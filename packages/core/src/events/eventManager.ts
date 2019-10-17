// Stratus Event System
// --------------------

import _ from 'lodash'
import { Cancelable } from 'lodash'
import {EventBase} from '@stratusjs/core/events/eventBase'
import {cookie} from '@stratusjs/core/environment'

export class EventManager {
    protected name = 'EventManager'
    public listeners: {
        [key: string]: Array<EventBase>
    } = {}
    public throttleTrigger: ((name: any, ...args: any[]) => (this)) & Cancelable

    constructor(throttle?: any) {
        this.throttleTrigger = _.throttle(this.trigger, throttle || 100)
    }

    off(name: any, callback: any, context: any) {
        if (!cookie('env')) {
            console.log('off:', name, callback, context)
        }
        return this
    }

    on(name: any, callback: any, context?: any) {
        const event: any = (name instanceof EventBase) ? name : new EventBase({
            enabled: true,
            hook: name,
            method: callback,
            scope: context || null
        })
        name = event.hook
        if (!(name in this.listeners)) {
            this.listeners[name] = []
        }
        this.listeners[name].push(event)
        return this
    }

    once(name: any, callback: any, context: any) {
        this.on(name, (event: any, ...args: any) => {
            event.enabled = false
            const childArgs: any = _.clone(args)
            childArgs.unshift(event)
            callback.apply(event.scope || this, childArgs)
        }, context)
        return this
    }

    trigger(name: any, ...args: any[]) {
        if (!(name in this.listeners)) {
            return this
        }
        this.listeners[name].forEach((event: any) => {
            if (!event.enabled) {
                return
            }
            const childArgs: any = _.clone(args)
            childArgs.unshift(event)
            event.method.apply(event.scope || this, childArgs)
        })
        return this
    }
}
