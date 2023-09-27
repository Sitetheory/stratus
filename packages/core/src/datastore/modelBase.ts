// Model Prototype
// ---------------

import _ from 'lodash'
import {EventManager} from '../events/eventManager'
import {
    LooseObject,
    patch
} from '../misc'
import {cookie} from '../environment'

export interface ModelBaseOptions {
    ignoreKeys?: Array<string>,
    received?: boolean
}

// This function is meant to be extended models that want to use internal data
// in a native Backbone way.
export class ModelBase<T = LooseObject> extends EventManager {
    name = 'ModelBase'

    // Infrastructure
    data: T = {} as T
    temps: LooseObject = {}

    // Diff Detection
    changed = false
    watch = false
    watching = false
    recv: LooseObject = {}
    sent: LooseObject = {}
    patch: LooseObject = {}
    ignoreKeys: Array<string> = []

    // FIXME: The AngularJS Package's Model and the Core ModelBase differ in terms of parameter order
    constructor(data?: LooseObject, options?: ModelBaseOptions) {
        super()

        // Evaluate object or array
        if (data && typeof data === 'object') {
            // TODO: Evaluate object or array into a string of sets
            /* *
             data = _.defaults(_.extend({}, defaults, data), defaults)
             this.set(data, options)
             /* */
            _.extend(this.data, data)
        }

        // Handle Initial Data Flagged as Received from DataStore, XHR, etc
        this.recv = _.cloneDeep(this.data)
        this.sent = {}

        // Handle Keys we wish to ignore in patch
        if (_.isObject(options) && _.isArray(options.ignoreKeys)) {
            this.ignoreKeys = options.ignoreKeys
        }
    }

    // Watch for Data Changes
    async watcher() {
        // Ensure we only watch once
        if (this.watching) {
            return true
        }
        this.watching = true

        // Begin Change Detection
        const interval = 250
        const check = () => {
            this.handleChanges()
            setTimeout(check, interval)
        }
    }

    // Handles new Changes, if any are present
    handleChanges(): LooseObject {
        // Determine Changes since last XHR payload
        const changeSet = this.toPatch()

        // Always keep the latest patch information
        this.patch = changeSet
        this.changed = !_.isEmpty(this.patch)

        // Ensure ChangeSet is valid
        if (!changeSet || _.isEmpty(changeSet)) {
            return changeSet
        }

        // Console Info for New ChangeSets
        if (cookie('env')) {
            console.log('Changed:', cookie('debug_change_set') ? JSON.stringify(changeSet) : changeSet)
        }

        // Dispatch Events
        this.throttleTrigger('change', changeSet)

        // Return ChangeSet, as it's useful for other workflows
        return changeSet
    }

    toObject(options?: any) {
        return _.clone(this.data)
    }

    // TODO: Collapse this into toObject()
    toJSON(options?: any) {
        options = options || {}
        return _.clone(options.patch ? (this.toPatch() || {}) : this.data)
    }

    toPatch(): LooseObject {
        const patchData = {}
        const changeSet = patch(this.data, this.recv, this.ignoreKeys)
        if (!changeSet || _.isEmpty(changeSet)) {
            return patchData
        }
        _.forEach(changeSet, (value: any, key: string) => _.set(patchData, key, _.get(this.data, key)))
        return patchData
    }

    each(callback: any, scope: any) {
        _.forEach.apply((scope === undefined) ? this : scope,
            _.union([this.data], arguments))
    }

    // TODO: Change this into the _.get function...
    get(attr: any) {
        if (typeof attr !== 'string' || !this.data || typeof this.data !== 'object') {
            return undefined
        }
        return _.get(this.data, attr)
        // Note: This get function below has been replaced by the _.get() above
        /* *
        return _.reduce(typeof attr === 'string' ? attr.split('.') : [],
            (attrs: any, a: any) => {
                return attrs && attrs[a]
            }, this.data)
        /* */
    }

    // TODO: Change this into the _.has function...
    has(attr: any) {
        return typeof this.get(attr) !== 'undefined'
    }

    size() {
        return _.size(this.data as LooseObject)
    }

    set(attr: string|object, value?: any) {
        if (attr && typeof attr === 'object') {
            _.forEach(attr, (valueDeep, attrDeep) => {
                this.setAttribute(attrDeep, valueDeep)
            })
            return this
        }
        this.setAttribute(attr, value)
        return this
    }

    // TODO: Change this into the _.set function...
    setAttribute(attr: any, value: any) {
        // TODO: Code golf this function to be only 1 level
        if (typeof attr === 'string') {
            if (attr.indexOf('.') !== -1) {
                let reference: any = this.data
                const chain: any = attr.split('.')
                _.find(_.initial(chain), (link: any) => {
                    if (!_.has(reference, link) || !reference[link]) {
                        reference[link] = {}
                    }
                    if (typeof reference !== 'undefined' && reference &&
                        typeof reference === 'object') {
                        reference = reference[link]
                    } else {
                        reference = this.data
                        return true
                    }
                })
                if (!_.isEqual(reference, this.data)) {
                    const link: any = _.last(chain)
                    if (reference && typeof reference === 'object' &&
                        (!_.has(reference, link) || !_.isEqual(reference[link], value))) {
                        reference[link] = value
                        this.trigger('change:' + attr, this)
                        this.trigger('change', this)
                    }
                }
            } else if (!_.has(this.data, attr) || !_.isEqual((this.data as LooseObject)[attr], value)) {
                (this.data as LooseObject)[attr] = value
                this.trigger('change:' + attr, this)
                this.trigger('change', this)
            }
        }
    }

    temp(attr: any, value: any) {
        this.set(attr, value)
        // TODO: Code golf this function to be only 1 level
        if (attr && typeof attr === 'object') {
            _.forEach(attr, (v: any, k: any) => {
                this.temps[k] = v
            })
            return
        }
        this.temps[attr] = value
    }

    add(attr: any, value: any) {
        // Ensure a placeholder exists
        if (!this.has(attr)) {
            this.set(attr, [])
        }

        // only add value if it's supplied (sometimes we want to create an empty
        // placeholder first)
        if (typeof value !== 'undefined' && !_.includes((this.data as LooseObject)[attr], value)) {
            (this.data as LooseObject)[attr].push(value)
            return value
        }
    }

    remove(attr: string, value?: any) {
        // Ensure we have data
        if (!_.isObject(this.data)) {
            return null
        }
        // Handle removal of item from array
        if (!_.isUndefined(value)) {
            const data = this.get(attr)
            if (_.isArray(data)) {
                this.set(attr, _.without(data, value))
                return this
            }
        }
        // Handle removal of attribute completely
        // @ts-ignore
        this.data = _.omit(this.data, attr)
        return this
    }

    iterate(attr: any) {
        if (!this.has(attr)) {
            this.set(attr, 0)
        }
        return ++(this.data as LooseObject)[attr]
    }

    /**
     * Clear all internal data
     */
    clear() {
        for (const attribute in (this.data as LooseObject)) {
            if (Object.prototype.hasOwnProperty.call(this.data, attribute)) {
                delete (this.data as LooseObject)[attribute]
            }
        }
    }

    /**
     * Clear all temporary data
     */
    clearTemp() {
        _.forEach(
            this.temps,
            (value: any, key: string) =>
                this.remove(key, value) && delete this.temps[key]
        )
    }
}
