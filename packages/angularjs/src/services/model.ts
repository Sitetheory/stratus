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
    getAnchorParams,
    getUrlParams,
    LooseObject,
    patch,
    setUrlParams,
    strcmp,
    ucfirst
} from '@stratusjs/core/misc'
import {ModelBase, ModelBaseOptions} from '@stratusjs/core/datastore/modelBase'
import {cookie} from '@stratusjs/core/environment'

// Modules
import 'angular-material' // Reliant for $mdToast

// AngularJS Dependency Injector
import {getInjector} from '@stratusjs/angularjs/injector'

// AngularJS Services
import {Collection} from '@stratusjs/angularjs/services/collection'

// Instantiate Injector
let injector = getInjector()

// Angular Services
// let $http: angular.IHttpService = injector ? injector.get('$http') : null
let $http: angular.IHttpService
// let $rootScope: angular.IRootScopeService = injector ? injector.get('$rootScope') : null
let $rootScope: angular.IRootScopeService
// let $mdToast: angular.material.IToastService = injector ? injector.get('$mdToast') : null
let $mdToast: angular.material.IToastService

// Service Verification Function
const serviceVerify = async () => {
    return new Promise(async (resolve, reject) => {
        if ($http && $rootScope && $mdToast) {
            resolve(true)
            return
        }
        if (!injector) {
            injector = getInjector()
        }
        if (injector) {
            $http = injector.get('$http')
            $rootScope = injector.get('$rootScope')
            $mdToast = injector.get('$mdToast')
        }
        if ($http && $rootScope && $mdToast) {
            resolve(true)
            return
        }
        setTimeout(() => {
            if (cookie('env')) {
                console.log('wait for $http, $rootScope, & $mdToast service:', {
                    $http,
                    $rootScope,
                    $mdToast
                })
            }
            serviceVerify().then(resolve)
        }, 250)
    })
}

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
    stagger?: boolean,
    target?: string,
    targetSuffix?: string,
    type?: string,
    urlRoot?: string,
    urlSync?: boolean,
    watch?: boolean,
}

export const ModelOptionKeys = keys<ModelOptions>()

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

    // Infrastructure
    header = new ModelBase()
    meta = new ModelBase()
    route = new ModelBase()
    collection?: Collection = null

    // XHR Flags
    pending = false
    error = false
    completed = false
    saving = false

    // Temporarily force watching to all direct models
    watch = true

    // XHR Data
    status?: any = null

    // Auto-Save Logic
    autoSave = false
    autoSaveInterval = 2500
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
        _.extend(this, options)

        // The data used to detect the data is changed.
        // this.initData = {}

        // Handle Collections & Meta
        this.header = new Stratus.Prototypes.Model()
        this.meta = new Stratus.Prototypes.Model()
        this.route = new Stratus.Prototypes.Model()
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
    handleChanges(): LooseObject {
        const changeSet = super.handleChanges()

        // Ensure ChangeSet is valid
        if (!changeSet || _.isEmpty(changeSet)) {
            return changeSet
        }
        // this.changed = !_.isEqual(this.data, this.initData)

        // This ensures that we only save
        if (this.error && !this.completed && this.getIdentifier()) {
            console.warn('Blocked attempt to save a persisted model that has not been fetched successfully.')
            return
        }

        // Trigger Queue for Auto-Save
        this.saveIdle()

        // Sync URL with Data Changes
        if (this.urlSync) {
            // TODO: Allow an option for using PushState here instead of hitting a page reload
            // Handle ID Changes
            if (_.get(changeSet, 'id')) {
                // if (cookie('env')) {
                //     console.info('replace id:', this.getIdentifier())
                // }
                const newUrl = setUrlParams({
                    id: this.getIdentifier()
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
        let url = this.getIdentifier() ? this.urlRoot + '/' + this.getIdentifier() : this.urlRoot + (this.targetSuffix || '')

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
    sync(action?: any, data?: any, options?: any): Promise<any> {
        // XHR Flags
        this.pending = true

        // XHR Flags for Collection
        if (this.collection) {
            // TODO: Change to a Model ID Register
            this.collection.pending = true
        }

        // Diff Information
        this.sent = _.cloneDeep(this.data)

        // Execute XHR
        return new Promise(async (resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const prototype: HttpPrototype = {
                method: action,
                url: this.url(),
                headers: {}
            }
            if (!_.isUndefined(data)) {
                if (action === 'GET') {
                    if (_.isObject(data) && Object.keys(data).length) {
                        prototype.url += prototype.url.includes('?') ? '&' : '?'
                        prototype.url += this.serialize(data)
                    }
                } else {
                    prototype.headers['Content-Type'] = 'application/json'
                    prototype.data = JSON.stringify(data)
                }
            }

            if (cookie('env')) {
                console.log('Prototype:', prototype)
            }

            if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                Object.keys(options.headers).forEach((headerKey: any) => {
                    prototype.headers[headerKey] = options.headers[headerKey]
                })
            }

            if (!$http) {
                // TODO: Verify the whether the const is necessity
                // tslint:disable-next-line:no-unused-variable
                const wait = await serviceVerify()
            }
            $http(prototype).then((response: any) => {
                // Data Stores
                this.status = response.status

                // Begin Watching
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

                if (response.status === 200 && _.isObject(response.data)) {
                    // TODO: Make this into an over-writable function
                    // Data
                    this.header.set(response.headers() || {})
                    this.meta.set(response.data.meta || {})
                    this.route.set(response.data.route || {})
                    const convoy = response.data.payload || response.data
                    const status: { code: string }[] = this.meta.get('status')
                    if (this.meta.has('status') && _.first(status).code !== 'SUCCESS') {
                        this.error = true
                    } else if (_.isArray(convoy) && convoy.length) {
                        this.recv = _.first(convoy)
                        this.error = false
                    } else if (_.isObject(convoy) && !_.isArray(convoy)) {
                        this.recv = convoy
                        this.error = false
                    } else {
                        this.error = true
                    }

                    // Diff Settings
                    if (!this.error) {
                        // This is the ChangeSet coming from alterations between what is sent and received (i.e. new version)
                        // const recvChangeSet = _.cloneDeep(patch(this.recv, this.sent))
                        // console.log('recvChangeSet:', recvChangeSet)

                        // This is the ChangeSet generated from what has changed during the save
                        const intermediateData = _.cloneDeep(this.recv)
                        const intermediateChangeSet = _.cloneDeep(patch(this.data, this.sent))
                        if (!_.isEmpty(intermediateChangeSet)) {
                            if (cookie('env')) {
                                console.log('Intermediate ChangeSet detected:', intermediateChangeSet)
                            }
                            _.forEach(intermediateChangeSet, (element: any, key: any) => {
                                _.set(intermediateData, key, element)
                            })
                        }

                        // Propagate Changes
                        this.data = _.cloneDeep(intermediateData) as T
                        this.changed = false
                        this.saving = false
                        this.handleChanges()
                        this.patch = {}
                    }

                    // XHR Flags
                    this.pending = false
                    this.completed = true

                    // XHR Flags for Collection
                    if (this.collection) {
                        // TODO: Change to a Model ID Register
                        this.collection.pending = false
                    }

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
                } else {
                    // XHR Flags
                    this.error = true

                    // Build Report
                    const error = new Stratus.Prototypes.Error()
                    error.payload = _.isObject(response.data) ? response.data : response
                    if (response.statusText && response.statusText !== 'OK') {
                        error.message = response.statusText
                    } else if (!_.isObject(response.data)) {
                        error.message = `Invalid Payload: ${prototype.method} ${prototype.url}`
                    } else {
                        error.message = 'Unknown Model error!'
                    }

                    // XHR Flags
                    this.pending = false

                    // Note: I've disabled this because a model should not be marked
                    // as completed if it hasn't received a proper entity or prototype
                    // initially.  This is to ensure we don't save entities with the
                    // possibility of nullified fields due to a broken retrieval,
                    // resulting in the replacement of good data for bad.
                    // this.completed = true

                    // XHR Flags for Collection
                    if (this.collection) {
                        // TODO: Change to a Model ID Register
                        this.collection.pending = false
                    }

                    // Events
                    this.trigger('error', this)
                    this.trigger('complete', this)

                    // Propagate Collection Change Event
                    if (this.collection instanceof Collection) {
                        this.collection.throttleTrigger('change')
                    }

                    // Promise
                    reject(error)
                }
            }).catch((message: any) => {
                // (/(.*)\sReceived/i).exec(error.message)[1]
                // Treat a fatal error like 500 (our UI code relies on this distinction)
                this.status = 500
                this.error = true
                console.error(`XHR: ${prototype.method} ${prototype.url}`, message)
                reject.call(message)
            })
        })
    }

    fetch(action?: any, data?: any, options?: any) {
        return this.sync(action, data || this.meta.get('api'), options)
            .catch(async (message: any) => {
                this.status = 500
                this.error = true
                console.error('FETCH:', message)
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
                        .textContent('Failure to Fetch!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                )
            })
    }

    save(options?: any): Promise<any> {
        this.saving = true
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
                console.error('SAVE:', message)
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

    /**
     * TODO: Ensure the meta temp locations get cleared appropriately before removing function
     * @deprecated This is specific to the Sitetheory 1.0 API and will be removed entirely
     */
    specialAction(action: any) {

        this.meta.temp('api.options.apiSpecialAction', action)
        this.save()
        if (this.meta.get('api') &&
            Object.prototype.hasOwnProperty.call(this.meta.get('api'), 'options') &&
            Object.prototype.hasOwnProperty.call(this.meta.get('api').options, 'apiSpecialAction')) {
            delete this.meta.get('api').options.apiSpecialAction
        }
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
        if (this.meta.size() > 0) {
            this.meta.clearTemp()
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
        if (typeof attr !== 'string' || !this.data || typeof this.data !== 'object') {
            return undefined
        }
        return this.buildPath(attr).reduce(
            (attrs: any, link: any) => attrs && attrs[link], this.data
        )
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

    set(attr: any, value: any) {
        if (!attr) {
            console.warn('No attr for model.set()!')
            return this
        }
        if (typeof attr === 'object') {

            _.forEach(attr, (valueChain: any, attrChain: any) => {
                this.setAttribute(attrChain, valueChain)
            })
            return this
        }
        this.setAttribute(attr, value)
        return this
    }

    setAttribute(attr: any, value: any) {
        if (typeof attr !== 'string') {
            console.warn('Malformed attr for model.setAttribute()!')
            return false
        }
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
        // TODO: Add a confirmation option here
        if (!this.getIdentifier()) {
            return new Promise((resolve, reject) => {
                reject('Unable to delete (non-persisted) model without id.')
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
                console.error('DESTROY:', message)
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

// This Model Service handles data binding for a single object with the $http
// Service
Stratus.Services.Model = [
    '$provide', ($provide: any) => {
        $provide.factory('Model', [
            // '$http',
            // '$rootScope',
            // '$mdToast',
            (
                // $h: angular.IHttpService,
                // $r: angular.IRootScopeService,
                // $m: angular.material.IToastService
            ) => {
                // $http = $h
                // $rootScope = $r
                // $mdToast = $m
                return Model
            }
        ])
    }
]
Stratus.Data.Model = Model
