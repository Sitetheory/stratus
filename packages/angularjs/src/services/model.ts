// Model Service
// -------------

// Transformers
import {keys} from 'ts-transformer-keys'

// Runtime
import _ from 'lodash'
import angular from 'angular'
import {Stratus} from '@stratusjs/runtime/stratus'

// Stratus Core
import {
    ErrorBase
} from '@stratusjs/core/errors/errorBase'
import {
    getAnchorParams,
    getUrlParams,
    isJSON,
    LooseObject,
    patch,
    setUrlParams,
    strcmp,
    ucfirst
} from '@stratusjs/core/misc'
import {
    ModelBase,
    ModelBaseOptions
} from '@stratusjs/core/datastore/modelBase'
import {
    cookie
} from '@stratusjs/core/environment'
import {
    XHR,
    XHRRequest
} from '@stratusjs/core/datastore/xhr'

// Modules
import 'angular-material' // Reliant for $mdToast

// AngularJS Dependency Injector
import {getInjector} from '../injector'

// AngularJS Services
import {Collection} from './collection'

// Instantiate Injector
let injector = getInjector()

// Angular Services
// let $rootScope: angular.IRootScopeService = injector ? injector.get('$rootScope') : null
let $rootScope: angular.IRootScopeService
// let $mdToast: angular.material.IToastService = injector ? injector.get('$mdToast') : null
let $mdToast: angular.material.IToastService

// Service Verification Function
const serviceVerify = async () => {
    return new Promise(async (resolve, reject) => {
        if ($rootScope && $mdToast) {
            resolve(true)
            return
        }
        if (!injector) {
            injector = getInjector()
        }
        if (injector) {
            // TODO: this is only used for the watcher (find a native replacement)
            $rootScope = injector.get('$rootScope')
            // TODO: this is only used in 4 places to respond to errors (find a native replacement)
            $mdToast = injector.get('$mdToast')
        }
        if ($rootScope && $mdToast) {
            resolve(true)
            return
        }
        setTimeout(() => {
            if (cookie('env')) {
                console.log('wait for $rootScope, & $mdToast service:', {
                    $rootScope,
                    $mdToast
                })
            }
            serviceVerify().then(resolve)
        }, 250)
    })
}

// TODO: Remove this interface (replaced by XHRRequest)
export interface HttpPrototype {
    headers: LooseObject
    method: string
    url: string
    data?: string
}

export interface ModelOptions extends ModelBaseOptions {
    autoSave?: boolean,
    autoSaveInterval?: number,
    autoSaveHalt?: boolean,
    collection?: Collection,
    completed?: boolean, // Fetch/injected model can already be completed
    manifest?: string,
    serviceId?: number,
    stagger?: boolean,
    target?: string,
    targetSuffix?: string,
    type?: string,
    urlRoot?: string,
    urlSync?: boolean,
    watch?: boolean,
    withCredentials?: boolean,
    payload?: string,
    convoy?: string,
}

export const ModelOptionKeys = keys<ModelOptions>()

export interface ModelSyncOptions {
    headers?: LooseObject<string>
}

export class Model<T = LooseObject> extends ModelBase<T> {
    // Base Information
    name = 'Model'

    // Environment
    target?: any = null
    type?: string = null
    manifest = false
    stagger = false
    toast = false
    identifier?: string | number = null
    urlRoot = '/Api'
    targetSuffix?: string = null
    serviceId?: number = null
    withCredentials = false

    // Infrastructure
    header = new ModelBase()
    meta = new ModelBase()
    route = new ModelBase()
    collection?: Collection = null
    xhr: XHR

    // XHR Flags
    pending = false
    error = false
    completed = false
    saving = false

    // External Controls
    changedExternal = false

    // Temporarily force watching to all direct models
    watch = true

    // XHR Data
    status?: any = null

    // Auto-Save Logic
    autoSave = false
    autoSaveInterval = 4000
    autoSaveHalt = true
    autoSaveTimeout: any = null

    // URL Controls
    urlSync = false

    // Misc
    bracket = {
        match: /\[[\d+]]/,
        search: /\[([\d+])]/g,
        attr: /(^[^[]+)/
    }

    // Methods
    throttle = _.throttle(this.fetch, 1000)
    initialize?: () => void = null

    constructor(options: ModelOptions = {}, attributes?: LooseObject) {
        // Trickle down handling for Attributes (Typically from Collection Hydration) and Basic Options
        super(attributes)

        // Initialize required options
        options = typeof options !== 'object' ? {} : options
        options.received = options.received || false

        // Inject Options
        _.extend(this, this.sanitizeOptions(options))

        // Handle Convoy
        if (options.convoy) {
            const convoy = isJSON(options.convoy) ? JSON.parse(options.convoy) : options.convoy
            if (_.isObject(convoy)) {
                this.meta.set((convoy as LooseObject).meta || {})
                const payload = (convoy as LooseObject).payload
                if (_.isObject(payload)) {
                    _.extend(this.data, payload)
                    this.completed = true
                    options.received = true
                } else {
                    console.error('malformed payload:', payload)
                }
            } else {
                console.error('malformed convoy:', convoy)
            }
        }

        // Handle Payload
        if (options.payload) {
            const payload = isJSON(options.payload) ? JSON.parse(options.payload) : options.payload
            if (_.isObject(payload)) {
                _.extend(this.data, payload)
                this.completed = true
                options.received = true
            } else {
                console.error('malformed payload:', payload)
            }
        }

        // The data used to detect the data is changed.
        // this.initData = {}

        // Handle Collections & Meta
        this.header = new ModelBase()
        this.meta = new ModelBase()
        this.route = new ModelBase()
        if (!_.isEmpty(this.collection)) {
            if (this.collection.target) {
                this.target = this.collection.target
            }
            if (this.collection.meta.has('api')) {
                this.meta.set('api', this.collection.meta.get('api'))
            }
        }

        // Handle Attributes (Typically from Collection Hydration)
        // Note: This is commented out because it doesn't differ from what happens in the ModelBase Constructor
        // if (attributes && typeof attributes === 'object') {
        //     _.extend(this.data, attributes)
        // }

        // TODO: Analyze possibility for options.received to be replaced with a !this.isNew()
        // Handle Data Flagged as Received from XHR
        this.recv = options.received ? _.cloneDeep(this.data) : {}
        this.sent = {}

        // Handle Keys we wish to ignore in patch
        this.ignoreKeys = options.ignoreKeys || ['$$hashKey']

        // Generate URL
        if (this.target) {
            this.urlRoot += '/' + ucfirst(this.target)
        }

        // TODO: Enable Auto-Save
        // this.throttle = _.throttle(this.save, 2000)

        const that = this
        this.initialize = _.once(this.initialize || function defaultInitializer() {
            // Begin Watching if already completed
            if (that.completed && (that.watch || that.autoSave)) {
                that.watcher()
            }

            // Bubble Event + Defer
            // this.on('change', function () {
            //   if (!this.collection) {
            //     return
            //   }
            //   this.collection.throttleTrigger('change')
            // })
            if (that.manifest && !that.getIdentifier()) {
                that.sync('POST', that.meta.has('api') ? {
                    meta: that.meta.get('api'),
                    payload: {}
                } : {}).catch(async (message: any) => {
                    console.error('MANIFEST:', message)
                    if (!that.toast) {
                        return
                    }
                    if (!$mdToast) {
                        // TODO: Verify the whether the const is necessity
                        // tslint:disable-next-line:no-unused-variable
                        const wait = await serviceVerify()
                    }
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failure to Manifest!')
                            .toastClass('errorMessage')
                            .position('top right')
                            .hideDelay(3000)
                    )
                })
            }
        })

        if (!this.stagger) {
            this.initialize()
        }
    }

    resetXHRFlags() {
        this.pending = false
        this.saving = false
        // Note: we do not know status of this.completed because in some cases an error would cause retrieval of bad
        // data and we do not want to overwrite data
        // NOTE: when we reset XHR it could happen in success, error, etc, so we don't know status of this.changed
    }

    sanitizeOptions(options: LooseObject): LooseObject {
        const sanitizedOptions = {}
        _.forEach(ModelOptionKeys, (key) => {
            const data = _.get(options, key)
            if (_.isUndefined(data)) {
                return
            }
            _.set(sanitizedOptions, key, data)
        })
        return sanitizedOptions
    }

    // Watch for Data Changes
    async watcher() {
        // Ensure we only watch once
        if (this.watching) {
            return true
        }
        this.watching = true

        // Verify AngularJS Services
        if (!$rootScope) {
            // TODO: Verify the whether the const is necessity
            // tslint:disable-next-line:no-unused-variable
            const wait = await serviceVerify()
        }

        // FIXME: The performance here is horrendous
        // We utilize the AngularJS Watcher for now, because it forces a redraw
        // as we change values in comparison to the native setTimeout() watcher
        // in the ModelBase.
        $rootScope.$watch(() => this.data, (newData: LooseObject, priorData: LooseObject) => this.handleChanges(), true)
    }

    // sanitizePatch(patchData: LooseObject) {
    //     _.forEach(_.keys(patchData), (key: any) => {
    //         if (_.endsWith(key, '$$hashKey')) {
    //             delete patchData[key]
    //         }
    //     })
    //     return patchData
    // }

    // TODO: A simpler version should exist on the ModelBase
    handleChanges(changeSet?: LooseObject): LooseObject {
        // Generate ChangeSet for normal triggers
        const isUserChangeSet = _.isUndefined(changeSet)
        if (isUserChangeSet) {
            changeSet = super.handleChanges()
        }

        // Ensure ChangeSet is valid
        if (!changeSet || _.isEmpty(changeSet)) {
            return changeSet
        }
        // this.changed = !_.isEqual(this.data, this.initData)

        // This ensures that we only save
        if (this.error && !this.completed && this.getIdentifier()) {
            const action = isUserChangeSet ? 'save' : 'sync url for'
            console.warn(`Blocked attempt to ${action} a persisted model that has not been fetched successfully.`)
            return
        }

        // Debug info
        if (!isUserChangeSet) {
            if (cookie('env')) {
                console.info('Attempting URL Sync for non-User ChangeSet:', changeSet)
            }
        }

        // Sync URL with Data Changes
        // TODO: Check the Payload as well, as everything may not generate a changeSet upon return (i.e. Content Duplication)
        if (this.urlSync) {
            // TODO: Allow an option for using PushState here instead of hitting a page reload
            // Handle ID Changes
            if (_.get(changeSet, 'id')) {
                // if (cookie('env')) {
                //     console.info('replace id:', this.getIdentifier())
                // }
                // NOTE: setUrlParams will automatically update the window (and I think that is a mistake!)
                const newUrl = setUrlParams({
                    id: _.get(changeSet, 'id') || this.getIdentifier()
                })
                if (newUrl !== document.location.href) {
                    window.location.replace(newUrl)
                }
            }

            // Handle Version ID Changes
            const version = getAnchorParams('version')
            const versionId = !_.isEmpty(version) ? parseInt(version, 10) : 0
            if (versionId && versionId !== _.get(changeSet, 'version.id')) {
                if (cookie('env')) {
                    console.warn('replacing version:', versionId)
                }
            }
        }

        // Stop Handling Data if not triggered by a User Change
        if (!isUserChangeSet) {
            return
        }

        // Trigger Queue for Auto-Save
        this.saveIdle()

        // Dispatch Model Events
        // This hasn't been test, but is probably a better idea than what we're getting from the setAttribute
        // this.throttleTrigger('change', changeSet)
        this.throttleTrigger('change', this)

        // Dispatch Collection Events
        if (this.collection) {
            this.collection.throttleTrigger('change', this)
        }

        // Ensure the ChangeSet bubbles
        return changeSet
    }

    getIdentifier() {
        return (this.identifier = this.get('id') || this.route.get('identifier') || this.identifier)
    }

    getType() {
        return (this.type = this.type || this.target || 'orphan')
    }

    getHash() {
        return this.getType() + (_.isNumber(this.getIdentifier()) ? this.getIdentifier().toString() : this.getIdentifier())
    }

    isNew() {
        return !this.getIdentifier()
    }

    url() {
        let url = this.getIdentifier() ? `${this.urlRoot}/${this.getIdentifier()}` : `${this.urlRoot}${this.targetSuffix || ''}`

        // add further param to specific version
        if (getUrlParams('version')) {
            // TODO: Move the following version logic to a router
            url += url.includes('?') ? '&' : '?'
            url += 'options[version]=' + getUrlParams('version')
        }
        return url
    }

    serialize(obj: any, chain?: any) {
        const str: any = []
        obj = obj || {}
        _.forEach(obj, (value: any, key: any) => {
            if (_.isObject(value)) {
                if (chain) {
                    key = chain + '[' + key + ']'
                }
                str.push(this.serialize(value, key))
            } else {
                let encoded = ''
                if (chain) {
                    encoded += chain + '['
                }
                encoded += key
                if (chain) {
                    encoded += ']'
                }
                str.push(encoded + '=' + value)
            }
        })
        return str.join('&')
    }

    // TODO: Abstract this deeper
    sync(action?: string, data?: LooseObject, options?: ModelSyncOptions): Promise<any> {
        // XHR Flags
        this.pending = true

        // Dispatch Model Change Event
        this.trigger('change', this)

        // XHR Flags for Collection
        if (this.collection) {
            // TODO: Change to a Model ID Register
            this.collection.pending = true

            // Dispatch Collection Change Event
            this.collection.throttleTrigger('change')
        }

        // Diff Information
        this.sent = _.cloneDeep(this.data)

        // Execute XHR
        // TODO: Get this in-line with Collection logic
        return new Promise(async (resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const request: XHRRequest = {
                method: action,
                url: this.url(),
                headers: {},
                withCredentials: this.withCredentials,
            }
            if (!_.isUndefined(data)) {
                if (action === 'GET') {
                    if (_.isObject(data) && Object.keys(data).length) {
                        request.url += request.url.includes('?') ? '&' : '?'
                        request.url += this.serialize(data)
                    }
                } else {
                    request.headers['Content-Type'] = 'application/json'
                    request.data = data
                }
            }

            if (cookie('env')) {
                console.log('Prototype:', request)
            }

            if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                Object.keys(options.headers).forEach((headerKey: any) => {
                    request.headers[headerKey] = options.headers[headerKey]
                })
            }

            // Example XHR
            this.xhr = new XHR(request)

            // Call XHR
            this.xhr.send().then((response: LooseObject | Array<LooseObject> | string) => {
                // Data Stores
                this.status = this.xhr.status

                // Begin Watching (this.watcher is a singleton)
                if (this.watch || this.autoSave) {
                    this.watcher()
                }

                // TODO: Remove this unnecessary hack, when new patch is confirmed as accurate
                // Reset status model
                // setTimeout(() => {
                //     this.changed = false
                //     this.throttleTrigger('change')
                //     if (this.collection) {
                //         this.collection.throttleTrigger('change')
                //     }
                // }, 100)

                // Set Flags & Propagate Events on Error
                const propagateError = () => {
                    // XHR Flags
                    this.error = true
                    this.resetXHRFlags()

                    // Note: we do not mark a model as "complete" completed if it hasn't received a proper entity or
                    // prototype initially.  This is to ensure we don't save entities with the possibility of nullified
                    // fields due to a broken retrieval, resulting in the replacement of good data for bad.
                    // this.completed = true

                    // XHR Flags for Collection
                    if (this.collection) {
                        // TODO: Change to a Model ID Register to account for all Models in a Collection
                        this.collection.pending = false
                    }

                    // Events
                    this.trigger('error', this)
                    this.trigger('complete', this)

                    // Propagate Collection Change Event
                    if (this.collection instanceof Collection) {
                        this.collection.throttleTrigger('change')
                    }
                }

                // Evaluate Response
                if (!_.isObject(response) && !_.isArray(response)) {
                    // Build Report
                    const error = new ErrorBase({
                        payload: response,
                        message: `Invalid Payload: ${request.method} ${request.url}`
                    }, {})

                    // Set Flags & Propagate Events
                    propagateError()

                    // Promise
                    reject(error)

                    return
                }

                // TODO: Make this into an over-writable function
                // Gather Data
                // FIXME: This needs to be setting as the API data...
                // FIXME: The API data coming in appears to have precedence after recent changes
                // FIXME: This does not have to do with recent changes, where we handle incoming
                //        change sets...  There's something else at play.
                this.header.set(this.xhr.getAllResponseHeaders() || {})
                this.meta.set((response as LooseObject).meta || {})
                this.route.set((response as LooseObject).route || {})
                const payload = (response as LooseObject).payload || response
                const status: { code: string }[] = this.meta.get('status') || []

                // Evaluate Payload
                if (this.meta.has('status') && this.meta.get('status[0].code') !== 'SUCCESS') {
                    this.error = true
                } else if (_.isArray(payload) && payload.length) {
                    this.recv = _.first(payload)
                    this.error = false
                } else if (_.isObject(payload) && !_.isArray(payload)) {
                    this.recv = payload
                    this.error = false
                } else {
                    this.error = true
                }

                // Report Invalid Payloads
                if (this.error) {
                    // Build Report
                    const error = new ErrorBase({
                        payload,
                        message: `Invalid Payload: ${request.method} ${request.url}`
                    }, {})

                    // Set Flags & Propagate Events
                    propagateError()

                    // Promise
                    reject(error)

                    return
                }

                // Diff Settings

                // This is the ChangeSet coming from alterations between what is sent and received (i.e. new version)
                const incomingChangeSet = this.completed ? _.cloneDeep(
                    patch(this.recv, this.sent)
                ) : {}
                if (!_.isEmpty(incomingChangeSet)) {
                    if (cookie('env')) {
                        console.log('Incoming ChangeSet detected:',
                            cookie('debug_change_set')
                            ? JSON.stringify(incomingChangeSet)
                            : incomingChangeSet
                        )
                    }
                    // Handle Incoming ChangeSet separately from User-defined data
                    this.handleChanges(incomingChangeSet)
                }

                // This is the ChangeSet generated from what has changed during the save
                const intermediateData = _.cloneDeep(
                    this.recv
                )
                const intermediateChangeSet = _.cloneDeep(
                    patch(this.data, this.sent)
                )
                if (!_.isEmpty(intermediateChangeSet)) {
                    if (cookie('env')) {
                        console.log('Intermediate ChangeSet detected:',
                            cookie('debug_change_set')
                                ? JSON.stringify(intermediateChangeSet)
                                : intermediateChangeSet
                        )
                    }
                    _.forEach(intermediateChangeSet, (element: any, key: any) => {
                        _.set(intermediateData, key, element)
                    })
                }

                // Propagate Changes
                this.data = _.cloneDeep(intermediateData) as T
                // Before handling changes make sure we set to false
                this.changed = false
                this.changedExternal = false
                this.saving = false
                // FIXME: This should be finding the changed identifier...
                this.handleChanges()
                this.patch = {}

                // TODO: Handle the remainder here, which was encapsulated after the if (!this.error) {

                // XHR Flags
                this.resetXHRFlags()
                this.completed = true

                // XHR Flags for Collection
                if (this.collection) {
                    // TODO: Change to a Model ID Register
                    this.collection.pending = false
                }

                // Clear Meta Temps
                this.meta.clearTemp()

                // Events
                this.trigger('success', this)
                this.trigger('change', this)
                this.trigger('complete', this)

                // Propagate Collection Change Event
                if (this.collection instanceof Collection) {
                    this.collection.throttleTrigger('change')
                }

                // Promise
                // extendDeep(this.data, this.initData)
                resolve(this.data)

                return
            })
            .catch((error: any) => {
                // (/(.*)\sReceived/i).exec(error.message)[1]
                // Treat a fatal error like 500 (our UI code relies on this distinction)
                this.status = 500
                this.error = true
                this.resetXHRFlags()
                console.error(`XHR: ${request.method} ${request.url}`, error)
                reject(error)
                throw error
            })
        })
    }

    fetch(action?: string, data?: LooseObject, options?: ModelSyncOptions) {
        return this.sync(action, data || this.meta.get('api'), options)
            .catch(async (message: any) => {
                this.status = 500
                this.error = true
                this.resetXHRFlags()
                console.error('FETCH:', message)
                // TODO: Move toast to something external (outside of Stratus scope)
                if (!this.toast) {
                    return
                }
                if (!$mdToast) {
                    // TODO: Verify the whether the const is necessity
                    // tslint:disable-next-line:no-unused-variable
                    const wait = await serviceVerify()
                }
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failure to fetch data!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                )
            })
    }

    save(options?: any): Promise<any> {
        this.saving = true
        // TODO: store the promise locally so if it's in the middle of saving it returns the pending promise instead of adding another...
        options = options || {}
        if (!_.isObject(options)) {
            console.warn('invalid options supplied:', options)
            options = {}
        }
        if (_.has(options, 'force') && options.force) {
            options.patch = _.has(options, 'patch') ? options.patch : false
            return this.doSave(options)
        }
        // Sanity Checks for Persisted Entities
        if (this.getIdentifier() &&
            (
                // Ensure we have a complete model to begin with
                !this.completed ||
                // Avoid sending empty XHRs
                _.isEmpty(this.toPatch())
            )
        ) {
            console.warn('Blocked attempt to save an empty payload to a persisted model.')
            return new Promise((resolve, reject) => {
                this.saving = false
                resolve(this.data)
            })
        }
        return this.doSave(options)
    }

    doSave(options?: any): Promise<any> {
        options = options || {}
        if (!_.isObject(options)) {
            console.warn('invalid options supplied:', options)
            options = {}
        }
        options.patch = _.has(options, 'patch') ? options.patch : true
        return this.sync(this.getIdentifier() ? 'PUT' : 'POST',
            this.toJSON({
                patch: options.patch
            }))
            .catch(async (message: any) => {
                this.error = true
                this.resetXHRFlags()
                console.error('SAVE:', message)
                // TODO: Move toast to something external (outside of Stratus scope)
                if (!this.toast) {
                    return
                }
                if (!$mdToast) {
                    // TODO: Verify the whether the const is necessity
                    // tslint:disable-next-line:no-unused-variable
                    const wait = await serviceVerify()
                }
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failure to Save!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                )
            })
    }

    saveIdle() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout)
        }
        if (this.pending || !this.completed || this.isNew() || _.isEmpty(this.toPatch())) {
            return
        }
        if (this.autoSaveHalt && !this.autoSave) {
            return
        }
        this.autoSaveTimeout = setTimeout(() => {
            if (!this.autoSaveHalt && !this.autoSave) {
                this.saveIdle()
                return
            }
            this.save()
        }, this.autoSaveInterval)
    }

    throttleSave() {

        return new Promise((resolve: any, reject: any) => {
            const request = this.throttle()
            console.log('throttle request:', request)
            request.then((data: any) => {
                console.log('throttle received:', data)
                resolve(data)
            }).catch(reject)
        })
    }

    // Attribute Functions

    toJSON(options?: any) {
        // Ensure Patch only Saves on Persistent Models
        options = options || {}
        if (!_.isObject(options)) {
            options = {}
        }
        options.patch = (options.patch && !this.isNew())
        let data = super.toJSON(options)
        const metaData = this.meta.get('api')
        if (metaData) {
            data = {
                meta: metaData,
                payload: data
            }
        }
        return data
    }

    buildPath(path: string): any {
        const acc: any = []
        if (!_.isString(path)) {
            return acc
        }
        let cur
        let search
        _.forEach(path.split('.'), (link: any) => {
            // handle bracket chains
            if (link.match(this.bracket.match)) {
                // extract attribute
                cur = this.bracket.attr.exec(link)
                if (cur !== null) {
                    acc.push(cur[1])
                    cur = null
                } else {
                    cur = false
                }

                // extract cells
                search = this.bracket.search.exec(link)
                while (search !== null) {
                    if (cur !== false) {
                        cur = parseInt(search[1], 10)
                        if (!isNaN(cur)) {
                            acc.push(cur)
                        } else {
                            cur = false
                        }
                    }
                    search = this.bracket.search.exec(link)
                }
            } else {
                // normal attributes
                acc.push(link)
            }
        })
        return acc
    }

    /**
     * Use to get an attributes in the model.
     */
    get(attr: string) {
        // TODO: Split these out as small errors
        if (typeof attr !== 'string' || !this.data || typeof this.data !== 'object') {
            return undefined
        }
        return _.get(this.data, attr)
        // Note: This get function below has been replaced by the _.get() above
        /* *
        return this.buildPath(attr).reduce(
            (attrs: any, link: any) => attrs && attrs[link], this.data
        )
        /* */
    }

    /**
     * if the attributes is an array, the function allow to find the specific object by the condition ( key - value )
     */
    find(attr: any, key: any, value: any) {
        if (typeof attr === 'string') {
            attr = this.get(attr)
        }
        return !_.isArray(attr) ? attr : attr.find((obj: any) => obj[key] === value)
    }

    set(attr: string | LooseObject, value: any) {
        if (!attr) {
            console.warn('No attr for model.set()!')
            return this
        }
        if (typeof attr === 'object') {
            _.forEach(attr, (v: any, k: string) => this.setAttribute(k, v))
            return this
        }
        this.setAttribute(attr, value)
        return this
    }

    setAttribute(attr: string, value: any) {
        if (typeof attr !== 'string') {
            console.warn('Malformed attr for model.setAttribute()!')
            return false
        }

        // @ts-ignore
        _.set(this.data, attr, value)

        // Note: This entire set has been replaced with the  _.set() above
        /* *
        if (_.includes(attr, '.') || _.includes(attr, '[')) {
            let future
            this.buildPath(attr)
                .reduce((attrs: any, link: any, index: any, chain: any) => {
                    future = index + 1
                    if (!_.has(attrs, link)) {
                        attrs[link] = _.has(chain, future) &&
                        _.isNumber(chain[future]) ? [] : {}
                    }
                    if (!_.has(chain, future)) {
                        attrs[link] = value
                    }
                    return attrs && attrs[link]
                }, this.data)
        } else {
            (this.data as LooseObject)[attr] = value
        }
        /* */
        // The issue with these triggers is they only fire if using the set() method,
        // while some values will be changed via the data object directly.
        this.throttleTrigger('change', this)
        this.throttleTrigger(`change:${attr}`, value)
    }

    // FIXME: This doesn't appear to work properly anymore
    toggle(attribute: any, item?: any, options?: object | any) {
        if (typeof options === 'object' &&
            !_.isUndefined(options.multiple) &&
            _.isUndefined(options.strict)) {
            options.strict = true
        }
        options = _.extend({
            multiple: true
        }, _.isObject(options) ? options : {})
        /* TODO: After plucking has been tested, remove this log *
         console.log('toggle:', attribute, item, options);
         /* */
        const request = attribute.split('[].')
        let target = this.get(request.length > 1 ? request[0] : attribute)
        if (_.isUndefined(target) ||
            (options.strict && _.isArray(target) !==
                options.multiple)) {
            target = options.multiple ? [] : null
            this.set(request.length > 1 ? request[0] : attribute, target)
        }
        if (_.isArray(target)) {
            /* This is disabled, since hydration should not be forced by default *
             const hydrate = {}
             if (request.length > 1) {
             hydrate[request[1]] = {
             id: item
             }
             } else {
             hydrate.id = item
             }
             /* */
            if (_.isUndefined(item)) {
                this.set(attribute, null)
            } else if (!this.exists(attribute, item)) {
                target.push(item)
            } else {
                _.forEach(target, (element: any, key: any) => {
                    const child = (request.length > 1 &&
                        typeof element === 'object' && request[1] in element)
                        ? element[request[1]]
                        : element
                    const childId = (typeof child === 'object' && child.id)
                        ? child.id
                        : child
                    const itemId = (typeof item === 'object' && item.id)
                        ? item.id
                        : item
                    if (childId === itemId || (
                        _.isString(childId) && _.isString(itemId) && strcmp(childId, itemId) === 0
                    )) {
                        target.splice(key, 1)
                    }
                })
            }
        } else if (typeof target === 'object' || typeof target === 'number') {
            // (item && typeof item !== 'object') ? { id: item } : item
            this.set(attribute, !this.exists(attribute, item) ? item : null)
        } else if (_.isUndefined(item)) {
            this.set(attribute, !target)
        }

        return this.get(attribute)
    }

    pluck(attr: string) {
        if (typeof attr !== 'string' || attr.indexOf('[].') === -1) {
            return this.get(attr)
        }
        const request = attr.split('[].')
        if (request.length <= 1) {
            return undefined
        }
        attr = this.get(request[0])
        if (!attr || !_.isArray(attr)) {
            return undefined
        }
        const list: Array<any> = _.filter(_.map(attr, (element: any) => _.get(element, request[1])))
        return list.length ? list : undefined
    }

    exists(attribute: any, item: any) {
        if (!item) {
            attribute = this.get(attribute)
            return typeof attribute !== 'undefined' && attribute
        }
        if (typeof attribute === 'string' && item) {
            attribute = this.pluck(attribute)
            if (_.isArray(attribute)) {
                return typeof attribute.find((element: any) => element === item || (
                    (typeof element === 'object' && element.id && element.id === item) || _.isEqual(element, item)
                )) !== 'undefined'
            }
            return attribute === item || (
                typeof attribute === 'object' && attribute.id && (
                    _.isEqual(attribute, item) || attribute.id === item
                )
            )
        }
        return false
    }

    destroy(): Promise<any> {
        // TODO: Add a delete confirmation dialog option
        if (this.isNew()) {
            return new Promise((resolve, reject) => {
                this.throttleTrigger('change')
                if (this.collection) {
                    this.collection.remove(this)
                }
                resolve(this.data)
            })
        }
        return this.sync('DELETE', {})
            .then((data: any) => {
                if (this.error) {
                    return
                }
                this.throttleTrigger('change')
                if (this.collection) {
                    this.collection.remove(this)
                }
            })
            .catch(async (message: any) => {
                this.error = true
                this.resetXHRFlags()
                console.error('DESTROY:', message)
                // TODO: Move toast to something external (outside of Stratus scope)
                if (!this.toast) {
                    return
                }
                if (!$mdToast) {
                    // TODO: Verify the whether the const is necessity
                    // tslint:disable-next-line:no-unused-variable
                    const wait = await serviceVerify()
                }
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Failure to Delete!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                )
            })
    }
}

// This Model Service handles data binding
// for a single object with a RESTful API.
Stratus.Services.Model = [
    '$provide', ($provide: any) => {
        $provide.factory('Model', [
            // '$rootScope',
            // '$mdToast',
            (
                // $h: angular.IHttpService,
                // $r: angular.IRootScopeService,
                // $m: angular.material.IToastService
            ) => {
                // $rootScope = $r
                // $mdToast = $m
                return Model
            }
        ])
    }
]
Stratus.Data.Model = Model
