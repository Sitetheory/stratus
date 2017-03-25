// Initializer
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
boot.config = function (configuration) {
    console.log('configure:', boot.configuration, configuration);
};

// Examples
// --------

/* *
boot.config({
    shim: {
        //
    },
    paths: {
        foo: 'bar.js'
    }
});
boot.config({
    foo: 'bar.js'
});
/* */
