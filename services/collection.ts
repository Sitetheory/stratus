// Collection Service
// ------------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Modules
import 'angular-material' // Reliant for $mdToast

// Services
import {Model} from 'stratus.services.model'

// Stratus Dependencies
import {ucfirst} from '@stratus/core/misc'

let http: any = () => {
    console.error('$$http not loaded!')
}
let mdToast: any = () => {
    console.error('$$mdToast not loaded!')
}

export class Collection extends Stratus.Prototypes.EventManager {
    throttle = _.throttle(this.fetch, 1000)

    constructor(options: any) {
        super()
        this.name = 'Collection'

        // Environment
        this.target = null
        this.direct = false
        this.infinite = false
        this.threshold = 0.5
        this.qualifier = '' // ng-if
        this.decay = 0
        this.urlRoot = '/Api'

        if (options && typeof options === 'object') {
            angular.extend(this, options)
        }

        // Infrastructure
        this.header = new Stratus.Prototypes.Model()
        this.meta = new Stratus.Prototypes.Model()
        this.model = Model
        this.models = []
        this.types = []

        // Internals
        this.pending = false
        this.error = false
        this.completed = false

        // Action Flags
        this.filtering = false
        this.paginate = false

        // Generate URL
        if (this.target) {
            this.urlRoot += '/' + ucfirst(this.target)
        }

        // Infinite Scrolling
        /* *
         this.infiniteModels = {
         numLoaded_: 0,
         toLoad_: 0,
         // Required.
         getItemAtIndex: function (index) {
         if (index > this.numLoaded_) {
         this.fetchMoreItems_(index)
         return null
         }
         return index
         },
         // Required.
         // For infinite scroll behavior, we always return a slightly higher
         // number than the previously loaded items.
         getLength: function () {
         return this.numLoaded_ + 5
         },
         fetchMoreItems_: function (index) {
         // For demo purposes, we simulate loading more items with a timed
         // promise. In real code, this function would likely contain an
         // $http request.
         if (this.toLoad_ < index) {
         this.toLoad_ += 20
         $timeout(angular.noop, 300).then(angular.bind(this, function () {
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
        angular.forEach(obj, (value: any, key: any) => {
            if (angular.isObject(value)) {
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
        const that = this
        if (that.types.indexOf(type) === -1) {
            that.types.push(type)
        }
        // TODO: Make this able to be flagged as direct entities
        data.forEach((target: any) => {
            // TODO: Add references to the Catalog when creating these
            // models
            that.models.push(new Model({
                collection: that,
                type: type || null
            }, target))
        })
    }

    // TODO: Abstract this deeper
    sync(action: string, data: any, options: any) {
        const that = this

        // Internals
        that.pending = true
        that.completed = false

        return new Promise((resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const prototype: { headers: any; method: string; url: string; data?: any } = {
                method: action,
                url: that.url(),
                headers: {}
            }
            if (angular.isDefined(data)) {
                if (action === 'GET') {
                    if (angular.isObject(data) && Object.keys(data).length) {
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

            http(prototype).then((response: any) => {
                if (response.status === 200 && angular.isObject(response.data)) {
                    // TODO: Make this into an over-writable function

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
            }).catch((error: any) => {
                // (/(.*)\sReceived/i).exec(error.message)[1]
                console.error('XHR: ' + prototype.method + ' ' + prototype.url)
                that.throttleTrigger('change')
                reject(error)
                throw error
            })
        })
    }

    fetch(action?: string, data?: any, options?: any) {
        const that = this
        return that.sync(action, data || that.meta.get('api'), options).catch(
            (error: any) => {
                mdToast.show(
                    mdToast.simple()
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
        this.meta.set('api.q', angular.isDefined(query) ? query : '')
        this.meta.set('api.p', 1)
        return this.fetch()
    }

    throttleFilter(query: string) {
        this.meta.set('api.q', angular.isDefined(query) ? query : '')
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
        if (!angular.isObject(target)) {
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

    remove(target: string) {
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
        return !!_.reduce(this.pluck(attribute) || [], (memo: any, data: any) => memo || angular.isDefined(data))
    }
}

// This Collection Service handles data binding for multiple objects with the
// $http Service
// TODO: Build out the query-only structure here as a separate set of
// registered collections and models
// RAJ Added $qProvide to handle unhandleExceptions in angular 1.6
Stratus.Services.Collection = [
    '$provide',
    ($provide: any) => {
        $provide.factory('Collection', [
            '$http',
            '$mdToast',
            ($http: any, $mdToast: any) => {
                http = $http
                mdToast = $mdToast
                return Collection
            }
        ])
    }
]
Stratus.Data.Collection = Collection
