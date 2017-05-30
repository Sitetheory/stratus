//     Stratus.Views.Plugins.Help.js 1.0

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

// Examples
// ========

// Data Attributes to Control Options
// ----------------------------------
// See Popover plugin for details. This Help just extends popover with a standard class for the icon.

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'zepto', 'underscore', 'bootstrap', 'stratus.views.plugins.base', 'stratus.views.plugins.popover'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Help Popover
    // ------------

    // The Popover view is very simple and extends the Backbone View (not the base view like many other widgets)
    Stratus.Views.Plugins.Help = Stratus.Views.Plugins.Popover.extend({
        style: function () {
            this.$el.addClass('btn-help glyphicon glyphicon-question-sign');
        }
    });

}));
