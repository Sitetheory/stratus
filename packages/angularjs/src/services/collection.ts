// Collection Service
// ------------------

// Runtime
import _ from 'lodash'
import angular from 'angular'
import {Stratus} from '@stratusjs/runtime/stratus'

// Stratus Core
import {ModelBase} from '@stratusjs/core/datastore/modelBase'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {cookie} from '@stratusjs/core/environment'
import {ucfirst} from '@stratusjs/core/misc'

// Modules
import 'angular-material' // Reliant for $mdToast

// AngularJS Dependency Injector
import {getInjector} from '@stratusjs/angularjs/injector'

// AngularJS Services
import {Model} from '@stratusjs/angularjs/services/model'

// Instantiate Injector
let injector = getInjector()

// Angular Services
// let $http: angular.IHttpService = injector ? injector.get('$http') : null
let $http: angular.IHttpService
// let $mdToast: angular.material.IToastService = injector ? injector.get('$mdToast') : null
let $mdToast: angular.material.IToastService

// Service Verification Function
const serviceVerify = async () => {
    return new Promise(async (resolve, reject) => {
        if ($http && $mdToast) {
            resolve(true)
            return
        }
        if (!injector) {
            injector = getInjector()
        }
        if (injector) {
            $http = injector.get('$http')
            $mdToast = injector.get('$mdToast')
        }
        if ($http && $mdToast) {
            resolve(true)
            return
        }
        setTimeout(() => {
            if (cookie('env')) {
                console.log('wait for $http & $mdToast service:', {
                    $http,
                    $mdToast
                })
            }
            serviceVerify().then(resolve)
        }, 250)
    })
}

export interface HttpPrototype {
    headers: any
    method: string
    url: string
    data?: any
}

export class Collection extends EventManager {
    // Base Information
    name = 'Collection'

    // Environment
    target?: any = null
    direct = false
    infinite = false
    threshold = 0.5
    qualifier = '' // ng-if
    decay = 0
    urlRoot = '/Api'
    targetSuffix?: string = null
    serviceId?: number = null

    // Infrastructure
    header = new ModelBase()
    meta = new ModelBase()
    model = Model
    models: any = []
    types: any = []
    cache: any = {}

    // Internals
    pending = false
    error = false
    completed = false

    // Action Flags
    filtering = false
    paginate = false

    // Methods
    throttle = _.throttle(this.fetch, 1000)

    constructor(options: any) {
        super()

        if (options && typeof options === 'object') {
            angular.extend(this, options)
        }

        // Generate URL
        if (this.target) {
            this.urlRoot += '/' + ucfirst(this.target)
        }

        // Scope Binding
        this.serialize = this.serialize.bind(this)
        this.url = this.url.bind(this)
        this.inject = this.inject.bind(this)
        this.sync = this.sync.bind(this)
        this.fetch = this.fetch.bind(this)
        this.filter = this.filter.bind(this)
        this.throttleFilter = this.throttleFilter.bind(this)
        this.page = this.page.bind(this)
        this.toJSON = this.toJSON.bind(this)
        this.add = this.add.bind(this)
        this.remove = this.remove.bind(this)
        this.find = this.find.bind(this)
        this.pluck = this.pluck.bind(this)
        this.exists = this.exists.bind(this)

        // Infinite Scrolling
        /* *
         this.infiniteModels = {
         numLoaded_: 0,
         toLoad_: 0,
         // Required.
         getItemAtIndex: function(index) {
         if (index > this.numLoaded_) {
         this.fetchMoreItems_(index)
         return null
         }
         return index
         },
         // Required.
         // For infinite scroll behavior, we always return a slightly higher
         // number than the previously loaded items.
         getLength: function() {
         return this.numLoaded_ + 5
         },
         fetchMoreItems_: function(index) {
         // For demo purposes, we simulate loading more items with a timed
         // promise. In real code, this function would likely contain an
         // $http request.
         if (this.toLoad_ < index) {
         this.toLoad_ += 20
         $timeout(angular.noop, 300).then(angular.bind(this, function() {
         this.numLoaded_ = this.toLoad_
         }))
         }
         }
         }
         /* */
    }

    serialize(obj: any, chain?: any) {
        const that = this
        const str: string[] = []
        obj = obj || {}
        _.forEach(obj, (value: any, key: any) => {
            if (_.isObject(value)) {
                if (chain) {
                    key = chain + '[' + key + ']'
                }
                str.push(that.serialize(value, key))
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
        const that = this
        return that.urlRoot + (that.targetSuffix || '')
    }

    inject(data: any, type?: any) {
        if (!_.isArray(data)) {
            return
        }
        if (this.types && this.types.indexOf(type) === -1) {
            this.types.push(type)
        }
        // TODO: Make this able to be flagged as direct entities
        data.forEach((target: any) => {
            // TODO: Add references to the Catalog when creating these
            // models
            this.models.push(new Model({
                collection: this,
                type: type || null
            }, target))
        })
    }

    // TODO: Abstract this deeper
    sync(action: string, data: any, options: any) {
        const that: Collection = this

        // Internals
        this.pending = true
        this.completed = false

        return new Promise(async (resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const prototype: HttpPrototype = {
                method: action,
                url: that.url(),
                headers: {}
            }
            if (!_.isUndefined(data)) {
                if (action === 'GET') {
                    if (_.isObject(data) && Object.keys(data).length) {
                        prototype.url += prototype.url.includes('?') ? '&' : '?'
                        prototype.url += that.serialize(data)
                    }
                } else {
                    prototype.headers['Content-Type'] = 'application/json'
                    prototype.data = JSON.stringify(data)
                }
            }

            if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                Object.keys(options.headers).forEach((headerKey: any) => {
                    prototype.headers[headerKey] = options.headers[headerKey]
                })
            }

            const queryHash = `${prototype.method}:${prototype.url}`
            const handler = (response: any) => {
                if (response.status === 200 && _.isObject(response.data)) {
                    // TODO: Make this into an over-writable function

                    // Cache reference
                    if (prototype.method === 'GET' && !(queryHash in that.cache)) {
                        that.cache[queryHash] = response
                    }

                    // Data
                    that.header.set(response.headers() || {})
                    that.meta.set(response.data.meta || {})
                    that.models = []
                    const recv = response.data.payload || response.data
                    if (that.direct) {
                        that.models = recv
                    } else if (_.isArray(recv)) {
                        that.inject(recv)
                    } else if (_.isObject(recv)) {
                        _.each(recv, that.inject)
                    } else {
                        console.error('malformed payload:', recv)
                    }

                    // XHR Flags
                    that.pending = false
                    that.completed = true

                    // Action Flags
                    that.filtering = false
                    that.paginate = false

                    // Trigger Change Event
                    that.throttleTrigger('change')

                    // Promise
                    resolve(that.models)
                } else {
                    // XHR Flags
                    that.pending = false
                    that.error = true

                    // Build Report
                    const error = new Stratus.Prototypes.Error()
                    error.payload = _.isObject(response.data) ? response.data : response
                    if (response.statusText && response.statusText !== 'OK') {
                        error.message = response.statusText
                    } else if (!_.isObject(response.data)) {
                        error.message = `Invalid Payload: ${prototype.method} ${prototype.url}`
                    } else {
                        error.message = 'Unknown AngularCollection error!'
                    }

                    // Trigger Change Event
                    that.throttleTrigger('change')

                    // Promise
                    reject(error)
                }

                // Trigger Change Event
                that.throttleTrigger('change')
            }
            if (prototype.method === 'GET' && queryHash in that.cache) {
                handler(that.cache[queryHash])
                return
            }
            if (!$http) {
                const wait = await serviceVerify()
            }
            $http(prototype)
                .then(handler)
                .catch((error: any) => {
                    // (/(.*)\sReceived/i).exec(error.message)[1]
                    console.error(`XHR: ${prototype.method} ${prototype.url}`)
                    that.throttleTrigger('change')
                    reject(error)
                    throw error
                })
        })
    }

    fetch(action?: string, data?: any, options?: any) {
        const that = this
        return that.sync(action, data || that.meta.get('api'), options)
            .catch(async (error: any) => {
                    if (!$mdToast) {
                        const wait = await serviceVerify()
                    }
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Failure to Fetch!')
                            .toastClass('errorMessage')
                            .position('top right')
                            .hideDelay(3000)
                    )
                    console.error('FETCH:', error)
                }
            )
    }

    filter(query: string) {
        this.filtering = true
        this.meta.set('api.q', !_.isUndefined(query) ? query : '')
        this.meta.set('api.p', 1)
        return this.fetch()
    }

    throttleFilter(query: string) {
        this.meta.set('api.q', !_.isUndefined(query) ? query : '')
        const that = this
        return new Promise((resolve: any, reject: any) => {
            const request = that.throttle()
            if (!Stratus.Environment.get('production')) {
                console.log('request:', request)
            }
            request.then((models: any) => {
                if (!Stratus.Environment.get('production')) {
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
        this.paginate = true
        this.meta.set('api.p', page)
        this.fetch()
        delete this.meta.get('api').p
    }

    toJSON() {
        return this.models.map((model: Model) => model.toJSON())
    }

    add(target: any, options: any) {
        if (!_.isObject(target)) {
            return
        }
        if (!options || typeof options !== 'object') {
            options = {}
        }
        const that = this
        target = (target instanceof Model) ? target : new Model({
            collection: that
        }, target)
        that.models.push(target)
        that.throttleTrigger('change')
        if (options.save) {
            target.save()
        }
    }

    remove(target: Model) {
        this.models.splice(this.models.indexOf(target), 1)
        this.throttleTrigger('change')
        return this
    }

    find(predicate: string) {
        return _.find(this.models, _.isFunction(predicate) ? predicate : (model: Model) => model.get('id') === predicate)
    }

    pluck(attribute: string) {
        return _.map(this.models, element => element instanceof Model ? element.pluck(attribute) : null)
    }

    exists(attribute: string) {
        return !!_.reduce(this.pluck(attribute) || [], (memo: any, data: any) => memo || !_.isUndefined(data))
    }
}

// This Collection Service handles data binding for multiple objects with the
// $http Service
// TODO: Build out the query-only structure here as a separate set of
// registered collections and models
// RAJ Added $qProvide to handle unhandleExceptions in angular 1.6
Stratus.Services.Collection = [
    '$provide',
    ($provide: angular.auto.IProvideService) => {
        $provide.factory('Collection', [
            // '$http',
            // '$mdToast',
            // 'Model',
            (
                // $h: angular.IHttpService,
                // $m: angular.material.IToastService,
                // M: Model
            ) => {
                // $http = $h
                // $mdToast = $m
                return Collection
            }
        ])
    }
]
Stratus.Data.Collection = Collection
