// Model Service
// -------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Modules
import 'angular-material' // Reliant for $mdToast

// Stratus Dependencies
import {getAnchorParams, getUrlParams, patch, setUrlParams, strcmp, ucfirst} from '@stratusjs/core/misc'

let http: any = () => {
    console.error('$$http not loaded!')
}
let mdToast: any = () => {
    console.error('$$mdToast not loaded!')
}
let rootScope: any = () => {
    console.error('$rootScope not loaded!')
}

export class Model extends Stratus.Prototypes.Model {
    constructor(options: any, attributes: any) {
        super()
        this.name = 'Model'

        // Environment
        this.target = null
        this.manifest = false
        this.stagger = false
        this.toast = false
        this.urlRoot = '/Api'
        this.collection = null

        // Inject Options
        _.extend(this, (!options || typeof options !== 'object') ? {} : options)

        // Infrastructure
        this.identifier = null
        this.data = {}

        // The data used to detect the data is changed.
        // this.initData = {}

        // Handle Collections & Meta
        this.header = new Stratus.Prototypes.Model()
        this.meta = new Stratus.Prototypes.Model()
        if (!_.isEmpty(this.collection)) {
            if (this.collection.target) {
                this.target = this.collection.target
            }
            if (this.collection.meta.has('api')) {
                this.meta.set('api', this.collection.meta.get('api'))
            }
        }

        // Handle Attributes (Typically from Collection Hydration)
        if (attributes && typeof attributes === 'object') {
            angular.extend(this.data, attributes)
        }

        // Generate URL
        if (this.target) {
            this.urlRoot += '/' + ucfirst(this.target)
        }

        // XHR Flags
        this.pending = false
        this.error = false
        this.completed = false
        this.status = null

        // TODO: Enable Auto-Save

        // Auto-Saving Flags
        this.changed = false
        this.saving = false
        this.watching = false

        // Auto-Saving Logic
        this.patch = {}

        this.bracket = {
            match: /\[[\d+]]/,
            search: /\[([\d+])]/g,
            attr: /(^[^[]+)/
        }

        // Scope Binding
        this.watcher = this.watcher.bind(this)
        this.getIdentifier = this.getIdentifier.bind(this)
        this.isNew = this.isNew.bind(this)
        this.getType = this.getType.bind(this)
        this.getHash = this.getHash.bind(this)
        this.url = this.url.bind(this)
        this.serialize = this.serialize.bind(this)
        this.sync = this.sync.bind(this)
        this.fetch = this.fetch.bind(this)
        this.save = this.save.bind(this)
        this.specialAction = this.specialAction.bind(this)
        this.throttleSave = this.throttleSave.bind(this)
        this.toJSON = this.toJSON.bind(this)
        this.toPatch = this.toPatch.bind(this)
        this.buildPath = this.buildPath.bind(this)
        this.get = this.get.bind(this)
        this.find = this.find.bind(this)
        this.set = this.set.bind(this)
        this.setAttribute = this.setAttribute.bind(this)
        this.toggle = this.toggle.bind(this)
        this.pluck = this.pluck.bind(this)
        this.exists = this.exists.bind(this)
        this.destroy = this.destroy.bind(this)

        this.throttle = _.throttle(this.save, 2000)

        this.initialize = _.once(this.initialize || function() {
            const that = this
            // Bubble Event + Defer
            // that.on('change', function () {
            //   if (!that.collection) {
            //     return
            //   }
            //   that.collection.throttleTrigger('change')
            // })
            if (this.manifest && !this.getIdentifier()) {
                this.sync('POST', this.meta.has('api') ? {
                    meta: this.meta.get('api'),
                    payload: {}
                } : {}).catch((message: any) => {
                    if (that.toast) {
                        mdToast.show(
                            mdToast.simple()
                                .textContent('Failure to Manifest!')
                                .toastClass('errorMessage')
                                .position('top right')
                                .hideDelay(3000)
                        )
                    }
                    console.error('MANIFEST:', message)
                })
            }
        })

        if (!this.stagger) {
            this.initialize()
        }
    }

    // Watch for Data Changes
    watcher() {
        if (this.watching) {
            return true
        }
        this.watching = true
        const that = this
        rootScope.$watch(() => that.data,
            (newData: any, priorData: any) => {
            const patchData = patch(newData, priorData)

            _.each(_.keys(patchData), (key: any) => {
                if (_.endsWith(key, '$$hashKey')) {
                    delete patchData[key]
                }
            })

            // Set the origin data
            /* *
             if (_.isEmpty(that.initData)) {
             angular.copy(that.data, that.initData)
             }
             /* */

            if (!patchData) {
                return true
            }

            if (!Stratus.Environment.get('production')) {
                console.log('Patch:', patchData)
            }

            that.changed = true

            const version = getAnchorParams('version')

            // that.changed = !angular.equals(newData, that.initData)
            if ((newData.id && newData.id !== priorData.id) ||
                (!_.isEmpty(version) && newData.version && parseInt(version, 10) !== newData.version.id)
            ) {
                // console.warn('replacing version...')
                window.location.replace(
                    setUrlParams({
                        id: newData.id
                    })
                )
            }
            that.patch = _.extend(that.patch, patchData)
            that.throttleTrigger('change')
        }, true)
    }

    getIdentifier() {
        return (this.identifier = this.get('id') || this.identifier)
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
        const that = this
        const str: any = []
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

    // TODO: Abstract this deeper
    sync(action?: any, data?: any, options?: any) {
        const that: Model = this
        this.pending = true
        return new Promise((resolve: any, reject: any) => {
            action = action || 'GET'
            options = options || {}
            const prototype: any = {
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

            if (!Stratus.Environment.get('production')) {
                console.log('Prototype:', prototype)
            }

            if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                Object.keys(options.headers).forEach((headerKey: any) => {
                    prototype.headers[headerKey] = options.headers[headerKey]
                })
            }

            http(prototype).then((response: any) => {
                // XHR Flags
                that.pending = false
                that.completed = true

                // Data Stores
                that.status = response.status

                // Begin Watching
                that.watcher()

                // Reset status model
                setTimeout(() => {
                    that.changed = false
                    that.throttleTrigger('change')
                    if (that.collection) {
                        that.collection.throttleTrigger('change')
                    }
                }, 100)

                if (response.status === 200 && angular.isObject(response.data)) {
                    // TODO: Make this into an over-writable function
                    // Data
                    that.header.set(response.headers() || {})
                    that.meta.set(response.data.meta || {})
                    const convoy = response.data.payload || response.data
                    const status: {code: string}[] = that.meta.get('status')
                    if (that.meta.has('status') && _.first(status).code !== 'SUCCESS') {
                        that.error = true
                    } else if (angular.isArray(convoy) && convoy.length) {
                        that.data = _.first(convoy)
                        that.error = false
                    } else if (angular.isObject(convoy) && !angular.isArray(convoy)) {
                        that.data = convoy
                        that.error = false
                    } else {
                        that.error = true
                    }

                    if (!that.error) {
                        // Auto-Saving Settings
                        that.saving = false
                        that.patch = {}
                    }

                    // Promise
                    // angular.copy(that.data, that.initData)
                    resolve(that.data)
                } else {
                    // XHR Flags
                    that.error = true

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

                    // Promise
                    reject(error)
                }
            }).catch((message: any) => {
                // (/(.*)\sReceived/i).exec(error.message)[1]
                // Treat a fatal error like 500 (our UI code relies on this distinction)
                that.status = 500
                that.error = true
                console.error(`XHR: ${prototype.method} ${prototype.url}`, message)
                reject.call(message)
            })
        })
    }

    fetch(action?: any, data?: any, options?: any) {
        const that = this
        return this.sync(action, data || this.meta.get('api'), options)
            .catch((message: any) => {
                if (that.toast) {
                    mdToast.show(
                        mdToast.simple()
                            .textContent('Failure to Fetch!')
                            .toastClass('errorMessage')
                            .position('top right')
                            .hideDelay(3000)
                    )
                }
                that.status = 500
                that.error = true
                console.error('FETCH:', message)
            })
    }

    save() {
        const that = this
        that.saving = true
        return that.sync(that.getIdentifier() ? 'PUT' : 'POST',
            that.toJSON({
                patch: true
            }))
            .catch((message: any) => {
                if (that.toast) {
                    mdToast.show(
                        mdToast.simple()
                            .textContent('Failure to Save!')
                            .toastClass('errorMessage')
                            .position('top right')
                            .hideDelay(3000)
                    )
                }
                that.error = true
                console.error('SAVE:', message)
            })
    }

    /**
     * TODO: Ensure the meta temp locations get cleared appropriately before removing function
     * @deprecated This is specific to the Sitetheory 1.0 API and will be removed entirely
     */
    specialAction(action: any) {
        const that = this
        that.meta.temp('api.options.apiSpecialAction', action)
        that.save()
        if (that.meta.get('api') &&
            Object.prototype.hasOwnProperty.call(that.meta.get('api'), 'options') &&
            Object.prototype.hasOwnProperty.call(that.meta.get('api').options, 'apiSpecialAction')) {
            delete that.meta.get('api').options.apiSpecialAction
        }
    }

    throttleSave() {
        const that = this
        return new Promise((resolve: any, reject: any) => {
            const request = that.throttle()
            console.log('throttle request:', request)
            request.then((data: any) => {
                console.log('throttle received:', data)
                resolve(data)
            }).catch(reject)
        })
    }

    // Attribute Functions

    toJSON(options?: any) {
        /* *
         options = _.extend(options || {}, {
         patch: false
         });
         /* */
        let data

        // options.patch ? that.toPatch() :
        data = this.data
        data = this.meta.has('api') ? {
            meta: this.meta.get('api'),
            payload: data
        } : data
        if (this.meta.size() > 0) {
            this.meta.clearTemp()
        }
        return data
    }

    toPatch() {
        return this.patch
    }

    buildPath(path: string): any {
        const acc: any = []
        if (!_.isString(path)) {
            return acc
        }
        const that = this
        let cur
        let search
        _.each(path.split('.'), (link: any) => {
            // handle bracket chains
            if (link.match(that.bracket.match)) {
                // extract attribute
                cur = that.bracket.attr.exec(link)
                if (cur !== null) {
                    acc.push(cur[1])
                    cur = null
                } else {
                    cur = false
                }

                // extract cells
                search = that.bracket.search.exec(link)
                while (search !== null) {
                    if (cur !== false) {
                        cur = parseInt(search[1], 10)
                        if (!isNaN(cur)) {
                            acc.push(cur)
                        } else {
                            cur = false
                        }
                    }
                    search = that.bracket.search.exec(link)
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
        } else {
            return this.buildPath(attr).reduce(
                (attrs: any, link: any) => attrs && attrs[link], this.data
            )
        }
    }

    /**
     * if the attributes is an array, the function allow to find the specific object by the condition ( key - value )
     */
    find(attr: any, key: any, value: any) {
        if (typeof attr === 'string') {
            attr = this.get(attr)
        }

        if (!(attr instanceof Array)) {
            return attr
        } else {
            return attr.find((obj: any) => obj[key] === value)
        }
    }

    set(attr: any, value: any) {
        const that = this
        if (!attr) {
            console.warn('No attr for model.set()!')
            return this
        }
        if (typeof attr === 'object') {
            _.each(attr, (valueChain: any, attrChain: any) => {
                that.setAttribute(attrChain, valueChain)
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
            this.data[attr] = value
        }
        this.throttleTrigger('change', this)
        this.throttleTrigger(`change:${attr}`, value)
    }

    toggle(attribute: any, item: any, options: any) {
        const that = this
        if (angular.isObject(options) &&
            angular.isDefined(options.multiple) &&
            angular.isUndefined(options.strict)) {
            options.strict = true
        }
        options = _.extend({
            multiple: true
        }, angular.isObject(options) ? options : {})
        /* TODO: After plucking has been tested, remove this log *
         console.log('toggle:', attribute, item, options);
         /* */
        const request = attribute.split('[].')
        let target = that.get(request.length > 1 ? request[0] : attribute)
        if (angular.isUndefined(target) ||
            (options.strict && angular.isArray(target) !==
                options.multiple)) {
            target = options.multiple ? [] : null
            that.set(request.length > 1 ? request[0] : attribute, target)
        }
        if (angular.isArray(target)) {
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
            if (angular.isUndefined(item)) {
                that.set(attribute, null)
            } else if (!that.exists(attribute, item)) {
                target.push(item)
            } else {
                _.each(target, (element: any, key: any) => {
                    const child = (request.length > 1 &&
                        angular.isObject(element) && request[1] in element)
                                  ? element[request[1]]
                                  : element
                    const childId = (angular.isObject(child) && child.id)
                                    ? child.id
                                    : child
                    const itemId = (angular.isObject(item) && item.id)
                                   ? item.id
                                   : item
                    if (childId === itemId || (
                        angular.isString(childId) && angular.isString(itemId) && strcmp(childId, itemId) === 0
                    )) {
                        target.splice(key, 1)
                    }
                })
            }
        } else if (typeof target === 'object' || typeof target === 'number') {
            // (item && typeof item !== 'object') ? { id: item } : item
            that.set(attribute, !that.exists(attribute, item) ? item : null)
        } else if (angular.isUndefined(item)) {
            that.set(attribute, !target)
        }

        return that.get(attribute)
    }

    pluck(attr: string) {
        const that = this
        if (typeof attr !== 'string' || attr.indexOf('[].') === -1) {
            return that.get(attr)
        }
        const request = attr.split('[].')
        if (request.length <= 1) {
            return undefined
        }
        attr = that.get(request[0])
        if (!attr || !angular.isArray(attr)) {
            return undefined
        }
        const list: any = []
        attr.forEach((element: any) => {
            if (!angular.isObject(element) || !(request[1] in element)) {
                return
            }
            list.push(element[request[1]])
        })
        if (!list.length) {
            return undefined
        }
        return list
    }

    exists(attribute: any, item: any) {
        const that = this
        if (!item) {
            attribute = that.get(attribute)
            return typeof attribute !== 'undefined' && attribute
        } else if (typeof attribute === 'string' && item) {
            attribute = that.pluck(attribute)
            if (angular.isArray(attribute)) {
                return typeof attribute.find((element: any) => element === item || (
                    (angular.isObject(element) && element.id && element.id === item) || _.isEqual(element, item)
                )) !== 'undefined'
            } else {
                return attribute === item || (
                    angular.isObject(attribute) && attribute.id && (
                        _.isEqual(attribute, item) || attribute.id === item
                    )
                )
            }
        }
        return false
    }

    destroy() {
        const that = this
        // TODO: Add a confirmation option here
        if (this.collection) {
            this.collection.remove(this)
        }
        if (this.getIdentifier()) {
            this.sync('DELETE', {}).catch((message: any) => {
                if (that.toast) {
                    mdToast.show(
                        mdToast.simple()
                            .textContent('Failure to Delete!')
                            .toastClass('errorMessage')
                            .position('top right')
                            .hideDelay(3000)
                    )
                }
                console.error('DESTROY:', message)
            })
        }
    }
}

// This Model Service handles data binding for a single object with the $http
// Service
Stratus.Services.Model = [
    '$provide', ($provide: any) => {
        $provide.factory('Model', [
            '$http',
            '$mdToast',
            '$rootScope',
            ($http: any, $mdToast: any, $rootScope: any) => {
                http = $http
                mdToast = $mdToast
                rootScope = $rootScope
                return Model
            }
        ])
    }
]
Stratus.Data.Model = Model
