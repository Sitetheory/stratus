// Internal
import {seconds} from './conversion'

// External
import _ from 'lodash'

// Cookie Getter & Setter
export function cookie(name: any, value?: any, expires?: any, path?: any, domain?: any, secure?: any, sameSite?: any) {
    const request = {
        name,
        value,
        expires,
        path: path || '/',
        domain,
        secure,
        sameSite
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
    data += `secure=${request.secure === false ? 'false' : 'true'};`
    data += `sameSite=${request.sameSite || 'Lax'};`
    console.log('new cookie:', data)
    document.cookie = data
}
