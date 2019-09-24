// Require.js
// ----------

/* global define, hamlet, boot, EventTarget, angular, bootbox */

// We use this function factory to ensure the Stratus Layer can work outside of a
// Require.js environment.  This function needs to exist on every module defined
// within the Stratus environment to ensure its acceptance regardless of the
// contextual environment in which it is running.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'lodash',
      'jquery', // TODO: Remove once phased out appropriately
      'bowser'
    ], function (exports, _, jQuery, bowser) {
      return (root.Stratus = factory(exports, _, jQuery, bowser))
    })
  } else {
    root.Stratus = factory(root.exports, root._, root.jQuery, root.bowser)
  }
}(this, function (exports, _, jQuery, bowser) {
  // Stratus Layer Prototype
  // -----------------------

  // This prototype is the only Global Object that will ever be used within the
  // Stratus layer.  Each individual instantiated reference from a constructor
  // gets stored in the Instances property, and every Data Set is maintained in
  // the Catalog, for efficient access and debugging purposes.  Further down this
  // initialization routine, this Global Object gets mixed with a function that
  // allows for Native DOM Selectors with added functionality to ensure the core
  // Stratus files never require external DOM Libraries, such as jQuery.
  /**
   * @param selector
   * @param context
   * @returns {NodeList|Node}
   * @constructor
   */
  let Stratus = { // eslint-disable-line prefer-const
    /* Settings */
    Settings: {
      image: {
        size: { xs: 200, s: 400, m: 600, l: 800, xl: 1200, hq: 1600 }
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
    Select: null,

    /* Boot */
    BaseUrl: (boot && _.has(boot, 'configuration') ? boot.configuration.baseUrl : null) || '/',
    BundlePath: (boot && _.has(boot, 'configuration') ? boot.configuration.bundlePath : '') || '',

    /* This is used internally for triggering events */
    Events: null,

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
    Chronos: null,
    Data: {},
    Environment: {
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
    },
    History: {},
    Instances: {},
    Internals: {},
    Loaders: {},
    Prototypes: {},
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
  if (!Stratus.Environment.production) {
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
  /**
   * @type {{evaluate: RegExp, interpolate: RegExp, escape: RegExp}}
   */
  _.templateSettings = {
    evaluate: /\{%(.+?)%\}/g,
    interpolate: /\{\{(.+?)\}\}/g,
    escape: /\{#(.+?)#\}/g
  }

  // Underscore Mixins
  // ------------------

  /**
   * @param string
   * @returns {*}
   * @constructor
   */
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
    /**
     * @param code
     * @returns {string|null}
     */
    functionName: function (code) {
      if (_.isEmpty(code)) {
        return null
      }
      if (!_.isString(code)) {
        code = code.toString()
      }
      code = code.substr('function '.length)
      return code.substr(0, code.indexOf('('))
    },

    // This function simply capitalizes the first letter of a string.
    /**
     * @param string
     * @returns {*}
     */
    ucfirst: function (string) {
      return (typeof string === 'string' && string) ? string.charAt(0).toUpperCase() + string.substring(1) : null
    },

    // This function simply changes the first letter of a string to a lower case.
    /**
     * @param string
     * @returns {*}
     */
    lcfirst: function (string) {
      return (typeof string === 'string' && string) ? string.charAt(0).toLowerCase() + string.substring(1) : null
    },

    // This function allows creation, edit, retrieval and deletion of cookies.
    // Note: Delete with `_.cookie(name, '', -1)`
    /**
     * @param name
     * @param value
     * @param expires
     * @param path
     * @param domain
     * @returns {Array|{index: number, input: string}}
     */
    cookie: function (name, value, expires, path, domain) {
      const request = {
        name: name,
        value: value,
        expires: expires,
        path: path || '/',
        domain: domain
      }
      if (name && typeof name === 'object') {
        _.extend(request, name)
      }
      if (typeof request.value === 'undefined') {
        const search = new RegExp('(?:^' + request.name + '|;\\s*' + request.name +
          ')=(.*?)(?:;|$)', 'g')
        const data = search.exec(document.cookie)
        return (data === null) ? null : data[1]
      } else {
        let cookie = request.name + '=' + escape(request.value) + ';'
        if (request.expires) {
          if (request.expires instanceof Date) {
            if (isNaN(request.expires.getTime())) {
              request.expires = new Date()
            }
          } else {
            request.expires = new Date(new Date().getTime() +
              _.seconds(request.expires) * 1000)
          }
          cookie += 'expires=' + request.expires.toUTCString() + ';'
        }
        if (request.path) {
          cookie += 'path=' + request.path + ';'
        }
        if (request.domain) {
          cookie += 'domain=' + request.domain + ';'
        }
        document.cookie = cookie
      }
    },

    // Converge a list and return the prime key through specified method.
    /**
     * @param list
     * @param method
     * @returns {*}
     */
    converge: function (list, method) {
      if (typeof method !== 'string') {
        method = 'min'
      }
      if (method === 'min') {
        const lowest = _.min(list)
        return _.findKey(list, function (element) {
          return (element === lowest)
        })
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
    },

    // This synchronously repeats a function a certain number of times
    /**
     * @param fn
     * @param times
     */
    repeat: function (fn, times) {
      if (typeof fn === 'function' && typeof times === 'number') {
        let i
        for (i = 0; i < times; i++) {
          fn()
        }
      } else {
        console.warn('Underscore cannot repeat function:', fn,
          'with number of times:', times)
      }
    },

    // This function dehydrates an Object, Boolean, or Null value, to a string.
    /**
     * @param value
     * @returns {*}
     */
    dehydrate: function (value) {
      return typeof value === 'string' ? value : JSON.stringify(value)
    },

    // This function hydrates a string into an Object, Boolean, or Null value, if
    // applicable.
    /**
     * @param string
     * @returns {*}
     */
    hydrate: function (string) {
      return _.isJSON(string) ? JSON.parse(string) : string
    },

    // This is an alias to the hydrate function for backwards compatibility.
    /**
     * @param string
     * @returns {*}
     */
    hydrateString: function (string) {
      return _.hydrate(string)
    },

    // This function utilizes tree building to clone an object.
    /**
     * @param obj
     * @returns {*}
     */
    cloneDeep: function (obj) {
      if (typeof obj !== 'object') {
        return obj
      }
      const shallow = _.clone(obj)
      _.each(shallow, function (value, key) {
        shallow[key] = _.cloneDeep(value)
      })
      return shallow
    },

    // This function utilizes tree building to clone an object.
    /**
     * @param target
     * @param merger
     * @returns {*}
     */
    extendDeep: function (target, merger) {
      let shallow = _.clone(target)
      if (merger && typeof merger === 'object') {
        _.each(merger, function (value, key) {
          if (shallow && typeof shallow === 'object') {
            shallow[key] = (key in shallow) ? _.extendDeep(shallow[key],
              merger[key]) : merger[key]
          }
        })
      } else {
        shallow = merger
      }
      return shallow
    },

    /**
     * Get more params which is shown after anchor '#' anchor in the url.
     * @return {*}
     */
    getAnchorParams: function (key, url) {
      const vars = {}
      const tail = window.location.hash
      if (_.isEmpty(tail)) {
        return vars
      }
      const digest = /([a-zA-Z]+)(?:\/([0-9]+))?/g
      let match
      while ((match = digest.exec(tail))) {
        vars[match[1]] = _.hydrate(match[2])
      }
      return (typeof key !== 'undefined' && key) ? vars[key] : vars
    },

    // Get a specific value or all values located in the URL
    /**
     * @param key
     * @param url
     * @returns {{}}
     */
    getUrlParams: function (key, url) {
      const vars = {}
      if (url === undefined) {
        url = window.location.href
      }
      const anchor = url.indexOf('#')
      if (anchor >= 0) {
        url = url.substring(0, anchor)
      }
      url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = _.hydrate(value)
      })
      return (typeof key !== 'undefined' && key) ? vars[key] : vars
    },

    // This function digests URLs into an object containing their respective
    // values, which will be merged with requested parameters and formulated
    // into a new URL.
    /**
     * @param params
     * @param url
     * @returns {string|*}
     * @constructor
     */
    setUrlParams: function (params, url) {
      if (url === undefined) {
        url = window.location.href
      }
      if (params === undefined) {
        return url
      }
      let vars = {}
      const glue = url.indexOf('?')
      const anchor = url.indexOf('#')
      let tail = ''
      if (anchor >= 0) {
        tail = url.substring(anchor, url.length)
        url = url.substring(0, anchor)
      }
      url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value
      })
      vars = _.extend(vars, params)
      return ((glue >= 0 ? url.substring(0, glue) : url) + '?' +
        _.map(vars, function (value, key) {
          return key + '=' + _.dehydrate(value)
        }).reduce(function (memo, value) {
          return memo + '&' + value
        }) + tail)
    },

    // Ensure all values in an array or object are true
    /**
     * @param values
     * @returns {boolean}
     */
    allTrue: function (values) {
      return (typeof values === 'object') ? _.every(values, function (value) {
        return value
      }) : false
    },

    // Determines whether or not the string supplied is in a valid JSON format
    /**
     * @param str
     * @returns {boolean}
     */
    isJSON: function (str) {
      try {
        JSON.parse(str)
      } catch (e) {
        return false
      }
      return true
    },

    // Determines whether or not the element was selected from Angular
    /**
     * @param element
     * @returns {boolean}
     */
    isAngular: function (element) {
      return typeof angular === 'object' && angular && angular.element && element instanceof angular.element
    },

    // Determines whether or not the element was selected from Angular
    /**
     * @param element
     * @returns {boolean}
     */
    isjQuery: function (element) {
      return typeof jQuery === 'function' && element instanceof jQuery
    },

    /**
     * @param str
     * @returns {number|null}
     */
    seconds: function (str) {
      let seconds = 0
      if (typeof str === 'string') {
        const timePairs = str.match(
          /([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/gi)
        if (_.size(timePairs)) {
          const digest = /([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/i
          let time
          let unit
          let value
          _.each(timePairs, function (timePair) {
            time = digest.exec(timePair)
            value = parseFloat(time[1])
            unit = time[2]
            if (!isNaN(value)) {
              switch (time[2]) {
                case 's':
                  unit = 1
                  break
                case 'm':
                  unit = 60
                  break
                case 'h':
                  unit = 3.6e+3
                  break
                case 'd':
                  unit = 8.64e+4
                  break
                case 'w':
                  unit = 6.048e+5
                  break
                case 'y':
                  unit = 3.1558149504e+7
                  break
                default:
                  unit = 0
              }
              seconds += value * unit
            }
          }, this)
        } else {
          seconds = null
        }
      } else if (typeof str === 'number') {
        seconds = str
      } else {
        seconds = null
      }
      return seconds
    },
    /**
     * @param target
     */
    camelToKebab: function (target) {
      return target.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    },
    /**
     * @param target
     */
    kebabToCamel: function (target) {
      return target.replace(/(-\w)/g, function (m) {
        return m[1].toUpperCase()
      })
    },
    /**
     * @param target
     */
    camelToSnake: function (target) {
      return target.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
    },
    /**
     * @param target
     */
    snakeToCamel: function (target) {
      return target.replace(/(_\w)/g, function (m) {
        return m[1].toUpperCase()
      })
    },
    /**
     * @BROKE
     * @param target
     * @param search
     * @returns {boolean}
     */
    startsWith: function (target, search) {
      return (typeof target === 'string' && typeof search === 'string' &&
        target.substr(0, search.length).toLowerCase() === search.toLowerCase())
    },
    /**
     * @BROKE
     * @param target
     * @param search
     * @returns {boolean}
     */
    endsWith: function (target, search) {
      return (typeof target === 'string' && typeof search === 'string' &&
        target.substr(target.length - search.length, target.length).toLowerCase() === search.toLowerCase())
    },
    /**
     * @param newData
     * @param priorData
     * @returns {*}
     */
    patch: function (newData, priorData) {
      if (!_.isObject(newData) || !_.size(newData)) {
        return null
      }
      const patch = {}
      const processor = {
        eax: undefined,
        ebx: undefined,
        ecx: undefined,
        edx: undefined
      }
      if (!_.isObject(priorData) || !_.size(priorData)) {
        console.error('bad prior:', priorData)
      } else {
        const detect = function (value, key) {
          processor.eax = processor.ecx ? processor.ecx + '.' + key : key
          if (_.isObject(value)) {
            processor.ecx = processor.eax
            _.each(value, detect)
            processor.ecx = processor.ecx === key
              ? undefined
              : processor.ecx.substring(0, processor.ecx.lastIndexOf('.'))
          } else {
            processor.ebx = _.reduce(processor.eax.split('.'),
              function (data, a) {
                return data && data[a]
              }, priorData)
            if (processor.ebx !== value) {
              processor.edx = value
            }
          }
          if (processor.edx !== undefined) {
            patch[processor.eax] = value
            processor.edx = undefined
          }
        }
        _.each(newData, detect)
      }
      return (!patch || !_.size(patch)) ? null : patch
    },
    /**
     * @param fn
     * @param timeout
     * @param interval
     * @returns {Promise<any>}
     */
    poll: function (fn, timeout, interval) {
      timeout = timeout || 2000
      interval = interval || 100
      const threshold = Number(new Date()) + timeout
      const check = function (resolve, reject) {
        const cond = fn()
        if (cond) {
          resolve(cond)
        } else if (Number(new Date()) < threshold) {
          setTimeout(check, interval, resolve, reject)
        } else {
          reject(new Error('Timeout ' + fn + ': ' + arguments))
        }
      }

      return new Promise(check)
    },
    /**
     * @BROKE
     * @param a
     * @param b
     * @returns {number}
     */
    strcmp: function (a, b) {
      if (!a) {
        return 1
      }
      if (!b) {
        return -1
      }
      a = a.toString()
      b = b.toString()
      let i, n
      for (i = 0, n = Math.max(a.length, b.length); i < n && a.charAt(i) === b.charAt(i); ++i) {}
      if (i === n) {
        return 0
      }
      return a.charAt(i) > b.charAt(i) ? -1 : 1
    },
    /**
     * @param target
     * @param limit
     * @param suffix
     * @returns {string}
     */
    truncate: function (target, limit, suffix) {
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
  })

  // Native Selector
  // ---------------

  // NOTE: This is a replacement for basic jQuery selectors. This function intends to allow native jQuery-Type chaining and plugins.
  /**
   * @param selector
   * @param context
   * @returns {window.NodeList|window.Node}
   * @constructor
   */
  Stratus.Select = function (selector, context) {
    if (!context) {
      context = document
    }
    let selection = selector
    if (typeof selector === 'string') {
      let target
      if (_.startsWith(selector, '.') || _.contains(selector, '[')) {
        target = 'querySelectorAll'
      } else if (_.contains(['html', 'head', 'body'], selector) || _.startsWith(selector, '#')) {
        target = 'querySelector'
      } else {
        target = 'querySelectorAll'
      }
      selection = context[target](selector)
    }
    if (selection && typeof selection === 'object') {
      if (_.isAngular(selection) || _.isjQuery(selection)) {
        selection = selection.length ? _.first(selection) : {}
      }
      selection = _.extend({}, Stratus.Selector, {
        context: this,
        length: _.size(selection),
        selection: selection,
        selector: selector
      })
    }
    return selection
  }
  // TODO: Remove the following hack
  /* eslint no-global-assign: "off" */
  Stratus = _.extend(function (selector, context) {
    // The function is a basic shortcut to the Stratus.Select
    // function for native jQuery-like chaining and plugins.
    return Stratus.Select(selector, context)
  }, Stratus)

  // Selector Plugins
  // ----------------

  /**
   * @param attr
   * @param value
   * @returns {*}
   */
  Stratus.Selector.attr = function (attr, value) {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find "' + attr + '" for list:', that.selection)
      return null
    }
    if (!attr) {
      return this
    }
    if (typeof value === 'undefined') {
      value = that.selection.getAttribute(attr)
      return _.hydrate(value)
    } else {
      that.selection.setAttribute(attr, _.dehydrate(value))
    }
    return that
  }

  /**
   * @param type
   * @param listener
   * @param options
   * @returns {Stratus.Selector|*}
   */
  Stratus.Selector.addEventListener = function (type, listener, options) {
    const that = this
    if (!that.selection) {
      console.warn('Unable to add EventListener on empty selection.')
      return that
    }
    const requestArgs = arguments
    const listen = (node) => node.addEventListener(type, listener, options)
    if (that.selection instanceof window.NodeList) {
      _.each(that.selection, listen)
      return that
    }
    if (that.selection instanceof EventTarget) {
      listen(that.selection)
      return that
    }
    console.warn('Unabled to add EventListener on:', that.selection)
    return that
  }

  /**
   * @param callable
   * @returns {*}
   */
  Stratus.Selector.each = function (callable) {
    const that = this
    if (typeof callable !== 'function') {
      callable = function (element) {
        console.warn('each running on element:', element)
      }
    }
    if (that.selection instanceof window.NodeList) {
      _.each(that.selection, callable)
    }
    return that
  }

  /**
   * @param selector
   * @returns {*}
   */
  Stratus.Selector.find = function (selector) {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find "' + selector + '" for list:', that.selection)
    } else if (selector) {
      return Stratus(selector, that.selection)
    }
    return null
  }

  /**
   * @param callable
   * @returns {*}
   */
  Stratus.Selector.map = function (callable) {
    const that = this
    if (typeof callable !== 'function') {
      callable = function (element) {
        console.warn('map running on element:', element)
      }
    }
    if (that.selection instanceof window.NodeList) {
      return _.map(that.selection, callable)
    }
    return that
  }

  /**
   * TODO: Merge with prepend
   *
   * @param child
   * @returns {*}
   */
  Stratus.Selector.append = function (child) {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to append child:', child, 'to list:', that.selection)
    } else if (child) {
      that.selection.insertBefore(child, that.selection.lastChild)
    }
    return that
  }

  /**
   * TODO: Merge with append
   *
   * @param child
   * @returns {*}
   */
  Stratus.Selector.prepend = function (child) {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to prepend child:', child, 'to list:', that.selection)
    } else if (child) {
      that.selection.insertBefore(child, that.selection.firstChild)
    }
    return that
  }

  // Design Plugins
  /**
   * @param className
   * @returns {*}
   * @constructor
   */
  Stratus.Selector.addClass = function (className) {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to add class "' + className + '" to list:', that.selection)
    } else {
      _.each(className.split(' '), function (name) {
        if (that.selection.classList) {
          that.selection.classList.add(name)
        } else {
          that.selection.className += ' ' + name
        }
      })
    }
    return that
  }

  /**
   * @param className
   * @returns {*}
   * @constructor
   */
  Stratus.Selector.removeClass = function (className) {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to remove class "' + className + '" from list:', that.selection)
    } else if (that.selection.classList) {
      _.each(className.split(' '), function (name) {
        that.selection.classList.remove(name)
      })
    } else {
      that.selection.className = that.selection.className.replace(
        new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
          'gi'), ' ')
    }
    return that
  }

  /**
   * @returns {CSSStyleDeclaration|*}
   */
  Stratus.Selector.style = function () {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find style for list:', that.selection)
    } else if (that.selection instanceof window.Node) {
      return window.getComputedStyle(that.selection)
    }
    return null
  }

  // Positioning Plugins
  /**
   * @returns {number|*}
   */
  Stratus.Selector.height = function () {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find height for list:', that.selection)
      return null
    }
    return that.selection.offsetHeight || 0
  }

  /**
   * @returns {number|*}
   */
  Stratus.Selector.width = function () {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find width for list:', that.selection)
      return null
    }
    // console.log('width:', that.selection.scrollWidth, that.selection.clientWidth, that.selection.offsetWidth)
    return that.selection.offsetWidth || 0
  }

  /**
   * @returns {{top: number, left: number}|*}
   */
  Stratus.Selector.offset = function () {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find offset for list:', that.selection)
    } else if (that.selection.getBoundingClientRect) {
      const rect = that.selection.getBoundingClientRect()
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

  /**
   * @returns {*}
   */
  Stratus.Selector.parent = function () {
    const that = this
    if (that.selection instanceof window.NodeList) {
      console.warn('Unable to find offset for list:', that.selection)
      return null
    }
    return Stratus(that.selection.parentNode)
  }

  // Stratus Event System
  // --------------------

  Stratus.Prototypes.EventManager = class EventManager {
    constructor (throttle) {
      this.name = 'EventManager'
      this.listeners = {}
      this.throttleTrigger = _.throttle(this.trigger, throttle || 100)
    }

    /**
     * @param name
     * @param callback
     * @param context
     * @returns {Stratus.Prototypes.EventManager}
     */
    off (name, callback, context) {
      console.log('off:', arguments)
      return this
    }

    /**
     * @param name
     * @param callback
     * @param context
     * @returns {Stratus.Prototypes.EventManager}
     */
    on (name, callback, context) {
      const event = (name instanceof Stratus.Prototypes.Event) ? name : new Stratus.Prototypes.Event({
        enabled: true,
        hook: name,
        method: callback,
        scope: context || null
      })
      name = event.hook
      if (!(name in this.listeners)) {
        this.listeners[name] = []
      }
      this.listeners[name].push(event)
      return this
    }

    /**
     * @param name
     * @param callback
     * @param context
     * @returns {Stratus.Prototypes.EventManager}
     */
    once (name, callback, context) {
      this.on(name, function (event, ...args) {
        event.enabled = false
        const childArgs = _.clone(args)
        childArgs.unshift(event)
        callback.apply(event.scope || this, childArgs)
      }, context)
      return this
    }

    /**
     * @param name
     * @param args
     * @returns {Stratus.Prototypes.EventManager}
     */
    trigger (name, ...args) {
      if (!(name in this.listeners)) {
        return this
      }
      this.listeners[name].forEach(function (event) {
        if (!event.enabled) {
          return
        }
        const childArgs = _.clone(args)
        childArgs.unshift(event)
        event.method.apply(event.scope || this, childArgs)
      })
      return this
    }
  }

  // Global Instantiation
  Stratus.Events = new Stratus.Prototypes.EventManager()

  // Error Prototype
  // ---------------

  /**
   * @param error
   * @param chain
   * @constructor
   */
  Stratus.Prototypes.Error = class StratusError {
    constructor (error, chain) {
      this.code = 'Internal'
      this.message = 'No discernible data received.'
      this.chain = []

      if (typeof error === 'string') {
        this.message = error
      } else if (error && typeof error === 'object') {
        _.extend(this, error)
      }

      this.chain.push(chain)
    }
  }

  // Event Prototype
  // --------------

  // This constructor builds events for various methods.
  /**
   * @param options
   * @returns {Stratus.Prototypes.Event}
   * @constructor
   */
  Stratus.Prototypes.Event = class StratusEvent {
    constructor (options) {
      this.enabled = false
      this.hook = null
      this.target = null
      this.scope = null
      this.debounce = null
      this.throttle = null
      this.method = function () {
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

  // Chronos System
  // --------------

  // This constructor builds jobs for various methods.
  /**
   * @param time
   * @param method
   * @param scope
   * @returns {Stratus.Prototypes.Job}
   * @constructor
   */
  Stratus.Prototypes.Job = class Job {
    constructor (time, method, scope) {
      this.enabled = false
      if (time && typeof time === 'object') {
        _.extend(this, time)
      } else {
        this.time = time
        this.method = method
        this.scope = scope
      }
      this.time = _.seconds(this.time)
      this.scope = this.scope || window
    }
  }

  // Model Prototype
  // ---------------

  // This function is meant to be extended models that want to use internal data
  // in a native Backbone way.
  Stratus.Prototypes.Model = class Model extends Stratus.Prototypes.EventManager {
    constructor (data, options) {
      super()
      this.name = 'Model'

      /**
       * @type {{}}
       */
      this.data = {}

      /**
       * @type {{}}
       */
      this.temps = {}

      // Diff Detection
      this.changed = false
      this.watching = false
      this.patch = {}

      // Evaluate object or array
      if (data) {
        // TODO: Evaluate object or array into a string of sets
        /* *
        data = _.defaults(_.extend({}, defaults, data), defaults)
        this.set(data, options)
        /* */
        _.extend(this.data, data)
      }

      // Scope Binding
      this.toObject = this.toObject.bind(this)
      this.toJSON = this.toJSON.bind(this)
      this.each = this.each.bind(this)
      this.get = this.get.bind(this)
      this.has = this.has.bind(this)
      this.size = this.size.bind(this)
      this.set = this.set.bind(this)
      this.setAttribute = this.setAttribute.bind(this)
      this.temp = this.temp.bind(this)
      this.add = this.add.bind(this)
      this.remove = this.remove.bind(this)
      this.iterate = this.iterate.bind(this)
      this.clear = this.clear.bind(this)
      this.clearTemp = this.clearTemp.bind(this)
    }

    /**
     * @param options
     * @returns {*}
     */
    toObject (options) {
      return _.clone(this.data)
    }

    /**
     * @param options
     * @returns {{meta: (*|string|{type, data}), payload: *}}
     */
    toJSON (options) {
      return _.clone(this.data)
    }

    /**
     * @param callback
     * @param scope
     */
    each (callback, scope) {
      _.each.apply((scope === undefined) ? this : scope,
        _.union([this.data], arguments))
    }

    /**
     * @param attr
     * @returns {*}
     */
    get (attr) {
      return _.reduce(typeof attr === 'string' ? attr.split('.') : [],
        function (attrs, a) {
          return attrs && attrs[a]
        }, this.data)
    }

    /**
     * @param attr
     * @returns {boolean}
     */
    has (attr) {
      return (typeof this.get(attr) !== 'undefined')
    }

    /**
     * @returns {number}
     */
    size () {
      return _.size(this.data)
    }

    /**
     * @param attr
     * @param value
     */
    set (attr, value) {
      if (attr && typeof attr === 'object') {
        const that = this
        _.each(attr, function (value, attr) {
          that.setAttribute(attr, value)
        }, this)
      } else {
        this.setAttribute(attr, value)
      }
    }

    /**
     * @param attr
     * @param value
     */
    setAttribute (attr, value) {
      if (typeof attr === 'string') {
        if (attr.indexOf('.') !== -1) {
          let reference = this.data
          const chain = attr.split('.')
          _.find(_.initial(chain), function (link) {
            if (!_.has(reference, link) || !reference[link]) {
              reference[link] = {}
            }
            if (typeof reference !== 'undefined' && reference &&
              typeof reference === 'object') {
              reference = reference[link]
            } else {
              reference = this.data
              return true
            }
          }, this)
          if (!_.isEqual(reference, this.data)) {
            const link = _.last(chain)
            if (reference && typeof reference === 'object' &&
              (!_.has(reference, link) || !_.isEqual(reference[link], value))) {
              reference[link] = value
              this.trigger('change:' + attr, this)
              this.trigger('change', this)
            }
          }
        } else if (!_.has(this.data, attr) || !_.isEqual(this.data[attr], value)) {
          this.data[attr] = value
          this.trigger('change:' + attr, this)
          this.trigger('change', this)
        }
      }
    }

    /**
     * @param attr
     * @param value
     */
    temp (attr, value) {
      this.set(attr, value)
      if (attr && typeof attr === 'object') {
        _.each(attr, function (value, attr) {
          this.temps[attr] = value
        }, this)
      } else {
        this.temps[attr] = value
      }
    }

    /**
     * @param attr
     * @param value
     * @returns {*}
     */
    add (attr, value) {
      // Ensure a placeholder exists
      if (!this.has(attr)) {
        this.set(attr, [])
      }

      // only add value if it's supplied (sometimes we want to create an empty
      // placeholder first)
      if (typeof value !== 'undefined' && !_.contains(this.data[attr], value)) {
        this.data[attr].push(value)
        return value
      }
    }

    /**
     * @param attr
     * @param value
     * @returns {*}
     */
    remove (attr, value) {
      // Note:
      // This needs to tree build into dot notation strings
      // then delete the keys for the values or remove an
      // element from an array.

      // console.log('remove:', attr, value === undefined ? 'straight' : 'element')
      if (value === undefined) {
        // FIXME: This needs to remove the dot notation references
        // delete this.data[attr];
      } else {
        // TODO: use dot notation for nested removal or _.without for array
        // values (these should be separate functions)
        this.data[attr] = _.without(this.data[attr], value)
      }
      // console.log('removed:', this.data[attr])
      return this.data[attr]
    }

    /**
     * @param attr
     * @returns {number}
     */
    iterate (attr) {
      if (!this.has(attr)) {
        this.set(attr, 0)
      }
      return ++this.data[attr]
    }

    /**
     * Clear all internal data
     */
    clear () {
      for (const attribute in this.data) {
        if (Object.prototype.hasOwnProperty.call(this.data, attribute)) {
          delete this.data[attribute]
        }
      }
    }

    /**
     * Clear all temporary data
     */
    clearTemp () {
      for (const attribute in this.temps) {
        if (Object.prototype.hasOwnProperty.call(this.temps, attribute)) {
          // delete this.data[attribute];
          // this.remove(attribute);
          delete this.temps[attribute]
        }
      }
    }
  }

  // Internal Collections
  Stratus.Collections = new Stratus.Prototypes.Model()
  Stratus.Models = new Stratus.Prototypes.Model()
  Stratus.Routers = new Stratus.Prototypes.Model()
  Stratus.Environment = new Stratus.Prototypes.Model(Stratus.Environment)

  // Sentinel Prototype
  // ------------------

  // This class intends to handle typical Sentinel operations.
  // TODO: Reevaluate this.
  /**
   * @returns {Stratus.Sentinel.Prototypes}
   * @constructor
   */
  Stratus.Prototypes.Sentinel = class Sentinel {
    constructor () {
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

    zero () {
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

    permissions (value) {
      if (!isNaN(value)) {
        _.each(value.toString(2).split('').reverse(), function (bit, key) {
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
        }, this)
      } else {
        let decimal = 0
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

    summary () {
      const output = []
      _.each(this, function (value, key) {
        if (typeof value === 'boolean' && value) {
          output.push(_.ucfirst(key))
        }
      })
      return output
    }
  }

  // TODO: rethink whether this should be in the core
  // This is the prototype for the toaster, in which one could be supplied
  // for a toast message, or one will automatically be created at runtime
  // using current arguments.
  /**
   * @param message
   * @param title
   * @param priority
   * @param settings
   * @constructor
   */
  Stratus.Prototypes.Toast = class Toast {
    constructor (message, title, priority, settings) {
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

  /**
   * @param request
   * @constructor
   */
  Stratus.Internals.XHR = function (request) {
    // Defaults
    this.method = 'GET'
    this.url = '/Api'
    this.data = {}
    this.type = ''

    /**
     * @param response
     * @returns {*}
     */
    this.success = function (response) {
      return response
    }

    /**
     * @param response
     * @returns {*}
     */
    this.error = function (response) {
      return response
    }

    // Customize & Hoist
    _.extend(this, request)
    const that = this

    // Make Request
    this.xhr = new window.XMLHttpRequest()
    const promise = new Promise(function (resolve, reject) {
      that.xhr.open(that.method, that.url, true)
      if (typeof that.type === 'string' && that.type.length) {
        that.xhr.setRequestHeader('Content-Type', that.type)
      }
      that.xhr.onload = function () {
        if (that.xhr.status >= 200 && that.xhr.status < 400) {
          let response = that.xhr.responseText
          if (_.isJSON(response)) {
            response = JSON.parse(response)
          }
          resolve(response)
        } else {
          reject(that.xhr)
        }
      }

      that.xhr.onerror = function () {
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

  // TODO: Compare this method with above
  // const XHR = (method, url, data) => new Promise((resolve, reject) => {
  //   const request = new XMLHttpRequest()
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
  /**
   * @type {*|Function|void}
   */
  // TODO: backbone was removed, so this needs to be rebuilt using native models
  Stratus.Internals.Anchor = (function Anchor () {
    Anchor.initialize = true
    /*
    return (typeof Backbone !== 'object') ? Anchor : Backbone.View.extend({
      el: 'a[href*=\\#]:not([href=\\#]):not([data-scroll="false"])',
      events: {
        click: 'clickAction'
      },
      clickAction: function (event) {
        if (window.location.pathname.replace(/^\//, '') ===
          event.currentTarget.pathname.replace(/^\//, '') &&
          window.location.hostname === event.currentTarget.hostname) {
          let reserved = ['new', 'filter', 'page', 'version']
          let valid = _.every(reserved, function (keyword) {
            return !_.startsWith(event.currentTarget.hash, '#' + keyword)
          }, this)
          if (valid) {
            if (typeof jQuery === 'function' && jQuery.fn && typeof Backbone === 'object') {
              let $target = jQuery(event.currentTarget.hash)
              let anchor = event.currentTarget.hash.slice(1)
              $target = ($target.length) ? $target : jQuery('[name=' + anchor + ']')
              // TODO: Ensure that this animation only stops propagation of click event son anchors that are confirmed to exist on the page
              if ($target.length) {
                jQuery('html,body').animate({
                  scrollTop: $target.offset().top
                }, 1000, function () {
                  Backbone.history.navigate(anchor)
                })
                return false
              }
            }
          }
        }
      }
    })
    */
  })()

  // Internal Convoy Builder
  // -----------------------

  // This function is simply a convoy builder for a SOAP-like API call.
  /**
   * @param route
   * @param meta
   * @param payload
   * @returns {*}
   * @constructor
   */
  Stratus.Internals.Api = function (route, meta, payload) {
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
      meta = { method: meta }
    }
    if (!_.has(meta, 'method')) {
      meta.method = 'GET'
    }

    return Stratus.Internals.Convoy({
      route: {
        controller: route
      },
      meta: meta,
      payload: payload
    })
  }

  // Internal Browser Compatibility
  // ------------------------------

  // This function gathers information about the Client's Browser
  // and respectively adds informational classes to the DOM's Body.
  /**
   * @constructor
   */
  Stratus.Internals.Compatibility = function () {
    const profile = []

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
    Stratus('body').addClass(profile.join(' '))
  }

  // Internal Convoy Dispatcher
  // --------------------------

  // This function allows Stratus to make SOAP-like API calls for
  // very specific, decoupled, data sets.
  /**
   * @param convoy
   * @param query
   * @returns {Promise}
   * @constructor
   */
  Stratus.Internals.Convoy = function (convoy, query) {
    return new Promise(function (resolve, reject) {
      if (convoy === undefined) {
        reject(new Stratus.Prototypes.Error({
          code: 'Convoy',
          message: 'No Convoy defined for dispatch.'
        }, this))
      }
      if (typeof jQuery === 'function' && jQuery.ajax) {
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
          success: function (response) {
            resolve(response)
            return response
          },
          error: function (response) {
            reject(
              new Stratus.Prototypes.Error({ code: 'Convoy', message: response },
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
          success: function (response) {
            response = response.payload || response
            resolve(response)
            return response
          },
          error: function (response) {
            reject(new Stratus.Prototypes.Error({
              code: 'Convoy',
              message: response
            }, this))
            return response
          }
        })
      }
    })
  }

  /**
   * @param url
   * @returns {Promise}
   * @constructor
   */
  Stratus.Internals.CssLoader = function (url) {
    return new Promise(function (resolve, reject) {
      /* Digest Extension */
      /*
      FIXME: Less files won't load correctly due to less.js not being able to parse new stylesheets after runtime
      let extension = /\.([0-9a-z]+)$/i;
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
      const link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = url

      /* Track Resolution */
      Stratus.Events.once('onload:' + url, function () {
        Stratus.CSS[url] = true
        resolve()
      })

      /* Capture OnLoad or Fallback */
      if ('onload' in link && !Stratus.Client.android) {
        link.onload = function () {
          Stratus.Events.trigger('onload:' + url)
        }
      } else {
        Stratus.CSS[url] = true
        Stratus.Events.trigger('onload:' + url)
      }

      /* Inject Link into Head */

      // TODO: Add the ability to prepend or append by a flagged option
      // Stratus('head').prepend(link);
      Stratus('head').append(link)
    })
  }

  /**
   * TODO: Move this to an underscore mixin
   * @param el
   * @returns {boolean}
   * @constructor
   */
  // FIXME: This would be better suited as a selector inside of Stratus.
  Stratus.Internals.GetColWidth = function (el) {
    if (typeof el === 'undefined' || !el) {
      return false
    }
    const classes = el.attr('class')
    if (typeof classes === 'undefined' || !classes) {
      return false
    }
    const regexp = /col-.{2}-([0-9]*)/g
    const match = regexp.exec(classes)
    if (typeof match === 'undefined' || !match) {
      return false
    }
    return typeof match[1] !== 'undefined' ? match[1] : false
  }

  // GetScrollDir()
  // --------------
  // Checks whether there has been any scroll yet, and returns down, up, or false
  /**
   * @returns {string}
   * @constructor
   */
  // FIXME: This would be better suited as non-jQuery, native logic in the selectors
  Stratus.Internals.GetScrollDir = function () {
    const windowTop = jQuery(Stratus.Environment.get('viewPort') || window).scrollTop()
    const lastWindowTop = Stratus.Environment.get('windowTop')
    /* *
  let windowHeight = jQuery(Stratus.Environment.get('viewPort') || window).height()
  let documentHeight = jQuery(document).height()
  /* */

    // return NULL if there is no scroll, otherwise up or down
    const down = lastWindowTop ? (windowTop > lastWindowTop) : false
    /* *
  let up = lastWindowTop ? (windowTop < lastWindowTop && (windowTop + windowHeight) < documentHeight) : false
  /* */
    const up = lastWindowTop ? (windowTop < lastWindowTop) : false
    return down ? 'down' : (up ? 'up' : false)
  }

  // IsOnScreen()
  // ---------------
  // Check whether an element is on screen, returns true or false.
  // FIXME: This would be better suited as a selector inside of Stratus.
  /**
   * @param el
   * @param offset
   * @param partial
   * @returns {boolean}
   * @constructor
   */
  Stratus.Internals.IsOnScreen = function (el, offset, partial) {
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
    const viewPort = Stratus.Environment.get('viewPort') || window
    const $viewPort = jQuery(viewPort)
    let pageTop = $viewPort.scrollTop()
    let pageBottom = pageTop + $viewPort.height()
    let elementTop = el.offset().top
    if (viewPort !== window) {
      elementTop += pageTop
    }
    const elementBottom = elementTop + el.height()
    pageTop = pageTop + offset
    pageBottom = pageBottom - offset
    /* *
  if (!Stratus.Environment.get('production')) {
    console.log('onScreen:',
      {
        el: el,
        pageTop: pageTop,
        pageBottom: pageBottom,
        elementTop: elementTop,
        elementBottom: elementBottom,
        offset: offset
      },
      partial ? (elementTop <= pageBottom && elementBottom >= pageTop) : (pageTop < elementTop && pageBottom > elementBottom)
    )
  }
  /* */
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
   * @param urls
   * @returns {Promise}
   * @constructor
   */
  Stratus.Internals.LoadCss = function (urls) {
    return new Promise(function (resolve, reject) {
      if (typeof urls === 'undefined' || typeof urls === 'function') {
        reject(new Stratus.Prototypes.Error({
          code: 'LoadCSS',
          message: 'CSS Resource URLs must be defined as a String, Array, or Object.'
        }, this))
      }
      if (typeof urls === 'string') {
        urls = [urls]
      }
      const cssEntries = {
        total: urls.length,
        iteration: 0
      }
      if (cssEntries.total > 0) {
        _.each(urls.reverse(), function (url) {
          cssEntries.iteration++
          const cssEntry = _.uniqueId('css_')
          cssEntries[cssEntry] = false
          if (typeof url === 'undefined' || !url) {
            cssEntries[cssEntry] = true
            if (cssEntries.total === cssEntries.iteration &&
              _.allTrue(cssEntries)) {
              resolve(cssEntries)
            }
          } else {
            Stratus.Internals.CssLoader(url).then(function (entry) {
              cssEntries[cssEntry] = true
              if (cssEntries.total === cssEntries.iteration &&
                _.allTrue(cssEntries)) {
                resolve(cssEntries)
              }
            }, reject)
          }
        })
      } else {
        reject(new Stratus.Prototypes.Error(
          { code: 'LoadCSS', message: 'No CSS Resource URLs found!' }, this))
      }
    })
  }

  // Stratus Environment Initialization
  // ----------------------------------

  // This needs to run after the jQuery library is configured.
  /**
   * @constructor
   */
  Stratus.Internals.LoadEnvironment = function () {
    const initialLoad = Stratus('body').attr('data-environment')
    if (initialLoad && typeof initialLoad === 'object' && _.size(initialLoad)) {
      Stratus.Environment.set(initialLoad)
    }
    // Environment Information
    let passiveEventOptions = false
    try {
      Stratus.Select(Stratus.Environment.get('viewPort') || window).addEventListener(
        'test',
        null,
        Object.defineProperty(
          {},
          'passive',
          {
            get: function () {
              passiveEventOptions = { passive: true }
            }
          }
        )
      )
    } catch (err) {}
    Stratus.Environment.set('passiveEventOptions', passiveEventOptions)
  }

  // Lazy Load Image
  // ---------------
  /**
   * @param obj
   * @returns {boolean}
   * @constructor
   */
  Stratus.Internals.LoadImage = function (obj) {
    if (!obj.el) {
      setTimeout(function () {
        Stratus.Internals.LoadImage(obj)
      }, 500)
      return false
    }
    const el = obj.el instanceof jQuery ? obj.el : jQuery(obj.el)
    if (!el.length) {
      setTimeout(function () {
        Stratus.Internals.LoadImage(obj)
      }, 500)
      return false
    }
    if (!el.hasClass('placeholder')) {
      el.addClass('placeholder')
      el.on('load', function () {
        el.removeClass('placeholder')
      })
    }
    if (Stratus.Internals.IsOnScreen(obj.spy || el) && !_.hydrate(el.attr('data-loading'))) {
      el.attr('data-loading', _.dehydrate(true))
      Stratus.DOM.complete(function () {
        // By default we'll load larger versions of an image to look good on HD
        // displays, but if you don't want that, you can bypass it with
        // data-hd="false"
        let hd = _.hydrate(el.attr('data-hd'))
        if (typeof hd === 'undefined') {
          hd = true
        }

        // Don't Get the Width, until it's "onScreen" (in case it was collapsed
        // offscreen originally)
        let src = _.hydrate(el.attr('data-src')) || el.attr('src') || null
        // NOTE: Element can be either <img> or any element with background image in style
        const type = el.prop('tagName').toLowerCase()

        // Handle precedence
        if (type === 'img' && (src === 'lazy' || _.isEmpty(src))) {
          src = el.attr('src')
        }
        if (_.isEmpty(src)) {
          return false
        }

        let size = _.hydrate(el.attr('data-size')) || obj.size || null

        // if a specific valid size is requested, use that
        // FIXME: size.indexOf should never return anything useful
        if (!size) {
          let width = null
          let unit = null
          let percentage = null

          if (el.width()) {
            // Check if there is CSS width hard coded on the element
            width = el.width()
          } else if (el.attr('width')) {
            width = el.attr('width')
          }

          // Digest Width Attribute
          if (width) {
            const digest = /([\d]+)(.*)/
            width = digest.exec(width)
            unit = width[2]
            width = parseInt(width[1])
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
            const visibilitySelector = _.hydrate(el.attr('data-ignore-visibility')) ? null : ':visible'
            const $visibleParent = jQuery(_.first(jQuery(obj.el).parents(visibilitySelector)))
            // let $visibleParent = obj.spy || el.parent()
            width = $visibleParent ? $visibleParent.width() : 0

            // If one of parents of the image (and child of the found parent) has
            // a bootstrap col-*-* set divide width by that in anticipation (e.g.
            // Carousel that has items grouped)
            const $col = $visibleParent.find('[class*="col-"]')

            if ($col.length > 0) {
              const colWidth = Stratus.Internals.GetColWidth($col)
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
            setTimeout(function () {
              el.attr('data-loading', _.dehydrate(false))
              Stratus.Internals.LoadImage(obj)
            }, 500)
            return false
          }

          // Double for HD
          if (hd) {
            width = width * 2
          }

          // Return the first size that is bigger than container width
          size = _.findKey(Stratus.Settings.image.size, function (s) {
            const ratio = s / width
            return (ratio > 0.85 && ratio < 1.15) || s > width
          })

          // default to largest size if the container is larger and it didn't
          // find a size
          size = size || 'hq'

          /* *
        if (!Stratus.Environment.get('production')) {
          console.log('size:', size, width, el)
        }
        /* */

          // Fail-safe for images that are sized too early
          if (size === 'xs') {
            setTimeout(function () {
              el.attr('data-loading', _.dehydrate(false))
              Stratus.Internals.LoadImage(obj)
            }, 1500)
          }
        }

        // Change Source to right size (get the base and extension and ignore
        // size)
        const srcOrigin = src
        const srcRegex = /^(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)/gi
        const srcMatch = srcRegex.exec(src)
        if (srcMatch !== null) {
          src = srcMatch[1] + '-' + size + '.' + srcMatch[3]
        } else {
          console.error('Unable to find file name for image src:', el)
        }

        // Start Loading
        el.addClass('loading')

        const srcOriginProtocol = srcOrigin.startsWith('//') ? window.location.protocol + srcOrigin : srcOrigin

        // Set up actions for onLoad and onError (if size doesn't exist, revert to srcOrigin)
        if (type === 'img') {
          // Add Listeners (Only once per Element!)
          el.on('load', function () {
            el.addClass('loaded').removeClass('loading')
          })
          el.on('error', function () {
            // TODO: Go down in sizes before reaching the origin
            el.attr('data-loading', _.dehydrate(false))
            el.attr('src', srcOriginProtocol)
            console.log('Unable to load', size.toUpperCase(), 'size.', 'Restored:', el.attr('src'))
          })
        } else {
          // If Background Image Create a Test Image to Test Loading
          const loadEl = jQuery('<img/>')
          loadEl.attr('src', srcOriginProtocol)
          loadEl.on('load', function () {
            el.addClass('loaded').removeClass('loading')
            jQuery(this).remove() // prevent memory leaks
          })
          loadEl.on('error', function () {
            // TODO: Go down in sizes before reaching the origin
            // Standardize src
            el.attr('data-loading', _.dehydrate(false))
            el.css('background-image', 'url(' + srcOriginProtocol + ')')
            console.log('Unable to load', size.toUpperCase(), 'size.', 'Restored:', srcOriginProtocol)
          })
        }

        // Change the Source to be the desired path (for image or background)
        const srcProtocol = src.startsWith('//') ? window.location.protocol + src : src
        el.attr('data-loading', _.dehydrate(false))
        el.attr('data-size', _.dehydrate(size))
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

  /**
   * @param options
   * @constructor
   */
  Stratus.Internals.Location = function (options) {
    return new Promise(function (resolve, reject) {
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
  /**
   * @param elements
   * @returns {boolean}
   * @constructor
   */
  Stratus.Internals.OnScroll = _.once(function (elements) {
    // Reset Elements:
    // if (!elements || elements.length === 0) return false;

    // Execute the methods for every registered object ONLY when there is a
    // change to the viewPort
    Stratus.Environment.on('change:viewPortChange', function (event, model) {
      if (!model.get('viewPortChange')) {
        return
      }
      model.set('lastScroll', Stratus.Internals.GetScrollDir())

      // Cycle through all the registered objects an execute their function
      // We must use the registered onScroll objects, because they get removed
      // in some cases (e.g. lazy load)
      // TODO: remove logic of RegisterGroup
      const elements = Stratus.RegisterGroup.get('OnScroll')

      _.each(elements, function (obj) {
        if (typeof obj !== 'undefined' && _.has(obj, 'method')) {
          obj.method(obj)
        }
      })
      model.set('viewPortChange', false)
      model.set('windowTop', jQuery(Stratus.Environment.get('viewPort') || window).scrollTop())
    })

    // Listen for Scrolling Updates
    // Note: You can't use event.preventDefault() in Passive Events
    const viewPort = Stratus.Select(Stratus.Environment.get('viewPort') || window)
    const viewPortChangeHandler = _.throttle(function () {
      /* *
      if (!Stratus.Environment.get('production')) {
        console.log('scrolling:', Stratus.Internals.GetScrollDir())
      }
      /* */
      if (Stratus.Environment.get('viewPortChange')) {
        return
      }
      Stratus.Environment.set('viewPortChange', true)
    }, 120)
    viewPort.addEventListener('scroll', viewPortChangeHandler, Stratus.Environment.get('passiveEventOptions'))
    // Resizing can change what's on screen so we need to check the scrolling
    viewPort.addEventListener('resize', viewPortChangeHandler, Stratus.Environment.get('passiveEventOptions'))

    // Run Once initially
    Stratus.DOM.complete(function () {
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
  /**
   * @param target
   * @param base
   * @constructor
   */
  /* *
Stratus.Internals.Rebase = function (target, base) {
  // TODO: Sanitize functions
  window[target] = _.extend(base, target)
  return target
}
/* */

  // Internal Resource Loader
  // ------------------------

  // This will either retrieve a resource from a URL and cache it
  // for future reference.
  /**
   * @param path
   * @param elementId
   * @returns {Promise}
   * @constructor
   */
  Stratus.Internals.Resource = function (path, elementId) {
    return new Promise(function (resolve, reject) {
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
        const meta = { path: path, dataType: 'text' }
        if (elementId !== undefined) {
          meta.elementId = elementId
        }
        Stratus.Internals.Api('Resource', meta, {}).then(function (data) {
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
   * @param params
   * @param url
   * @returns {string|*}
   * @constructor
   */
  Stratus.Internals.SetUrlParams = function (params, url) {
    // TODO: Add Controls for Deprecation Warnings...
    // console.warn('Stratus.Internals.SetUrlParams is deprecated. Use _.setUrlParams instead.')
    return _.setUrlParams(params, url)
  }

  // Track Location
  // --------------

  // This function requires more details.
  /**
   * @constructor
   */
  Stratus.Internals.TrackLocation = function () {
    const envData = {}
    // if (!Stratus.Environment.has('timezone'))
    envData.timezone = new Date().toString().match(/\((.*)\)/)[1]
    if (Stratus.Environment.get('trackLocation')) {
      if (Stratus.Environment.get('trackLocationConsent')) {
        Stratus.Internals.Location().then(function (pos) {
          envData.lat = pos.coords.latitude
          envData.lng = pos.coords.longitude
          Stratus.Environment.set('lat', pos.coords.latitude)
          Stratus.Environment.set('lng', pos.coords.longitude)
          Stratus.Internals.UpdateEnvironment(envData)
        }, function (error) {
          console.error('Stratus Location:', error)
        })
      } else {
        Stratus.Internals.XHR({
          url: 'https://ipapi.co/' + Stratus.Environment.get('ip') + '/json/',
          success: function (data) {
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
  /**
   * @param request
   * @returns {boolean}
   * @constructor
   */
  Stratus.Internals.UpdateEnvironment = function (request) {
    if (!request) {
      request = {}
    }
    if (typeof document.cookie !== 'string' ||
      !_.cookie('SITETHEORY')) {
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
        success: function (response) {
          const settings = response.payload || response
          if (typeof settings === 'object') {
            _.each(Object.keys(settings), function (key) {
              Stratus.Environment.set(key, settings[key])
            })
          }
        },
        error: function (error) {
          console.error('error:', error)
        }
      })
    }
  }

  /**
   * @type {{renderer: null, webgl: null, vendor: null, debugInfo: null}}
   */
  const rendererData = {
    webgl: null,
    debugInfo: null,
    vendor: null,
    renderer: null
  }

  /**
   * @param brief
   * @returns {*}
   * @constructor
   */
  Stratus.Internals.Renderer = function (brief) {
    if (rendererData.webgl) {
      return brief ? rendererData.renderer : rendererData
    }
    const canvas = document.createElement('canvas')
    try {
      rendererData.webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    } catch (e) {}
    if (!rendererData.webgl) {
      return brief ? rendererData.renderer : rendererData
    }
    rendererData.debugInfo = rendererData.webgl.getExtension('WEBGL_debug_renderer_info')
    rendererData.vendor = rendererData.webgl.getParameter(rendererData.debugInfo.UNMASKED_VENDOR_WEBGL)
    rendererData.renderer = rendererData.webgl.getParameter(rendererData.debugInfo.UNMASKED_RENDERER_WEBGL)
    return brief ? rendererData.renderer : rendererData
  }

  // TODO: Move to a module that loads separately
  /**
   * @constructor
   */
  Stratus.Loaders.Angular = () => {
    let requirement
    let nodes
    let injection

    // This contains references for the auto-loader below
    const container = {
      requirement: [],
      module: [],
      stylesheet: []
    }

    // TODO: Add references to this prototype in the tree builder, accordingly
    const injector = function (injection) {
      injection = injection || {}
      _.each(injection, function (element, attribute) {
        container[attribute] = container[attribute] || []
        if (_.isArray(element)) {
          _.each(element, function (value) {
            container[attribute].push(value)
          })
        } else {
          container[attribute].push(element)
        }
      })
    }

    _.each(Stratus.Roster, function (element, key) {
      if (typeof element === 'object' && element) {
        // sanitize roster fields without selector attribute
        if (_.isUndefined(element.selector) && element.namespace) {
          element.selector = _.filter(
            _.map(boot.configuration.paths, function (path, key) {
              // if (_.isString(key)) console.log(key.match(/([a-zA-Z]+)/g));
              return _.startsWith(key, element.namespace) ? (element.type === 'attribute' ? '[' : '') + _.camelToKebab(key.replace(element.namespace, 'stratus-')) + (element.type === 'attribute' ? ']' : '') : null
            })
          )
        }

        // digest roster
        if (_.isArray(element.selector)) {
          element.length = 0
          _.each(element.selector, function (selector) {
            nodes = document.querySelectorAll(selector)
            element.length += nodes.length
            if (nodes.length) {
              const name = selector.replace(/^\[/, '').replace(/]$/, '')
              requirement = element.namespace + _.lcfirst(_.kebabToCamel(name.replace(/^stratus/, '').replace(/^ng/, '')))
              if (_.has(boot.configuration.paths, requirement)) {
                injection = {
                  requirement: requirement
                }
                if (element.module) {
                  injection.module = _.isString(element.module) ? element.module : _.lcfirst(_.kebabToCamel(name + (element.suffix || '')))
                }
                injector(injection)
              }
            }
          })
        } else if (_.isString(element.selector)) {
          nodes = document.querySelectorAll(element.selector)
          element.length = nodes.length
          if (nodes.length) {
            const attribute = element.selector.replace(/^\[/, '').replace(/]$/, '')
            if (attribute && element.namespace) {
              _.each(nodes, function (node) {
                const name = node.getAttribute(attribute)
                if (name) {
                  requirement = element.namespace + _.lcfirst(_.kebabToCamel(name.replace('Stratus', '')))
                  if (_.has(boot.configuration.paths, requirement)) {
                    injector({
                      requirement: requirement
                    })
                  }
                }
              })
            } else if (element.require) {
              // TODO: add an injector to the container
              container.requirement = _.union(container.requirement, element.require)
              injection = {}
              if (element.module) {
                injection.module = _.isString(element.module) ? element.module : _.lcfirst(_.kebabToCamel(attribute + (element.suffix || '')))
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
    _.each(container, function (element, key) {
      container[key] = _.uniq(element)
    })
    window.container = container

    // Angular Injector
    if (container.requirement.length) {
      // Deprecated the use of the 'froala' directive for stratus-froala
      /* *
      if (_.contains(container.requirement, 'angular-froala')) {
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
        ].forEach(function (requirement) {
          container.requirement.push(requirement);
        });
      }
      /* */

      // We are currently forcing all filters to load because we don't have a selector to find them on the DOM, yet.
      Object.keys(boot.configuration.paths).filter(function (path) {
        return _.startsWith(path, 'stratus.filters.')
      }).forEach(function (requirement) {
        container.requirement.push(requirement)
      })

      // console.log('requirements:', container.requirement)

      require(container.requirement, function () {
        // App Reference
        angular.module('stratusApp', _.union(Object.keys(Stratus.Modules), container.module)).config(['$sceDelegateProvider', function ($sceDelegateProvider) {
          const whitelist = [
            'self',
            'http://*.sitetheory.io/**',
            'https://*.sitetheory.io/**'
          ]
          if (boot.host) {
            if (_.startsWith(boot.host, '//')) {
              _.each(['https:', 'http:'], function (proto) {
                whitelist.push(proto + boot.host + '/**')
              })
            } else {
              whitelist.push(boot.host + '/**')
            }
          }
          $sceDelegateProvider.resourceUrlWhitelist(whitelist)
        }])

        // TODO: Make Dynamic
        // Froala Configuration
        if (typeof jQuery === 'function' && jQuery.fn && jQuery.FroalaEditor) {
          jQuery.FroalaEditor.DEFAULTS.key = Stratus.Api.Froala

          // 'insertOrderedList', 'insertUnorderedList', 'createLink', 'table'
          const buttons = [
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
            fileUploadURL: 'https://app.sitetheory.io:3000/?session=' + _.cookie('SITETHEORY'),
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
        _.each(Stratus.Services, function (service) {
          angular.module('stratusApp').config(service)
        })

        // Components
        _.each(Stratus.Components, function (component, name) {
          angular.module('stratusApp').component('stratus' + _.ucfirst(name), component)
        })

        // Directives
        _.each(Stratus.Directives, function (directive, name) {
          angular.module('stratusApp').directive('stratus' + _.ucfirst(name), directive)
        })

        // Filters
        _.each(Stratus.Filters, function (filter, name) {
          angular.module('stratusApp').filter(_.lcfirst(name), filter)
        })

        // Controllers
        _.each(Stratus.Controllers, function (controller, name) {
          angular.module('stratusApp').controller(name, controller)
        })

        // Load CSS
        // TODO: Move this reference to the stylesheets block above
        const css = container.stylesheet
        const cssLoaded = Stratus('link[satisfies]').map(function (node) {
          return node.getAttribute('satisfies')
        })
        if (!_.contains(cssLoaded, 'angular-material.css') && 'angular-material' in boot.configuration.paths) {
          css.push(
            Stratus.BaseUrl + boot.configuration.paths['angular-material'].replace(/\.[^.]+$/, '.css')
          )
        }
        if (Stratus.Directives.Froala || Stratus('[froala]').length) {
          const froalaPath = boot.configuration.paths['froala'].replace(/\/[^/]+\/?[^/]+\/?$/, '')
          _.each([
            // FIXME this is sitetheory only
            Stratus.BaseUrl + 'sitetheorycore/css/sitetheory.codemirror.css',
            Stratus.BaseUrl + boot.configuration.paths['codemirror'].replace(/\/([^/]+)\/?$/, '') + '/codemirror.css',
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

        // FIXME: What is above this line is total crap

        if (css.length) {
          let counter = 0
          css.forEach(function (url) {
            Stratus.Internals.CssLoader(url)
              .then(function () {
                if (++counter !== css.length) {
                  return
                }
                angular.bootstrap(document.querySelector('html'), ['stratusApp'])
              })
          })
        } else {
          angular.bootstrap(document.querySelector('html'), ['stratusApp'])
        }
      })
    }
  }

  // Instance Clean
  // --------------

  // This function is meant to delete instances by their unique id for Garbage
  // Collection.
  /**
   * @param instances
   * @returns {boolean}
   * @constructor
   */
  Stratus.Instances.Clean = function (instances) {
    if (typeof instances === 'undefined') {
      console.error('Stratus.Instances.Clean() requires a string or array containing Unique ID(s).')
    } else if (typeof instances === 'string') {
      instances = [instances]
    }

    if (typeof instances === 'object' && Array.isArray(instances)) {
      _.each(instances, function (value) {
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

  // Aether System
  // --------------

  // This model handles all event related logic.
  class Aether extends Stratus.Prototypes.Model {
    constructor (data, options) {
      super(data, options)

      this.passiveSupported = false

      if (!Stratus.Environment.get('production')) {
        console.info('Aether Invoked!')
      }
      const that = this
      try {
        const options = {
          get passive () {
            that.passiveSupported = true
          }
        }
        window.addEventListener('test', options, options)
        window.removeEventListener('test', options, options)
      } catch (err) {
        that.passiveSupported = false
      }
      this.on('change', this.synchronize, this)
    }

    synchronize () {
      if (!Stratus.Environment.get('production')) {
        console.info('Aether Synchronizing...')
      }
      if (_.isEmpty(this.data)) {
        console.warn('synchronize: no data!')
      }
      _.each(this.data, function (event, key) {
        if (event.listening || !event.enabled) {
          return
        }
        if (Stratus.Environment.get('viewPort')) {
          console.warn('Aether does not support custom viewPorts:', Stratus.Environment.get('viewPort'))
        }
        (event.target || window).addEventListener(event.hook, event.method,
          this.passiveSupported ? {
            capture: true,
            passive: true
          } : false
        )
        event.listening = true
      }, this)
    }

    /**
     * @param options
     */
    listen (options) {
      let uid = null
      const event = new Stratus.Prototypes.Event(options)
      if (!event.invalid) {
        uid = _.uniqueId('event_')
        this.set(uid, event)
        Stratus.Instances[uid] = event
      }
      return uid
    }
  }

  Stratus.Aether = new Aether()

  // Chronos System
  // --------------

  // This model handles all time related jobs.
  class Chronos extends Stratus.Prototypes.Model {
    constructor (data, options) {
      super(data, options)
      if (!Stratus.Environment.get('production')) {
        console.info('Chronos Invoked!')
      }
      this.on('change', this.synchronize, this)
    }

    synchronize () {
      if (!Stratus.Environment.get('production')) {
        console.info('Chronos Synchronizing...')
      }
      if (_.isEmpty(this.changed)) {
        console.warn('synchronize: empty changeset!')
      }
      _.each(this.changed, function (job, key) {
        if (typeof key === 'string' && key.indexOf('.') !== -1) {
          key = _.first(key.split('.'))
          job = this.get(key)
        }
        if (!job.code && job.enabled) {
          job.code = setInterval(function (job) {
            job.method.call(job.scope)
          }, job.time * 1000, job)
        } else if (job.code && !job.enabled) {
          clearInterval(job.code)
          job.code = 0
        }
      }, this)
    }

    /**
     * @param time
     * @param method
     * @param scope
     * @returns {string|null}
     */
    queue (time, method, scope) {
      const job = time instanceof Stratus.Prototypes.Job ? time : new Stratus.Prototypes.Job(time, method, scope)
      if (job.time === null || typeof job.method !== 'function') {
        return null
      }
      const uid = _.uniqueId('job_')
      this.set(uid, job)
      Stratus.Instances[uid] = job
      return uid
    }

    /**
     * @param uid
     * @returns {boolean|*}
     */
    enable (uid) {
      if (!this.has(uid)) {
        return false
      }
      this.set(uid + '.enabled', true)
      return true
    }

    /**
     * @param uid
     * @returns {boolean|*}
     */
    disable (uid) {
      if (!this.has(uid)) {
        return false
      }
      this.set(uid + '.enabled', false)
      return true
    }

    /**
     * @param uid
     * @param value
     * @returns {boolean|*}
     */
    toggle (uid, value) {
      if (!this.has(uid)) {
        return false
      }
      this.set(uid + '.enabled', typeof value === 'boolean' ? value : !this.get(uid + '.enabled'))
      return true
    }
  }

  Stratus.Chronos = new Chronos()

  // Post Message Handling
  // ---------------------

  // This function executes when the window receives a Post Message
  // Convoy from another source as a (i.e. Window, iFrame, etc.)
  /**
   * @param fn
   * @constructor
   */
  Stratus.PostMessage.Convoy = function (fn) {
    window.addEventListener('message', function (event) {
      if (event.origin !== 'https://auth.sitetheory.io') {
        return false
      }
      fn(_.isJSON(event.data) ? JSON.parse(event.data) : {})
    }, false)
  }

  // When a message arrives from another source, handle the Convoy
  // appropriately.
  Stratus.PostMessage.Convoy(function (convoy) {
    // Single Sign On
    let ssoEnabled = _.cookie('sso')
    ssoEnabled = ssoEnabled === null ? true : (_.isJSON(ssoEnabled) ? JSON.parse(ssoEnabled) : false)
    if (ssoEnabled && convoy && convoy.meta && convoy.meta.session && convoy.meta.session !== _.cookie('SITETHEORY')) {
      _.cookie({
        name: 'SITETHEORY',
        value: convoy.meta.session,
        expires: '1w'
      })
      if (!Stratus.Client.safari) {
        window.location.reload(true)
      }
    }
  })

  // Local Storage Handling
  // ----------------------

  // This function executes when the window receives a keyed Local
  // Storage event, which can occur on any open tab within the
  // browser's session.
  /**
   * @param key
   * @param fn
   * @constructor
   */
  Stratus.LocalStorage.Listen = function (key, fn) {
    window.addEventListener('storage', function (event) {
      if (event.key !== key) {
        return
      }
      fn(event)
      // fn(_.isJSON(event.data) ? JSON.parse(event.data) : {})
    }, false)
  }

  // When an event arrives from any source, we will handle it
  // appropriately.
  Stratus.LocalStorage.Listen('stratus-core', function (data) {
    // console.log('LocalStorage:', data)
  })
  // localStorage.setItem('stratus-core', 'foo')

  // DOM Listeners
  // -------------

  // This function executes when the DOM is Ready, which means
  // the DOM is fully parsed, but still loading sub-resources
  // (CSS, Images, Frames, etc).
  /**
   * @param fn
   */
  Stratus.DOM.ready = function (fn) {
    (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn)
  }

  // This function executes when the DOM is Complete, which means
  // the DOM is fully parsed and all resources are rendered.
  /**
   * @param fn
   */
  Stratus.DOM.complete = function (fn) {
    (document.readyState === 'complete') ? fn() : window.addEventListener('load', fn)
  }

  // This function executes before the DOM has completely Unloaded,
  // which means the window/tab has been closed or the user has
  // navigated from the current page.
  /**
   * @param fn
   */
  Stratus.DOM.unload = function (fn) {
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

  Stratus.Events.once('initialize', function () {
    if (!Stratus.Environment.get('production')) {
      console.groupEnd()
      console.group('Stratus Initialize')
    }
    Stratus.Internals.LoadEnvironment()
    Stratus.Internals.Compatibility()
    Stratus.RegisterGroup = new Stratus.Prototypes.Model()

    // Handle Location
    Stratus.Internals.TrackLocation()

    // Load Angular
    Stratus.Loaders.Angular()

    // Load Views
    /* *
    Stratus.Internals.Loader().then(function (views) {
      if (!Stratus.Environment.get('production')) {
        console.info('Views:', views)
      }
      window.views = views
      Stratus.Events.on('finalize', function (views) {
        // TODO: backbone is gone, so rewrite this portion to record history so we can back/forward
        // Backbone.history.start()
        Stratus.Events.trigger('finalized', views)
      })
      Stratus.Events.trigger('finalize', views)
    }, function (error) {
      console.error('Stratus Loader:', error)
    })
    /* */
  })
  Stratus.Events.once('finalize', function () {
    if (!Stratus.Environment.get('production')) {
      console.groupEnd()
      console.group('Stratus Finalize')
    }

    // Load Internals
    if (Stratus.Internals.Anchor.initialize) {
      Stratus.Internals.Anchor = Stratus.Internals.Anchor()
    }
    const anchor = new Stratus.Internals.Anchor()
    if (!Stratus.Environment.get('production')) {
      console.log('Anchor:', anchor)
    }

    // Call Any Registered Group Methods that plugins might use, e.g. OnScroll
    if (Stratus.RegisterGroup.size()) {
      Stratus.RegisterGroup.each(function (objs, key) {
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
  Stratus.Events.once('terminate', function () {
    if (!Stratus.Environment.get('production')) {
      console.groupEnd()
      console.group('Stratus Terminate')
    }
  })

  // This event supports both Native and Bootbox styling to generate
  // an alert box with an optional message and handler callback.
  Stratus.Events.on('alert', function (event, message, handler) {
    if (!(message instanceof Stratus.Prototypes.Bootbox)) {
      message = new Stratus.Prototypes.Bootbox(message, handler)
    }
    /* if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') { */
    if (typeof bootbox !== 'undefined') {
      bootbox.alert(message.message, message.handler)
    } else {
      window.alert(message.message)
      message.handler()
    }
  })

  // This event supports both Native and Bootbox styling to generate
  // a confirmation box with an optional message and handler callback.
  Stratus.Events.on('confirm', function (event, message, handler) {
    if (!(message instanceof Stratus.Prototypes.Bootbox)) {
      message = new Stratus.Prototypes.Bootbox(message, handler)
    }
    /* if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') { */
    if (typeof bootbox !== 'undefined') {
      bootbox.confirm(message.message, message.handler)
    } else {
      handler(window.confirm(message.message))
    }
  })

  // This event allows a Notification to reach the browser.
  Stratus.Events.on('notification', function (event, message, title) {
    const options = {}
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
    } else if (window.Notification.permission === 'granted') {
      notification = new window.Notification(options.title, {
        body: options.message,
        icon: options.icon
      })
      if (!Stratus.Environment.get('production')) {
        console.log(notification)
      }
    } else if (window.Notification.permission !== 'denied') {
      window.Notification.requestPermission(function (permission) {
        if (permission === 'granted') {
          notification = new window.Notification(options.title, {
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
  Stratus.Events.on('toast', function (event, message, title, priority, settings) {
    if (!(message instanceof Stratus.Prototypes.Toast)) {
      message = new Stratus.Prototypes.Toast(message, title, priority, settings)
    }
    if (!Stratus.Environment.get('production')) {
      console.log('Toast:', message)
    }
    if (typeof jQuery !== 'undefined' && jQuery.toaster) {
      jQuery.toaster(message)
    } else {
      Stratus.Events.trigger('alert', message.message)
    }
  })

  // DOM Ready Routines
  // ------------------
  // On DOM Ready, add browser compatible CSS classes and digest DOM data-entity
  // attributes.
  Stratus.DOM.ready(function () {
    Stratus('body').removeClass('loaded unloaded').addClass('loading')
    Stratus.Events.trigger('initialize')
  })

  // DOM Complete Routines
  // ---------------------

  // Stratus Events are more accurate than the DOM, so nothing is added to this
  // stub.
  Stratus.DOM.complete(function () {
    // Renderer Detection
    const renderer = Stratus.Internals.Renderer()
    Stratus.Environment.set('render', renderer)

    // List Qualified Vendors
    const qualified = {
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

    const quality = (
      (renderer.vendor && qualified.vendors.indexOf(renderer.vendor) >= 0) ||
      (renderer.renderer && _.map(qualified.renderers, (renderer) => _.startsWith(renderer, renderer.renderer).length))
    ) ? 'high' : 'low'

    Stratus.Environment.set('quality', quality)

    // Handle Classes (for Design Timing)
    Stratus('body').removeClass('loading unloaded').addClass(`loaded quality-${quality}`)

    // Load Angular 8+
    if (!hamlet.isUndefined('System')) {
      require([
        // 'quill',
        '@stratus/angular/boot'
      ])
    }
  })

  // DOM Unload Routines
  // -------------------

  // On DOM Unload, all inherent Stratus functions will cleanly
  // break any open connections or currently operating routines,
  // while providing the user with a confirmation box, if necessary,
  // before close routines are triggered.
  Stratus.DOM.unload(function (event) {
    Stratus('body').removeClass('loading loaded').addClass('unloaded')
    Stratus.Events.trigger('terminate', event)
    /* *
    if (event.cancelable === true) {
        // TODO: Check if any unsaved changes exist on any Stratus Models then request confirmation of navigation
        event.preventDefault();
        let confirmationMessage = 'You have pending changes, if you leave now, they may not be saved.';
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    }
    /* */
  })

  // Handle Scope
  // ------------

  // Return the Stratus Object so it can be attached in the correct context as either a Global Variable or Object Reference
  exports = Stratus
  return Stratus
}))
