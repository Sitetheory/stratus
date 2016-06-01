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


// Plugin
// ======

// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.plugins.help", ["stratus", "jquery", "bootstrap", "stratus.views.plugins.popover"], function (Stratus, $) {

    // Popover
    // -------------

    // The Popover view is very simple and extends the Backbone View (not the base view like many other widgets)
    Stratus.Views.Plugins.Help = Stratus.Views.Plugins.Popover.extend({

        style: function() {
            this.$el.addClass('btn-help glyphicon glyphicon-question-sign');
        }

    });


    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
