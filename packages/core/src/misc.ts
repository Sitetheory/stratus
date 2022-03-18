import _ from 'lodash'

// This function simply extracts the name of a function from code directly
export function functionName(code: any) {
    if (_.isEmpty(code)) {
        return null
    }
    if (!_.isString(code)) {
        code = code.toString()
    }
    code = code.substr('function '.length)
    return code.substr(0, code.indexOf('('))
}

// This function simply capitalizes the first letter of a string.
export function ucfirst(str: string): string {
    if (typeof str !== 'string' || !str) {
        return ''
    }
    return str.charAt(0).toUpperCase() + str.substring(1)
}

// This function simply changes the first letter of a string to a lower case.
export function lcfirst(str: string): string {
    if (typeof str !== 'string' || !str) {
        return ''
    }
    return str.charAt(0).toLowerCase() + str.substring(1)
}

// Converge a list and return the prime key through specified method.
export function converge(list: any, method: any) {
    if (typeof method !== 'string') {
        method = 'min'
    }
    if (method === 'min') {
        const lowest = _.min(list)
        return _.findKey(list, (element: any) => (element === lowest))
    } else if (method === 'radial') {
        // Eccentricity
        // Radians
        // Diameter
        // Focal Point
    } else if (method === 'gauss') {
        // Usage: Node Connection or Initialization
    } else {
        return list
    }
}

// This synchronously repeats a function a certain number of times
export function repeat(fn: any, times: number) {
    if (typeof fn === 'function' && typeof times === 'number') {
        let i
        for (i = 0; i < times; i++) {
            fn()
        }
    } else {
        console.warn('Underscore cannot repeat function:', fn,
            'with number of times:', times)
    }
}

// This function dehydrates an Object, Boolean, or Null value, to a string.
export function dehydrate(value: any) {
    return typeof value === 'string' ? value : JSON.stringify(value)
}

// This function hydrates a string into an Object, Boolean, or Null value, if
// applicable.
export function hydrate(str: string) {
    return isJSON(str) ? JSON.parse(str) : str
}

// This is an alias to the hydrate function for backwards compatibility.
export function hydrateString(str: string): string {
    return hydrate(str)
}

// This function utilizes tree building to clone an object.
// Note: This function already exists in Lodash
// export function cloneDeep(obj: any) {
//     if (typeof obj !== 'object') {
//         return obj
//     }
//     const shallow = _.clone(obj)
//     _.forEach(shallow, (value: any, key: any) => {
//         shallow[key] = cloneDeep(value)
//     })
//     return shallow
// }

// This function utilizes tree building to clone an object.
export function extendDeep(target: any, merger: any) {
    const shallow = _.clone(target)
    if (!merger || typeof merger !== 'object') {
        return merger
    }
    _.forEach(merger, (value: any, key: number|string) => {
        if (!shallow || typeof shallow !== 'object') {
            return
        }
        shallow[key] = (key in shallow) ?
                       extendDeep(shallow[key], merger[key]) :
                       merger[key]
    })
    return shallow
}

// TODO: Move this to a new PushState Handler Class
// Get more params which is shown after anchor '#' anchor in the url.
export function getAnchorParams(key: any, url?: any) {
    const vars: any = {}
    const tail = window.location.hash
    if (_.isEmpty(tail)) {
        return vars
    }
    const digest = /([a-zA-Z]+)(?:\/([0-9]+))?/g
    let match
    while (match) {
        match = digest.exec(tail)
        vars[match[1]] = hydrate(match[2])
    }
    return (typeof key !== 'undefined' && key) ? vars[key] : vars
}

// Get a specific value or all values located in the URL
export function getUrlParams(key: any, url?: any) {
    const vars: any = {}
    if (url === undefined) {
        url = window.location.href
    }
    const anchor = url.indexOf('#')
    if (anchor >= 0) {
        url = url.substring(0, anchor)
    }
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m: any, keyChild: any, value: any) => {
        vars[keyChild] = hydrate(value)
    })
    return (typeof key !== 'undefined' && key) ? vars[key] : vars
}

// This function digests URLs into an object containing their respective
// values, which will be merged with requested parameters and formulated
// into a new URL.
export function setUrlParams(params: any, url?: any) {
    if (url === undefined) {
        url = window.location.href
    }
    if (params === undefined) {
        return url
    }
    let vars: any = {}
    const glue = url.indexOf('?')
    const anchor = url.indexOf('#')
    let tail = ''
    if (anchor >= 0) {
        tail = url.substring(anchor, url.length)
        url = url.substring(0, anchor)
    }
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m: any, key: any, value: any) => {
        vars[key] = value
    })
    vars = _.extend(vars, params)
    return ((glue >= 0 ? url.substring(0, glue) : url) + '?' +
        _.map(vars, (value: any, key: any) => key + '=' + dehydrate(value))
            .reduce((memo: any, value: any) => memo + '&' + value) + tail)
}

// Ensure all values in an array or object are true
export function allTrue(values: any) {
    return (typeof values === 'object') ? _.every(values, (value: any) => value) : false
}

// Determines whether or not the string supplied is in a valid JSON format
export function isJSON(str: string | any) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

// Determines whether or not the element was selected from Angular
export function isAngular(element: any) {
    // @ts-ignore
    return typeof angular === 'object' && angular && angular.element && element instanceof angular.element
}

// Determines whether or not the element was selected from Angular
export function isjQuery(element: any) {
    return typeof jQuery === 'function' && element instanceof jQuery
}

export function startsWith(target: any, search: any) {
    return (typeof target === 'string' && typeof search === 'string' &&
        target.substr(0, search.length).toLowerCase() === search.toLowerCase())
}

export function endsWith(target: any, search: any) {
    return (typeof target === 'string' && typeof search === 'string' &&
        target.substr(target.length - search.length, target.length).toLowerCase() === search.toLowerCase())
}

export function flatten(data: LooseObject, flatData?: LooseObject, chain?: string): LooseObject {
    flatData = flatData || {}
    const delimiter = chain ? '.' : ''
    chain = chain || ''
    _.forEach(data, (value: any, key: string|number) => {
        const location = `${chain}${delimiter}${key}`
        if (typeof value === 'object' && value) {
            flatten(value, flatData, location)
            return
        }
        flatData[location] = value
    })
    return flatData
}

// This is a new simplified Patch Function to allow Difference between Object and Nested Arrays
// Note: We are currently using LooseObject because the tree below outputs as such
export function patch(newData: LooseObject, priorData: LooseObject, ignoreKeys?: Array<string>): LooseObject {
    if (!_.isObject(newData) || !_.size(newData)) {
        return null
    }
    if (!_.size(newData) || !_.isObject(priorData) || !_.size(priorData)) {
        return newData
    }
    // Note: once we allow the tree to be an array, we must allow LooseObject|Array<any> to the parameters above.
    // const tree: LooseObject = _.isArray(newData) ? [] : {}
    const tree: LooseObject = {}
    function detect(value: any, key: string, list: LooseObject|Array<any>, chain?: string) {
        if (_.includes(ignoreKeys, key)) {
            return
        }
        const acc = (chain === null || chain === undefined) ? key : (_.isArray(list) ? `${chain}[${key}]` : `${chain}.${key}`)
        const priorValue: LooseObject|Array<any>|any =  _.get(priorData, acc)
        if (value === priorValue) {
            return
        }
        if (_.isObject(value)) {
            if (_.isArray(value)) {
                if (!priorValue || _.size(value) !== _.size(priorValue)) {
                    tree[acc] = value
                    return
                }
                _.forEach(value, (v: any, k: number) => {
                    const priorEl = _.get(priorValue, k)
                    if (v === priorEl) {
                        return
                    }
                    if (_.size(patch(v, priorEl, ignoreKeys))) {
                        // This shows only the changed cell, which would be more efficient if Sitetheory allowed persistence of array keys
                        // tree[`${acc}[${k}]`] = v
                        // Store entire array in patch and break from forEach to preserve other elements
                        tree[acc] = value
                        return false
                    }
                })
                return
            }
            _.forEach(value, (v: any, k: string, l: LooseObject|Array<any>) => detect(v, k, l, acc))
            return
        }
        tree[acc] = value
    }
    _.forEach(newData, detect)
    return (!tree || !_.size(tree)) ? null : tree
}

export function poll(fn: any, timeout?: any, interval?: any) {
    timeout = timeout || 2000
    interval = interval || 100
    const threshold = Number(new Date()) + timeout
    const check = (resolve: any, reject: any) => {
        const cond = fn()
        if (typeof cond !== 'undefined') {
            resolve(cond)
            return
        }
        if (Number(new Date()) > threshold) {
            const err = new Error(fn)
            err.name = 'Timeout'
            reject(err)
            return
        }
        setTimeout(check, interval, resolve, reject)
    }

    return new Promise(check)
}

export function strcmp(a: string, b: string) {
    if (!a) {
        return 1
    }
    if (!b) {
        return -1
    }
    a = a.toString()
    b = b.toString()
    let i
    let n
    for (i = 0, n = Math.max(a.length, b.length); i < n && a.charAt(i) === b.charAt(i); ++i) {
    }
    if (i === n) {
        return 0
    }
    return a.charAt(i) > b.charAt(i) ? -1 : 1
}

/**
 * @deprecated use _.truncate() instead
 * https://lodash.com/docs/4.17.15#truncate
 *
 * @param target string to truncate
 * @param limit characters allowed in string
 * @param suffix string to append after truncation
 */
export function truncate(target: string, limit?: number, suffix?: string) {
    limit = limit || 100
    suffix = suffix || '...'

    const arr = target.replace(/</g, '\n<')
        .replace(/>/g, '>\n')
        .replace(/\n\n/g, '\n')
        .replace(/^\n/g, '')
        .replace(/\n$/g, '')
        .split('\n')

    let sum = 0
    let row
    let cut
    let add
    let tagMatch
    let tagName
    const tagStack = []
    // let more = false

    for (let i = 0; i < arr.length; i++) {
        row = arr[i]

        // count multiple spaces as one character
        const rowCut = row.replace(/[ ]+/g, ' ')

        if (!row.length) {
            continue
        }

        if (row[0] !== '<') {
            if (sum >= limit) {
                row = ''
            } else if ((sum + rowCut.length) >= limit) {
                cut = limit - sum

                if (row[cut - 1] === ' ') {
                    while (cut) {
                        cut -= 1
                        if (row[cut - 1] !== ' ') {
                            break
                        }
                    }
                } else {
                    add = row.substring(cut).split('').indexOf(' ')
                    if (add !== -1) {
                        cut += add
                    } else {
                        cut = row.length
                    }
                }

                row = row.substring(0, cut) + suffix

                /*
                 if (moreLink) {
                 row += '<a href="' + moreLink + '" style="display:inline">' + moreText + '</a>';
                 }
                 */

                sum = limit
                // more = true
            } else {
                sum += rowCut.length
            }
        } else if (sum >= limit) {
            tagMatch = row.match(/[a-zA-Z]+/)
            tagName = tagMatch ? tagMatch[0] : ''

            if (tagName) {
                if (row.substring(0, 2) !== '</') {
                    tagStack.push(tagName)
                    row = ''
                } else {
                    while (tagStack[tagStack.length - 1] !== tagName &&
                    tagStack.length) {
                        tagStack.pop()
                    }

                    if (tagStack.length) {
                        row = ''
                    }

                    tagStack.pop()
                }
            } else {
                row = ''
            }
        }

        arr[i] = row
    }

    return arr.join('\n').replace(/\n/g, '')
}

// Generic Types & Interfaces
type ObjectType = object
export interface LooseObject<T=any> extends ObjectType {
    [key: string]: T
}
export type LooseFunction<T=any> = (...args: any) => T

// TODO: Add a PushState Handler for document.location.hash
// https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event
// https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
