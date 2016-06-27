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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'underscore', 'stratus.views.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Plugins Base
    // -------------

    // Like a MoreBox but attached to the side and pushes the app body over. Will only allow one drawer to
    // be open at a time.
    Stratus.Views.Plugins.Base = Stratus.Views.Base.extend({

        // prepare()
        // ---------
        // This should be added to the initialize of every plugin.
        prepare: function (options) {
            this.uid = (_.has(options, 'uid')) ? options.uid : null;
            this.plugin = (_.has(options, 'plugin')) ? options.plugin.toLowerCase() : null;
            this.view = options.view;
            Stratus.Internals.LoadCss(Stratus.BaseUrl + 'sitetheorycore/css/Core/plugins.css');
        }
    });

}));
