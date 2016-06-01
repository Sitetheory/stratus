//     Stratus.Views.Plugins.MoreBox.js 1.0

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

// Data Options (see addClass plugin for further options)


// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.plugins.morebox", ["stratus", "jquery", "stratus.views.plugins.addclass", "stratus.views.plugins.base"], function (Stratus, $) {

    // MoreBox
    // -------------

    // A consistent way to reuse the AddClass plugin to add a moreBox that pops up when you interact with
    // a button.
    Stratus.Views.Plugins.MoreBox = Stratus.Views.Plugins.Base.extend({

        // Custom Actions for View
        initialize: function (options) {

            // Add Default Plugin Values
            // Use the element's ID as the default base for the moreBox target.
            if (!this.$el.attr('data-target')) {
                this.$el.attr('data-target', '#'+this.$el.attr('id')+'-moreBox');
            }
            if (!this.$el.attr('data-event')) {
                this.$el.attr('data-event', 'click');
            }
            if (!this.$el.attr('data-class')) {
                this.$el.attr('data-class', 'show');
            }
            this.$el.attr('data-classremove', 'hidden');
            // Add Default Classes
            var moreBox = $(this.$el.data('target'));
            moreBox.addClass('moreBox');
            moreBox.attr('aria-labelledby', this.$el.attr('id'));

            // Utilize Standard AddClass Plugin
            new Stratus.Views.Plugins.AddClass({el: this.el});

        }

    });


    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
