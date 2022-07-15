// Initializer
// -----------

(function (root) {
  // Ensure Boot is available
  if (typeof root.boot === 'undefined') {
    console.error('boot does not exist!')
    return
  }

  // Localize Dependencies
  const boot = root.boot
  const requirejs = root.requirejs
  const System = root.System
  const steal = root.steal

  // TODO: Remove the appendJS function in a new version of boot to ensure we can use any extension we prefer
  const appendJS = function (paths) {
    if (typeof paths !== 'object' || !paths) {
      return paths
    }
    const extensions = [
      '.cjs',
      '.mjs',
    ]
    for (const path in paths) {
      if (!Object.prototype.hasOwnProperty.call(paths, path)) {
        continue
      }
      const module = paths[path]
      if (typeof module !== 'string') {
        continue
      }
      if (extensions.some(ext => module.endsWith(ext))) {
        continue
      }
      paths[path] = module + '.js'
    }
    return paths
  }

  // TODO: Move things like this to the Hamlet library
  const fullUrl = function (path) {
    if (typeof path !== 'string') {
      return path
    }
    if (path.startsWith('//')) {
      return path
    }
    if (!path.startsWith('/')) {
      return path
    }
    return `${location.origin + path}`
  }

  if (typeof requirejs !== 'undefined') {
    // Handle RequireJS Detection
    // TODO: We need to clone the boot configuration because Require.js will change the reference directly
    requirejs.config(boot.configuration)
  } else if (typeof steal !== 'undefined' && typeof steal.config === 'function') {
    // Handle StealJS Detection
    // Require.js Config Conversion
    const config = boot.configuration
    config.baseURL = typeof config.baseUrl === 'string' ? config.baseUrl : '/'
    config.cacheKey = 'v'
    config.cacheVersion = boot.cacheTime
    // config.configMain = '@empty'
    if (typeof config.paths === 'object' && config.paths) {
      config.paths = appendJS(config.paths)
    }
    // Inject into Steal Dynamically
    steal.config(config)
    console.log('StealJS configured dynamically for SystemJS support')
  } else if (typeof System !== 'undefined' && typeof System.config === 'function') {
    // Handle Legacy SystemJS Detection
    System.config(boot.configuration)
    console.log('SystemJS configured dynamically')
  } else if (typeof System !== 'undefined') {
    // Handle Modern SystemJS Detection
    // ImportMap Injector
    // const inject = function (paths) {
    //   const configEl = document.createElement('script')
    //   configEl.setAttribute('type', 'systemjs-importmap')
    //   configEl.text = JSON.stringify({ imports: paths })
    //   document.head.appendChild(configEl)
    // }
    // Dynamic Module Resolution
    const constants = {}
    const wildcards = {}
    const dynamicModuleResolution = function (id) {
      if (typeof id !== 'string') {
        return false
      }
      if (typeof constants[id] === 'string') {
        return constants[id]
      }
      // Check Wildcards for a match
      const matches = {}
      for (const path in wildcards) {
        if (!Object.prototype.hasOwnProperty.call(wildcards, path)) {
          continue
        }
        const data = wildcards[path]
        const re = new RegExp(data.re)
        const digest = re.exec(id)
        if (!digest || !digest.length || digest.length < 2) {
          continue
        }
        matches[path] = data.path.replace('*', digest[1])
      }
      const matchPaths = Object.keys(matches)
      if (!matchPaths.length) {
        return false;
      }
      const bestPath = matchPaths.reduce((memo, value) => memo.length >= value.length ? memo : value)
      if (!bestPath) {
        return false;
      }
      return matches[bestPath]
    }
    // SystemJS Resolver Hook
    const originalResolve = System.constructor.prototype.resolve
    System.constructor.prototype.resolve = function (id) {
      try {
        return originalResolve.apply(this, arguments)
      } catch (err) {
        // console.log('error:', err)
        if (typeof id === 'string' && id.startsWith('.')) {
          console.log(id)
        }
        const modulePath = dynamicModuleResolution(id)
        if (modulePath) {
          return fullUrl(modulePath)
        }
        throw err
      }
    }
    // Handle Config Paths
    const config = boot.configuration
    if (typeof config.paths === 'object' && config.paths) {
      for (const path in config.paths) {
        if (!Object.prototype.hasOwnProperty.call(config.paths, path)) {
          continue
        }
        // const pathUrl = `${boot.cdn + boot.relative + config.paths[path]}.js${boot.cacheTime ? '?v=' + boot.cacheTime : ''}`
        const pathUrl = `${boot.cdn + boot.relative + config.paths[path]}.js`
        if (path.endsWith('*')) {
          const pathRe = path.replace('/', '\\/').replace('*', '(.*)')
          wildcards[path] = {
            path: pathUrl,
            re: pathRe,
          }
          continue
        }
        constants[path] = pathUrl
        // const singlePath = {}
        // singlePath[path] = pathUrl
        // inject(singlePath)
      }
      // TODO: Order the constants in terms of length, descending, to ensure the most accurate representation gets matched
    }
    console.log('SystemJS configured through dynamic module hook.')
    // console.log('SystemJS configured through head element.')
  } else {
    console.warn('Module Loader not detected!')
  }

  // throw "it begins!"

  // Begin Warm-Up
  if (typeof System !== 'undefined' && typeof System.import === 'function') {
    System.import('@stratusjs/runtime/stratus')
      .then(function () {
        console.log('Stratus initialized through SystemJS')
      })
  } else if (typeof require !== 'undefined') {
    require(['@stratusjs/runtime/stratus'])
  }
})(this)
