// Environment
// -----------

var boot = {
    // Environment
    dev: (typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1),
    local: (typeof document.cookie === 'string' && document.cookie.indexOf('local=') !== -1),
    cacheTime: cacheTime || '1',

    // Locations
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
boot.config = function (configuration) {
    if (typeof configuration !== 'object') return false;
    boot.merge(boot.configuration, (!configuration.paths) ? { paths: configuration } : configuration);
    return requirejs.config ? requirejs.config(boot.configuration) : boot.configuration;
};
