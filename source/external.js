/* global _, jQuery, angular */

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
    let request = {
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
      let search = new RegExp('(?:^' + request.name + '|;\\s*' + request.name +
        ')=(.*?)(?:;|$)', 'g')
      let data = search.exec(document.cookie)
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
      let lowest = _.min(list)
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
    let shallow = _.clone(obj)
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
    let vars = {}
    let tail = window.location.hash
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
      let timePairs = str.match(
        /([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/gi)
      if (_.size(timePairs)) {
        let digest = /([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/i
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
   * @param target
   * @param search
   * @returns {boolean}
   */
  startsWith: function (target, search) {
    return (typeof target === 'string' && target.substr(0, search.length).toLowerCase() === search.toLowerCase())
  },
  /**
   * @param target
   * @param search
   * @returns {boolean}
   */
  endsWith: function (target, search) {
    return (typeof target === 'string' && target.substr(target.length - search.length, target.length).toLowerCase() === search.toLowerCase())
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
    let patch = {}
    let processor = {
      eax: undefined,
      ebx: undefined,
      ecx: undefined,
      edx: undefined
    }
    if (!_.isObject(priorData) || !_.size(priorData)) {
      console.error('bad prior:', priorData)
    } else {
      let detect = function (value, key) {
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
   * @param a
   * @param b
   * @returns {number}
   */
  strcmp: function (a, b) {
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

    let arr = target.replace(/</g, '\n<')
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
    let tagStack = []
    // let more = false

    for (let i = 0; i < arr.length; i++) {
      row = arr[i]

      // count multiple spaces as one character
      let rowCut = row.replace(/[ ]+/g, ' ')

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
