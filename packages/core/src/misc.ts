import _, {extend} from 'lodash'

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
 * Create a universally usable id string from various names
 */
export function safeUniqueId(...names: string[]): string {
    return _.uniqueId(
        _.map(names, (name) => {
            return _.camelCase(name) + '_'
        }).join('')
    )
}

/**
 * _.truncate() is faster if target doesn't contain html
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

// tslint:disable-next-line:max-line-length
const invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111]
const regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)([=a-zA-Z0-9])?/g
const regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/
// tslint:disable-next-line:max-line-length
const decodeMap: LooseObject<string> = {aacute:'\xE1',Aacute:'\xC1',abreve:'\u0103',Abreve:'\u0102',ac:'\u223E',acd:'\u223F',acE:'\u223E\u0333',acirc:'\xE2',Acirc:'\xC2',acute:'\xB4',acy:'\u0430',Acy:'\u0410',aelig:'\xE6',AElig:'\xC6',af:'\u2061',afr:'\uD835\uDD1E',Afr:'\uD835\uDD04',agrave:'\xE0',Agrave:'\xC0',alefsym:'\u2135',aleph:'\u2135',alpha:'\u03B1',Alpha:'\u0391',amacr:'\u0101',Amacr:'\u0100',amalg:'\u2A3F',amp:'&',AMP:'&',and:'\u2227',And:'\u2A53',andand:'\u2A55',andd:'\u2A5C',andslope:'\u2A58',andv:'\u2A5A',ang:'\u2220',ange:'\u29A4',angle:'\u2220',angmsd:'\u2221',angmsdaa:'\u29A8',angmsdab:'\u29A9',angmsdac:'\u29AA',angmsdad:'\u29AB',angmsdae:'\u29AC',angmsdaf:'\u29AD',angmsdag:'\u29AE',angmsdah:'\u29AF',angrt:'\u221F',angrtvb:'\u22BE',angrtvbd:'\u299D',angsph:'\u2222',angst:'\xC5',angzarr:'\u237C',aogon:'\u0105',Aogon:'\u0104',aopf:'\uD835\uDD52',Aopf:'\uD835\uDD38',ap:'\u2248',apacir:'\u2A6F',ape:'\u224A',apE:'\u2A70',apid:'\u224B',apos:'\'',ApplyFunction:'\u2061',approx:'\u2248',approxeq:'\u224A',aring:'\xE5',Aring:'\xC5',ascr:'\uD835\uDCB6',Ascr:'\uD835\uDC9C',Assign:'\u2254',ast:'*',asymp:'\u2248',asympeq:'\u224D',atilde:'\xE3',Atilde:'\xC3',auml:'\xE4',Auml:'\xC4',awconint:'\u2233',awint:'\u2A11',backcong:'\u224C',backepsilon:'\u03F6',backprime:'\u2035',backsim:'\u223D',backsimeq:'\u22CD',Backslash:'\u2216',Barv:'\u2AE7',barvee:'\u22BD',barwed:'\u2305',Barwed:'\u2306',barwedge:'\u2305',bbrk:'\u23B5',bbrktbrk:'\u23B6',bcong:'\u224C',bcy:'\u0431',Bcy:'\u0411',bdquo:'\u201E',becaus:'\u2235',because:'\u2235',Because:'\u2235',bemptyv:'\u29B0',bepsi:'\u03F6',bernou:'\u212C',Bernoullis:'\u212C',beta:'\u03B2',Beta:'\u0392',beth:'\u2136',between:'\u226C',bfr:'\uD835\uDD1F',Bfr:'\uD835\uDD05',bigcap:'\u22C2',bigcirc:'\u25EF',bigcup:'\u22C3',bigodot:'\u2A00',bigoplus:'\u2A01',bigotimes:'\u2A02',bigsqcup:'\u2A06',bigstar:'\u2605',bigtriangledown:'\u25BD',bigtriangleup:'\u25B3',biguplus:'\u2A04',bigvee:'\u22C1',bigwedge:'\u22C0',bkarow:'\u290D',blacklozenge:'\u29EB',blacksquare:'\u25AA',blacktriangle:'\u25B4',blacktriangledown:'\u25BE',blacktriangleleft:'\u25C2',blacktriangleright:'\u25B8',blank:'\u2423',blk12:'\u2592',blk14:'\u2591',blk34:'\u2593',block:'\u2588',bne:'=\u20E5',bnequiv:'\u2261\u20E5',bnot:'\u2310',bNot:'\u2AED',bopf:'\uD835\uDD53',Bopf:'\uD835\uDD39',bot:'\u22A5',bottom:'\u22A5',bowtie:'\u22C8',boxbox:'\u29C9',boxdl:'\u2510',boxdL:'\u2555',boxDl:'\u2556',boxDL:'\u2557',boxdr:'\u250C',boxdR:'\u2552',boxDr:'\u2553',boxDR:'\u2554',boxh:'\u2500',boxH:'\u2550',boxhd:'\u252C',boxhD:'\u2565',boxHd:'\u2564',boxHD:'\u2566',boxhu:'\u2534',boxhU:'\u2568',boxHu:'\u2567',boxHU:'\u2569',boxminus:'\u229F',boxplus:'\u229E',boxtimes:'\u22A0',boxul:'\u2518',boxuL:'\u255B',boxUl:'\u255C',boxUL:'\u255D',boxur:'\u2514',boxuR:'\u2558',boxUr:'\u2559',boxUR:'\u255A',boxv:'\u2502',boxV:'\u2551',boxvh:'\u253C',boxvH:'\u256A',boxVh:'\u256B',boxVH:'\u256C',boxvl:'\u2524',boxvL:'\u2561',boxVl:'\u2562',boxVL:'\u2563',boxvr:'\u251C',boxvR:'\u255E',boxVr:'\u255F',boxVR:'\u2560',bprime:'\u2035',breve:'\u02D8',Breve:'\u02D8',brvbar:'\xA6',bscr:'\uD835\uDCB7',Bscr:'\u212C',bsemi:'\u204F',bsim:'\u223D',bsime:'\u22CD',bsol:'\\',bsolb:'\u29C5',bsolhsub:'\u27C8',bull:'\u2022',bullet:'\u2022',bump:'\u224E',bumpe:'\u224F',bumpE:'\u2AAE',bumpeq:'\u224F',Bumpeq:'\u224E',cacute:'\u0107',Cacute:'\u0106',cap:'\u2229',Cap:'\u22D2',capand:'\u2A44',capbrcup:'\u2A49',capcap:'\u2A4B',capcup:'\u2A47',capdot:'\u2A40',CapitalDifferentialD:'\u2145',caps:'\u2229\uFE00',caret:'\u2041',caron:'\u02C7',Cayleys:'\u212D',ccaps:'\u2A4D',ccaron:'\u010D',Ccaron:'\u010C',ccedil:'\xE7',Ccedil:'\xC7',ccirc:'\u0109',Ccirc:'\u0108',Cconint:'\u2230',ccups:'\u2A4C',ccupssm:'\u2A50',cdot:'\u010B',Cdot:'\u010A',cedil:'\xB8',Cedilla:'\xB8',cemptyv:'\u29B2',cent:'\xA2',centerdot:'\xB7',CenterDot:'\xB7',cfr:'\uD835\uDD20',Cfr:'\u212D',chcy:'\u0447',CHcy:'\u0427',check:'\u2713',checkmark:'\u2713',chi:'\u03C7',Chi:'\u03A7',cir:'\u25CB',circ:'\u02C6',circeq:'\u2257',circlearrowleft:'\u21BA',circlearrowright:'\u21BB',circledast:'\u229B',circledcirc:'\u229A',circleddash:'\u229D',CircleDot:'\u2299',circledR:'\xAE',circledS:'\u24C8',CircleMinus:'\u2296',CirclePlus:'\u2295',CircleTimes:'\u2297',cire:'\u2257',cirE:'\u29C3',cirfnint:'\u2A10',cirmid:'\u2AEF',cirscir:'\u29C2',ClockwiseContourIntegral:'\u2232',CloseCurlyDoubleQuote:'\u201D',CloseCurlyQuote:'\u2019',clubs:'\u2663',clubsuit:'\u2663',colon:':',Colon:'\u2237',colone:'\u2254',Colone:'\u2A74',coloneq:'\u2254',comma:',',commat:'@',comp:'\u2201',compfn:'\u2218',complement:'\u2201',complexes:'\u2102',cong:'\u2245',congdot:'\u2A6D',Congruent:'\u2261',conint:'\u222E',Conint:'\u222F',ContourIntegral:'\u222E',copf:'\uD835\uDD54',Copf:'\u2102',coprod:'\u2210',Coproduct:'\u2210',copy:'\xA9',COPY:'\xA9',copysr:'\u2117',CounterClockwiseContourIntegral:'\u2233',crarr:'\u21B5',cross:'\u2717',Cross:'\u2A2F',cscr:'\uD835\uDCB8',Cscr:'\uD835\uDC9E',csub:'\u2ACF',csube:'\u2AD1',csup:'\u2AD0',csupe:'\u2AD2',ctdot:'\u22EF',cudarrl:'\u2938',cudarrr:'\u2935',cuepr:'\u22DE',cuesc:'\u22DF',cularr:'\u21B6',cularrp:'\u293D',cup:'\u222A',Cup:'\u22D3',cupbrcap:'\u2A48',cupcap:'\u2A46',CupCap:'\u224D',cupcup:'\u2A4A',cupdot:'\u228D',cupor:'\u2A45',cups:'\u222A\uFE00',curarr:'\u21B7',curarrm:'\u293C',curlyeqprec:'\u22DE',curlyeqsucc:'\u22DF',curlyvee:'\u22CE',curlywedge:'\u22CF',curren:'\xA4',curvearrowleft:'\u21B6',curvearrowright:'\u21B7',cuvee:'\u22CE',cuwed:'\u22CF',cwconint:'\u2232',cwint:'\u2231',cylcty:'\u232D',dagger:'\u2020',Dagger:'\u2021',daleth:'\u2138',darr:'\u2193',dArr:'\u21D3',Darr:'\u21A1',dash:'\u2010',dashv:'\u22A3',Dashv:'\u2AE4',dbkarow:'\u290F',dblac:'\u02DD',dcaron:'\u010F',Dcaron:'\u010E',dcy:'\u0434',Dcy:'\u0414',dd:'\u2146',DD:'\u2145',ddagger:'\u2021',ddarr:'\u21CA',DDotrahd:'\u2911',ddotseq:'\u2A77',deg:'\xB0',Del:'\u2207',delta:'\u03B4',Delta:'\u0394',demptyv:'\u29B1',dfisht:'\u297F',dfr:'\uD835\uDD21',Dfr:'\uD835\uDD07',dHar:'\u2965',dharl:'\u21C3',dharr:'\u21C2',DiacriticalAcute:'\xB4',DiacriticalDot:'\u02D9',DiacriticalDoubleAcute:'\u02DD',DiacriticalGrave:'`',DiacriticalTilde:'\u02DC',diam:'\u22C4',diamond:'\u22C4',Diamond:'\u22C4',diamondsuit:'\u2666',diams:'\u2666',die:'\xA8',DifferentialD:'\u2146',digamma:'\u03DD',disin:'\u22F2',div:'\xF7',divide:'\xF7',divideontimes:'\u22C7',divonx:'\u22C7',djcy:'\u0452',DJcy:'\u0402',dlcorn:'\u231E',dlcrop:'\u230D',dollar:'$',dopf:'\uD835\uDD55',Dopf:'\uD835\uDD3B',dot:'\u02D9',Dot:'\xA8',DotDot:'\u20DC',doteq:'\u2250',doteqdot:'\u2251',DotEqual:'\u2250',dotminus:'\u2238',dotplus:'\u2214',dotsquare:'\u22A1',doublebarwedge:'\u2306',DoubleContourIntegral:'\u222F',DoubleDot:'\xA8',DoubleDownArrow:'\u21D3',DoubleLeftArrow:'\u21D0',DoubleLeftRightArrow:'\u21D4',DoubleLeftTee:'\u2AE4',DoubleLongLeftArrow:'\u27F8',DoubleLongLeftRightArrow:'\u27FA',DoubleLongRightArrow:'\u27F9',DoubleRightArrow:'\u21D2',DoubleRightTee:'\u22A8',DoubleUpArrow:'\u21D1',DoubleUpDownArrow:'\u21D5',DoubleVerticalBar:'\u2225',downarrow:'\u2193',Downarrow:'\u21D3',DownArrow:'\u2193',DownArrowBar:'\u2913',DownArrowUpArrow:'\u21F5',DownBreve:'\u0311',downdownarrows:'\u21CA',downharpoonleft:'\u21C3',downharpoonright:'\u21C2',DownLeftRightVector:'\u2950',DownLeftTeeVector:'\u295E',DownLeftVector:'\u21BD',DownLeftVectorBar:'\u2956',DownRightTeeVector:'\u295F',DownRightVector:'\u21C1',DownRightVectorBar:'\u2957',DownTee:'\u22A4',DownTeeArrow:'\u21A7',drbkarow:'\u2910',drcorn:'\u231F',drcrop:'\u230C',dscr:'\uD835\uDCB9',Dscr:'\uD835\uDC9F',dscy:'\u0455',DScy:'\u0405',dsol:'\u29F6',dstrok:'\u0111',Dstrok:'\u0110',dtdot:'\u22F1',dtri:'\u25BF',dtrif:'\u25BE',duarr:'\u21F5',duhar:'\u296F',dwangle:'\u29A6',dzcy:'\u045F',DZcy:'\u040F',dzigrarr:'\u27FF',eacute:'\xE9',Eacute:'\xC9',easter:'\u2A6E',ecaron:'\u011B',Ecaron:'\u011A',ecir:'\u2256',ecirc:'\xEA',Ecirc:'\xCA',ecolon:'\u2255',ecy:'\u044D',Ecy:'\u042D',eDDot:'\u2A77',edot:'\u0117',eDot:'\u2251',Edot:'\u0116',ee:'\u2147',efDot:'\u2252',efr:'\uD835\uDD22',Efr:'\uD835\uDD08',eg:'\u2A9A',egrave:'\xE8',Egrave:'\xC8',egs:'\u2A96',egsdot:'\u2A98',el:'\u2A99',Element:'\u2208',elinters:'\u23E7',ell:'\u2113',els:'\u2A95',elsdot:'\u2A97',emacr:'\u0113',Emacr:'\u0112',empty:'\u2205',emptyset:'\u2205',EmptySmallSquare:'\u25FB',emptyv:'\u2205',EmptyVerySmallSquare:'\u25AB',emsp:'\u2003',emsp13:'\u2004',emsp14:'\u2005',eng:'\u014B',ENG:'\u014A',ensp:'\u2002',eogon:'\u0119',Eogon:'\u0118',eopf:'\uD835\uDD56',Eopf:'\uD835\uDD3C',epar:'\u22D5',eparsl:'\u29E3',eplus:'\u2A71',epsi:'\u03B5',epsilon:'\u03B5',Epsilon:'\u0395',epsiv:'\u03F5',eqcirc:'\u2256',eqcolon:'\u2255',eqsim:'\u2242',eqslantgtr:'\u2A96',eqslantless:'\u2A95',Equal:'\u2A75',equals:'=',EqualTilde:'\u2242',equest:'\u225F',Equilibrium:'\u21CC',equiv:'\u2261',equivDD:'\u2A78',eqvparsl:'\u29E5',erarr:'\u2971',erDot:'\u2253',escr:'\u212F',Escr:'\u2130',esdot:'\u2250',esim:'\u2242',Esim:'\u2A73',eta:'\u03B7',Eta:'\u0397',eth:'\xF0',ETH:'\xD0',euml:'\xEB',Euml:'\xCB',euro:'\u20AC',excl:'!',exist:'\u2203',Exists:'\u2203',expectation:'\u2130',exponentiale:'\u2147',ExponentialE:'\u2147',fallingdotseq:'\u2252',fcy:'\u0444',Fcy:'\u0424',female:'\u2640',ffilig:'\uFB03',fflig:'\uFB00',ffllig:'\uFB04',ffr:'\uD835\uDD23',Ffr:'\uD835\uDD09',filig:'\uFB01',FilledSmallSquare:'\u25FC',FilledVerySmallSquare:'\u25AA',fjlig:'fj',flat:'\u266D',fllig:'\uFB02',fltns:'\u25B1',fnof:'\u0192',fopf:'\uD835\uDD57',Fopf:'\uD835\uDD3D',forall:'\u2200',ForAll:'\u2200',fork:'\u22D4',forkv:'\u2AD9',Fouriertrf:'\u2131',fpartint:'\u2A0D',frac12:'\xBD',frac13:'\u2153',frac14:'\xBC',frac15:'\u2155',frac16:'\u2159',frac18:'\u215B',frac23:'\u2154',frac25:'\u2156',frac34:'\xBE',frac35:'\u2157',frac38:'\u215C',frac45:'\u2158',frac56:'\u215A',frac58:'\u215D',frac78:'\u215E',frasl:'\u2044',frown:'\u2322',fscr:'\uD835\uDCBB',Fscr:'\u2131',gacute:'\u01F5',gamma:'\u03B3',Gamma:'\u0393',gammad:'\u03DD',Gammad:'\u03DC',gap:'\u2A86',gbreve:'\u011F',Gbreve:'\u011E',Gcedil:'\u0122',gcirc:'\u011D',Gcirc:'\u011C',gcy:'\u0433',Gcy:'\u0413',gdot:'\u0121',Gdot:'\u0120',ge:'\u2265',gE:'\u2267',gel:'\u22DB',gEl:'\u2A8C',geq:'\u2265',geqq:'\u2267',geqslant:'\u2A7E',ges:'\u2A7E',gescc:'\u2AA9',gesdot:'\u2A80',gesdoto:'\u2A82',gesdotol:'\u2A84',gesl:'\u22DB\uFE00',gesles:'\u2A94',gfr:'\uD835\uDD24',Gfr:'\uD835\uDD0A',gg:'\u226B',Gg:'\u22D9',ggg:'\u22D9',gimel:'\u2137',gjcy:'\u0453',GJcy:'\u0403',gl:'\u2277',gla:'\u2AA5',glE:'\u2A92',glj:'\u2AA4',gnap:'\u2A8A',gnapprox:'\u2A8A',gne:'\u2A88',gnE:'\u2269',gneq:'\u2A88',gneqq:'\u2269',gnsim:'\u22E7',gopf:'\uD835\uDD58',Gopf:'\uD835\uDD3E',grave:'`',GreaterEqual:'\u2265',GreaterEqualLess:'\u22DB',GreaterFullEqual:'\u2267',GreaterGreater:'\u2AA2',GreaterLess:'\u2277',GreaterSlantEqual:'\u2A7E',GreaterTilde:'\u2273',gscr:'\u210A',Gscr:'\uD835\uDCA2',gsim:'\u2273',gsime:'\u2A8E',gsiml:'\u2A90',gt:'>',Gt:'\u226B',GT:'>',gtcc:'\u2AA7',gtcir:'\u2A7A',gtdot:'\u22D7',gtlPar:'\u2995',gtquest:'\u2A7C',gtrapprox:'\u2A86',gtrarr:'\u2978',gtrdot:'\u22D7',gtreqless:'\u22DB',gtreqqless:'\u2A8C',gtrless:'\u2277',gtrsim:'\u2273',gvertneqq:'\u2269\uFE00',gvnE:'\u2269\uFE00',Hacek:'\u02C7',hairsp:'\u200A',half:'\xBD',hamilt:'\u210B',hardcy:'\u044A',HARDcy:'\u042A',harr:'\u2194',hArr:'\u21D4',harrcir:'\u2948',harrw:'\u21AD',Hat:'^',hbar:'\u210F',hcirc:'\u0125',Hcirc:'\u0124',hearts:'\u2665',heartsuit:'\u2665',hellip:'\u2026',hercon:'\u22B9',hfr:'\uD835\uDD25',Hfr:'\u210C',HilbertSpace:'\u210B',hksearow:'\u2925',hkswarow:'\u2926',hoarr:'\u21FF',homtht:'\u223B',hookleftarrow:'\u21A9',hookrightarrow:'\u21AA',hopf:'\uD835\uDD59',Hopf:'\u210D',horbar:'\u2015',HorizontalLine:'\u2500',hscr:'\uD835\uDCBD',Hscr:'\u210B',hslash:'\u210F',hstrok:'\u0127',Hstrok:'\u0126',HumpDownHump:'\u224E',HumpEqual:'\u224F',hybull:'\u2043',hyphen:'\u2010',iacute:'\xED',Iacute:'\xCD',ic:'\u2063',icirc:'\xEE',Icirc:'\xCE',icy:'\u0438',Icy:'\u0418',Idot:'\u0130',iecy:'\u0435',IEcy:'\u0415',iexcl:'\xA1',iff:'\u21D4',ifr:'\uD835\uDD26',Ifr:'\u2111',igrave:'\xEC',Igrave:'\xCC',ii:'\u2148',iiiint:'\u2A0C',iiint:'\u222D',iinfin:'\u29DC',iiota:'\u2129',ijlig:'\u0133',IJlig:'\u0132',Im:'\u2111',imacr:'\u012B',Imacr:'\u012A',image:'\u2111',ImaginaryI:'\u2148',imagline:'\u2110',imagpart:'\u2111',imath:'\u0131',imof:'\u22B7',imped:'\u01B5',Implies:'\u21D2',in:'\u2208',incare:'\u2105',infin:'\u221E',infintie:'\u29DD',inodot:'\u0131',int:'\u222B',Int:'\u222C',intcal:'\u22BA',integers:'\u2124',Integral:'\u222B',intercal:'\u22BA',Intersection:'\u22C2',intlarhk:'\u2A17',intprod:'\u2A3C',InvisibleComma:'\u2063',InvisibleTimes:'\u2062',iocy:'\u0451',IOcy:'\u0401',iogon:'\u012F',Iogon:'\u012E',iopf:'\uD835\uDD5A',Iopf:'\uD835\uDD40',iota:'\u03B9',Iota:'\u0399',iprod:'\u2A3C',iquest:'\xBF',iscr:'\uD835\uDCBE',Iscr:'\u2110',isin:'\u2208',isindot:'\u22F5',isinE:'\u22F9',isins:'\u22F4',isinsv:'\u22F3',isinv:'\u2208',it:'\u2062',itilde:'\u0129',Itilde:'\u0128',iukcy:'\u0456',Iukcy:'\u0406',iuml:'\xEF',Iuml:'\xCF',jcirc:'\u0135',Jcirc:'\u0134',jcy:'\u0439',Jcy:'\u0419',jfr:'\uD835\uDD27',Jfr:'\uD835\uDD0D',jmath:'\u0237',jopf:'\uD835\uDD5B',Jopf:'\uD835\uDD41',jscr:'\uD835\uDCBF',Jscr:'\uD835\uDCA5',jsercy:'\u0458',Jsercy:'\u0408',jukcy:'\u0454',Jukcy:'\u0404',kappa:'\u03BA',Kappa:'\u039A',kappav:'\u03F0',kcedil:'\u0137',Kcedil:'\u0136',kcy:'\u043A',Kcy:'\u041A',kfr:'\uD835\uDD28',Kfr:'\uD835\uDD0E',kgreen:'\u0138',khcy:'\u0445',KHcy:'\u0425',kjcy:'\u045C',KJcy:'\u040C',kopf:'\uD835\uDD5C',Kopf:'\uD835\uDD42',kscr:'\uD835\uDCC0',Kscr:'\uD835\uDCA6',lAarr:'\u21DA',lacute:'\u013A',Lacute:'\u0139',laemptyv:'\u29B4',lagran:'\u2112',lambda:'\u03BB',Lambda:'\u039B',lang:'\u27E8',Lang:'\u27EA',langd:'\u2991',langle:'\u27E8',lap:'\u2A85',Laplacetrf:'\u2112',laquo:'\xAB',larr:'\u2190',lArr:'\u21D0',Larr:'\u219E',larrb:'\u21E4',larrbfs:'\u291F',larrfs:'\u291D',larrhk:'\u21A9',larrlp:'\u21AB',larrpl:'\u2939',larrsim:'\u2973',larrtl:'\u21A2',lat:'\u2AAB',latail:'\u2919',lAtail:'\u291B',late:'\u2AAD',lates:'\u2AAD\uFE00',lbarr:'\u290C',lBarr:'\u290E',lbbrk:'\u2772',lbrace:'{',lbrack:'[',lbrke:'\u298B',lbrksld:'\u298F',lbrkslu:'\u298D',lcaron:'\u013E',Lcaron:'\u013D',lcedil:'\u013C',Lcedil:'\u013B',lceil:'\u2308',lcub:'{',lcy:'\u043B',Lcy:'\u041B',ldca:'\u2936',ldquo:'\u201C',ldquor:'\u201E',ldrdhar:'\u2967',ldrushar:'\u294B',ldsh:'\u21B2',le:'\u2264',lE:'\u2266',LeftAngleBracket:'\u27E8',leftarrow:'\u2190',Leftarrow:'\u21D0',LeftArrow:'\u2190',LeftArrowBar:'\u21E4',LeftArrowRightArrow:'\u21C6',leftarrowtail:'\u21A2',LeftCeiling:'\u2308',LeftDoubleBracket:'\u27E6',LeftDownTeeVector:'\u2961',LeftDownVector:'\u21C3',LeftDownVectorBar:'\u2959',LeftFloor:'\u230A',leftharpoondown:'\u21BD',leftharpoonup:'\u21BC',leftleftarrows:'\u21C7',leftrightarrow:'\u2194',Leftrightarrow:'\u21D4',LeftRightArrow:'\u2194',leftrightarrows:'\u21C6',leftrightharpoons:'\u21CB',leftrightsquigarrow:'\u21AD',LeftRightVector:'\u294E',LeftTee:'\u22A3',LeftTeeArrow:'\u21A4',LeftTeeVector:'\u295A',leftthreetimes:'\u22CB',LeftTriangle:'\u22B2',LeftTriangleBar:'\u29CF',LeftTriangleEqual:'\u22B4',LeftUpDownVector:'\u2951',LeftUpTeeVector:'\u2960',LeftUpVector:'\u21BF',LeftUpVectorBar:'\u2958',LeftVector:'\u21BC',LeftVectorBar:'\u2952',leg:'\u22DA',lEg:'\u2A8B',leq:'\u2264',leqq:'\u2266',leqslant:'\u2A7D',les:'\u2A7D',lescc:'\u2AA8',lesdot:'\u2A7F',lesdoto:'\u2A81',lesdotor:'\u2A83',lesg:'\u22DA\uFE00',lesges:'\u2A93',lessapprox:'\u2A85',lessdot:'\u22D6',lesseqgtr:'\u22DA',lesseqqgtr:'\u2A8B',LessEqualGreater:'\u22DA',LessFullEqual:'\u2266',LessGreater:'\u2276',lessgtr:'\u2276',LessLess:'\u2AA1',lesssim:'\u2272',LessSlantEqual:'\u2A7D',LessTilde:'\u2272',lfisht:'\u297C',lfloor:'\u230A',lfr:'\uD835\uDD29',Lfr:'\uD835\uDD0F',lg:'\u2276',lgE:'\u2A91',lHar:'\u2962',lhard:'\u21BD',lharu:'\u21BC',lharul:'\u296A',lhblk:'\u2584',ljcy:'\u0459',LJcy:'\u0409',ll:'\u226A',Ll:'\u22D8',llarr:'\u21C7',llcorner:'\u231E',Lleftarrow:'\u21DA',llhard:'\u296B',lltri:'\u25FA',lmidot:'\u0140',Lmidot:'\u013F',lmoust:'\u23B0',lmoustache:'\u23B0',lnap:'\u2A89',lnapprox:'\u2A89',lne:'\u2A87',lnE:'\u2268',lneq:'\u2A87',lneqq:'\u2268',lnsim:'\u22E6',loang:'\u27EC',loarr:'\u21FD',lobrk:'\u27E6',longleftarrow:'\u27F5',Longleftarrow:'\u27F8',LongLeftArrow:'\u27F5',longleftrightarrow:'\u27F7',Longleftrightarrow:'\u27FA',LongLeftRightArrow:'\u27F7',longmapsto:'\u27FC',longrightarrow:'\u27F6',Longrightarrow:'\u27F9',LongRightArrow:'\u27F6',looparrowleft:'\u21AB',looparrowright:'\u21AC',lopar:'\u2985',lopf:'\uD835\uDD5D',Lopf:'\uD835\uDD43',loplus:'\u2A2D',lotimes:'\u2A34',lowast:'\u2217',lowbar:'_',LowerLeftArrow:'\u2199',LowerRightArrow:'\u2198',loz:'\u25CA',lozenge:'\u25CA',lozf:'\u29EB',lpar:'(',lparlt:'\u2993',lrarr:'\u21C6',lrcorner:'\u231F',lrhar:'\u21CB',lrhard:'\u296D',lrm:'\u200E',lrtri:'\u22BF',lsaquo:'\u2039',lscr:'\uD835\uDCC1',Lscr:'\u2112',lsh:'\u21B0',Lsh:'\u21B0',lsim:'\u2272',lsime:'\u2A8D',lsimg:'\u2A8F',lsqb:'[',lsquo:'\u2018',lsquor:'\u201A',lstrok:'\u0142',Lstrok:'\u0141',lt:'<',Lt:'\u226A',LT:'<',ltcc:'\u2AA6',ltcir:'\u2A79',ltdot:'\u22D6',lthree:'\u22CB',ltimes:'\u22C9',ltlarr:'\u2976',ltquest:'\u2A7B',ltri:'\u25C3',ltrie:'\u22B4',ltrif:'\u25C2',ltrPar:'\u2996',lurdshar:'\u294A',luruhar:'\u2966',lvertneqq:'\u2268\uFE00',lvnE:'\u2268\uFE00',macr:'\xAF',male:'\u2642',malt:'\u2720',maltese:'\u2720',map:'\u21A6',Map:'\u2905',mapsto:'\u21A6',mapstodown:'\u21A7',mapstoleft:'\u21A4',mapstoup:'\u21A5',marker:'\u25AE',mcomma:'\u2A29',mcy:'\u043C',Mcy:'\u041C',mdash:'\u2014',mDDot:'\u223A',measuredangle:'\u2221',MediumSpace:'\u205F',Mellintrf:'\u2133',mfr:'\uD835\uDD2A',Mfr:'\uD835\uDD10',mho:'\u2127',micro:'\xB5',mid:'\u2223',midast:'*',midcir:'\u2AF0',middot:'\xB7',minus:'\u2212',minusb:'\u229F',minusd:'\u2238',minusdu:'\u2A2A',MinusPlus:'\u2213',mlcp:'\u2ADB',mldr:'\u2026',mnplus:'\u2213',models:'\u22A7',mopf:'\uD835\uDD5E',Mopf:'\uD835\uDD44',mp:'\u2213',mscr:'\uD835\uDCC2',Mscr:'\u2133',mstpos:'\u223E',mu:'\u03BC',Mu:'\u039C',multimap:'\u22B8',mumap:'\u22B8',nabla:'\u2207',nacute:'\u0144',Nacute:'\u0143',nang:'\u2220\u20D2',nap:'\u2249',napE:'\u2A70\u0338',napid:'\u224B\u0338',napos:'\u0149',napprox:'\u2249',natur:'\u266E',natural:'\u266E',naturals:'\u2115',nbsp:'\xA0',nbump:'\u224E\u0338',nbumpe:'\u224F\u0338',ncap:'\u2A43',ncaron:'\u0148',Ncaron:'\u0147',ncedil:'\u0146',Ncedil:'\u0145',ncong:'\u2247',ncongdot:'\u2A6D\u0338',ncup:'\u2A42',ncy:'\u043D',Ncy:'\u041D',ndash:'\u2013',ne:'\u2260',nearhk:'\u2924',nearr:'\u2197',neArr:'\u21D7',nearrow:'\u2197',nedot:'\u2250\u0338',NegativeMediumSpace:'\u200B',NegativeThickSpace:'\u200B',NegativeThinSpace:'\u200B',NegativeVeryThinSpace:'\u200B',nequiv:'\u2262',nesear:'\u2928',nesim:'\u2242\u0338',NestedGreaterGreater:'\u226B',NestedLessLess:'\u226A',NewLine:'\n',nexist:'\u2204',nexists:'\u2204',nfr:'\uD835\uDD2B',Nfr:'\uD835\uDD11',nge:'\u2271',ngE:'\u2267\u0338',ngeq:'\u2271',ngeqq:'\u2267\u0338',ngeqslant:'\u2A7E\u0338',nges:'\u2A7E\u0338',nGg:'\u22D9\u0338',ngsim:'\u2275',ngt:'\u226F',nGt:'\u226B\u20D2',ngtr:'\u226F',nGtv:'\u226B\u0338',nharr:'\u21AE',nhArr:'\u21CE',nhpar:'\u2AF2',ni:'\u220B',nis:'\u22FC',nisd:'\u22FA',niv:'\u220B',njcy:'\u045A',NJcy:'\u040A',nlarr:'\u219A',nlArr:'\u21CD',nldr:'\u2025',nle:'\u2270',nlE:'\u2266\u0338',nleftarrow:'\u219A',nLeftarrow:'\u21CD',nleftrightarrow:'\u21AE',nLeftrightarrow:'\u21CE',nleq:'\u2270',nleqq:'\u2266\u0338',nleqslant:'\u2A7D\u0338',nles:'\u2A7D\u0338',nless:'\u226E',nLl:'\u22D8\u0338',nlsim:'\u2274',nlt:'\u226E',nLt:'\u226A\u20D2',nltri:'\u22EA',nltrie:'\u22EC',nLtv:'\u226A\u0338',nmid:'\u2224',NoBreak:'\u2060',NonBreakingSpace:'\xA0',nopf:'\uD835\uDD5F',Nopf:'\u2115',not:'\xAC',Not:'\u2AEC',NotCongruent:'\u2262',NotCupCap:'\u226D',NotDoubleVerticalBar:'\u2226',NotElement:'\u2209',NotEqual:'\u2260',NotEqualTilde:'\u2242\u0338',NotExists:'\u2204',NotGreater:'\u226F',NotGreaterEqual:'\u2271',NotGreaterFullEqual:'\u2267\u0338',NotGreaterGreater:'\u226B\u0338',NotGreaterLess:'\u2279',NotGreaterSlantEqual:'\u2A7E\u0338',NotGreaterTilde:'\u2275',NotHumpDownHump:'\u224E\u0338',NotHumpEqual:'\u224F\u0338',notin:'\u2209',notindot:'\u22F5\u0338',notinE:'\u22F9\u0338',notinva:'\u2209',notinvb:'\u22F7',notinvc:'\u22F6',NotLeftTriangle:'\u22EA',NotLeftTriangleBar:'\u29CF\u0338',NotLeftTriangleEqual:'\u22EC',NotLess:'\u226E',NotLessEqual:'\u2270',NotLessGreater:'\u2278',NotLessLess:'\u226A\u0338',NotLessSlantEqual:'\u2A7D\u0338',NotLessTilde:'\u2274',NotNestedGreaterGreater:'\u2AA2\u0338',NotNestedLessLess:'\u2AA1\u0338',notni:'\u220C',notniva:'\u220C',notnivb:'\u22FE',notnivc:'\u22FD',NotPrecedes:'\u2280',NotPrecedesEqual:'\u2AAF\u0338',NotPrecedesSlantEqual:'\u22E0',NotReverseElement:'\u220C',NotRightTriangle:'\u22EB',NotRightTriangleBar:'\u29D0\u0338',NotRightTriangleEqual:'\u22ED',NotSquareSubset:'\u228F\u0338',NotSquareSubsetEqual:'\u22E2',NotSquareSuperset:'\u2290\u0338',NotSquareSupersetEqual:'\u22E3',NotSubset:'\u2282\u20D2',NotSubsetEqual:'\u2288',NotSucceeds:'\u2281',NotSucceedsEqual:'\u2AB0\u0338',NotSucceedsSlantEqual:'\u22E1',NotSucceedsTilde:'\u227F\u0338',NotSuperset:'\u2283\u20D2',NotSupersetEqual:'\u2289',NotTilde:'\u2241',NotTildeEqual:'\u2244',NotTildeFullEqual:'\u2247',NotTildeTilde:'\u2249',NotVerticalBar:'\u2224',npar:'\u2226',nparallel:'\u2226',nparsl:'\u2AFD\u20E5',npart:'\u2202\u0338',npolint:'\u2A14',npr:'\u2280',nprcue:'\u22E0',npre:'\u2AAF\u0338',nprec:'\u2280',npreceq:'\u2AAF\u0338',nrarr:'\u219B',nrArr:'\u21CF',nrarrc:'\u2933\u0338',nrarrw:'\u219D\u0338',nrightarrow:'\u219B',nRightarrow:'\u21CF',nrtri:'\u22EB',nrtrie:'\u22ED',nsc:'\u2281',nsccue:'\u22E1',nsce:'\u2AB0\u0338',nscr:'\uD835\uDCC3',Nscr:'\uD835\uDCA9',nshortmid:'\u2224',nshortparallel:'\u2226',nsim:'\u2241',nsime:'\u2244',nsimeq:'\u2244',nsmid:'\u2224',nspar:'\u2226',nsqsube:'\u22E2',nsqsupe:'\u22E3',nsub:'\u2284',nsube:'\u2288',nsubE:'\u2AC5\u0338',nsubset:'\u2282\u20D2',nsubseteq:'\u2288',nsubseteqq:'\u2AC5\u0338',nsucc:'\u2281',nsucceq:'\u2AB0\u0338',nsup:'\u2285',nsupe:'\u2289',nsupE:'\u2AC6\u0338',nsupset:'\u2283\u20D2',nsupseteq:'\u2289',nsupseteqq:'\u2AC6\u0338',ntgl:'\u2279',ntilde:'\xF1',Ntilde:'\xD1',ntlg:'\u2278',ntriangleleft:'\u22EA',ntrianglelefteq:'\u22EC',ntriangleright:'\u22EB',ntrianglerighteq:'\u22ED',nu:'\u03BD',Nu:'\u039D',num:'#',numero:'\u2116',numsp:'\u2007',nvap:'\u224D\u20D2',nvdash:'\u22AC',nvDash:'\u22AD',nVdash:'\u22AE',nVDash:'\u22AF',nvge:'\u2265\u20D2',nvgt:'>\u20D2',nvHarr:'\u2904',nvinfin:'\u29DE',nvlArr:'\u2902',nvle:'\u2264\u20D2',nvlt:'<\u20D2',nvltrie:'\u22B4\u20D2',nvrArr:'\u2903',nvrtrie:'\u22B5\u20D2',nvsim:'\u223C\u20D2',nwarhk:'\u2923',nwarr:'\u2196',nwArr:'\u21D6',nwarrow:'\u2196',nwnear:'\u2927',oacute:'\xF3',Oacute:'\xD3',oast:'\u229B',ocir:'\u229A',ocirc:'\xF4',Ocirc:'\xD4',ocy:'\u043E',Ocy:'\u041E',odash:'\u229D',odblac:'\u0151',Odblac:'\u0150',odiv:'\u2A38',odot:'\u2299',odsold:'\u29BC',oelig:'\u0153',OElig:'\u0152',ofcir:'\u29BF',ofr:'\uD835\uDD2C',Ofr:'\uD835\uDD12',ogon:'\u02DB',ograve:'\xF2',Ograve:'\xD2',ogt:'\u29C1',ohbar:'\u29B5',ohm:'\u03A9',oint:'\u222E',olarr:'\u21BA',olcir:'\u29BE',olcross:'\u29BB',oline:'\u203E',olt:'\u29C0',omacr:'\u014D',Omacr:'\u014C',omega:'\u03C9',Omega:'\u03A9',omicron:'\u03BF',Omicron:'\u039F',omid:'\u29B6',ominus:'\u2296',oopf:'\uD835\uDD60',Oopf:'\uD835\uDD46',opar:'\u29B7',OpenCurlyDoubleQuote:'\u201C',OpenCurlyQuote:'\u2018',operp:'\u29B9',oplus:'\u2295',or:'\u2228',Or:'\u2A54',orarr:'\u21BB',ord:'\u2A5D',order:'\u2134',orderof:'\u2134',ordf:'\xAA',ordm:'\xBA',origof:'\u22B6',oror:'\u2A56',orslope:'\u2A57',orv:'\u2A5B',oS:'\u24C8',oscr:'\u2134',Oscr:'\uD835\uDCAA',oslash:'\xF8',Oslash:'\xD8',osol:'\u2298',otilde:'\xF5',Otilde:'\xD5',otimes:'\u2297',Otimes:'\u2A37',otimesas:'\u2A36',ouml:'\xF6',Ouml:'\xD6',ovbar:'\u233D',OverBar:'\u203E',OverBrace:'\u23DE',OverBracket:'\u23B4',OverParenthesis:'\u23DC',par:'\u2225',para:'\xB6',parallel:'\u2225',parsim:'\u2AF3',parsl:'\u2AFD',part:'\u2202',PartialD:'\u2202',pcy:'\u043F',Pcy:'\u041F',percnt:'%',period:'.',permil:'\u2030',perp:'\u22A5',pertenk:'\u2031',pfr:'\uD835\uDD2D',Pfr:'\uD835\uDD13',phi:'\u03C6',Phi:'\u03A6',phiv:'\u03D5',phmmat:'\u2133',phone:'\u260E',pi:'\u03C0',Pi:'\u03A0',pitchfork:'\u22D4',piv:'\u03D6',planck:'\u210F',planckh:'\u210E',plankv:'\u210F',plus:'+',plusacir:'\u2A23',plusb:'\u229E',pluscir:'\u2A22',plusdo:'\u2214',plusdu:'\u2A25',pluse:'\u2A72',PlusMinus:'\xB1',plusmn:'\xB1',plussim:'\u2A26',plustwo:'\u2A27',pm:'\xB1',Poincareplane:'\u210C',pointint:'\u2A15',popf:'\uD835\uDD61',Popf:'\u2119',pound:'\xA3',pr:'\u227A',Pr:'\u2ABB',prap:'\u2AB7',prcue:'\u227C',pre:'\u2AAF',prE:'\u2AB3',prec:'\u227A',precapprox:'\u2AB7',preccurlyeq:'\u227C',Precedes:'\u227A',PrecedesEqual:'\u2AAF',PrecedesSlantEqual:'\u227C',PrecedesTilde:'\u227E',preceq:'\u2AAF',precnapprox:'\u2AB9',precneqq:'\u2AB5',precnsim:'\u22E8',precsim:'\u227E',prime:'\u2032',Prime:'\u2033',primes:'\u2119',prnap:'\u2AB9',prnE:'\u2AB5',prnsim:'\u22E8',prod:'\u220F',Product:'\u220F',profalar:'\u232E',profline:'\u2312',profsurf:'\u2313',prop:'\u221D',Proportion:'\u2237',Proportional:'\u221D',propto:'\u221D',prsim:'\u227E',prurel:'\u22B0',pscr:'\uD835\uDCC5',Pscr:'\uD835\uDCAB',psi:'\u03C8',Psi:'\u03A8',puncsp:'\u2008',qfr:'\uD835\uDD2E',Qfr:'\uD835\uDD14',qint:'\u2A0C',qopf:'\uD835\uDD62',Qopf:'\u211A',qprime:'\u2057',qscr:'\uD835\uDCC6',Qscr:'\uD835\uDCAC',quaternions:'\u210D',quatint:'\u2A16',quest:'?',questeq:'\u225F',quot:'"',QUOT:'"',rAarr:'\u21DB',race:'\u223D\u0331',racute:'\u0155',Racute:'\u0154',radic:'\u221A',raemptyv:'\u29B3',rang:'\u27E9',Rang:'\u27EB',rangd:'\u2992',range:'\u29A5',rangle:'\u27E9',raquo:'\xBB',rarr:'\u2192',rArr:'\u21D2',Rarr:'\u21A0',rarrap:'\u2975',rarrb:'\u21E5',rarrbfs:'\u2920',rarrc:'\u2933',rarrfs:'\u291E',rarrhk:'\u21AA',rarrlp:'\u21AC',rarrpl:'\u2945',rarrsim:'\u2974',rarrtl:'\u21A3',Rarrtl:'\u2916',rarrw:'\u219D',ratail:'\u291A',rAtail:'\u291C',ratio:'\u2236',rationals:'\u211A',rbarr:'\u290D',rBarr:'\u290F',RBarr:'\u2910',rbbrk:'\u2773',rbrace:'}',rbrack:']',rbrke:'\u298C',rbrksld:'\u298E',rbrkslu:'\u2990',rcaron:'\u0159',Rcaron:'\u0158',rcedil:'\u0157',Rcedil:'\u0156',rceil:'\u2309',rcub:'}',rcy:'\u0440',Rcy:'\u0420',rdca:'\u2937',rdldhar:'\u2969',rdquo:'\u201D',rdquor:'\u201D',rdsh:'\u21B3',Re:'\u211C',real:'\u211C',realine:'\u211B',realpart:'\u211C',reals:'\u211D',rect:'\u25AD',reg:'\xAE',REG:'\xAE',ReverseElement:'\u220B',ReverseEquilibrium:'\u21CB',ReverseUpEquilibrium:'\u296F',rfisht:'\u297D',rfloor:'\u230B',rfr:'\uD835\uDD2F',Rfr:'\u211C',rHar:'\u2964',rhard:'\u21C1',rharu:'\u21C0',rharul:'\u296C',rho:'\u03C1',Rho:'\u03A1',rhov:'\u03F1',RightAngleBracket:'\u27E9',rightarrow:'\u2192',Rightarrow:'\u21D2',RightArrow:'\u2192',RightArrowBar:'\u21E5',RightArrowLeftArrow:'\u21C4',rightarrowtail:'\u21A3',RightCeiling:'\u2309',RightDoubleBracket:'\u27E7',RightDownTeeVector:'\u295D',RightDownVector:'\u21C2',RightDownVectorBar:'\u2955',RightFloor:'\u230B',rightharpoondown:'\u21C1',rightharpoonup:'\u21C0',rightleftarrows:'\u21C4',rightleftharpoons:'\u21CC',rightrightarrows:'\u21C9',rightsquigarrow:'\u219D',RightTee:'\u22A2',RightTeeArrow:'\u21A6',RightTeeVector:'\u295B',rightthreetimes:'\u22CC',RightTriangle:'\u22B3',RightTriangleBar:'\u29D0',RightTriangleEqual:'\u22B5',RightUpDownVector:'\u294F',RightUpTeeVector:'\u295C',RightUpVector:'\u21BE',RightUpVectorBar:'\u2954',RightVector:'\u21C0',RightVectorBar:'\u2953',ring:'\u02DA',risingdotseq:'\u2253',rlarr:'\u21C4',rlhar:'\u21CC',rlm:'\u200F',rmoust:'\u23B1',rmoustache:'\u23B1',rnmid:'\u2AEE',roang:'\u27ED',roarr:'\u21FE',robrk:'\u27E7',ropar:'\u2986',ropf:'\uD835\uDD63',Ropf:'\u211D',roplus:'\u2A2E',rotimes:'\u2A35',RoundImplies:'\u2970',rpar:')',rpargt:'\u2994',rppolint:'\u2A12',rrarr:'\u21C9',Rrightarrow:'\u21DB',rsaquo:'\u203A',rscr:'\uD835\uDCC7',Rscr:'\u211B',rsh:'\u21B1',Rsh:'\u21B1',rsqb:']',rsquo:'\u2019',rsquor:'\u2019',rthree:'\u22CC',rtimes:'\u22CA',rtri:'\u25B9',rtrie:'\u22B5',rtrif:'\u25B8',rtriltri:'\u29CE',RuleDelayed:'\u29F4',ruluhar:'\u2968',rx:'\u211E',sacute:'\u015B',Sacute:'\u015A',sbquo:'\u201A',sc:'\u227B',Sc:'\u2ABC',scap:'\u2AB8',scaron:'\u0161',Scaron:'\u0160',sccue:'\u227D',sce:'\u2AB0',scE:'\u2AB4',scedil:'\u015F',Scedil:'\u015E',scirc:'\u015D',Scirc:'\u015C',scnap:'\u2ABA',scnE:'\u2AB6',scnsim:'\u22E9',scpolint:'\u2A13',scsim:'\u227F',scy:'\u0441',Scy:'\u0421',sdot:'\u22C5',sdotb:'\u22A1',sdote:'\u2A66',searhk:'\u2925',searr:'\u2198',seArr:'\u21D8',searrow:'\u2198',sect:'\xA7',semi:';',seswar:'\u2929',setminus:'\u2216',setmn:'\u2216',sext:'\u2736',sfr:'\uD835\uDD30',Sfr:'\uD835\uDD16',sfrown:'\u2322',sharp:'\u266F',shchcy:'\u0449',SHCHcy:'\u0429',shcy:'\u0448',SHcy:'\u0428',ShortDownArrow:'\u2193',ShortLeftArrow:'\u2190',shortmid:'\u2223',shortparallel:'\u2225',ShortRightArrow:'\u2192',ShortUpArrow:'\u2191',shy:'\xAD',sigma:'\u03C3',Sigma:'\u03A3',sigmaf:'\u03C2',sigmav:'\u03C2',sim:'\u223C',simdot:'\u2A6A',sime:'\u2243',simeq:'\u2243',simg:'\u2A9E',simgE:'\u2AA0',siml:'\u2A9D',simlE:'\u2A9F',simne:'\u2246',simplus:'\u2A24',simrarr:'\u2972',slarr:'\u2190',SmallCircle:'\u2218',smallsetminus:'\u2216',smashp:'\u2A33',smeparsl:'\u29E4',smid:'\u2223',smile:'\u2323',smt:'\u2AAA',smte:'\u2AAC',smtes:'\u2AAC\uFE00',softcy:'\u044C',SOFTcy:'\u042C',sol:'/',solb:'\u29C4',solbar:'\u233F',sopf:'\uD835\uDD64',Sopf:'\uD835\uDD4A',spades:'\u2660',spadesuit:'\u2660',spar:'\u2225',sqcap:'\u2293',sqcaps:'\u2293\uFE00',sqcup:'\u2294',sqcups:'\u2294\uFE00',Sqrt:'\u221A',sqsub:'\u228F',sqsube:'\u2291',sqsubset:'\u228F',sqsubseteq:'\u2291',sqsup:'\u2290',sqsupe:'\u2292',sqsupset:'\u2290',sqsupseteq:'\u2292',squ:'\u25A1',square:'\u25A1',Square:'\u25A1',SquareIntersection:'\u2293',SquareSubset:'\u228F',SquareSubsetEqual:'\u2291',SquareSuperset:'\u2290',SquareSupersetEqual:'\u2292',SquareUnion:'\u2294',squarf:'\u25AA',squf:'\u25AA',srarr:'\u2192',sscr:'\uD835\uDCC8',Sscr:'\uD835\uDCAE',ssetmn:'\u2216',ssmile:'\u2323',sstarf:'\u22C6',star:'\u2606',Star:'\u22C6',starf:'\u2605',straightepsilon:'\u03F5',straightphi:'\u03D5',strns:'\xAF',sub:'\u2282',Sub:'\u22D0',subdot:'\u2ABD',sube:'\u2286',subE:'\u2AC5',subedot:'\u2AC3',submult:'\u2AC1',subne:'\u228A',subnE:'\u2ACB',subplus:'\u2ABF',subrarr:'\u2979',subset:'\u2282',Subset:'\u22D0',subseteq:'\u2286',subseteqq:'\u2AC5',SubsetEqual:'\u2286',subsetneq:'\u228A',subsetneqq:'\u2ACB',subsim:'\u2AC7',subsub:'\u2AD5',subsup:'\u2AD3',succ:'\u227B',succapprox:'\u2AB8',succcurlyeq:'\u227D',Succeeds:'\u227B',SucceedsEqual:'\u2AB0',SucceedsSlantEqual:'\u227D',SucceedsTilde:'\u227F',succeq:'\u2AB0',succnapprox:'\u2ABA',succneqq:'\u2AB6',succnsim:'\u22E9',succsim:'\u227F',SuchThat:'\u220B',sum:'\u2211',Sum:'\u2211',sung:'\u266A',sup:'\u2283',Sup:'\u22D1',sup1:'\xB9',sup2:'\xB2',sup3:'\xB3',supdot:'\u2ABE',supdsub:'\u2AD8',supe:'\u2287',supE:'\u2AC6',supedot:'\u2AC4',Superset:'\u2283',SupersetEqual:'\u2287',suphsol:'\u27C9',suphsub:'\u2AD7',suplarr:'\u297B',supmult:'\u2AC2',supne:'\u228B',supnE:'\u2ACC',supplus:'\u2AC0',supset:'\u2283',Supset:'\u22D1',supseteq:'\u2287',supseteqq:'\u2AC6',supsetneq:'\u228B',supsetneqq:'\u2ACC',supsim:'\u2AC8',supsub:'\u2AD4',supsup:'\u2AD6',swarhk:'\u2926',swarr:'\u2199',swArr:'\u21D9',swarrow:'\u2199',swnwar:'\u292A',szlig:'\xDF',Tab:'\t',target:'\u2316',tau:'\u03C4',Tau:'\u03A4',tbrk:'\u23B4',tcaron:'\u0165',Tcaron:'\u0164',tcedil:'\u0163',Tcedil:'\u0162',tcy:'\u0442',Tcy:'\u0422',tdot:'\u20DB',telrec:'\u2315',tfr:'\uD835\uDD31',Tfr:'\uD835\uDD17',there4:'\u2234',therefore:'\u2234',Therefore:'\u2234',theta:'\u03B8',Theta:'\u0398',thetasym:'\u03D1',thetav:'\u03D1',thickapprox:'\u2248',thicksim:'\u223C',ThickSpace:'\u205F\u200A',thinsp:'\u2009',ThinSpace:'\u2009',thkap:'\u2248',thksim:'\u223C',thorn:'\xFE',THORN:'\xDE',tilde:'\u02DC',Tilde:'\u223C',TildeEqual:'\u2243',TildeFullEqual:'\u2245',TildeTilde:'\u2248',times:'\xD7',timesb:'\u22A0',timesbar:'\u2A31',timesd:'\u2A30',tint:'\u222D',toea:'\u2928',top:'\u22A4',topbot:'\u2336',topcir:'\u2AF1',topf:'\uD835\uDD65',Topf:'\uD835\uDD4B',topfork:'\u2ADA',tosa:'\u2929',tprime:'\u2034',trade:'\u2122',TRADE:'\u2122',triangle:'\u25B5',triangledown:'\u25BF',triangleleft:'\u25C3',trianglelefteq:'\u22B4',triangleq:'\u225C',triangleright:'\u25B9',trianglerighteq:'\u22B5',tridot:'\u25EC',trie:'\u225C',triminus:'\u2A3A',TripleDot:'\u20DB',triplus:'\u2A39',trisb:'\u29CD',tritime:'\u2A3B',trpezium:'\u23E2',tscr:'\uD835\uDCC9',Tscr:'\uD835\uDCAF',tscy:'\u0446',TScy:'\u0426',tshcy:'\u045B',TSHcy:'\u040B',tstrok:'\u0167',Tstrok:'\u0166',twixt:'\u226C',twoheadleftarrow:'\u219E',twoheadrightarrow:'\u21A0',uacute:'\xFA',Uacute:'\xDA',uarr:'\u2191',uArr:'\u21D1',Uarr:'\u219F',Uarrocir:'\u2949',ubrcy:'\u045E',Ubrcy:'\u040E',ubreve:'\u016D',Ubreve:'\u016C',ucirc:'\xFB',Ucirc:'\xDB',ucy:'\u0443',Ucy:'\u0423',udarr:'\u21C5',udblac:'\u0171',Udblac:'\u0170',udhar:'\u296E',ufisht:'\u297E',ufr:'\uD835\uDD32',Ufr:'\uD835\uDD18',ugrave:'\xF9',Ugrave:'\xD9',uHar:'\u2963',uharl:'\u21BF',uharr:'\u21BE',uhblk:'\u2580',ulcorn:'\u231C',ulcorner:'\u231C',ulcrop:'\u230F',ultri:'\u25F8',umacr:'\u016B',Umacr:'\u016A',uml:'\xA8',UnderBar:'_',UnderBrace:'\u23DF',UnderBracket:'\u23B5',UnderParenthesis:'\u23DD',Union:'\u22C3',UnionPlus:'\u228E',uogon:'\u0173',Uogon:'\u0172',uopf:'\uD835\uDD66',Uopf:'\uD835\uDD4C',uparrow:'\u2191',Uparrow:'\u21D1',UpArrow:'\u2191',UpArrowBar:'\u2912',UpArrowDownArrow:'\u21C5',updownarrow:'\u2195',Updownarrow:'\u21D5',UpDownArrow:'\u2195',UpEquilibrium:'\u296E',upharpoonleft:'\u21BF',upharpoonright:'\u21BE',uplus:'\u228E',UpperLeftArrow:'\u2196',UpperRightArrow:'\u2197',upsi:'\u03C5',Upsi:'\u03D2',upsih:'\u03D2',upsilon:'\u03C5',Upsilon:'\u03A5',UpTee:'\u22A5',UpTeeArrow:'\u21A5',upuparrows:'\u21C8',urcorn:'\u231D',urcorner:'\u231D',urcrop:'\u230E',uring:'\u016F',Uring:'\u016E',urtri:'\u25F9',uscr:'\uD835\uDCCA',Uscr:'\uD835\uDCB0',utdot:'\u22F0',utilde:'\u0169',Utilde:'\u0168',utri:'\u25B5',utrif:'\u25B4',uuarr:'\u21C8',uuml:'\xFC',Uuml:'\xDC',uwangle:'\u29A7',vangrt:'\u299C',varepsilon:'\u03F5',varkappa:'\u03F0',varnothing:'\u2205',varphi:'\u03D5',varpi:'\u03D6',varpropto:'\u221D',varr:'\u2195',vArr:'\u21D5',varrho:'\u03F1',varsigma:'\u03C2',varsubsetneq:'\u228A\uFE00',varsubsetneqq:'\u2ACB\uFE00',varsupsetneq:'\u228B\uFE00',varsupsetneqq:'\u2ACC\uFE00',vartheta:'\u03D1',vartriangleleft:'\u22B2',vartriangleright:'\u22B3',vBar:'\u2AE8',Vbar:'\u2AEB',vBarv:'\u2AE9',vcy:'\u0432',Vcy:'\u0412',vdash:'\u22A2',vDash:'\u22A8',Vdash:'\u22A9',VDash:'\u22AB',Vdashl:'\u2AE6',vee:'\u2228',Vee:'\u22C1',veebar:'\u22BB',veeeq:'\u225A',vellip:'\u22EE',verbar:'|',Verbar:'\u2016',vert:'|',Vert:'\u2016',VerticalBar:'\u2223',VerticalLine:'|',VerticalSeparator:'\u2758',VerticalTilde:'\u2240',VeryThinSpace:'\u200A',vfr:'\uD835\uDD33',Vfr:'\uD835\uDD19',vltri:'\u22B2',vnsub:'\u2282\u20D2',vnsup:'\u2283\u20D2',vopf:'\uD835\uDD67',Vopf:'\uD835\uDD4D',vprop:'\u221D',vrtri:'\u22B3',vscr:'\uD835\uDCCB',Vscr:'\uD835\uDCB1',vsubne:'\u228A\uFE00',vsubnE:'\u2ACB\uFE00',vsupne:'\u228B\uFE00',vsupnE:'\u2ACC\uFE00',Vvdash:'\u22AA',vzigzag:'\u299A',wcirc:'\u0175',Wcirc:'\u0174',wedbar:'\u2A5F',wedge:'\u2227',Wedge:'\u22C0',wedgeq:'\u2259',weierp:'\u2118',wfr:'\uD835\uDD34',Wfr:'\uD835\uDD1A',wopf:'\uD835\uDD68',Wopf:'\uD835\uDD4E',wp:'\u2118',wr:'\u2240',wreath:'\u2240',wscr:'\uD835\uDCCC',Wscr:'\uD835\uDCB2',xcap:'\u22C2',xcirc:'\u25EF',xcup:'\u22C3',xdtri:'\u25BD',xfr:'\uD835\uDD35',Xfr:'\uD835\uDD1B',xharr:'\u27F7',xhArr:'\u27FA',xi:'\u03BE',Xi:'\u039E',xlarr:'\u27F5',xlArr:'\u27F8',xmap:'\u27FC',xnis:'\u22FB',xodot:'\u2A00',xopf:'\uD835\uDD69',Xopf:'\uD835\uDD4F',xoplus:'\u2A01',xotime:'\u2A02',xrarr:'\u27F6',xrArr:'\u27F9',xscr:'\uD835\uDCCD',Xscr:'\uD835\uDCB3',xsqcup:'\u2A06',xuplus:'\u2A04',xutri:'\u25B3',xvee:'\u22C1',xwedge:'\u22C0',yacute:'\xFD',Yacute:'\xDD',yacy:'\u044F',YAcy:'\u042F',ycirc:'\u0177',Ycirc:'\u0176',ycy:'\u044B',Ycy:'\u042B',yen:'\xA5',yfr:'\uD835\uDD36',Yfr:'\uD835\uDD1C',yicy:'\u0457',YIcy:'\u0407',yopf:'\uD835\uDD6A',Yopf:'\uD835\uDD50',yscr:'\uD835\uDCCE',Yscr:'\uD835\uDCB4',yucy:'\u044E',YUcy:'\u042E',yuml:'\xFF',Yuml:'\u0178',zacute:'\u017A',Zacute:'\u0179',zcaron:'\u017E',Zcaron:'\u017D',zcy:'\u0437',Zcy:'\u0417',zdot:'\u017C',Zdot:'\u017B',zeetrf:'\u2128',ZeroWidthSpace:'\u200B',zeta:'\u03B6',Zeta:'\u0396',zfr:'\uD835\uDD37',Zfr:'\u2128',zhcy:'\u0436',ZHcy:'\u0416',zigrarr:'\u21DD',zopf:'\uD835\uDD6B',Zopf:'\u2124',zscr:'\uD835\uDCCF',Zscr:'\uD835\uDCB5',zwj:'\u200D',zwnj:'\u200C'}
// tslint:disable-next-line:max-line-length
const decodeMapNumeric: LooseObject<string> = {0:'\uFFFD',128:'\u20AC',130:'\u201A',131:'\u0192',132:'\u201E',133:'\u2026',134:'\u2020',135:'\u2021',136:'\u02C6',137:'\u2030',138:'\u0160',139:'\u2039',140:'\u0152',142:'\u017D',145:'\u2018',146:'\u2019',147:'\u201C',148:'\u201D',149:'\u2022',150:'\u2013',151:'\u2014',152:'\u02DC',153:'\u2122',154:'\u0161',155:'\u203A',156:'\u0153',158:'\u017E',159:'\u0178'}
// tslint:disable-next-line:max-line-length
const decodeMapLegacy: LooseObject<string> = {aacute:'\xE1',Aacute:'\xC1',acirc:'\xE2',Acirc:'\xC2',acute:'\xB4',aelig:'\xE6',AElig:'\xC6',agrave:'\xE0',Agrave:'\xC0',amp:'&',AMP:'&',aring:'\xE5',Aring:'\xC5',atilde:'\xE3',Atilde:'\xC3',auml:'\xE4',Auml:'\xC4',brvbar:'\xA6',ccedil:'\xE7',Ccedil:'\xC7',cedil:'\xB8',cent:'\xA2',copy:'\xA9',COPY:'\xA9',curren:'\xA4',deg:'\xB0',divide:'\xF7',eacute:'\xE9',Eacute:'\xC9',ecirc:'\xEA',Ecirc:'\xCA',egrave:'\xE8',Egrave:'\xC8',eth:'\xF0',ETH:'\xD0',euml:'\xEB',Euml:'\xCB',frac12:'\xBD',frac14:'\xBC',frac34:'\xBE',gt:'>',GT:'>',iacute:'\xED',Iacute:'\xCD',icirc:'\xEE',Icirc:'\xCE',iexcl:'\xA1',igrave:'\xEC',Igrave:'\xCC',iquest:'\xBF',iuml:'\xEF',Iuml:'\xCF',laquo:'\xAB',lt:'<',LT:'<',macr:'\xAF',micro:'\xB5',middot:'\xB7',nbsp:'\xA0',not:'\xAC',ntilde:'\xF1',Ntilde:'\xD1',oacute:'\xF3',Oacute:'\xD3',ocirc:'\xF4',Ocirc:'\xD4',ograve:'\xF2',Ograve:'\xD2',ordf:'\xAA',ordm:'\xBA',oslash:'\xF8',Oslash:'\xD8',otilde:'\xF5',Otilde:'\xD5',ouml:'\xF6',Ouml:'\xD6',para:'\xB6',plusmn:'\xB1',pound:'\xA3',quot:'"',QUOT:'"',raquo:'\xBB',reg:'\xAE',REG:'\xAE',sect:'\xA7',shy:'\xAD',sup1:'\xB9',sup2:'\xB2',sup3:'\xB3',szlig:'\xDF',thorn:'\xFE',THORN:'\xDE',times:'\xD7',uacute:'\xFA',Uacute:'\xDA',ucirc:'\xFB',Ucirc:'\xDB',ugrave:'\xF9',Ugrave:'\xD9',uml:'\xA8',uuml:'\xFC',Uuml:'\xDC',yacute:'\xFD',Yacute:'\xDD',yen:'\xA5',yuml:'\xFF'}
const codePointToSymbol = (codePoint: number, strict: boolean): string => {
    let output = ''
    if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
        // See issue #4:
        // “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
        // greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
        // REPLACEMENT CHARACTER.”
        if (strict) {
            throw new Error(('character reference outside the permissible Unicode range'))
        }
        return '\uFFFD'
    }

    if (decodeMapNumeric.hasOwnProperty(codePoint)) {
        if (strict) {
            throw new Error(('disallowed character reference'))
        }
        return decodeMapNumeric[codePoint]
    }
    if (strict && invalidReferenceCodePoints.includes(codePoint)) {
        throw new Error(('disallowed character reference'))
    }
    if (codePoint > 0xFFFF) {
        codePoint -= 0x10000
        output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800)
        codePoint = 0xDC00 | codePoint & 0x3FF
    }
    output += String.fromCharCode(codePoint)
    return output
}

export type entityDecodeOptions = {
    isAttributeValue: boolean,
    strict: boolean
}

/**
 * HTML entity decoder, recompiled and altered from various sources to function within Stratus environment
 * @source https://github.com/mathiasbynens/he
 * @source https://github.com/adnaan1703/lean-he
 * @source https://github.com/node-projects/lean-he
 */
export function entityDecode (html: string, options?: entityDecodeOptions): string {
    options = extend(
        options, {
        isAttributeValue: false,
        strict: false
    })
    const strict = options.strict
    if (strict && regexInvalidEntity.test(html)) {
        throw new Error(('malformed character reference'))
    }
    return html.replace(regexDecode, ($0, $1, $2, $3, $4, $5, $6, $7) => {
        let codePoint
        let semicolon
        let decDigits
        let hexDigits
        let reference
        let next
        if ($1) {
            // Decode decimal escapes, e.g. `&#119558;`.
            decDigits = $1
            semicolon = $2
            if (strict && !semicolon) {
                throw new Error(('character reference was not terminated by a semicolon'))
            }
            codePoint = parseInt(decDigits, 10)
            return codePointToSymbol(codePoint, strict)
        }
        if ($3) {
            // Decode hexadecimal escapes, e.g. `&#x1D306;`.
            hexDigits = $3
            semicolon = $4
            if (strict && !semicolon) {
                throw new Error(('character reference was not terminated by a semicolon'))
            }
            codePoint = parseInt(hexDigits, 16)
            return codePointToSymbol(codePoint, strict)
        }
        if ($5) {
            // Decode named character references with trailing `;`, e.g. `&copy;`.
            reference = $5
            if (decodeMap.hasOwnProperty(reference)) {
                return decodeMap[reference]
            } else {
                // Ambiguous ampersand. https://mths.be/notes/ambiguous-ampersands
                if (strict) {
                    throw new Error(('named character reference was not terminated by a semicolon'))
                }
                return $0
            }
        }
        // If we’re still here, it’s a legacy reference for sure. No need for an
        // extra `if` check.
        // Decode named character references without trailing `;`, e.g. `&amp`
        // This is only a parse error if it gets converted to `&`, or if it is
        // followed by `=` in an attribute context.
        reference = $6
        next = $7
        if (next && options.isAttributeValue) {
            if (strict && next === '=') {
                throw new Error(('`&` did not start a character reference'))
            }
            return $0
        } else {
            if (strict) {
                throw new Error(('named character reference was not terminated by a semicolon'))
            }
            // Note: there is no need to check `has(decodeMapLegacy, reference)`.
            return decodeMapLegacy[reference] + (next || '')
        }
    })
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
