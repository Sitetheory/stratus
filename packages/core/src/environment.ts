// Internal
import {seconds} from '@stratusjs/core/conversion'

// External
import * as _ from 'lodash'

// Cookie Getter & Setter
export function cookie(name: any, value?: any, expires?: any, path?: any, domain?: any) {
    const request = {
        name,
        value,
        expires,
        path: path || '/',
        domain
    }
    if (name && typeof name === 'object') {
        _.extend(request, name)
    }
    let data
    if (typeof request.value === 'undefined') {
        const search = new RegExp('(?:^' + request.name + '|;\\s*' + request.name + ')=(.*?)(?:;|$)', 'g')
        data = search.exec(document.cookie)
        return null === data ? null : data[1]
    }
    data = request.name + '=' + escape(request.value) + ';'
    if (request.expires) {
        if (request.expires instanceof Date) {
            if (isNaN(request.expires.getTime())) {
                request.expires = new Date()
            }
        } else {
            request.expires = new Date(new Date().getTime() + seconds(request.expires) * 1000)
        }
        data += 'expires=' + request.expires.toUTCString() + ';'
    }
    if (request.path) {
        data += 'path=' + request.path + ';'
    }
    if (request.domain) {
        data += 'domain=' + request.domain + ';'
    }
    document.cookie = data
}
