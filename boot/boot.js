//     Boot.Boot.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

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
