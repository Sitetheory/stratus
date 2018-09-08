/* global Stratus, _, $, Backbone */

/**
 * @param request
 * @constructor
 */
Stratus.Internals.Ajax = function (request) {
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
  var that = this

  // Make Request
  this.xhr = new window.XMLHttpRequest()
  var promise = new Promise(function (resolve, reject) {
    that.xhr.open(that.method, that.url, true)
    if (typeof that.type === 'string' && that.type.length) {
      that.xhr.setRequestHeader('Content-Type', that.type)
    }
    that.xhr.onload = function () {
      if (that.xhr.status >= 200 && that.xhr.status < 400) {
        var response = that.xhr.responseText
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

// Internal Anchor Capture
// -----------------------

// This function allows anchor capture for smooth scrolling before propagation.
/**
 * @type {*|Function|void}
 */
Stratus.Internals.Anchor = (function Anchor () {
  Anchor.initialize = true
  return (typeof Backbone !== 'object') ? Anchor : Backbone.View.extend({
    el: 'a[href*=\\#]:not([href=\\#]):not([data-scroll="false"])',
    events: {
      click: 'clickAction'
    },
    clickAction: function (event) {
      if (window.location.pathname.replace(/^\//, '') ===
        event.currentTarget.pathname.replace(/^\//, '') &&
        window.location.hostname === event.currentTarget.hostname) {
        var reserved = ['new', 'filter', 'page', 'version']
        var valid = _.every(reserved, function (keyword) {
          return !_.startsWith(event.currentTarget.hash, '#' + keyword)
        }, this)
        if (valid) {
          if (typeof $ === 'function' && $.fn && typeof Backbone === 'object') {
            var $target = $(event.currentTarget.hash)
            var anchor = event.currentTarget.hash.slice(1)
            $target = ($target.length) ? $target : $('[name=' + anchor + ']')
            /* TODO: Ensure that this animation only stops propagation of click event son anchors that are confirmed to exist on the page */
            if ($target.length) {
              $('html,body').animate({
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
    meta = {method: meta}
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
  var profile = []

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
    if (typeof $ === 'function' && $.ajax) {
      $.ajax({
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
            new Stratus.Prototypes.Error({code: 'Convoy', message: response},
              this))
          return response
        }
      })
    } else {
      Stratus.Internals.Ajax({
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
         var extension = /\.([0-9a-z]+)$/i;
         extension = extension.exec(url);
         */
    /* Verify Identical Calls */
    if (url in Stratus.CSS) {
      if (Stratus.CSS[url]) {
        resolve()
      } else {
        Stratus.Events.once('onload:' + url, resolve)
      }
    } else {
      /* Set CSS State */
      Stratus.CSS[url] = false

      /* Create Link */
      var link = document.createElement('link')
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
    }
  })
}

/**
 * TODO: Move this to an underscore mixin
 * @param el
 * @returns {boolean}
 * @constructor
 */
Stratus.Internals.GetColWidth = function (el) {
  var classes = el.attr('class')
  var regexp = /col-.{2}-([0-9]*)/g
  var match = regexp.exec(classes)
  return (typeof match[1] !== 'undefined') ? match[1] : false
}

// GetScrollDir()
// --------------
// Checks whether there has been any scroll yet, and returns down, up, or false
/**
 * @returns {string}
 * @constructor
 */
Stratus.Internals.GetScrollDir = function () {
  /* *
  var app = $('#app')
  var viewPort = app[0] !== undefined ? app : $(window)
  /* */
  var windowTop = $(window).scrollTop()
  var lastWindowTop = Stratus.Environment.get('windowTop')
  /* *
  var windowHeight = $(window).height()
  var documentHeight = $(document).height()
  /* */

  // return NULL if there is no scroll, otherwise up or down
  var down = lastWindowTop ? (windowTop > lastWindowTop) : false
  /* *
  var up = lastWindowTop ? (windowTop < lastWindowTop && (windowTop + windowHeight) < documentHeight) : false
  /* */
  var up = lastWindowTop ? (windowTop < lastWindowTop) : false
  return down ? 'down' : (up ? 'up' : false)
}

// IsOnScreen()
// ---------------
// Check whether an element is on screen, returns true or false.
/**
 * @param el
 * @param offset
 * @returns {boolean}
 * @constructor
 */
Stratus.Internals.IsOnScreen = function (el, offset) {
  el = Stratus(el)
  offset = offset || 0
  var position = {
    wt: document.body.scrollTop,
    et: el.offset().top || null
  }
  /* *
  if (!Stratus.Environment.get('production')) {
    console.log('position:', position)
  }
  /* */
  position.wb = position.wt + document.body.offsetHeight
  position.eb = el.height() + (position.et || 0)
  /* *
  if (!Stratus.Environment.get('production')) {
    console.log('OnScreen:', el, position.eb >= (position.wt + offset) && position.et <= (position.wb - offset))
  }
  /* */
  return position.eb >= (position.wt + offset) && position.et <=
    (position.wb - offset)
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
    var cssEntries = {
      total: urls.length,
      iteration: 0
    }
    if (cssEntries.total > 0) {
      _.each(urls.reverse(), function (url) {
        cssEntries.iteration++
        var cssEntry = _.uniqueId('css_')
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
        {code: 'LoadCSS', message: 'No CSS Resource URLs found!'}, this))
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
  var initialLoad = Stratus('body').attr('data-environment')
  if (initialLoad && typeof initialLoad === 'object' && _.size(initialLoad)) {
    Stratus.Environment.set(initialLoad)
  }
}

// Lazy Load Image
// ---------------
/**
 * @param obj
 * @returns {boolean}
 * @constructor
 */
Stratus.Internals.LoadImage = function (obj) {
  var el = Stratus(obj.el)
  el.addClass('placeholder')
  if (Stratus.Internals.IsOnScreen(obj.spy) && !el.attr('data-loading')) {
    el.attr('data-loading', true)
    Stratus.DOM.complete(function () {
      // By default we'll load larger versions of an image to look good on HD
      // displays, but if you don't want that, you can bypass it with
      // data-hd="false"
      var hd = el.attr('data-hd')
      if (typeof hd === 'undefined') {
        hd = true
      }

      // Don't Get the Width, until it's "onScreen" (in case it was collapsed
      // offscreen originally)
      var src = el.attr('data-src')

      // Handle precedence
      if (!src || src === 'lazy') {
        src = el.attr('src')
      }

      var size = null

      // if a specific valid size is requested, use that
      // FIXME: size.indexOf should never return anything useful
      if (el.attr('data-size') &&
        size.indexOf(el.attr('data-size')) !== false) {
        size = el.attr('data-size')
      } else {
        var width = null
        var unit = null
        var percentage = null

        if (el.width()) {
          // Check if there is CSS width hard coded on the element
          width = el.width()
        } else if (el.attr('width')) {
          width = el.attr('width')
        }

        // Digest Width Attribute
        if (width) {
          var digest = /([\d]+)(.*)/
          width = digest.exec(width)
          unit = width[2]
          width = parseInt(width[1])
          percentage = unit === '%' ? (width / 100) : null
        }

        // FIXME: This should only happen if the CSS has completely loaded.
        // Gather Container (Calculated) Width
        if (!width || unit === '%') {
          // FIXME: This is jquery and I wrote a possibly long-term solution
          // natively
          /* *
              // If there is no CSS width, calculate the parent container's width
              // The image may be inside an element that is invisible (e.g. Carousel has items display:none)
              // So we need to find the first parent that is visible and use that width
              // NOTE: when lazy-loading in a slideshow, the containers that determine the size, might be invisible
              // so in some cases we need to flag to find the parent regardless of invisibility.
              var visibilitySelector = el.attr('data-ignorevisibility') ? null : ':visible';
              var $visibleParent = $(_.first($(obj.el).parents(visibilitySelector)));
              /* */

          var $visibleParent = el.parent()
          width = $visibleParent ? $visibleParent.width() : 0

          // If one of parents of the image (and child of the found parent) has
          // a bootstrap col-*-* set divide width by that in anticipation (e.g.
          // Carousel that has items grouped)
          var $col = $visibleParent.find('[class*="col-"]')

          if ($col.length > 0) {
            var colWidth = Stratus.Internals.GetColWidth($col)
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
          el.attr('data-loading', false)
          setTimeout(function () {
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
          var ratio = s / width
          return ((ratio > 0.85 && ratio < 1.15) || s > width)
        })

        // default to largest size if the container is larger and it didn't
        // find a size
        size = size || 'hq'
      }

      // Change Source to right size (get the base and extension and ignore
      // size)
      var srcRegex = /^(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)/gi
      var srcMatch = srcRegex.exec(src)
      src = srcMatch[1] + '-' + size + '.' + srcMatch[3]

      // Change the Source to be the desired path
      el.attr('src', src.startsWith('//') ? window.location.protocol + src : src)
      el.addClass('loading')
      if (obj.el.load) {
        obj.el.load(function () {
          el.addClass('loaded').removeClass('placeholder loading')
        })
      } else {
        el.addClass('loaded').removeClass('placeholder loading')
      }

      // Remove from registration
      Stratus.RegisterGroup.remove('OnScroll', obj)
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
  Stratus.Environment.on('change:viewPortChange', function (model) {
    if (model.get('viewPortChange')) {
      model.set('lastScroll', Stratus.Internals.GetScrollDir())

      // Cycle through all the registered objects an execute their function
      // We must use the registered onScroll objects, because they get removed
      // in some cases (e.g. lazy load)
      var elements = Stratus.RegisterGroup.get('OnScroll')

      _.each(elements, function (obj) {
        if (typeof obj !== 'undefined' && _.has(obj, 'method')) {
          obj.method(obj)
        }
      })
      /* *
      var app = $('#app')
      var viewPort = app[0] !== undefined ? app : $(window)
      /* */
      model.set('viewPortChange', false)
      model.set('windowTop', $(window).scrollTop())
    }
  })

  // jQuery Binding
  if (typeof $ === 'function' && $.fn) {
    /* *
    var app = $('#app')
    var viewPort = app[0] !== undefined ? app : $(window)
    /* */
    $(window).scroll(function () {
      /* *
      if (!Stratus.Environment.get('production')) {
        console.log('scrolling:', Stratus.Internals.GetScrollDir())
      }
      /* */
      if (Stratus.Environment.get('viewPortChange') === false) {
        Stratus.Environment.set('viewPortChange', true)
      }
    })

    // Resizing can change what's on screen so we need to check the scrolling
    $(window).resize(function () {
      if (Stratus.Environment.get('viewPortChange') === false) {
        Stratus.Environment.set('viewPortChange', true)
      }
    })
  }

  // Run Once initially
  Stratus.Environment.set('viewPortChange', true)
})

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
      var meta = {path: path, dataType: 'text'}
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
 * @param params
 * @param url
 * @returns {string|*}
 * @constructor
 */
Stratus.Internals.SetUrlParams = function (params, url) {
  // FIXME: This can't handle anchors correctly
  if (typeof url === 'undefined') {
    url = window.location.href
  }
  if (typeof params === 'undefined') {
    return url
  }
  var vars = {}
  var glue = url.indexOf('?')
  var anchor = url.indexOf('#')
  var tail = ''
  if (anchor >= 0) {
    tail = url.substring(anchor, url.length)
    url = url.substring(0, anchor)
  }
  url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value
  })
  vars = _.extend(vars, params)
  return ((glue >= 0 ? url.substring(0, glue) : url) + '?' +
    _.reduce(_.map(vars, function (value, key) {
      return key + '=' + value
    }), function (memo, value) {
      return memo + '&' + value
    }) + tail)
}

// Track Location
// --------------

// This function requires more details.
/**
 * @constructor
 */
Stratus.Internals.TrackLocation = function () {
  var envData = {}
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
      Stratus.Internals.Ajax({
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
    Stratus.Internals.Ajax({
      method: 'PUT',
      url: '/Api/Session', // auth.sitetheory.io
      data: request,
      type: 'application/json',
      success: function (response) {
        var settings = response.payload || response
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
