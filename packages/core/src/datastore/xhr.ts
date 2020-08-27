import _ from 'lodash'
import {isJSON} from '@stratusjs/core/misc'

export interface XHRRequest {
    method?: string
    url?: string
    data?: {} | any
    type?: string
    success?: (response: any) => any
    error?: (response: any) => any
}

export class XHR {
    public method: string
    public url: string
    public data: {} | any
    public type: string
    public success: (response: any) => any
    public error: (response: any) => any
    private xhr: XMLHttpRequest

    constructor(request?: XHRRequest) {
        // Defaults
        this.method = 'GET'
        this.url = '/Api'
        this.data = {}
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

    send() {
        // Make Request
        this.xhr = new XMLHttpRequest()
        const promise: any = new Promise((resolve: any, reject: any) => {
            this.xhr.open(this.method, this.url, true)
            if (typeof this.type === 'string' && this.type.length) {
                this.xhr.setRequestHeader('Content-Type', this.type)
            }
            this.xhr.onload = () => {
                if (this.xhr.status >= 200 && this.xhr.status < 400) {
                    let response: any = this.xhr.responseText
                    if (isJSON(response)) {
                        response = JSON.parse(response)
                    }
                    resolve(response)
                } else {
                    reject(this.xhr)
                }
            }

            this.xhr.onerror = () => {
                reject(this.xhr)
            }

            if (Object.keys(this.data).length) {
                this.xhr.send(JSON.stringify(this.data))
            } else {
                this.xhr.send()
            }
        })
        promise.then(this.success, this.error)
        return promise
    }
}
