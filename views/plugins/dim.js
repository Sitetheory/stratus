//     Stratus.Views.Plugins.Dim.js 1.0

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

// Plugin
// ======

// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.plugins.dim", ["stratus", "jquery", "stratus.views.plugins.base"], function (Stratus, $) {

    // Dim
    // -------------

    // Add a dim class to the body so that the body can be styled to be black background and the
    // app can be styled to be opacity .2 (as defined in the site CSS)
    Stratus.Views.Plugins.Dim = Stratus.Views.Plugins.Base.extend({

        events: {
            'click': 'toggle'
        },
        initialize: function(options) {
            this.prepare(options);
        },
        toggle: function (event) {
            $('body').toggleClass('dim');
        }

    });

    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
