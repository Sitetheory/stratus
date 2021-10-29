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

    // todo: allow this to pass in options like the constructor
    send() {
        // Make Request
        // TODO: Make this possibly store a const and store each reference in an array (simultaneous calls as an option)
        this.xhr = new XMLHttpRequest()
        const promise = new Promise((resolve, reject) => {
            this.xhr.open(this.method, this.url, true)

            if (typeof this.type === 'string' && this.type.length) {
                this.xhr.setRequestHeader('Content-Type', this.type)
            }

            if (typeof this.headers === 'object' && this.headers && this.headers.length) {
                _.forEach(this.headers, (v, k) => this.xhr.setRequestHeader(k, v))
            }

            this.xhr.onload = () => {
                // todo: make this 1 deep
                if (this.xhr.status >= 200 && this.xhr.status < 400) {
                    let response: any = this.xhr.responseText
                    if (isJSON(response)) {
                        response = JSON.parse(response)
                    }
                    resolve(response)
                    return
                } else {
                    reject(this.xhr)
                    return
                }
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
