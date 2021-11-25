import _ from 'lodash'
import {isJSON, LooseObject} from '@stratusjs/core/misc'

export interface XHRRequest {
    method?: string
    url?: string
    data?: LooseObject | string
    headers?: LooseObject
    type?: string
    success?: (response: any) => any
    error?: (response: any) => any
}

export class XHR {
    public method: string
    public url: string
    public data: LooseObject | string | null
    public headers: LooseObject
    public type: string
    public success: (response: any) => any
    public error: (response: any) => any
    private xhr: XMLHttpRequest

    // XHR Properties
    readonly response?: any
    readonly responseText?: string
    readonly responseType?: string
    readonly responseURL?: string
    readonly responseXML?: Document
    readonly status?: number
    readonly statusText?: string
    readonly timeout?: number
    readonly upload?: XMLHttpRequestUpload
    readonly withCredentials?: boolean

    // TODO: Make the constructor optional, and allow the send to provide options instead (for class reuse)
    constructor(request?: XHRRequest) {
        // Defaults
        this.method = 'GET'
        this.url = '/Api'
        this.data = null
        this.headers = {}
        this.type = ''

        this.success = (response: any) => {
            return response
        }

        this.error = (response: any) => {
            return response
        }

        // Customize Settings
        _.extend(this, request)
    }

    // This is just a wrapper for the internal XHR
    getAllResponseHeaders(): LooseObject<string> {
        // TODO: @Optimize! Add a cache for header objects, keyed by the header string
        return Object.fromEntries(
            this.xhr.getAllResponseHeaders()
                .split(/\r?\n/)
                .filter((e: string) => e.length)
                .map((e: string) => e.split(': '))
        )
    }

    // This is just a wrapper for the internal XHR
    getResponseHeader(name: string): string | null {
        return this.xhr.getResponseHeader(name)
    }

    // TODO: allow this to pass in options like the constructor
    send(): Promise<LooseObject|Array<LooseObject>|string> {
        // Make Request
        // TODO: Make this possibly store a const and store each reference in an array (simultaneous calls as an option)
        this.xhr = new XMLHttpRequest()
        const promise = new Promise((resolve, reject) => {
            this.xhr.open(this.method, this.url, true)

            if (typeof this.type === 'string' && this.type.length) {
                this.xhr.setRequestHeader('Content-Type', this.type)
            }

            if (_.isPlainObject(this.headers)) {
                _.forEach(this.headers, (v, k) => this.xhr.setRequestHeader(k, v))
            }

            this.xhr.onload = () => {
                // hoist properties
                _.forEach([
                    'response',
                    'responseText',
                    'responseType',
                    'responseURL',
                    'responseXML',
                    'status',
                    'statusText',
                    'timeout',
                    'upload',
                    'withCredentials'
                ],(p) => _.set(this, p, _.get(this.xhr, p)))
                if (this.xhr.status < 200 || this.xhr.status >= 400) {
                    reject(this.xhr)
                    return
                }
                const response = this.xhr.responseText
                if (isJSON(response)) {
                    resolve(JSON.parse(response))
                    return
                }
                resolve(response)
            }

            this.xhr.onerror = () => {
                reject(this.xhr)
            }

            // allow straight calls
            if (!this.data) {
                this.xhr.send()
                return
            }

            // serialize data types
            if (typeof this.data === 'string' && this.data.length) {
                this.xhr.send(this.data)
                return
            }

            if (typeof this.data === 'object' && Object.keys(this.data).length) {
                this.xhr.send(JSON.stringify(this.data))
                return
            }

            // catch remaining
            this.xhr.send()
        })
        promise.then(this.success, this.error)
        return promise
    }
}
