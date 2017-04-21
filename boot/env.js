// Environment
// -----------

var boot = {
    // Environment
    dev: (typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1),
    local: (typeof document.cookie === 'string' && document.cookie.indexOf('local=') !== -1) || true, // we are disabling the CDN until it is ready.
    cacheTime: (typeof cacheTime !== 'undefined') ? cacheTime : '2',

    // Locations
    host: '',
    cdn: '/',
    relative: '',
    bundle: '',

    // Require.js
    configuration: {}
};
boot.suffix = (boot.dev) ? '' : '.min';
boot.dashSuffix = (boot.dev) ? '' : '-min';
boot.directory = (boot.dev) ? '' : 'min/';
boot.merge = function (destination, source) {
    if (destination === null || source === null) return destination;
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            destination[key] = (typeof destination[key] === 'object') ? boot.merge(destination[key], source[key]) : source[key];
        }
    }
    return destination;
};
boot.config = function (configuration, options) {
    if (typeof configuration !== 'object') return false;
    /* *
    if (typeof options !== 'object') options = {};
    var args = [
        boot.configuration,
        !configuration.paths ? { paths: configuration } : configuration
    ];
    if (typeof boot.merge === 'function') {
        boot.merge.apply(this, options.inverse ? args.reverse() : args);
    }
    return requirejs.config ? requirejs.config(boot.configuration) : boot.configuration;
    /* */
    return boot.merge(boot.configuration, !configuration.paths ? { paths: configuration } : configuration);
};
if (typeof config !== 'undefined') {
    if (typeof config === 'function') {
        config = config(boot);
    }
    if (typeof config === 'object' && config) {
        boot.config(config);
    }
}
