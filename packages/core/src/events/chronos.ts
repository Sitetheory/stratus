// Chronos System
// --------------

import _ from 'lodash'
import {seconds} from '@stratusjs/core/conversion'
import {ModelBase} from '@stratusjs/core/datastore/modelBase'
import {cookie} from '@stratusjs/core/environment'

// This constructor builds jobs for various methods.
export class Job {
    public enabled: boolean
    public time: any
    public method: any
    public scope: any

    constructor(time?: any, method?: any, scope?: any) {
        this.enabled = false
        if (time && typeof time === 'object') {
            _.extend(this, time)
        } else {
            this.time = time
            this.method = method
            this.scope = scope
        }
        this.time = seconds(this.time)
        this.scope = this.scope || window
    }
}

// This model handles all time related jobs.
export class Chronos extends ModelBase {
    constructor(data?: any, options?: any) {
        super(data, options)
        if (!cookie('env')) {
            console.info('Chronos Invoked!')
        }
        this.on('change', this.synchronize, this)
    }

    synchronize() {
        if (!cookie('env')) {
            console.info('Chronos Synchronizing...')
        }
        if (_.isEmpty(this.changed)) {
            console.warn('synchronize: empty changeset!')
        }
        _.forEach(this.changed, (job: any, key: any) => {
            if (typeof key === 'string' && key.indexOf('.') !== -1) {
                key = _.first(key.split('.'))
                job = this.get(key)
            }
            if (!job.code && job.enabled) {
                job.code = setInterval(() => {
                    job.method.call(job.scope)
                }, job.time * 1000, job)
            } else if (job.code && !job.enabled) {
                clearInterval(job.code)
                job.code = 0
            }
        })
    }

    queue(time: any, method: any, scope: any) {
        const job: any = time instanceof Job ? time : new Job(time, method, scope)
        if (job.time === null || typeof job.method !== 'function') {
            return null
        }
        const uid: any = _.uniqueId('job_')
        this.set(uid, job)
        // @ts-ignore
        if (typeof Stratus !== 'undefined' && Stratus.Instances) {
            // @ts-ignore
            Stratus.Instances[uid] = job
        }
        return uid
    }

    enable(uid: any) {
        if (!this.has(uid)) {
            return false
        }
        this.set(uid + '.enabled', true)
        return true
    }

    disable(uid: any) {
        if (!this.has(uid)) {
            return false
        }
        this.set(uid + '.enabled', false)
        return true
    }

    toggle(uid: any, value: any) {
        if (!this.has(uid)) {
            return false
        }
        this.set(uid + '.enabled', typeof value === 'boolean' ? value : !this.get(uid + '.enabled'))
        return true
    }
}
