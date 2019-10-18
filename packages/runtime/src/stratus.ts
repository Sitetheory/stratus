// Require.js
// ----------

// Runtime
import _ from 'lodash'
import jQuery from 'jquery'
import bowser from 'bowser-legacy'

// Stratus Core
import {cookie} from '@stratusjs/core/environment'
import {
    allTrue,
    converge,
    dehydrate,
    extendDeep,
    functionName,
    getAnchorParams,
    getUrlParams,
    hydrate,
    hydrateString,
    isAngular,
    isjQuery,
    isJSON,
    lcfirst,
    patch,
    poll,
    repeat,
    setUrlParams,
    strcmp,
    truncate,
    ucfirst
} from '@stratusjs/core/misc'
import {
    camelToKebab,
    camelToSnake,
    kebabToCamel,
    seconds,
    snakeToCamel
} from '@stratusjs/core/conversion'

// Specific Types
import {ModelBase} from '@stratusjs/core/datastore/modelBase'
import {XHR, XHRRequest} from '@stratusjs/core/datastore/xhr'
import {ErrorBase} from '@stratusjs/core/errors/errorBase'
import {Aether} from '@stratusjs/core/events/aether'
import {Job, Chronos} from '@stratusjs/core/events/chronos'
import {EventBase} from '@stratusjs/core/events/eventBase'
import {EventManager} from '@stratusjs/core/events/eventManager'

declare var boot: any
declare var hamlet: any
declare var require: any
declare var angular: any

// Stratus Layer Prototype
// -----------------------

// This prototype is the only Global Object that will ever be used within the
// Stratus layer.  Each individual instantiated reference from a constructor
// gets stored in the Instances property, and every Data Set is maintained in
// the Catalog, for efficient access and debugging purposes.  Further down this
// initialization routine, this Global Object gets mixed with a function that
// allows for Native DOM Selectors with added functionality to ensure the core
// Stratus files never require external DOM Libraries, such as jQuery.
interface StratusRuntime {
    Controllers: {} | any
    BundlePath: string
    Modules: {
        ngMaterial?: boolean
        ngMessages?: boolean
        ngSanitize?: boolean
        [key: string]: boolean
    }
    History: {} | any
    Apps: {} | any
    RegisterGroup: {} | any
    Components: {} | any
    Filters: {} | any
    LocalStorage: {} | any
    Roster: {
        controller: {
            namespace: string
            selector: string
        }
        components: {
            namespace: string
        }
        uiTree: {
            module: string
            selector: string
            require: string[]
        }
        directives: {
            namespace: string
            type: string
        }
        flex: {
            selector: string
            require: string[]
        }
        chart: {
            module: boolean
            selector: string
            require: string[]
            suffix: string
        }
        countUp: {
            module: boolean
            namespace: string
            selector: string[]
            suffix: string
        }
        modules: {
            module: boolean
            namespace: string
            selector: string[]
        }
    }
    Events: {} | any
    Directives: {} | any
    Prototypes: {} | any
    DeploymentPath: string
    BaseUrl?: string
    Client: bowser.IBowser | any
    Internals: {} | any
    Settings: {
        image: {
            size: {
                s: number
                xl: number
                hq: number
                xs: number
                l: number
                m: number
            }
        }
        consent: {
            reject: number
            pending: number
            accept: number
        }
        status: {
            deleted: number
            inactive: number
            reset: number
            active: number
        }
    }
    PostMessage: {} | any
    Selector: {} | any
    Compendium: {} | any
    CSS: {} | any
    DOM: {} | any
    Aether: Aether
    Chronos: Chronos
    Collections: ModelBase
    Models: ModelBase
    Routers: ModelBase
    Loaders: {} | any
    Data: {} | any
    Catalog: {} | any
    Instances: {} | any
    Services: {} | any
    Select?: (selector: (string | any), context?: (Document | any)) => (
        ({} & { selection: any; context: any; length: number; selector: any }) | any
        )
    Environment: ModelBase
    Resources: {} | any
    Api: {
        GoogleMaps: string
        Froala: string
    }
    Key: {} | any
}

export const Stratus: StratusRuntime = {
    /* Settings */
    Settings: {
        image: {
            size: {xs: 200, s: 400, m: 600, l: 800, xl: 1200, hq: 1600}
        },
        status: {
            reset: -2,
            deleted: -1,
            inactive: 0,
            active: 1
        },
        consent: {
            reject: -1,
            pending: 0,
            accept: 1
        }
    },

    /* Native */
    DOM: {},
    Key: {},
    PostMessage: {},
    LocalStorage: {},

    /* Selector Logic */
    Selector: {},

    // NOTE: This is a replacement for basic jQuery selectors. This function intends to allow native jQuery-Type chaining and plugins.
    Select: null,

    /* Boot */
    BaseUrl: (boot && _.has(boot, 'configuration') ? boot.configuration.baseUrl : null) || '/',
    BundlePath: (boot && _.has(boot, 'configuration') ? boot.configuration.bundlePath : '') || '',
    DeploymentPath: (boot && _.has(boot, 'configuration') ? boot.configuration.deploymentPath : '') || '',

    /* This is used internally for triggering events */
    Events: new EventManager(),

    /* Angular */
    Apps: {},
    Catalog: {},
    Compendium: {},
    Components: {},
    Controllers: {},
    Directives: {},
    Filters: {},
    Modules: {
        ngMaterial: true,
        ngMessages: true
        /* ngMdIcons: true */
    },
    Services: {},

    /* Bowser */
    Client: bowser,

    /* Stratus */
    CSS: {},
    Aether: new Aether(),
    Chronos: new Chronos(),
    Data: {},
    Collections: new ModelBase(),
    Models: new ModelBase(),
    Routers: new ModelBase(),
    Environment: new ModelBase({
        ip: null,
        production: !(typeof document.cookie === 'string' &&
            document.cookie.indexOf('env=') !== -1),
        context: null,
        contextId: null,
        contextMasterSiteId: null,
        siteId: null,
        masterSiteId: null,
        language: navigator.language,
        timezone: null,
        trackLocation: 0,
        trackLocationConsent: 0,
        lat: null,
        lng: null,
        postalCode: null,
        city: null,
        region: null,
        country: null,
        debugNest: false,
        liveEdit: false,
        viewPortChange: false,
        viewPort: null,
        lastScroll: false
    }),
    History: {},
    Instances: {},
    Internals: {
        XHR: (request?: XHRRequest) => (new XHR(request)).send()
    },
    Loaders: {},
    Prototypes: {
        Event: EventBase,
        EventManager,
        Error: ErrorBase,
        Job,
        Model: ModelBase,
    },
    Resources: {},
    Roster: {

        // dynamic
        controller: {
            selector: '[ng-controller]',
            namespace: 'stratus.controllers.'
        },
        components: {
            namespace: 'stratus.components.'
        },
        directives: {
            namespace: 'stratus.directives.',
            type: 'attribute'
        },

        // angular material
        flex: {
            selector: '[flex]',
            require: ['angular', 'angular-material']
        },

        // TODO: Find a more scalable ideology
        // third party
        chart: {
            selector: '[chart]',
            require: ['angular', 'angular-chart'],
            module: true,
            suffix: '.js'
        },

        // TODO: Move Froala to Sitetheory since it is specific to Sitetheory
        modules: {
            selector: [
                '[ng-sanitize]', '[froala]'
            ],
            namespace: 'angular-',
            module: true
        },

        // TODO: Move these to Sitetheory since they are specific to Sitetheory
        countUp: {
            selector: [
                '[count-up]', '[scroll-spy]'
            ],
            namespace: 'angular-',
            module: true,
            suffix: 'Module'
        },
        uiTree: {
            selector: '[ui-tree]',
            require: ['angular-ui-tree'],
            module: 'ui.tree'
        }
    },

    /* Methods that need to be called as a group later, e.g. OnScroll */
    // TODO: RegisterGroup needs to be removed
    RegisterGroup: {},

    // TODO: Turn this into a Dynamic Object loaded from the DOM in Sitetheory
    Api: {
        GoogleMaps: 'AIzaSyBatGvzPR7u7NZ3tsCy93xj4gEBfytffyA',
        Froala: 'KybxhzguB-7j1jC3A-16y=='
    }
}

// Declare Warm Up
if (!Stratus.Environment.get('production')) {
    console.group('Stratus Warm Up')
}

// Underscore Settings
// -------------------

// These template settings intend to mimic a Twig-like bracket format for
// internal Javascript templates.  The '{% %}' tag Evaluates anything inside as
// if it were native Javascript code.  The '{{ }}' tag Interpolates any
// variables inside for use with String Interpolation.  The '{# #}' tag
// Interpolates any variables and HTML Escapes the output for use with HTML
// Escaped String Interpolation.
// _.templateSettings = {
//     evaluate: /\{%(.+?)%\}/g,
//     interpolate: /\{\{(.+?)\}\}/g,
//     escape: /\{#(.+?)#\}/g
// }

// Underscore Mixins
// ------------------

_.mixin({

    // Underscore Compatibility References: https://github.com/lodash/lodash/wiki/Migrating
    // TODO: Remove once phased out completely
    any: _.some,
    all: _.every,
    compose: _.flowRight,
    contains: _.includes,
    findWhere: _.find,
    indexBy: _.keyBy,
    mapObject: _.mapValues,
    object: _.zipObject,
    omit: _.omitBy,
    pairs: _.toPairs,
    pluck: _.map,
    where: _.filter,

    // This function simply extracts the name of a function from code directly
    functionName,

    // This function simply capitalizes the first letter of a string.
    ucfirst,

    // This function simply changes the first letter of a string to a lower case.
    lcfirst,

    // This function allows creation, edit, retrieval and deletion of cookies.
    // Note: Delete with `_.cookie(name, '', -1)`
    cookie,

    // Converge a list and return the prime key through specified method.
    converge,

    // This synchronously repeats a function a certain number of times
    // FIXME: This overwrites the core one
    repeat,

    // This function dehydrates an Object, Boolean, or Null value, to a string.
    dehydrate,

    // This function hydrates a string into an Object, Boolean, or Null value, if
    // applicable.
    hydrate,

    // This is an alias to the hydrate function for backwards compatibility.
    hydrateString,

    // This function utilizes tree building to clone an object.
    extendDeep,

    // Get more params which is shown after anchor '#' anchor in the url.
    getAnchorParams,

    // Get a specific value or all values located in the URL
    getUrlParams,

    // This function digests URLs into an object containing their respective
    // values, which will be merged with requested parameters and formulated
    // into a new URL.
    setUrlParams,

    // Ensure all values in an array or object are true
    allTrue,

    // Determines whether or not the string supplied is in a valid JSON format
    isJSON,

    // Determines whether or not the element was selected from Angular
    isAngular,

    // Determines whether or not the element was selected from Angular
    isjQuery,

    seconds,

    // Legacy Case Switchers
    camelToKebab: _.kebabCase,
    kebabToCamel: _.camelCase,
    camelToSnake: _.snakeCase,
    snakeToCamel: _.camelCase,

    patch,
    poll,
    strcmp,

    // FIXME: This overwrites the core one
    truncate
})

// Client Information
// const browser: any = Bowser.getParser(window.navigator.userAgent)
// if (!Stratus.Environment.get('production')) {
//     console.log('Browser Information:', browser)
// }

// Native Selector
// ---------------

Stratus.Select = (selector: string | any, context?: Document | any) => {
    if (!context) {
        context = document
    }
    let selection: any = selector
    if (typeof selector === 'string') {
        let target
        if (_.startsWith(selector, '.') || _.includes(selector, '[')) {
            target = 'querySelectorAll'
        } else if (_.includes(['html', 'head', 'body'], selector) || _.startsWith(selector, '#')) {
            target = 'querySelector'
        } else {
            target = 'querySelectorAll'
        }
        selection = context[target](selector)
    }
    if (selection && typeof selection === 'object') {
        if (isAngular(selection) || isjQuery(selection)) {
            selection = selection.length ? _.first(selection) : {}
        }
        return _.extend({}, Stratus.Selector, {
            context: this,
            length: _.size(selection),
            selection,
            selector
        })
    }
    return selection
}

// TODO: Remove the following hack
/* eslint no-global-assign: "off" */
// Stratus = _.extend((selector: any, context: any) => {
//     // The function is a basic shortcut to the Stratus.Select
//     // function for native jQuery-like chaining and plugins.
//     return Stratus.Select(selector, context)
// }, Stratus)

// Selector Plugins
// ----------------

Stratus.Selector.attr = function attr(attribute: any, value: any) {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find "' + attribute + '" for list:', that.selection)
        return null
    }
    if (!attribute) {
        return this
    }
    if (typeof value === 'undefined') {
        value = that.selection.getAttribute(attribute)
        return hydrate(value)
    } else {
        that.selection.setAttribute(attribute, dehydrate(value))
    }
    return that
}

Stratus.Selector.addEventListener = function addEventListener(type: any, listener: any, options?: any) {
    const that: any = this
    if (!that.selection) {
        console.warn('Unable to add EventListener on empty selection.')
        return that
    }
    const listen: any = (node: Element) => node.addEventListener(type, listener, options)
    if (that.selection instanceof NodeList) {
        _.forEach(that.selection, listen)
        return that
    }
    if (that.selection instanceof EventTarget) {
        listen(that.selection)
        return that
    }
    console.warn('Unabled to add EventListener on:', that.selection)
    return that
}

Stratus.Selector.each = function each(callable: any) {
    const that: any = this
    if (typeof callable !== 'function') {
        callable = (element: any) => {
            console.warn('each running on element:', element)
        }
    }
    if (that.selection instanceof NodeList) {
        _.forEach(that.selection, callable)
    }
    return that
}

Stratus.Selector.find = function find(selector: any) {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find "' + selector + '" for list:', that.selection)
    } else if (selector) {
        return Stratus.Select(selector, that.selection)
    }
    return null
}

Stratus.Selector.map = function map(callable: any) {
    const that: any = this
    if (typeof callable !== 'function') {
        callable = (element: any) => {
            console.warn('map running on element:', element)
        }
    }
    if (that.selection instanceof NodeList) {
        return _.map(that.selection, callable)
    }
    return that
}

// TODO: Merge with prepend
Stratus.Selector.append = function append(child: any) {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to append child:', child, 'to list:', that.selection)
    } else if (child) {
        that.selection.insertBefore(child, that.selection.lastChild)
    }
    return that
}

// TODO: Merge with append
Stratus.Selector.prepend = function(child: any) {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to prepend child:', child, 'to list:', that.selection)
    } else if (child) {
        that.selection.insertBefore(child, that.selection.firstChild)
    }
    return that
}

// Design Plugins
Stratus.Selector.addClass = function addClass(className: any) {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to add class "' + className + '" to list:', that.selection)
    } else {
        _.forEach(className.split(' '), (name: any) => {
            if (that.selection.classList) {
                that.selection.classList.add(name)
            } else {
                that.selection.className += ' ' + name
            }
        })
    }
    return that
}

Stratus.Selector.removeClass = function removeClass(className: string) {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to remove class "' + className + '" from list:', that.selection)
    } else if (that.selection.classList) {
        _.forEach(className.split(' '), name => {
            that.selection.classList.remove(name)
        })
    } else {
        that.selection.className = that.selection.className.replace(
            new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
                'gi'), ' ')
    }
    return that
}

Stratus.Selector.style = function style() {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find style for list:', that.selection)
    } else if (that.selection instanceof Node) {
        return window.getComputedStyle(that.selection)
    }
    return null
}

// Positioning Plugins
Stratus.Selector.height = function height() {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find height for list:', that.selection)
        return null
    }
    return that.selection.offsetHeight || 0
}

Stratus.Selector.width = function width() {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find width for list:', that.selection)
        return null
    }
    // if (!Stratus.Environment.get('production')) {
    //     console.log('width:', that.selection.scrollWidth, that.selection.clientWidth, that.selection.offsetWidth)
    // }
    return that.selection.offsetWidth || 0
}

Stratus.Selector.offset = function offset() {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find offset for list:', that.selection)
    } else if (that.selection.getBoundingClientRect) {
        const rect: any = that.selection.getBoundingClientRect()
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        }
    }
    return {
        top: null,
        left: null
    }
}

Stratus.Selector.parent = function parent() {
    const that: any = this
    if (that.selection instanceof NodeList) {
        console.warn('Unable to find offset for list:', that.selection)
        return null
    }
    return Stratus.Select(that.selection.parentNode)
}

// Sentinel Prototype
// ------------------

// This class intends to handle typical Sentinel operations.
// TODO: Reevaluate this.
Stratus.Prototypes.Sentinel = class Sentinel {
    public view: boolean
    public create: boolean
    public edit: boolean
    public delete: boolean
    public publish: boolean
    public design: boolean
    public dev: boolean
    public master: boolean

    constructor() {
        this.view = false
        this.create = false
        this.edit = false
        this.delete = false
        this.publish = false
        this.design = false
        this.dev = false
        this.master = false

        // Scope Binding
        this.zero = this.zero.bind(this)
        this.permissions = this.permissions.bind(this)
        this.summary = this.summary.bind(this)
    }

    zero() {
        _.extend(this, {
            view: false,
            create: false,
            edit: false,
            delete: false,
            publish: false,
            design: false,
            dev: false,
            master: false
        })
    }

    permissions(value: any) {
        if (!isNaN(value)) {
            _.forEach(value.toString(2).split('').reverse(), (bit: any, key: any) => {
                if (bit === '1') {
                    switch (key) {
                        case 0:
                            this.view = true
                            break
                        case 1:
                            this.create = true
                            break
                        case 2:
                            this.edit = true
                            break
                        case 3:
                            this.delete = true
                            break
                        case 4:
                            this.publish = true
                            break
                        case 5:
                            this.design = true
                            break
                        case 6:
                            this.dev = true
                            break
                        case 7:
                            this.view = true
                            this.create = true
                            this.edit = true
                            this.delete = true
                            this.publish = true
                            this.design = true
                            this.dev = true
                            this.master = true
                            break
                    }
                }
            })
        } else {
            let decimal: any = 0
            decimal += (this.view) ? (1 << 0) : (0 << 0)
            decimal += (this.create) ? (1 << 1) : (0 << 1)
            decimal += (this.edit) ? (1 << 2) : (0 << 2)
            decimal += (this.delete) ? (1 << 3) : (0 << 3)
            decimal += (this.publish) ? (1 << 4) : (0 << 4)
            decimal += (this.design) ? (1 << 5) : (0 << 5)
            decimal += (this.dev) ? (1 << 6) : (0 << 6)
            decimal += (this.master) ? (1 << 7) : (0 << 7)
            return decimal
        }
    }

    summary() {
        const output: any = []
        _.forEach(this, (value: any, key: any) => {
            if (typeof value === 'boolean' && value) {
                output.push(ucfirst(key))
            }
        })
        return output
    }
}

// TODO: rethink whether this should be in the core
// This is the prototype for the toaster, in which one could be supplied
// for a toast message, or one will automatically be created at runtime
// using current arguments.
Stratus.Prototypes.Toast = class Toast {
    public message: string
    public title: string
    public priority: string
    public settings: any

    constructor(message?: any, title?: any, priority?: any, settings?: any) {
        if (message && typeof message === 'object') {
            _.extend(this, message)
            this.message = this.message || 'Message'
        } else {
            this.message = message || 'Message'
        }
        this.title = this.title || title || 'Toast'
        this.priority = this.priority || priority || 'danger'
        this.settings = this.settings || settings
        if (!this.settings || typeof this.settings !== 'object') {
            this.settings = {}
        }
        this.settings.timeout = this.settings.timeout || 10000
    }
}

// TODO: Compare this method with above
// const XHR: any = (method, url, data) => new Promise((resolve, reject) => {
//   const request: any = new XMLHttpRequest()
//   request.onload = (event) => {
//     (request.status >= 200 && request.status < 400) ? resolve(request.response) : reject(request)
//   }
//   request.onerror = (event) => {
//     reject(request)
//   }
//   request.open(method, url, true)
//   request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
//   request.send(data)
// })

// Internal Anchor Capture
// -----------------------

// This function allows anchor capture for smooth scrolling before propagation.
// TODO: backbone was removed, so this needs to be rebuilt using native models
// Stratus.Internals.Anchor = (function Anchor() {
//     Anchor.initialize = true
//     return (typeof Backbone !== 'object') ? Anchor : Backbone.View.extend({
//       el: 'a[href*=\\#]:not([href=\\#]):not([data-scroll="false"])',
//       events: {
//         click: 'clickAction'
//       },
//       clickAction: function (event) {
//         if (window.location.pathname.replace(/^\//, '') ===
//           event.currentTarget.pathname.replace(/^\//, '') &&
//           window.location.hostname === event.currentTarget.hostname) {
//           let reserved = ['new', 'filter', 'page', 'version']
//           let valid = _.every(reserved, function (keyword) {
//             return !_.startsWith(event.currentTarget.hash, '#' + keyword)
//           }, this)
//           if (valid) {
//             if (typeof jQuery === 'function' && jQuery.fn && typeof Backbone === 'object') {
//               let $target = jQuery(event.currentTarget.hash)
//               let anchor = event.currentTarget.hash.slice(1)
//               $target = ($target.length) ? $target : jQuery('[name=' + anchor + ']')
//               // TODO: Ensure that this animation only stops propagation of click events
//               // TODO: on anchors that are confirmed to exist on the page
//               if ($target.length) {
//                 jQuery('html,body').animate({
//                   scrollTop: $target.offset().top
//                 }, 1000, function () {
//                   Backbone.history.navigate(anchor)
//                 })
//                 return false
//               }
//             }
//           }
//         }
//       }
//     })
// })()

// Internal Convoy Builder
// -----------------------

// This function is simply a convoy builder for a SOAP-like API call.
Stratus.Internals.Api = (route: any, meta: any, payload: any) => {
    if (route === undefined) {
        route = 'Default'
    }
    if (meta === undefined || meta === null) {
        meta = {}
    }
    if (payload === undefined) {
        payload = {}
    }

    if (typeof meta !== 'object') {
        meta = {method: meta}
    }
    if (!_.has(meta, 'method')) {
        meta.method = 'GET'
    }

    return Stratus.Internals.Convoy({
        route: {
            controller: route
        },
        meta,
        payload
    })
}

// Internal Browser Compatibility
// ------------------------------

// This function gathers information about the Client's Browser
// and respectively adds informational classes to the DOM's Body.
Stratus.Internals.Compatibility = () => {
    const profile: any = []

    // Operating System
    if (Stratus.Client.android) {
        profile.push('android')
    } else if (Stratus.Client.ios) {
        profile.push('ios')
    } else if (Stratus.Client.mac) {
        profile.push('mac')
    } else if (Stratus.Client.windows) {
        profile.push('windows')
    } else if (Stratus.Client.linux) {
        profile.push('linux')
    } else {
        profile.push('os')
    }

    // Browser Type
    if (Stratus.Client.chrome) {
        profile.push('chrome')
    } else if (Stratus.Client.firefox) {
        profile.push('firefox')
    } else if (Stratus.Client.safari) {
        profile.push('safari')
    } else if (Stratus.Client.opera) {
        profile.push('opera')
    } else if (Stratus.Client.msie) {
        profile.push('msie')
    } else if (Stratus.Client.iphone) {
        profile.push('iphone')
    } else {
        profile.push('browser')
    }

    // Browser Major Version
    if (Stratus.Client.version) {
        profile.push('version' + Stratus.Client.version.split('.')[0])
    }

    // Platform
    if (Stratus.Client.mobile) {
        profile.push('mobile')
    } else if (Stratus.Client.tablet) {
        profile.push('tablet')
    } else {
        profile.push('desktop')
    }

    /* Stratus.Events.trigger('alert', profile + JSON.stringify(Stratus.Client)); */
    Stratus.Select('body').addClass(profile.join(' '))
}

// Internal Convoy Dispatcher
// --------------------------

// This function allows Stratus to make SOAP-like API calls for
// very specific, decoupled, data sets.
Stratus.Internals.Convoy = (convoy: any, query: any) => new Promise((resolve: any, reject: any) => {
    if (convoy === undefined) {
        reject(new Stratus.Prototypes.Error({
            code: 'Convoy',
            message: 'No Convoy defined for dispatch.'
        }, this))
    }
    if (typeof jQuery !== 'undefined' && jQuery.ajax) {
        jQuery.ajax({
            type: 'POST',
            url: '/Api' + encodeURIComponent(query || ''),
            data: {
                convoy: JSON.stringify(convoy)
            },
            dataType: (_.has(convoy, 'meta') && _.has(convoy.meta, 'dataType'))
                      ? convoy.meta.dataType
                      : 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success(response: any) {
                resolve(response)
                return response
            },
            error(response: any) {
                reject(
                    new Stratus.Prototypes.Error({code: 'Convoy', message: response},
                        this))
                return response
            }
        })
    } else {
        Stratus.Internals.XHR({
            method: 'POST',
            url: '/Api' + encodeURIComponent(query || ''),
            data: {
                convoy: JSON.stringify(convoy)
            },
            type: (_.has(convoy, 'meta') && _.has(convoy.meta, 'dataType'))
                  ? convoy.meta.dataType
                  : 'application/json',
            success(response: any) {
                response = response.payload || response
                resolve(response)
                return response
            },
            error(response: any) {
                reject(new Stratus.Prototypes.Error({
                    code: 'Convoy',
                    message: response
                }, this))
                return response
            }
        })
    }
})

Stratus.Internals.CssLoader = (url: any) => {
    return new Promise((resolve: any, reject: any) => {
        /* Digest Extension */
        /*
         FIXME: Less files won't load correctly due to less.js not being able to parse new stylesheets after runtime
         let extension: any = /\.([0-9a-z]+)$/i;
         extension = extension.exec(url);
         */

        /* Handle Identical Calls */
        if (url in Stratus.CSS) {
            if (Stratus.CSS[url]) {
                resolve()
            } else {
                Stratus.Events.once('onload:' + url, resolve)
            }
            return
        }

        /* Set CSS State */
        Stratus.CSS[url] = false

        /* Create Link */
        const link: any = document.createElement('link')
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = url

        /* Track Resolution */
        Stratus.Events.once('onload:' + url, () => {
            Stratus.CSS[url] = true
            resolve()
        })

        /* Capture OnLoad or Fallback */
        if ('onload' in link && !Stratus.Client.android) {
            link.onload = () => {
                Stratus.Events.trigger('onload:' + url)
            }
        } else {
            Stratus.CSS[url] = true
            Stratus.Events.trigger('onload:' + url)
        }

        /* Inject Link into Head */

        // TODO: Add the ability to prepend or append by a flagged option
        // Stratus.Select('head').prepend(link);
        Stratus.Select('head').append(link)
    })
}

/**
 * TODO: Move this to an underscore mixin
 */
// FIXME: This would be better suited as a selector inside of Stratus.
Stratus.Internals.GetColWidth = (el: any) => {
    if (typeof el === 'undefined' || !el) {
        return false
    }
    const classes: any = el.attr('class')
    if (typeof classes === 'undefined' || !classes) {
        return false
    }
    const regexp: any = /col-.{2}-([0-9]*)/g
    const match: any = regexp.exec(classes)
    if (typeof match === 'undefined' || !match) {
        return false
    }
    return typeof match[1] !== 'undefined' ? match[1] : false
}

// GetScrollDir()
// --------------
// Checks whether there has been any scroll yet, and returns down, up, or false
// FIXME: This would be better suited as non-jQuery, native logic in the selectors
Stratus.Internals.GetScrollDir = () => {
    const windowTop: any = jQuery(Stratus.Environment.get('viewPort') || window).scrollTop()
    const lastWindowTop: any = Stratus.Environment.get('windowTop')
    /* *
     let windowHeight: any = jQuery(Stratus.Environment.get('viewPort') || window).height()
     let documentHeight: any = jQuery(document).height()
     /* */

    // return NULL if there is no scroll, otherwise up or down
    const down: any = lastWindowTop ? (windowTop > lastWindowTop) : false
    /* *
     let up: any = lastWindowTop ? (windowTop < lastWindowTop && (windowTop + windowHeight) < documentHeight) : false
     /* */
    const up: any = lastWindowTop ? (windowTop < lastWindowTop) : false
    return down ? 'down' : (up ? 'up' : false)
}

// IsOnScreen()
// ---------------
// Check whether an element is on screen, returns true or false.
// FIXME: This would be better suited as a selector inside of Stratus.
Stratus.Internals.IsOnScreen = (el: any, offset: any, partial: any) => {
    if (!el) {
        return false
    }
    if (!(el instanceof jQuery)) {
        el = jQuery(el)
    }
    if (!el.length) {
        return false
    }
    offset = offset || 0
    if (typeof partial !== 'boolean') {
        partial = true
    }
    const viewPort: any = Stratus.Environment.get('viewPort') || window
    const $viewPort = jQuery(viewPort)
    let pageTop: any = $viewPort.scrollTop()
    let pageBottom: any = pageTop + $viewPort.height()
    let elementTop: any = el.offset().top
    if (viewPort !== window) {
        elementTop += pageTop
    }
    const elementBottom: any = elementTop + el.height()
    pageTop = pageTop + offset
    pageBottom = pageBottom - offset
    // if (!Stratus.Environment.get('production')) {
    //     console.log('onScreen:',
    //         {
    //             el,
    //             pageTop,
    //             pageBottom,
    //             elementTop,
    //             elementBottom,
    //             offset
    //         },
    //         partial ? (elementTop <= pageBottom && elementBottom >= pageTop) : (pageTop < elementTop && pageBottom > elementBottom)
    //     )
    // }
    return partial ? (elementTop <= pageBottom && elementBottom >= pageTop) : (pageTop < elementTop && pageBottom > elementBottom)
}

// Internal CSS Loader
// -------------------

// This function allows asynchronous CSS Loading and returns a promise.
// It Prepends CSS files to the top of the list, so that it
// doesn't overwrite the site.css. So we reverse the order of the list of urls
// so they load the order specified.
/**
 * TODO: Determine relative or CDN based URLs
 */
Stratus.Internals.LoadCss = (urls: any) => {
    return new Promise((resolve: any, reject: any) => {
        if (typeof urls === 'undefined' || typeof urls === 'function') {
            reject(new Stratus.Prototypes.Error({
                code: 'LoadCSS',
                message: 'CSS Resource URLs must be defined as a String, Array, or Object.'
            }, this))
        }
        if (typeof urls === 'string') {
            urls = [urls]
        }
        const cssEntries: any = {
            total: urls.length,
            iteration: 0
        }
        if (cssEntries.total > 0) {
            _.forEach(urls.reverse(), (url: any) => {
                cssEntries.iteration++
                const cssEntry: any = _.uniqueId('css_')
                cssEntries[cssEntry] = false
                if (typeof url === 'undefined' || !url) {
                    cssEntries[cssEntry] = true
                    if (cssEntries.total === cssEntries.iteration &&
                        _.every(cssEntries)) {
                        resolve(cssEntries)
                    }
                } else {
                    Stratus.Internals.CssLoader(url).then((entry: any) => {
                        cssEntries[cssEntry] = true
                        if (cssEntries.total === cssEntries.iteration &&
                            _.every(cssEntries)) {
                            resolve(cssEntries)
                        }
                    }, reject)
                }
            })
        } else {
            reject(new Stratus.Prototypes.Error(
                {code: 'LoadCSS', message: 'No CSS Resource URLs found!'}, this))
        }
    })
}

// Stratus Environment Initialization
// ----------------------------------

// This needs to run after the jQuery library is configured.
Stratus.Internals.LoadEnvironment = () => {
    const initialLoad: any = Stratus.Select('body').attr('data-environment')
    if (initialLoad && typeof initialLoad === 'object' && _.size(initialLoad)) {
        Stratus.Environment.set(initialLoad)
    }
    if (Stratus.Client.mobile) {
        Stratus.Environment.set('viewPort', null)
    }
    // Environment Information
    let passiveEventOptions: any = false
    try {
        Stratus.Select(Stratus.Environment.get('viewPort') || window).addEventListener(
            'test',
            null,
            Object.defineProperty(
                {},
                'passive',
                {
                    get() {
                        passiveEventOptions = {passive: true}
                    }
                }
            )
        )
    } catch (err) {
    }
    Stratus.Environment.set('passiveEventOptions', passiveEventOptions)
}

// Lazy Load Image
// ---------------
Stratus.Internals.LoadImage = (obj: any) => {
    if (!obj.el) {
        setTimeout(() => {
            Stratus.Internals.LoadImage(obj)
        }, 500)
        return false
    }
    const el: any = obj.el instanceof jQuery ? obj.el : jQuery(obj.el)
    if (!el.length) {
        setTimeout(() => {
            Stratus.Internals.LoadImage(obj)
        }, 500)
        return false
    }
    if (!el.hasClass('placeholder')) {
        el.addClass('placeholder')
        el.on('load', () => {
            el.removeClass('placeholder')
        })
    }
    if (Stratus.Internals.IsOnScreen(obj.spy || el) && !hydrate(el.attr('data-loading'))) {
        el.attr('data-loading', dehydrate(true))
        Stratus.DOM.complete(() => {
            // By default we'll load larger versions of an image to look good on HD
            // displays, but if you don't want that, you can bypass it with
            // data-hd="false"
            let hd: any = hydrate(el.attr('data-hd'))
            if (typeof hd === 'undefined') {
                hd = true
            }

            // Don't Get the Width, until it's "onScreen" (in case it was collapsed
            // offscreen originally)
            let src: any = hydrate(el.attr('data-src')) || el.attr('src') || null
            // NOTE: Element can be either <img> or any element with background image in style
            const type: any = el.prop('tagName').toLowerCase()

            // Handle precedence
            if (type === 'img' && (src === 'lazy' || _.isEmpty(src))) {
                src = el.attr('src')
            }
            if (_.isEmpty(src)) {
                return false
            }

            let size: any = hydrate(el.attr('data-size')) || obj.size || null

            // if a specific valid size is requested, use that
            // FIXME: size.indexOf should never return anything useful
            if (!size) {
                let width: any = null
                let unit: any = null
                let percentage: any = null

                if (el.width()) {
                    // Check if there is CSS width hard coded on the element
                    width = el.width()
                } else if (el.attr('width')) {
                    width = el.attr('width')
                }

                // Digest Width Attribute
                if (width) {
                    const digest: any = /([\d]+)(.*)/
                    width = digest.exec(width)
                    unit = width[2]
                    width = parseInt(width[1], 10)
                    percentage = unit === '%' ? (width / 100) : null
                }

                // FIXME: This should only happen if the CSS has completely loaded.
                // Gather Container (Calculated) Width
                if (!width || unit === '%') {
                    // If there is no CSS width, calculate the parent container's width
                    // The image may be inside an element that is invisible (e.g. Carousel has items display:none)
                    // So we need to find the first parent that is visible and use that width
                    // NOTE: when lazy-loading in a slideshow, the containers that determine the size, might be invisible
                    // so in some cases we need to flag to find the parent regardless of invisibility.
                    const visibilitySelector: any = hydrate(el.attr('data-ignore-visibility')) ? null : ':visible'
                    const $visibleParent = jQuery(_.first(jQuery(obj.el).parents(visibilitySelector)))
                    // let $visibleParent = obj.spy || el.parent()
                    width = $visibleParent ? $visibleParent.width() : 0

                    // If one of parents of the image (and child of the found parent) has
                    // a bootstrap col-*-* set divide width by that in anticipation (e.g.
                    // Carousel that has items grouped)
                    const $col = $visibleParent.find('[class*="col-"]')

                    if ($col.length > 0) {
                        const colWidth: any = Stratus.Internals.GetColWidth($col)
                        if (colWidth) {
                            width = Math.round(width / colWidth)
                        }
                    }

                    // Calculate Percentage
                    if (percentage) {
                        width = Math.round(width * percentage)
                    }
                }

                // If no appropriate width was found, abort
                if (width <= 0) {
                    setTimeout(() => {
                        el.attr('data-loading', dehydrate(false))
                        Stratus.Internals.LoadImage(obj)
                    }, 500)
                    return false
                }

                // Double for HD
                if (hd) {
                    width = width * 2
                }

                // Return the first size that is bigger than container width
                size = _.findKey(Stratus.Settings.image.size, (s: any) => {
                    const ratio: any = s / width
                    return (ratio > 0.85 && ratio < 1.15) || s > width
                })

                // default to largest size if the container is larger and it didn't
                // find a size
                size = size || 'hq'

                // if (!Stratus.Environment.get('production')) {
                //     console.log('size:', size, width, el)
                // }

                // Fail-safe for images that are sized too early
                if (size === 'xs') {
                    setTimeout(() => {
                        el.attr('data-loading', dehydrate(false))
                        Stratus.Internals.LoadImage(obj)
                    }, 1500)
                }
            }

            // Change Source to right size (get the base and extension and ignore
            // size)
            const srcOrigin: any = src
            const srcRegex: any = /^(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)/gi
            const srcMatch: any = srcRegex.exec(src)
            if (srcMatch !== null) {
                src = srcMatch[1] + '-' + size + '.' + srcMatch[3]
            } else {
                console.error('Unable to find file name for image src:', el)
            }

            // Start Loading
            el.addClass('loading')

            const srcOriginProtocol: any = srcOrigin.startsWith('//') ? window.location.protocol + srcOrigin : srcOrigin

            // Set up actions for onLoad and onError (if size doesn't exist, revert to srcOrigin)
            if (type === 'img') {
                // Add Listeners (Only once per Element!)
                el.on('load', () => {
                    el.addClass('loaded').removeClass('loading')
                })
                el.on('error', () => {
                    // TODO: Go down in sizes before reaching the origin
                    el.attr('data-loading', dehydrate(false))
                    el.attr('src', srcOriginProtocol)
                    if (!Stratus.Environment.get('production')) {
                        console.log('Unable to load', size.toUpperCase(), 'size.', 'Restored:', el.attr('src'))
                    }
                })
            } else {
                // If Background Image Create a Test Image to Test Loading
                const loadEl: any = jQuery('<img/>')
                loadEl.attr('src', srcOriginProtocol)
                loadEl.on('load', () => {
                    el.addClass('loaded').removeClass('loading')
                    jQuery(this).remove() // prevent memory leaks
                })
                loadEl.on('error', () => {
                    // TODO: Go down in sizes before reaching the origin
                    // Standardize src
                    el.attr('data-loading', dehydrate(false))
                    el.css('background-image', 'url(' + srcOriginProtocol + ')')
                    if (!Stratus.Environment.get('production')) {
                        console.log('Unable to load', size.toUpperCase(), 'size.', 'Restored:', srcOriginProtocol)
                    }
                })
            }

            // Change the Source to be the desired path (for image or background)
            const srcProtocol: any = src.startsWith('//') ? window.location.protocol + src : src
            el.attr('data-loading', dehydrate(false))
            el.attr('data-size', dehydrate(size))
            if (type === 'img') {
                el.attr('src', srcProtocol)
            } else {
                el.css('background-image', 'url(' + srcProtocol + ')')
            }

            // FIXME: This is a mess that we shouldn't need to maintain.
            // RegisterGroups should just use Native Logic instead of
            // another level of abstraction.np

            // Remove from registration
            // TODO: remove this
            Stratus.RegisterGroup.remove('OnScroll', obj)
            // if (!Stratus.Environment.get('production')) {
            //   console.log('Remove RegisterGroup:', obj)
            // }
        })
    }
}

Stratus.Internals.Location = (options: any) => {
    return new Promise((resolve: any, reject: any) => {
        if (!('geolocation' in navigator)) {
            reject(new Stratus.Prototypes.Error({
                code: 'Location',
                message: 'HTML5 Geo-Location isn\'t supported on this browser.'
            }, this))
        } else {
            options = _.extend({
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 50000
            }, options || {})
            navigator.geolocation.getCurrentPosition(resolve, reject, options)
        }
    })
}

// OnScroll()
// -----------
// Since different plugins or methods may need to listen to the Scroll, we
// don't want lots of different listeners on the scroll event, so we register
// them and then execute them all at once Each element must include: method:
// the function to callback options: an object of options that the function
// uses TODO: Move this somewhere.
Stratus.Internals.OnScroll = _.once((elements: any) => {
    // Reset Elements:
    // if (!elements || elements.length === 0) return false;

    // Execute the methods for every registered object ONLY when there is a
    // change to the viewPort
    Stratus.Environment.on('change:viewPortChange', (event: any, model: any) => {
        if (!model.get('viewPortChange')) {
            return
        }
        model.set('lastScroll', Stratus.Internals.GetScrollDir())

        // Cycle through all the registered objects an execute their function
        // We must use the registered onScroll objects, because they get removed
        // in some cases (e.g. lazy load)
        // TODO: remove logic of RegisterGroup
        const scrollElements: any = Stratus.RegisterGroup.get('OnScroll')

        _.forEach(scrollElements, (obj: any) => {
            if (typeof obj !== 'undefined' && _.has(obj, 'method')) {
                obj.method(obj)
            }
        })
        model.set('viewPortChange', false)
        model.set('windowTop', jQuery(Stratus.Environment.get('viewPort') || window).scrollTop())
    })

    // Listen for Scrolling Updates
    // Note: You can't use event.preventDefault() in Passive Events
    const viewPort: any = Stratus.Select(Stratus.Environment.get('viewPort') || window)
    const viewPortChangeHandler: any = () => {
        // if (!Stratus.Environment.get('production')) {
        //     console.log('scrolling:', Stratus.Internals.GetScrollDir())
        // }
        if (Stratus.Environment.get('viewPortChange')) {
            return
        }
        Stratus.Environment.set('viewPortChange', true)
    }
    viewPort.addEventListener('scroll', viewPortChangeHandler, Stratus.Environment.get('passiveEventOptions'))
    // Resizing can change what's on screen so we need to check the scrolling
    viewPort.addEventListener('resize', viewPortChangeHandler, Stratus.Environment.get('passiveEventOptions'))

    // Run Once initially
    Stratus.DOM.complete(() => {
        Stratus.Environment.set('viewPortChange', true)
    })
})

// FIXME: This logic above needs to be specific to a particular component or controller.
// It can be abstracted into an underscore function or something, but this currently is
// a bit ridiculous to maintain as a secondary black box.  Utility functions are supposed
// to be simple and reusable functions.

// Internal Rebase Function
// ------------------------

// This function changes the base of an object or function and
// extends the original target.
/* *
 Stratus.Internals.Rebase = (target: any, base: any) => {
 // TODO: Sanitize functions
 window[target] = _.extend(base, target)
 return target
 }
 /* */

// Internal Resource Loader
// ------------------------

// This will either retrieve a resource from a URL and cache it
// for future reference.
Stratus.Internals.Resource = (path: any, elementId: any) => {
    return new Promise((resolve: any, reject: any) => {
        if (typeof path === 'undefined') {
            reject(new Stratus.Prototypes.Error({
                code: 'Resource',
                message: 'Resource path is not defined.'
            }, this))
        }
        if (_.has(Stratus.Resources, path)) {
            if (Stratus.Resources[path].success) {
                resolve(Stratus.Resources[path].data)
            } else {
                Stratus.Events.once('resource:' + path, resolve)
            }
        } else {
            Stratus.Resources[path] = {
                success: false,
                data: null
            }
            Stratus.Events.once('resource:' + path, resolve)
            const meta: any = {path, dataType: 'text'}
            if (elementId !== undefined) {
                meta.elementId = elementId
            }
            Stratus.Internals.Api('Resource', meta, {}).then((data: any) => {
                Stratus.Resources[path].success = true
                Stratus.Resources[path].data = data
                Stratus.Events.trigger('resource:' + path, data)
            }, reject)
        }
    })
}

// Internal URL Handling
// ---------------------

// This function digests URLs into an object containing their respective
// values, which will be merged with requested parameters and formulated
// into a new URL. TODO: Move this into underscore as a mixin.
/**
 * @deprecated
 */
Stratus.Internals.SetUrlParams = (params: any, url: any) => {
    // TODO: Add Controls for Deprecation Warnings...
    // console.warn('Stratus.Internals.SetUrlParams is deprecated. Use setUrlParams instead.')
    return setUrlParams(params, url)
}

// Track Location
// --------------

// This function requires more details.
Stratus.Internals.TrackLocation = () => {
    const envData: any = {}
    // if (!Stratus.Environment.has('timezone'))
    envData.timezone = new Date().toString().match(/\((.*)\)/)[1]
    if (Stratus.Environment.get('trackLocation')) {
        if (Stratus.Environment.get('trackLocationConsent')) {
            Stratus.Internals.Location().then((pos: any) => {
                envData.lat = pos.coords.latitude
                envData.lng = pos.coords.longitude
                Stratus.Environment.set('lat', pos.coords.latitude)
                Stratus.Environment.set('lng', pos.coords.longitude)
                Stratus.Internals.UpdateEnvironment(envData)
            }, (error: any) => {
                console.error('Stratus Location:', error)
            })
        } else {
            Stratus.Internals.XHR({
                url: 'https://ipapi.co/' + Stratus.Environment.get('ip') + '/json/',
                success(data: any) {
                    if (!data) {
                        data = {}
                    }
                    if (typeof data === 'object' && Object.keys(data).length &&
                        data.postal) {
                        envData.postalCode = data.postal
                        envData.lat = data.latitude
                        envData.lng = data.longitude
                        envData.city = data.city
                        envData.region = data.region
                        envData.country = data.country
                        Stratus.Internals.UpdateEnvironment(envData)
                    }
                }
            })
        }
    } else {
        Stratus.Internals.UpdateEnvironment(envData)
    }
}

// Update Environment
// ------------------

// This function requires more details.
Stratus.Internals.UpdateEnvironment = (request: any) => {
    if (!request) {
        request = {}
    }
    if (typeof document.cookie !== 'string' ||
        !cookie('SITETHEORY')) {
        return false
    }
    if (typeof request === 'object' && Object.keys(request).length) {
        // TODO: Create a better URL, switching between relative APIs based on
        // environment
        Stratus.Internals.XHR({
            method: 'PUT',
            url: '/Api/Session', // auth.sitetheory.io
            data: request,
            type: 'application/json',
            success(response: any) {
                const settings: any = response.payload || response
                if (typeof settings === 'object') {
                    _.forEach(Object.keys(settings), (key: any) => {
                        Stratus.Environment.set(key, settings[key])
                    })
                }
            },
            error(error: any) {
                console.error('error:', error)
            }
        })
    }
}

const rendererData: any = {
    webgl: null,
    debugInfo: null,
    vendor: null,
    renderer: null
}

Stratus.Internals.Renderer = (brief: any) => {
    if (rendererData.webgl) {
        return brief ? rendererData.renderer : rendererData
    }
    const canvas: any = document.createElement('canvas')
    try {
        rendererData.webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    } catch (e) {
    }
    if (!rendererData.webgl) {
        return brief ? rendererData.renderer : rendererData
    }
    rendererData.debugInfo = rendererData.webgl.getExtension('WEBGL_debug_renderer_info')
    rendererData.vendor = rendererData.webgl.getParameter(rendererData.debugInfo.UNMASKED_VENDOR_WEBGL)
    rendererData.renderer = rendererData.webgl.getParameter(rendererData.debugInfo.UNMASKED_RENDERER_WEBGL)
    return brief ? rendererData.renderer : rendererData
}

// TODO: Move to a module that loads separately
Stratus.Loaders.Angular = function AngularLoader() {
    let requirement: any
    let nodes: any
    let injection: any

    // This contains references for the auto-loader below
    const container: any = {
        requirement: [],
        module: [],
        stylesheet: []
    }

    // TODO: Add references to this prototype in the tree builder, accordingly
    const injector: any = (injectable: any) => {
        injectable = injectable || {}
        _.forEach(injectable, (element: any, attribute: any) => {
            container[attribute] = container[attribute] || []
            if (_.isArray(element)) {
                _.forEach(element, (value: any) => {
                    container[attribute].push(value)
                })
            } else {
                container[attribute].push(element)
            }
        })
    }

    _.forEach(Stratus.Roster, (element: any, key: any) => {
        if (typeof element === 'object' && element) {
            // sanitize roster fields without selector attribute
            if (_.isUndefined(element.selector) && element.namespace) {
                element.selector = _.filter(
                    _.map(boot.configuration.paths, (path: any, pathKey: any) => {
                        // if (_.isString(pathKey) && !Stratus.Environment.get('production')) {
                        //     console.log(pathKey.match(/([a-zA-Z]+)/g))
                        // }
                        return _.startsWith(pathKey, element.namespace)
                               ? (element.type === 'attribute' ? '[' : '') +
                                   camelToKebab(pathKey.replace(element.namespace, 'stratus-')) +
                                   (element.type === 'attribute' ? ']' : '')
                               : null
                    })
                )
            }

            // digest roster
            if (_.isArray(element.selector)) {
                element.length = 0
                _.forEach(element.selector, (selector: any) => {
                    nodes = document.querySelectorAll(selector)
                    element.length += nodes.length
                    if (nodes.length) {
                        const name: any = selector.replace(/^\[/, '').replace(/]$/, '')
                        requirement = element.namespace + lcfirst(kebabToCamel(name.replace(/^stratus/, '').replace(/^ng/, '')))
                        if (_.has(boot.configuration.paths, requirement)) {
                            injection = {
                                requirement
                            }
                            if (element.module) {
                                injection.module =
                                    _.isString(element.module) ? element.module : lcfirst(kebabToCamel(name + (element.suffix || '')))
                            }
                            injector(injection)
                        }
                    }
                })
            } else if (_.isString(element.selector)) {
                nodes = document.querySelectorAll(element.selector)
                element.length = nodes.length
                if (nodes.length) {
                    const attribute: any = element.selector.replace(/^\[/, '').replace(/]$/, '')
                    if (attribute && element.namespace) {
                        _.forEach(nodes, (node: any) => {
                            const name: any = node.getAttribute(attribute)
                            if (name) {
                                requirement = element.namespace + lcfirst(kebabToCamel(name.replace('Stratus', '')))
                                if (_.has(boot.configuration.paths, requirement)) {
                                    injector({
                                        requirement
                                    })
                                }
                            }
                        })
                    } else if (element.require) {
                        // TODO: add an injector to the container
                        container.requirement = _.union(container.requirement, element.require)
                        injection = {}
                        if (element.module) {
                            injection.module =
                                _.isString(element.module) ? element.module : lcfirst(kebabToCamel(attribute + (element.suffix || '')))
                        }
                        if (element.stylesheet) {
                            injection.stylesheet = element.stylesheet
                        }
                        injector(injection)
                    }
                }
            }
        }
    })

    // Ensure Modules enabled are in the requirements
    container.requirement.push('angular-material')
    _.forEach(container, (element: any, key: any) => {
        container[key] = _.uniq(element)
    })

    // Angular Injector
    if (container.requirement.length) {
        // Deprecated the use of the 'froala' directive for stratus-froala
        /* *
         if (_.includes(container.requirement, 'angular-froala')) {
         [
         'codemirror/mode/htmlmixed/htmlmixed',
         'codemirror/addon/edit/matchbrackets',
         'codemirror',
         'froala-align',
         'froala-code-beautifier',
         'froala-code-view',
         'froala-draggable',
         'froala-entities',
         'froala-file',
         'froala-forms',
         'froala-fullscreen',
         'froala-help',
         'froala-image',
         'froala-image-manager',
         'froala-inline-style',
         'froala-link',
         'froala-lists',
         'froala-paragraph-format',
         'froala-paragraph-style',
         'froala-quick-insert',
         'froala-quote',
         'froala-table',
         'froala-url',
         'froala-video',
         'froala-word-paste'
         ].forEach((requirement: any) => {
         container.requirement.push(requirement);
         });
         }
         /* */

        // We are currently forcing all filters to load because we don't have a selector to find them on the DOM, yet.
        Object.keys(boot.configuration.paths).filter((path: any) => {
            return _.startsWith(path, 'stratus.filters.')
        }).forEach((value) => {
            container.requirement.push(value)
        })

        // if (!Stratus.Environment.get('production')) {
        //     console.log('requirements:', container.requirement)
        // }

        require(container.requirement, () => {
            // App Reference
            angular.module('stratusApp', _.union(Object.keys(Stratus.Modules), container.module)).config([
                '$sceDelegateProvider', ($sceDelegateProvider: any) => {
                    const whitelist: any = [
                        'self',
                        'http://*.sitetheory.io/**',
                        'https://*.sitetheory.io/**'
                    ]
                    if (boot.host) {
                        if (_.startsWith(boot.host, '//')) {
                            _.forEach(['https:', 'http:'], (proto: any) => {
                                whitelist.push(proto + boot.host + '/**')
                            })
                        } else {
                            whitelist.push(boot.host + '/**')
                        }
                    }
                    $sceDelegateProvider.resourceUrlWhitelist(whitelist)
                }
            ])

            // TODO: Make Dynamic
            // Froala Configuration
            // @ts-ignore
            if (typeof jQuery !== 'undefined' && jQuery.fn && jQuery.FroalaEditor) {
                // @ts-ignore
                jQuery.FroalaEditor.DEFAULTS.key = Stratus.Api.Froala

                // 'insertOrderedList', 'insertUnorderedList', 'createLink', 'table'
                const buttons: any = [
                    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'formatBlock',
                    'blockStyle', 'inlineStyle', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL',
                    'formatUL', 'outdent', 'indent', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile',
                    'insertTable', '|', 'undo', 'redo', 'removeFormat', 'wordPaste', 'help', 'html', 'fullscreen'
                ]
                angular.module('stratusApp').value('froalaConfig', {
                    codeBeautifierOptions: {
                        end_with_newline: true,
                        indent_inner_html: true,
                        extra_liners: '[\'p\', \'h1\', \'h2\', \'h3\', \'h4\', \'h5\', \'h6\', \'blockquote\', \'pre\', \'ul\', \'ol\', \'table\', \'dl\']',
                        brace_style: 'expand',
                        indent_char: ' ',
                        indent_size: 4,
                        wrap_line_length: 0
                    },
                    codeMirror: true,
                    codeMirrorOptions: {
                        indentWithTabs: false,
                        lineNumbers: true,
                        lineWrapping: true,
                        mode: 'text/html',
                        tabMode: 'space',
                        tabSize: 4
                    },
                    fileUploadURL: 'https://app.sitetheory.io:3000/?session=' + cookie('SITETHEORY'),
                    htmlAllowedAttrs: ['.*'],
                    htmlAllowedEmptyTags: [
                        'textarea', 'a', '.fa',
                        'iframe', 'object', 'video',
                        'style', 'script', 'div'
                    ],
                    htmlAllowedTags: ['.*'],
                    htmlRemoveTags: [''],
                    htmlUntouched: true,
                    imageManagerPageSize: 20,
                    imageManagerScrollOffset: 10,
                    imageManagerLoadURL: '/Api/Media?payload-only=true',
                    imageManagerLoadMethod: 'GET',
                    imageManagerDeleteMethod: 'DELETE',
                    multiLine: true,
                    pasteDeniedAttrs: [''],
                    pasteDeniedTags: [''],
                    pastePlain: false,
                    toolbarSticky: false,
                    toolbarButtons: buttons,
                    toolbarButtonsMD: buttons,
                    toolbarButtonsSM: buttons,
                    toolbarButtonsXS: buttons
                })
            }

            // Services
            _.forEach(Stratus.Services, (service: any) => {
                angular.module('stratusApp').config(service)
            })

            // Components
            _.forEach(Stratus.Components, (component: any, name: any) => {
                angular.module('stratusApp').component('stratus' + ucfirst(name), component)
            })

            // Directives
            _.forEach(Stratus.Directives, (directive: any, name: any) => {
                angular.module('stratusApp').directive('stratus' + ucfirst(name), directive)
            })

            // Filters
            _.forEach(Stratus.Filters, (filter: any, name: any) => {
                angular.module('stratusApp').filter(lcfirst(name), filter)
            })

            // Controllers
            _.forEach(Stratus.Controllers, (controller: any, name: any) => {
                angular.module('stratusApp').controller(name, controller)
            })

            // Load CSS
            // TODO: Move this reference to the stylesheets block above
            const css: any = container.stylesheet
            const cssLoaded: any = Stratus.Select('link[satisfies]').map((node: Element) => node.getAttribute('satisfies'))
            if (!_.includes(cssLoaded, 'angular-material.css') && 'angular-material' in boot.configuration.paths) {
                css.push(
                    Stratus.BaseUrl + boot.configuration.paths['angular-material'].replace(/\.js$/, '') + '.css'
                )
            }
            if (Stratus.Directives.Froala || Stratus.Select('[froala]').length) {
                const froalaPath: any = boot.configuration.paths.froala.replace(/\/[^/]+\/?[^/]+\/?$/, '')
                _.forEach([
                        // FIXME this is sitetheory only
                        Stratus.BaseUrl + 'sitetheorycore/css/sitetheory.codemirror.css',
                        Stratus.BaseUrl + boot.configuration.paths.codemirror.replace(/\/([^/]+)\/?$/, '') + '/codemirror.css',
                        Stratus.BaseUrl + froalaPath + '/css/froala_editor.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/froala_style.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/code_view.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/draggable.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/file.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/fullscreen.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/help.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/image.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/image_manager.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/quick_insert.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/special_characters.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/table.min.css',
                        Stratus.BaseUrl + froalaPath + '/css/plugins/video.min.css'
                    ],
                    stylesheet => css.push(stylesheet)
                )
            }

            // FIXME: What is above this line is not great

            if (css.length) {
                let counter: any = 0
                css.forEach((url: any) => {
                    Stratus.Internals.CssLoader(url)
                        .then(() => {
                            if (++counter !== css.length) {
                                return
                            }
                            const angularRoot = angular.bootstrap(document.documentElement, ['stratusApp'])
                        })
                })
            } else {
                const angularRoot = angular.bootstrap(document.documentElement, ['stratusApp'])
            }
        })
    }
}

// Instance Clean
// --------------

// This function is meant to delete instances by their unique id for Garbage
// Collection.
Stratus.Instances.Clean = (instances: any) => {
    if (typeof instances === 'undefined') {
        console.error('Stratus.Instances.Clean() requires a string or array containing Unique ID(s).')
    } else if (typeof instances === 'string') {
        instances = [instances]
    }

    if (typeof instances === 'object' && Array.isArray(instances)) {
        _.forEach(instances, (value: any) => {
            if (_.has(Stratus.Instances, value)) {
                if (typeof Stratus.Instances[value].remove === 'function') {
                    Stratus.Instances[value].remove()
                }
                delete Stratus.Instances[value]
            }
        })
    } else {
        return false
    }
}

// Post Message Handling
// ---------------------

// This function executes when the window receives a Post Message
// Convoy from another source as a (i.e. Window, iFrame, etc.)
Stratus.PostMessage.Convoy = (fn: (e: object) => void) => {
    window.addEventListener('message', (e: MessageEvent) => {
        if (e.origin !== 'https://auth.sitetheory.io') {
            return false
        }
        fn(isJSON(e.data) ? JSON.parse(e.data) : {})
    }, false)
}

// When a message arrives from another source, handle the Convoy
// appropriately.
Stratus.PostMessage.Convoy((convoy: any) => {
    // Single Sign On
    let ssoEnabled: any = cookie('sso')
    ssoEnabled = ssoEnabled === null ? true : (isJSON(ssoEnabled) ? JSON.parse(ssoEnabled) : false)
    if (ssoEnabled && convoy && convoy.meta && convoy.meta.session && convoy.meta.session !== cookie('SITETHEORY')) {
        cookie({
            name: 'SITETHEORY',
            value: convoy.meta.session,
            expires: '1w'
        })
        if (Stratus.Client.safari) {
            return
        }
        window.location.reload()
    }
})

// Local Storage Handling
// ----------------------

// This function executes when the window receives a keyed Local
// Storage event, which can occur on any open tab within the
// browser's session.
Stratus.LocalStorage.Listen = (key: any, fn: any) => {
    window.addEventListener('storage', (event: any) => {
        if (event.key !== key) {
            return
        }
        fn(event)
        // fn(isJSON(event.data) ? JSON.parse(event.data) : {})
    }, false)
}

// When an event arrives from any source, we will handle it
// appropriately.
Stratus.LocalStorage.Listen('stratus-core', (data: any) => {
    // if (!Stratus.Environment.get('production')) {
    //     console.log('LocalStorage:', data)
    // }
})
// localStorage.setItem('stratus-core', 'foo')

// DOM Listeners
// -------------

// This function executes when the DOM is Ready, which means
// the DOM is fully parsed, but still loading sub-resources
// (CSS, Images, Frames, etc).
Stratus.DOM.ready = (fn: any) => {
    (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn)
}

// This function executes when the DOM is Complete, which means
// the DOM is fully parsed and all resources are rendered.
Stratus.DOM.complete = (fn: any) => {
    (document.readyState === 'complete') ? fn() : window.addEventListener('load', fn)
}

// This function executes before the DOM has completely Unloaded,
// which means the window/tab has been closed or the user has
// navigated from the current page.
Stratus.DOM.unload = (fn: (e: BeforeUnloadEvent) => void) => {
    window.addEventListener('beforeunload', fn)
}

// Key Maps
// --------

// These constants intend to map keys for most browsers.
Stratus.Key.Enter = 13
Stratus.Key.Escape = 27

// Stratus Layer Events
// --------------------

// When these events are triggered, all functions attached to the event name
// will execute in order of initial creation.  This becomes supremely useful
// when adding to the Initialization and Exit Routines as AMD Modules, views
// and custom script(s) progressively add Objects within the Stratus Layer.

Stratus.Events.once('initialize', () => {
    if (!Stratus.Environment.get('production')) {
        console.groupEnd()
        console.group('Stratus Initialize')
    }
    Stratus.Internals.LoadEnvironment()
    Stratus.Internals.Compatibility()
    Stratus.RegisterGroup = new ModelBase()

    // Handle Location
    Stratus.Internals.TrackLocation()

    // Load Angular
    Stratus.Loaders.Angular()

    // Load Views
    /* *
     Stratus.Internals.Loader().then((views: any) => {
     if (!Stratus.Environment.get('production')) {
     console.info('Views:', views)
     }
     window.views = views
     Stratus.Events.on('finalize', (views: any) => {
     // TODO: backbone is gone, so rewrite this portion to record history so we can back/forward
     // Backbone.history.start()
     Stratus.Events.trigger('finalized', views)
     })
     Stratus.Events.trigger('finalize', views)
     }, (error: any) => {
     console.error('Stratus Loader:', error)
     })
     /* */
})
Stratus.Events.once('finalize', () => {
    if (!Stratus.Environment.get('production')) {
        console.groupEnd()
        console.group('Stratus Finalize')
    }

    // Load Internals
    // FIXME: This doesn't work after Backbone was removed
    // if (Stratus.Internals.Anchor.initialize) {
    //     Stratus.Internals.Anchor = Stratus.Internals.Anchor()
    // }
    // const anchor: any = new Stratus.Internals.Anchor()
    // if (!Stratus.Environment.get('production')) {
    //     console.log('Anchor:', anchor)
    // }

    // Call Any Registered Group Methods that plugins might use, e.g. OnScroll
    if (Stratus.RegisterGroup.size()) {
        Stratus.RegisterGroup.each((objs: any, key: any) => {
            // for each different type of registered plugin, pass all the registered
            // elements
            if (_.has(Stratus.Internals, key)) {
                Stratus.Internals[key](objs)
                // TODO: remove
                if (!Stratus.Environment.get('production')) {
                    console.log('Register Group: remove - ', key, objs)
                }
            }
        })
    }
})
Stratus.Events.once('terminate', () => {
    if (!Stratus.Environment.get('production')) {
        console.groupEnd()
        console.group('Stratus Terminate')
    }
})

// This event supports both Native and Bootbox styling to generate
// an alert box with an optional message and handler callback.
Stratus.Events.on('alert', (event: any, message: any, handler: any) => {
    if (!(message instanceof Stratus.Prototypes.Bootbox)) {
        message = new Stratus.Prototypes.Bootbox(message, handler)
    }
    /* if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') { */
    // if (typeof bootbox !== 'undefined') {
    //     bootbox.alert(message.message, message.handler)
    // } else {
    window.alert(message.message)
    message.handler()
    // }
})

// This event supports both Native and Bootbox styling to generate
// a confirmation box with an optional message and handler callback.
Stratus.Events.on('confirm', (event: any, message: any, handler: any) => {
    if (!(message instanceof Stratus.Prototypes.Bootbox)) {
        message = new Stratus.Prototypes.Bootbox(message, handler)
    }
    /* if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') { */
    // if (typeof bootbox !== 'undefined') {
    //     bootbox.confirm(message.message, message.handler)
    // } else {
    handler(window.confirm(message.message))
    // }
})

// This event allows a Notification to reach the browser.
Stratus.Events.on('notification', (event: any, message: any, title: any) => {
    const options: any = {}
    if (message && typeof message === 'object') {
        _.extend(options, message)
        options.message = options.message || 'Message'
    } else {
        options.message = message || 'Message'
    }
    options.title = options.title || title || 'Stratus'
    options.icon = options.icon || 'https://avatars0.githubusercontent.com/u/15791995?v=3&s=200'
    let notification
    if (!('Notification' in window)) {
        console.info('This browser does not support desktop notifications.  You should switch to a modern browser.')
    } else if (Notification.permission === 'granted') {
        notification = new Notification(options.title, {
            body: options.message,
            icon: options.icon
        })
        if (!Stratus.Environment.get('production')) {
            console.log(notification)
        }
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission((permission: any) => {
            if (permission === 'granted') {
                notification = new Notification(options.title, {
                    body: options.message,
                    icon: options.icon
                })
                if (!Stratus.Environment.get('production')) {
                    console.log(notification)
                }
            }
        })
    }
})

// This event only supports Toaster styling to generate a message
// with either a Bootbox or Native Alert as a fallback, respectively.
Stratus.Events.on('toast', (event: any, message: any, title: any, priority: any, settings: any) => {
    if (!(message instanceof Stratus.Prototypes.Toast)) {
        message = new Stratus.Prototypes.Toast(message, title, priority, settings)
    }
    if (!Stratus.Environment.get('production')) {
        console.log('Toast:', message)
    }
    // if (typeof jQuery !== 'undefined' && jQuery.toaster) {
    //     jQuery.toaster(message)
    // } else {
    Stratus.Events.trigger('alert', message.message)
    // }
})

// DOM Ready Routines
// ------------------
// On DOM Ready, add browser compatible CSS classes and digest DOM data-entity
// attributes.
Stratus.DOM.ready(() => {
    Stratus.Select('body').removeClass('loaded unloaded').addClass('loading')
    Stratus.Events.trigger('initialize')
})

// DOM Complete Routines
// ---------------------

// Stratus Events are more accurate than the DOM, so nothing is added to this
// stub.
Stratus.DOM.complete(() => {
    // Renderer Detection
    const renderer: any = Stratus.Internals.Renderer()
    Stratus.Environment.set('render', renderer)

    // List Qualified Vendors
    const qualified: any = {
        vendors: [
            'NVIDIA Corporation',
            'ATI Technologies Inc.',
            'Qualcomm'
        ],
        renderers: [
            'NVIDIA',
            'GeForce',
            'AMD',
            'ATI',
            'Radeon',
            'Adreno'
        ]
    }

    let quality: any
    quality = (
                  (renderer.vendor && qualified.vendors.indexOf(renderer.vendor) >= 0) ||
                  (renderer.renderer &&
                      _.map(qualified.renderers,
                          (r: string) => _.startsWith(r, renderer.renderer)
                      )
                  )
              ) ? 'high' : 'low'

    Stratus.Environment.set('quality', quality)

    // Handle Classes (for Design Timing)
    Stratus.Select('body').removeClass('loading unloaded').addClass(`loaded quality-${quality}`)

    // Load Angular 8+
    if (!hamlet.isUndefined('System')) {
        require([
            // 'quill',
            '@stratusjs/angular/boot'
        ])
    }
})

// DOM Unload Routines
// -------------------

// On DOM Unload, all inherent Stratus functions will cleanly
// break any open connections or currently operating routines,
// while providing the user with a confirmation box, if necessary,
// before close routines are triggered.
Stratus.DOM.unload((event: BeforeUnloadEvent) => {
    Stratus.Select('body').removeClass('loading loaded').addClass('unloaded')
    Stratus.Events.trigger('terminate', event)
    /* *
     if (event.cancelable === true) {
     // TODO: Check if any unsaved changes exist on any Stratus Models then request confirmation of navigation
     event.preventDefault();
     let confirmationMessage: any = 'You have pending changes, if you leave now, they may not be saved.';
     (event || window.event).returnValue = confirmationMessage;
     return confirmationMessage;
     }
     /* */
})
