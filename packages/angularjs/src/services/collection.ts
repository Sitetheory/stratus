// Collection Service
// ------------------

// Transformers
import { keys } from 'ts-transformer-keys'

// Runtime
import _, {cloneDeep} from 'lodash'
import angular from 'angular'
import {Stratus} from '@stratusjs/runtime/stratus'

// Stratus Core
import {ErrorBase} from '@stratusjs/core/errors/errorBase'
import {ModelBase} from '@stratusjs/core/datastore/modelBase'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {cookie} from '@stratusjs/core/environment'
import {
    isJSON,
    LooseFunction,
    LooseObject,
    ucfirst
} from '@stratusjs/core/misc'
import {XHR, XHRRequest} from '@stratusjs/core/datastore/xhr'

// AngularJS Services
import {Model, ModelOptions} from './model'

// Third-Party
import Toastify from 'toastify-js'

export interface HttpPrototype {
    headers: LooseObject
    method: string
    url: string
    data?: string
}

export interface CollectionOptions {
    autoSave?: boolean,
    autoSaveInterval?: number,
    cache?: boolean,
    // decay?: number
    direct?: boolean,
    // infinite?: boolean,
    // qualifier?: string,
    target?: string,
    targetSuffix?: string,
    // threshold?: number,
    urlRoot?: string,
    watch?: boolean,
    payload?: string,
    convoy?: string,
}

export interface CollectionModelOptions extends ModelOptions {
    // This adds a new model to the beginning of the collection.models
    prepend?: boolean,

    // This forces a save (intended for use without autoSave enabled)
    save?: boolean

    // This triggers the collection add event
    trigger?: boolean
}

export const CollectionOptionKeys = keys<CollectionOptions>()

export interface CollectionSyncOptions {
    headers?: LooseObject<string>
    nocache?: boolean
}

export class Collection<T = LooseObject> extends EventManager {
    // Base Information
    name = 'Collection'

    // Environment
    direct = false
    target?: any = null
    targetSuffix?: string = null
    urlRoot = '/Api'
    toast = true

    // Unsure usage
    qualifier = '' // data-ng-if
    serviceId?: number = null

    // Infinite Scrolling
    infinite = false
    threshold = 0.5
    decay = 0

    // Infrastructure
    header = new ModelBase<T>()
    meta = new ModelBase<T>()
    model = Model
    models: Model<T>[] | (Model<T>['data'])[] = []
    types: Array<string> = []
    xhr: XHR
    cacheResponse: LooseObject<LooseObject|Array<LooseObject>|string> = {}
    cacheHeaders: LooseObject<LooseObject<string>> = {}

    // Internals
    cache = false
    pending = false
    error = false
    completed = false

    // Action Flags
    filtering = false
    paginate = false

    // Allow watching models
    watch = false

    // Allow AutoSaving
    autoSave = false
    autoSaveInterval = 2500

    // Methods
    throttle = _.throttle(this.fetch, 1000)

    constructor(options: CollectionOptions = {}) {
        super()

        if (options && typeof options === 'object') {
            angular.extend(this, options)
        }

        // Generate URL
        if (this.target) {
            this.urlRoot += '/' + ucfirst(this.target)
        }

        // Handle Convoy
        if (options.convoy) {
            const convoy = isJSON(options.convoy) ? JSON.parse(options.convoy) : options.convoy
            if (_.isObject(convoy)) {
                this.meta.set((convoy as LooseObject).meta || {})
                const models = (convoy as LooseObject).payload
                if (_.isArray(models)) {
                    this.inject(models)
                    this.completed = true
                } else {
                    console.error('malformed payload:', models)
                }
            } else {
                console.error('malformed convoy:', convoy)
            }
        }

        // Handle Payload
        if (options.payload) {
            const models = isJSON(options.payload) ? JSON.parse(options.payload) : options.payload
            if (_.isArray(models)) {
                this.inject(models)
                this.completed = true
            } else {
                console.error('malformed payload:', models)
            }
        }

        // Scope Binding
        // this.serialize = this.serialize.bind(this)
        // this.url = this.url.bind(this)
        // this.inject = this.inject.bind(this)
        // this.sync = this.sync.bind(this)
        // this.fetch = this.fetch.bind(this)
        // this.filter = this.filter.bind(this)
        // this.throttleFilter = this.throttleFilter.bind(this)
        // this.page = this.page.bind(this)
        // this.toJSON = this.toJSON.bind(this)
        // this.add = this.add.bind(this)
        // this.remove = this.remove.bind(this)
        // this.find = this.find.bind(this)
        // this.pluck = this.pluck.bind(this)
        // this.exists = this.exists.bind(this)

        // Infinite Scrolling
        // this.infiniteModels = {
        //     numLoaded_: 0,
        //     toLoad_: 0,
        //     // Required.
        //     getItemAtIndex: function(index) {
        //         if (index > this.numLoaded_) {
        //             this.fetchMoreItems_(index)
        //             return null
        //         }
        //         return index
        //     },
        //     // Required.
        //     // For infinite scroll behavior, we always return a slightly higher
        //     // number than the previously loaded items.
        //     getLength: function() {
        //         return this.numLoaded_ + 5
        //     },
        //     fetchMoreItems_: function(index) {
        //         // For demo purposes, we simulate loading more items with a timed
        //         // promise. In real code, this function would likely contain an
        //         // XHR request.
        //         if (this.toLoad_ < index) {
        //             this.toLoad_ += 20
        //             $timeout(angular.noop, 300).then(angular.bind(this, function() {
        //                 this.numLoaded_ = this.toLoad_
        //             }))
        //         }
        //     }
        // }
    }

    serialize(obj: any, chain?: any) {
        const str: string[] = []
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

    url() {
        return this.urlRoot + (this.targetSuffix || '')
    }

    inject(data: Array<LooseObject>, type?: string) {
        if (!_.isArray(data)) {
            return
        }
        if (this.types && this.types.indexOf(type) === -1) {
            this.types.push(type)
        }
        // TODO: Make this able to be flagged as direct entities
        if (!this.direct) {
            data.forEach((target: any) => {
                // TODO: Add references to the Catalog when creating these models
                (this.models as Model<T>[]).push(new Model<T>({
                    autoSave: this.autoSave,
                    autoSaveInterval: this.autoSaveInterval,
                    collection: this,
                    completed: true,
                    received: true,
                    toast: this.toast,
                    type: type || null,
                    watch: this.watch
                }, target))
            })
        }
    }

    // TODO: Abstract this deeper
    sync(action?: string, data?: LooseObject, options?: CollectionSyncOptions) {
        // XHR Flags
        this.pending = true

        return new Promise(async (resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const request: XHRRequest = {
                method: action,
                url: this.url(),
                headers: {}
            }
            if (!_.isUndefined(data)) {
                if (action === 'GET') {
                    if (_.isObject(data) && Object.keys(data).length) {
                        request.url += request.url.includes('?') ? '&' : '?'
                        request.url += this.serialize(data)
                    }
                } else {
                    request.headers['Content-Type'] = 'application/json'
                    request.data = JSON.stringify(data)
                }
            }

            if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                Object.keys(options.headers).forEach((headerKey: string) => {
                    request.headers[headerKey] = options.headers[headerKey]
                })
            }

            // Create QueryHash for Responses
            const queryHash = `${request.method}:${request.url}`

            // Clear Cache upon Request
            if (options.nocache) {
                if (queryHash in this.cacheResponse) {
                    delete this.cacheResponse[queryHash]
                }
                if (queryHash in this.cacheHeaders) {
                    delete this.cacheHeaders[queryHash]
                }
            }

            // begin request
            this.xhr = new XHR(request)

            // TODO: Make this into an over-writable function
            const handler = (response: LooseObject | Array<LooseObject> | string) => {
                if (!_.isObject(response) && !_.isArray(response)) {
                    // Build Report
                    const error = new ErrorBase({
                        payload: response,
                        message: `Invalid Payload: ${request.method} ${request.url}`
                    }, {})

                    // XHR Flags
                    this.error = true
                    this.pending = false

                    // Note: I've disabled this because a model should not be marked
                    // as completed if it hasn't received a proper entity or prototype
                    // initially.  This is to ensure we don't save entities with the
                    // possibility of nullified fields due to a broken retrieval,
                    // resulting in the replacement of good data for bad.
                    // this.completed = true

                    // Trigger Change Event
                    this.throttleTrigger('change')
                    this.trigger('error', error)

                    // Promise
                    reject(error)

                    return
                }

                // TODO: Make this able to wipe the cache
                let responseHeaders: LooseObject<string> = null

                // Handle Cache on GET methods
                if (this.cache && request.method === 'GET') {
                    // Cache Request
                    if (!(queryHash in this.cacheResponse)) {
                        this.cacheResponse[queryHash] = cloneDeep(response)
                    }
                    // Cache Headers
                    if (!(queryHash in this.cacheHeaders)) {
                        this.cacheHeaders[queryHash] = this.xhr.getAllResponseHeaders()
                    } else {
                        responseHeaders = this.cacheHeaders[queryHash]
                    }
                }

                // Data
                this.header.set(responseHeaders || this.xhr.getAllResponseHeaders())
                this.meta.set((response as LooseObject).meta || {})
                this.models = []
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
                } else if (this.direct) {
                    this.models = payload
                } else if (_.isArray(payload)) {
                    this.inject(payload)
                } else if (_.isObject(payload)) {
                    // Note: this is explicitly stated due to context binding
                    _.forEach(payload, (value: any, key: any) => {
                        this.inject(value, key)
                    })
                } else {
                    // If we've gotten this far, it's passed the status check if one is available
                    if (!this.meta.has('status') && !this.meta.has('success')) {
                        // If the status check was not available, this classifies as an error, since the payload is invalid.
                        this.error = true
                    }
                    console.warn(`Invalid Payload: ${request.method} ${request.url}`)
                }

                // XHR Flags
                this.pending = false
                this.completed = true

                // Action Flags
                this.filtering = !_.isEmpty(this.meta.get('api.q'))
                this.paginate = !_.isEmpty(this.meta.get('api.p'))

                // Clear Meta Temps
                this.meta.clearTemp()

                // Trigger Change Event
                this.throttleTrigger('change')
                this.trigger('complete')

                // Promise
                resolve(this.models)
            }
            // handle response cache (headers are cached in the handler)
            if (this.cache && request.method === 'GET' && queryHash in this.cacheResponse) {
                handler(this.cacheResponse[queryHash])
                return
            }
            // make the call!
            this.xhr.send()
                .then(handler)
                .catch((error: any) => {
                    // (/(.*)\sReceived/i).exec(error.message)[1]
                    console.error(`XHR: ${request.method} ${request.url}`)
                    this.throttleTrigger('change')
                    this.trigger('error', error)
                    reject(error)
                    return
                })
        })
    }

    fetch(action?: string, data?: LooseObject, options?: CollectionSyncOptions) {
        return new Promise(async (resolve: any, reject: any) => {
            this.sync(action, data || this.meta.get('api'), options)
                .then(resolve)
                .catch(async (error: XMLHttpRequest|ErrorBase) => {
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

    filter(query: string) {
        this.filtering = !_.isEmpty(query)
        this.meta.set('api.q', !_.isUndefined(query) ? query : '')
        this.meta.set('api.p', 1)
        return this.fetch()
    }

    throttleFilter(query: string) {
        this.meta.set('api.q', !_.isUndefined(query) ? query : '')
        return new Promise((resolve: any, reject: any) => {
            const request = this.throttle()
            if (cookie('env')) {
                console.log('request:', request)
            }
            request.then((models: any) => {
                if (cookie('env')) {
                    // TODO: Finish handling throttled data
                    /* *
                     console.log('throttled:', _.map(models, function (model: Model) {
                     return model.domainPrimary
                     }))
                     /* */
                }
                resolve(models)
            }).catch(reject)
        })
    }

    page(page: any) {
        this.paginate = !_.isEmpty(page)
        this.meta.set('api.p', page)
        this.fetch()
        delete this.meta.get('api').p
    }

    toJSON() {
        return !this.direct ? (this.models as Model<T>[]).map((model: Model<T>) => model.toJSON()) : this.models
    }

    add(target?: any, options?: CollectionModelOptions): Model {
        if (!_.isObject(target)) {
            console.error('collection.add: target object not set!')
            return
        }
        if (!options || typeof options !== 'object') {
            options = {}
        }
        if (target instanceof Model) {
            target.collection = this
        } else {
            options.collection = this
            target = new Model(options, target)
            target.initialize()
            if (options.autoSave || options.watch) {
                if (target.isNew()) {
                    target.save()
                } else if (!target.completed) {
                    target.fetch()
                }
            }
        }
        if (options.save) {
            target.save()
        }
        if (options.prepend) {
            this.models.unshift(target)
        } else {
            this.models.push(target)
        }
        if (options.trigger) {
            this.trigger('add', target)
        }
        this.throttleTrigger('change')
        return target
    }

    remove(target: Model<T>) {
        if (!this.direct) {
            this.models.splice((this.models as Model<T>[]).indexOf(target), 1)
            this.throttleTrigger('change')
        }
        return this
    }

    find(predicate: string|number|LooseFunction<boolean>) {
        return _.find(this.models, _.isFunction(predicate) ? predicate : (model: Model) => model.get('id') === predicate)
    }

    map(predicate: string) {
        // return _.filter(_.map(this.models, model => model instanceof Model ? model.get(predicate) : null), model => !!model)
        return _.map(this.models, model => model instanceof Model ? model.get(predicate) : null)
    }

    pluck(attribute: string) {
        return _.map(this.models, model => model instanceof Model ? model.pluck(attribute) : null)
    }

    exists(attribute: string) {
        return !!_.reduce(this.pluck(attribute) || [], (memo: any, data: any) => memo || !_.isUndefined(data))
    }

    errorMessage(error: XMLHttpRequest|ErrorBase): string|null {
        if (error instanceof ErrorBase) {
            console.error(`[${error.code}] ${error.message}`, error)
            return error.code != 'Internal' ? error.message : null
        }
        const digest = (error.responseText && isJSON(error.responseText)) ? JSON.parse(error.responseText) : null
        if (!digest) {
            return null
        }
        const message = _.get(digest, 'meta.status[0].message') || _.get(digest, 'error.exception[0].message') || null
        if (!message) {
            return null
        }
        return message
    }
}

// TODO: Build out the query-only structure here as a separate set
// This Collection Service handles data binding for multiple objects with the
// registered collections and models
Stratus.Services.Collection = [
    '$provide',
    ($provide: angular.auto.IProvideService) => {
        $provide.factory('Collection', [() => Collection])
    }
]
Stratus.Data.Collection = Collection
