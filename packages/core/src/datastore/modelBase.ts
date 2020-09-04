// Model Prototype
// ---------------

import _ from 'lodash'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {
    LooseObject,
    patch
} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

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
            console.log('Changed:', changeSet)
        }

        // Dispatch Events
        this.throttleTrigger('change', changeSet)

        // Return ChangeSet, as it's useful for other workflows
        return changeSet
    }

    toObject(options?: any) {
        return _.clone(this.data)
    }

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

    get(attr: any) {
        return _.reduce(typeof attr === 'string' ? attr.split('.') : [],
            (attrs: any, a: any) => {
                return attrs && attrs[a]
            }, this.data)
    }

    has(attr: any) {
        return (typeof this.get(attr) !== 'undefined')
    }

    size() {
        return _.size(this.data as LooseObject)
    }

    set(attr: string|object, value?: any) {
        if (attr && typeof attr === 'object') {
            _.forEach(attr, (valueDeep, attrDeep) => {
                this.setAttribute(attrDeep, valueDeep)
            })
        } else {
            this.setAttribute(attr, value)
        }
    }

    setAttribute(attr: any, value: any) {
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
        if (attr && typeof attr === 'object') {
            _.forEach(attr, (v: any, k: any) => {
                this.temps[k] = v
            })
        } else {
            this.temps[attr] = value
        }
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

    remove(attr: any, value: any) {
        // Note:
        // This needs to tree build into dot notation strings
        // then delete the keys for the values or remove an
        // element from an array.

        // console.log('remove:', attr, value === undefined ? 'straight' : 'element')
        if (value === undefined) {
            // FIXME: This needs to remove the dot notation references
            // delete this.data[attr];
        } else {
            // TODO: use dot notation for nested removal or _.without for array
            // values (these should be separate functions)
            (this.data as LooseObject)[attr] = _.without((this.data as LooseObject)[attr], value)
        }
        // if (!cookie('env')) {
        //     console.log('removed:', this.data[attr])
        // }
        return (this.data as LooseObject)[attr]
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
        for (const attribute in this.temps) {
            if (Object.prototype.hasOwnProperty.call(this.temps, attribute)) {
                // delete this.data[attribute];
                // this.remove(attribute);
                delete this.temps[attribute]
            }
        }
    }
}
