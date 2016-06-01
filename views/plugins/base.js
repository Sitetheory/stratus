//     Stratus.Views.Plugins.Base.js 1.0

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


// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.plugins.base", ["stratus", "backbone"], function (Stratus, Backbone) {

    // Plugins Base
    // -------------

    // Like a MoreBox but attached to the side and pushes the app body over. Will only allow one drawer to
    // be open at a time.
    Stratus.Views.Plugins.Base = Backbone.View.extend({

        // prepare()
        // ---------
        // This should be added to the initialize of every plugin.
        prepare: function (options) {

            this.uid = (_.has(options, 'uid')) ? options.uid : null;
            this.plugin = options.plugin.toLowerCase();
            this.view = options.view;

            // TODO: load from the CDN
            Stratus.Internals.LoadCss('/sitetheory/v/1/0/bundles/sitetheorycore/css/Core/plugins.css');
        }
    });


    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
