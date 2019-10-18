// Model Prototype
// ---------------

import _ from 'lodash'
import {EventManager} from '@stratusjs/core/events/eventManager'

// This function is meant to be extended models that want to use internal data
// in a native Backbone way.
export class ModelBase extends EventManager {
    name = 'ModelBase'

    // Infrastructure
    data: any = {}
    temps: any = {}

    // Diff Detection
    changed: boolean|any = false
    watching = false
    patch: any = {}

    constructor(data?: any, options?: any) {
        super()

        // Evaluate object or array
        if (data) {
            // TODO: Evaluate object or array into a string of sets
            /* *
             data = _.defaults(_.extend({}, defaults, data), defaults)
             this.set(data, options)
             /* */
            _.extend(this.data, data)
        }

        // Scope Binding
        this.toObject = this.toObject.bind(this)
        this.toJSON = this.toJSON.bind(this)
        this.each = this.each.bind(this)
        this.get = this.get.bind(this)
        this.has = this.has.bind(this)
        this.size = this.size.bind(this)
        this.set = this.set.bind(this)
        this.setAttribute = this.setAttribute.bind(this)
        this.temp = this.temp.bind(this)
        this.add = this.add.bind(this)
        this.remove = this.remove.bind(this)
        this.iterate = this.iterate.bind(this)
        this.clear = this.clear.bind(this)
        this.clearTemp = this.clearTemp.bind(this)
    }

    toObject(options: any) {
        return _.clone(this.data)
    }

    toJSON(options: any) {
        return _.clone(this.data)
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
        return _.size(this.data)
    }

    set(attr: string|object, value?: any) {
        if (attr && typeof attr === 'object') {
            const that: any = this
            _.forEach(attr, (valueDeep, attrDeep) => {
                that.setAttribute(attrDeep, valueDeep)
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
            } else if (!_.has(this.data, attr) || !_.isEqual(this.data[attr], value)) {
                this.data[attr] = value
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
        if (typeof value !== 'undefined' && !_.includes(this.data[attr], value)) {
            this.data[attr].push(value)
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
            this.data[attr] = _.without(this.data[attr], value)
        }
        // if (!cookie('env')) {
        //     console.log('removed:', this.data[attr])
        // }
        return this.data[attr]
    }

    iterate(attr: any) {
        if (!this.has(attr)) {
            this.set(attr, 0)
        }
        return ++this.data[attr]
    }

    /**
     * Clear all internal data
     */
    clear() {
        for (const attribute in this.data) {
            if (Object.prototype.hasOwnProperty.call(this.data, attribute)) {
                delete this.data[attribute]
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
