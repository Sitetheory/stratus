// Aether System
// --------------

import _ from 'lodash'
import {cookie} from '@stratusjs/core/environment'
import {ModelBase} from '@stratusjs/core/datastore/modelBase'
import {EventBase} from '@stratusjs/core/events/eventBase'

// This model handles all event related logic.
export class Aether extends ModelBase {
    public passiveSupported: boolean

    constructor(data?: any, options?: any) {
        super(data, options)

        this.passiveSupported = false

        if (!cookie('env')) {
            console.info('Aether Invoked!')
        }
        const that: any = this
        try {
            const eventOptions: any = {
                get passive() {
                    that.passiveSupported = true
                    return true
                }
            }
            window.addEventListener('test', eventOptions, eventOptions)
            window.removeEventListener('test', eventOptions, eventOptions)
        } catch (err) {
            that.passiveSupported = false
        }
        this.on('change', this.synchronize, this)
    }

    synchronize() {
        if (!cookie('env')) {
            console.info('Aether Synchronizing...')
        }
        if (_.isEmpty(this.data)) {
            console.warn('synchronize: no data!')
        }
        _.forEach(this.data, (event: any, key: any) => {
            if (event.listening || !event.enabled) {
                return
            }
            // @ts-ignore
            if (typeof Stratus !== 'undefined' && Stratus.Environment.get('viewPort')) {
                // @ts-ignore
                console.warn('Aether does not support custom viewPorts:', Stratus.Environment.get('viewPort'))
            }
            (event.target || window).addEventListener(event.hook, event.method,
                this.passiveSupported ? {
                    capture: true,
                    passive: true
                } : false
            )
            event.listening = true
        })
    }

    listen(options: any) {
        let uid: any = null
        const event: any = new EventBase(options)
        if (!event.invalid) {
            uid = _.uniqueId('event_')
            this.set(uid, event)
            // @ts-ignore
            if (typeof Stratus !== 'undefined' && Stratus.Instances) {
                // @ts-ignore
                Stratus.Instances[uid] = event
            }
        }
        return uid
    }
}
