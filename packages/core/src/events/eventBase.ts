// Event Prototype
// --------------

import _ from 'lodash'

// This constructor builds events for various methods.
export class EventBase {
    public enabled: boolean
    public hook: any
    public target: any
    public scope: any
    public debounce: any
    public throttle: any
    public method: () => any
    public listening: boolean
    public invalid: boolean

    constructor(options?: any) {
        this.enabled = false
        this.hook = null
        this.target = null
        this.scope = null
        this.debounce = null
        this.throttle = null
        this.method = () => {
            console.warn('No method:', this)
        }
        if (options && typeof options === 'object') {
            _.extend(this, options)
        }
        this.listening = false
        this.invalid = false
        if (typeof this.hook !== 'string') {
            console.error('Unsupported hook:', this.hook)
            this.invalid = true
        }
        if (this.target !== undefined && this.target !== null && !(this.target instanceof EventTarget)) {
            console.error('Unsupported target:', this.target)
            this.invalid = true
        }
        if (typeof this.method !== 'function') {
            console.error('Unsupported method:', this.method)
            this.invalid = true
        }
        if (this.invalid) {
            this.enabled = false
        }
    }
}
