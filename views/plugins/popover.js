//     Stratus.Views.Plugins.Popover.js 1.0

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
// The options below are the standard Bootstrap popover options. If you need to manipulate the widget, you can set data attributes to change the default values.

/*
data-content: this is the text that shows up in the popover.

data-target: This is used instead of the data-content, and is the CSS selector for another element that contains the content of the popover. This is used if you need a more complicated content (HTML) inside the popover. This is

data-delay: if you need to set an alternative delay, you can pass in a JSON string to control the delay, e.g. {"show": 50, "hide": 400}.

data-placement: The location of the popover, e.g. "auto top", "right", "bottom" "left"
 */

// Plugin
// ======

// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.plugins.popover", ["stratus", "jquery", "bootstrap", "stratus.views.plugins.base"], function (Stratus, $) {

    // Popover
    // -------------

    // The Popover view is very simple and extends the Backbone View (not the base view like many other widgets)
    Stratus.Views.Plugins.Popover = Stratus.Views.Plugins.Base.extend({

        events: {
            'mouseenter': 'show',
            'mouseleave': 'hide'
        },

        // Custom Actions for View
        initialize: function (options) {
            this.prepare(options);
            this.render();
        },

        render: function() {

            // Add Extra Styles (if this is extended, e.g. help)
            this.style();

            // Popover
            this.$el.popover({
                html: true,
                trigger: 'manual',
                placement: this.$el.data('placement') ? this.$el.data('placement') : 'auto top',
                delay: this.$el.data('delay') ? this.$el.data('delay').toJSON() : {
                    'show': 50,
                    'hide': 400
                },
                container: 'body',
                content: function () {
                    return this.$el.data('content') ? this.$el.data('content') : $(this.$el.data('target')).html();
                }.bind(this)
            });
        },

        style: function() {},

        show: function() {
            this.$el.popover('show');
            $('.popover').on('mouseleave', function () {
                this.$el.popover('hide');
            }.bind(this));
        },

        hide: function() {
            setTimeout((function () {
                if (!$('.popover:hover').length) {
                    this.$el.popover('hide');
                }
            }.bind(this)), 100);
        }


    });


    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
