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
        // Hoist Context
        const that: any = this

        // Make Request
        this.xhr = new XMLHttpRequest()
        const promise: any = new Promise((resolve: any, reject: any) => {
            that.xhr.open(that.method, that.url, true)
            if (typeof that.type === 'string' && that.type.length) {
                that.xhr.setRequestHeader('Content-Type', that.type)
            }
            that.xhr.onload = () => {
                if (that.xhr.status >= 200 && that.xhr.status < 400) {
                    let response: any = that.xhr.responseText
                    if (isJSON(response)) {
                        response = JSON.parse(response)
                    }
                    resolve(response)
                } else {
                    reject(that.xhr)
                }
            }

            that.xhr.onerror = () => {
                reject(that.xhr)
            }

            if (Object.keys(that.data).length) {
                that.xhr.send(JSON.stringify(that.data))
            } else {
                that.xhr.send()
            }
        })
        promise.then(that.success, that.error)
        return promise
    }
}
