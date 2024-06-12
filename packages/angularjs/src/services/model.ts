// Model Service
// -------------

// Transformers
import {keys} from 'ts-transformer-keys'

// Runtime
import {
    clone,
    cloneDeep,
    extend,
    filter,
    forEach,
    get,
    has,
    head,
    isArray,
    isEmpty,
    isEqual,
    isNumber,
    isObject,
    isString,
    isUndefined,
    map,
    once,
    set,
    throttle
} from 'lodash'
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

// AngularJS Dependency Injector
import {getInjector} from '../injector'

// AngularJS Services
import {Collection} from './collection'

// Third-Party
import Toastify from 'toastify-js'

// Instantiate Injector
let injector = getInjector()

// Angular Services
// let $rootScope: angular.IRootScopeService = injector ? injector.get('$rootScope') : null
let $rootScope: angular.IRootScopeService

// Service Verification Function
const serviceVerify = async () => {
    return new Promise(async (resolve, _reject) => {
        if ($rootScope) {
            resolve(true)
            return
        }
        if (!injector) {
            injector = getInjector()
        }
        if (injector) {
            // TODO: this is only used for the watcher (find a native replacement)
            $rootScope = injector.get('$rootScope')
        }
        if ($rootScope) {
            resolve(true)
            return
        }
        setTimeout(() => {
            if (cookie('env')) {
                console.log('wait for $rootScope service:', {
                    $rootScope
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
    toast?: boolean,
    type?: string,
    urlRoot?: string,
    urlSync?: boolean,
    watch?: boolean,
    withCredentials?: boolean,
    payload?: string,
    convoy?: string,
    headers?: LooseObject<any>,
}

export const ModelOptionKeys = keys<ModelOptions>()

export interface ModelSyncOptions {
    headers?: LooseObject<any>
}

export class Model<T = LooseObject> extends ModelBase<T> {
    // Base Information
    name = 'Model'

    // Environment
    target?: any = null
    type?: string = null
    manifest = false
    stagger = false
    toast = true
    identifier?: string | number = null
    urlRoot = '/Api'
    targetSuffix?: string = null

    // Unsure usage
    serviceId?: number = null

    // Infrastructure
    header = new ModelBase()
    meta = new ModelBase()
    route = new ModelBase()
    collection?: Collection = null
    xhr: XHR
    withCredentials = false
    headers: LooseObject<any> = {}

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
    throttle = throttle(this.fetch, 1000)
    initialize?: () => void = null

    constructor(options: ModelOptions = {}, attributes?: LooseObject) {
        // Trickle down handling for Attributes (Typically from Collection Hydration) and Basic Options
        super(attributes)

        // Initialize required options
        options = typeof options !== 'object' ? {} : options
        options.received = options.received || false

        // Inject Options
        extend(this, this.sanitizeOptions(options))

        // Handle Convoy
        if (options.convoy) {
            const convoy = isJSON(options.convoy) ? JSON.parse(options.convoy) : options.convoy
            if (isObject(convoy)) {
                this.meta.set((convoy as LooseObject).meta || {})
                const payload = (convoy as LooseObject).payload
                if (isObject(payload)) {
                    extend(this.data, payload)
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
            if (isObject(payload)) {
                extend(this.data, payload)
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
        if (!isEmpty(this.collection)) {
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
        //     extend(this.data, attributes)
        // }

        // TODO: Analyze possibility for options.received to be replaced with a !this.isNew()
        // Handle Data Flagged as Received from XHR
        this.recv = options.received ? cloneDeep(this.data) : {}
        this.sent = {}

        // Handle Keys we wish to ignore in patch
        this.ignoreKeys = options.ignoreKeys || ['$$hashKey']

        // Generate URL
        if (this.target) {
            this.urlRoot += '/' + ucfirst(this.target)
        }

        // TODO: Enable Auto-Save
        // this.throttle = throttle(this.save, 2000)

        const that = this
        this.initialize = once(this.initialize || function defaultInitializer() {
            // Begin Watching if already completed
            if (that.completed && (that.watch || that.autoSave)) {
                that.watcher().then()
            }

            // Bubble Event + Defer
            // this.on('change', function () {
            //   if (!this.collection) {
            //     return
            //   }
            //   this.collection.throttleTrigger('change')
            // })
            // TODO: This needs to be wrapped in a new promise!!!
            if (that.manifest && !that.getIdentifier()) {
                that.sync('POST', that.meta.has('api') ? {
                    meta: that.meta.get('api'),
                    payload: {}
                } : {}).catch(async (error: XMLHttpRequest|ErrorBase) => {
                    console.error('MANIFEST:', error)
                    if (!that.toast) {
                        return
                    }
                    const errorMessage = that.errorMessage(error)
                    const formatMessage = errorMessage ? `: ${errorMessage}` : '.'
                    Toastify({
                        text: `Unable to Manifest ${that.target}${formatMessage}`,
                        duration: 12000,
                        close: true,
                        stopOnFocus: true,
                        style: {
                            background: '#E14D45',
                        }
                    }).showToast()
                    that.errorMessage(error)
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
        forEach(ModelOptionKeys, (key) => {
            const data = get(options, key)
            if (isUndefined(data)) {
                return
            }
            set(sanitizedOptions, key, data)
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
            await serviceVerify()
        }

        // FIXME: The performance here is horrendous
        // We utilize the AngularJS Watcher for now, because it forces a redraw
        // as we change values in comparison to the native setTimeout() watcher
        // in the ModelBase.
        $rootScope.$watch(() => this.data, (_newData: LooseObject, _priorData: LooseObject) => this.handleChanges(), true)
    }

    // sanitizePatch(patchData: LooseObject) {
    //     forEach(keys(patchData), (key: any) => {
    //         if (endsWith(key, '$$hashKey')) {
    //             delete patchData[key]
    //         }
    //     })
    //     return patchData
    // }

    // TODO: A simpler version should exist on the ModelBase
    handleChanges(changeSet?: LooseObject): LooseObject {
        // Generate ChangeSet for normal triggers
        const isUserChangeSet = isUndefined(changeSet)
        if (isUserChangeSet) {
            changeSet = super.handleChanges()
        }

        // Ensure ChangeSet is valid
        if (!changeSet || isEmpty(changeSet)) {
            return changeSet
        }
        // this.changed = !isEqual(this.data, this.initData)

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
            if (get(changeSet, 'id')) {
                // if (cookie('env')) {
                //     console.info('replace id:', this.getIdentifier())
                // }
                // NOTE: setUrlParams will automatically update the window (and I think that is a mistake!)
                const newUrl = setUrlParams({
                    id: get(changeSet, 'id') || this.getIdentifier()
                })
                if (newUrl !== document.location.href) {
                    window.location.replace(newUrl)
                }
            }

            // Handle Version ID Changes
            const version = getAnchorParams('version')
            const versionId = !isEmpty(version) ? parseInt(version, 10) : 0
            if (versionId && versionId !== get(changeSet, 'version.id')) {
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
        return this.getType() + (isNumber(this.getIdentifier()) ? this.getIdentifier().toString() : this.getIdentifier())
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
        forEach(obj, (value: any, key: any) => {
            if (isObject(value)) {
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
        this.sent = cloneDeep(this.data)

        // Execute XHR
        // TODO: Get this in-line with Collection logic
        return new Promise(async (resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const request: XHRRequest = {
                method: action,
                url: this.url(),
                headers: clone(this.headers),
                withCredentials: this.withCredentials,
            }
            if (!isUndefined(data)) {
                if (['GET','DELETE'].includes(action)) {
                    if (isObject(data) && Object.keys(data).length) {
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
                if (!isObject(response) && !isArray(response)) {
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

                // XHR Flags
                this.error = false

                // Check Status and Associate Payload
                if (
                    (this.meta.has('success') && !this.meta.get('success'))
                    // Removing checks for status[0]
                    // || (!this.meta.has('success') && this.meta.has('status') && this.meta.get('status[0].code') !== 'SUCCESS')
                ) {
                    this.error = true
                } else if (isArray(payload) && payload.length) {
                    this.recv = head(payload)
                } else if (isObject(payload) && !isArray(payload)) {
                    this.recv = payload
                } else {
                    // If we've gotten this far, it's passed the status check if one is available
                    if (!this.meta.has('status') && !this.meta.has('success')) {
                        // If the status check was not available, this classifies as an error, since the payload is invalid.
                        this.error = true
                    }
                    console.warn(`Invalid Payload: ${request.method} ${request.url}`)
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
                const incomingChangeSet = this.completed ? cloneDeep(
                    patch(this.recv, this.sent)
                ) : {}
                if (!isEmpty(incomingChangeSet)) {
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
                const intermediateData = cloneDeep(
                    this.recv
                )
                const intermediateChangeSet = cloneDeep(
                    patch(this.data, this.sent)
                )
                if (!isEmpty(intermediateChangeSet)) {
                    if (cookie('env')) {
                        console.log('Intermediate ChangeSet detected:',
                            cookie('debug_change_set')
                                ? JSON.stringify(intermediateChangeSet)
                                : intermediateChangeSet
                        )
                    }
                    forEach(intermediateChangeSet, (element: any, key: any) => {
                        set(intermediateData, key, element)
                    })
                }

                // Propagate Changes
                this.data = cloneDeep(intermediateData) as T
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
            .catch((error: XMLHttpRequest|ErrorBase) => {
                // (/(.*)\sReceived/i).exec(error.message)[1]
                // FIXME: The UI should be able to handle more than a status of 500...
                // Treat a fatal error like 500 (our UI code relies on this distinction)
                // TODO: This should not default to status 500.  It should contain the actual status.
                this.status = 500
                this.error = true
                this.resetXHRFlags()
                console.error(`XHR: ${request.method} ${request.url}`, error)
                // reject and close promise
                reject(error)
                return
            })
        })
    }

    fetch(action?: string, data?: LooseObject, options?: ModelSyncOptions) {
        return new Promise(async (resolve: any, reject: any) => {
            this.sync(action, data || this.meta.get('api'), options)
                .then(resolve)
                .catch(async (error: XMLHttpRequest|ErrorBase) => {
                    // TODO: This should not default to status 500.  It should contain the actual status.
                    this.status = 500
                    this.error = true
                    this.resetXHRFlags()
                    console.error('FETCH:', error)
                    if (!this.toast) {
                        reject(error)
                        return
                    }
                    const errorMessage = this.errorMessage(error)
                    const formatMessage = errorMessage ? `: ${errorMessage}` : '.'
                    Toastify({
                        text: `Unable to Fetch ${this.target}${formatMessage}`,
                        duration: 12000,
                        close: true,
                        stopOnFocus: true,
                        style: {
                            background: '#E14D45',
                        }
                    }).showToast()
                    reject(error)
                    return
                })
        })
    }

    save(options?: any): Promise<any> {
        this.saving = true
        // TODO: store the promise locally so if it's in the middle of saving it returns the pending promise instead of adding another...
        options = options || {}
        if (!isObject(options)) {
            console.warn('invalid options supplied:', options)
            options = {}
        }
        if (has(options, 'force') && options.force) {
            options.patch = has(options, 'patch') ? options.patch : false
            return this.doSave(options)
        }
        // Sanity Checks for Persisted Entities
        if (this.getIdentifier() &&
            (
                // Ensure we have a complete model to begin with
                !this.completed ||
                // Avoid sending empty XHRs
                isEmpty(this.toPatch())
            )
        ) {
            console.warn('Blocked attempt to save an empty payload to a persisted model.')
            return new Promise((resolve, _reject) => {
                this.saving = false
                resolve(this.data)
            })
        }
        return this.doSave(options)
    }

    doSave(options?: any): Promise<any> {
        options = options || {}
        if (!isObject(options)) {
            console.warn('invalid options supplied:', options)
            options = {}
        }
        options.patch = has(options, 'patch') ? options.patch : true
        return new Promise(async (resolve: any, reject: any) => {
            this.sync(this.getIdentifier() ? 'PUT' : 'POST',
                this.toJSON({
                    patch: options.patch
                }))
                .then(resolve)
                .catch(async (error: XMLHttpRequest|ErrorBase) => {
                    this.error = true
                    this.resetXHRFlags()
                    console.error('SAVE:', error)
                    if (!this.toast) {
                        reject(error)
                        return
                    }
                    // TODO: Detect why we're getting internal messages outside of Dev Mode!
                    const errorMessage = this.errorMessage(error)
                    const formatMessage = errorMessage ? `: ${errorMessage}` : '.'
                    Toastify({
                        text: `Unable to Save ${this.target}${formatMessage}`,
                        duration: 12000,
                        close: true,
                        stopOnFocus: true,
                        style: {
                            background: '#E14D45',
                        }
                    }).showToast()
                    reject(error)
                    return
                })
        })
    }

    saveIdle() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout)
        }
        if (this.pending || !this.completed || this.isNew() || isEmpty(this.toPatch())) {
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
            this.save().then()
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
        if (!isObject(options)) {
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
        if (!isString(path)) {
            return acc
        }
        let cur
        let search
        forEach(path.split('.'), (link: any) => {
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
        return get(this.data, attr)
        // Note: This get function below has been replaced by the get() above
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
        return !isArray(attr) ? attr : attr.find((obj: any) => obj[key] === value)
    }

    set(attr: string | LooseObject, value: any) {
        if (!attr) {
            console.warn('No attr for model.set()!')
            return this
        }
        if (typeof attr === 'object') {
            forEach(attr, (v: any, k: string) => this.setAttribute(k, v))
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
        set(this.data, attr, value)

        // Note: This entire set has been replaced with the  set() above
        /* *
        if (includes(attr, '.') || includes(attr, '[')) {
            let future
            this.buildPath(attr)
                .reduce((attrs: any, link: any, index: any, chain: any) => {
                    future = index + 1
                    if (!has(attrs, link)) {
                        attrs[link] = has(chain, future) &&
                        isNumber(chain[future]) ? [] : {}
                    }
                    if (!has(chain, future)) {
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
            !isUndefined(options.multiple) &&
            isUndefined(options.strict)) {
            options.strict = true
        }
        options = extend({
            multiple: true
        }, isObject(options) ? options : {})
        /* TODO: After plucking has been tested, remove this log *
         console.log('toggle:', attribute, item, options);
         /* */
        const request = attribute.split('[].')
        let target = this.get(request.length > 1 ? request[0] : attribute)
        if (isUndefined(target) ||
            (options.strict && isArray(target) !==
                options.multiple)) {
            target = options.multiple ? [] : null
            this.set(request.length > 1 ? request[0] : attribute, target)
        }
        if (isArray(target)) {
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
            if (isUndefined(item)) {
                this.set(attribute, null)
            } else if (!this.exists(attribute, item)) {
                target.push(item)
            } else {
                forEach(target, (element: any, key: any) => {
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
                        isString(childId) && isString(itemId) && strcmp(childId, itemId) === 0
                    )) {
                        target.splice(key, 1)
                    }
                })
            }
        } else if (typeof target === 'object' || typeof target === 'number') {
            // (item && typeof item !== 'object') ? { id: item } : item
            this.set(attribute, !this.exists(attribute, item) ? item : null)
        } else if (isUndefined(item)) {
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
        if (!attr || !isArray(attr)) {
            return undefined
        }
        const list: Array<any> = filter(map(attr, (element: any) => get(element, request[1])))
        return list.length ? list : undefined
    }

    exists(attribute: any, item: any) {
        if (!item) {
            attribute = this.get(attribute)
            return typeof attribute !== 'undefined' && attribute
        }
        if (typeof attribute === 'string' && item) {
            attribute = this.pluck(attribute)
            if (isArray(attribute)) {
                return typeof attribute.find((element: any) => element === item || (
                    (typeof element === 'object' && element.id && element.id === item) || isEqual(element, item)
                )) !== 'undefined'
            }
            return attribute === item || (
                typeof attribute === 'object' && attribute.id && (
                    isEqual(attribute, item) || attribute.id === item
                )
            )
        }
        return false
    }

    destroy(): Promise<any> {
        // TODO: Add a delete confirmation dialog option
        if (this.isNew()) {
            return new Promise((resolve, _reject) => {
                this.throttleTrigger('change')
                if (this.collection) {
                    this.collection.remove(this)
                }
                resolve(this.data)
            })
        }
        return new Promise(async (_resolve: any, reject: any) => {
            let deleteData = {}
            if (!isEmpty(this.meta.get('api'))) {
                deleteData = this.meta.get('api')
            }
            this.sync('DELETE', deleteData)
                .then((_data: any) => {
                    // TODO: This should not need an error check in the success portion of the Promise, but I'm going to leave it here
                    //       until we are certain there isn't any code paths relying on this rejection.
                    if (this.error) {
                        reject(this.error)
                        return
                    }
                    this.throttleTrigger('change')
                    if (this.collection) {
                        this.collection.remove(this)
                    }
                })
                .catch(async (error: XMLHttpRequest|ErrorBase) => {
                    this.error = true
                    this.resetXHRFlags()
                    console.error('DESTROY:', error)
                    if (!this.toast) {
                        reject(error)
                        return
                    }
                    const errorMessage = this.errorMessage(error)
                    const formatMessage = errorMessage ? `: ${errorMessage}` : '.'
                    Toastify({
                        text: `Unable to Delete ${this.target}${formatMessage}`,
                        duration: 12000,
                        close: true,
                        stopOnFocus: true,
                        style: {
                            background: '#E14D45',
                        }
                    }).showToast()
                    reject(error)
                    return
                })
        })
    }

    errorMessage(error: XMLHttpRequest|ErrorBase): string|null {
        if (error instanceof ErrorBase) {
            console.error(`[${error.code}] ${error.message}`, error)
            return error.code !== 'Internal' ? error.message : null
        }
        const digest = (error.responseText && isJSON(error.responseText)) ? JSON.parse(error.responseText) : null
        if (!digest) {
            return null
        }
        const message = get(digest, 'meta.status[0].message') || get(digest, 'error.exception[0].message') || null
        if (!message) {
            return null
        }
        if (!cookie('env') && has(digest, 'error.exception[0].message')) {
            console.error('[xhr] server:', message)
            return null
        }
        return message
    }
}

// This Model Service handles data binding
// for a single object with a RESTful API.
Stratus.Services.Model = [
    '$provide', ($provide: any) => {
        $provide.factory('Model', [
            // '$rootScope',
            (
                // $r: angular.IRootScopeService
            ) => {
                // $rootScope = $r
                return Model
            }
        ])
    }
]
Stratus.Data.Model = Model
