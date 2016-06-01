//     Stratus.Views.Plugins.Drawer.js 1.0

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

// Data Options
// -

// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.plugins.drawer", ["stratus", "jquery", "stratus.views.plugins.addclass", "stratus.views.plugins.base"], function (Stratus, $) {

    // Drawer
    // -------------

    // Like a MoreBox but attached to the side and pushes the app body over. Will only allow one drawer to
    // be open at a time.
    Stratus.Views.Plugins.Drawer = Stratus.Views.Plugins.Base.extend({

        events: {
            'click': 'toggle'
        },

        // Custom Actions for View
        initialize: function (options) {

            this.prepare(options);

            if (!this.$el.attr('id')) {
                console.warn('No ID supplied for data-plugin="Drawer" button.', this.$el);
                return false;
            }
            var drawer = this.$el.data('target') ? $(this.$el.data('target')) : $('#'+this.$el.attr('id')+'-drawer');
            if (!drawer) {
                console.warn('No ID supplied for data-plugin="Drawer" targetted drawer.', this.$el);
                return false;
            }

            // Determine if this is a drawer that only shows up for mobile
            this.drawerClass = this.$el.data('mobileonly') ? 'mobileDrawer' : 'drawer';

            // Add Default Classes
            drawer.addClass(this.drawerClass);
            drawer.attr('aria-labelledby', this.$el.attr('id'));
            // Add a close button

            var close = drawer.find('.btnClose');
            if (!close.length) {
                Stratus.PluginMethods.AddClose(drawer);
                close = drawer.find('.btnClose');
            }
            close.on('click', function() { this.toggle()}.bind(this));

        },

        toggle: function() {
            // NOTE: with this method only one drawer can be open at a time
            var drawerVar = this.drawerClass.toLowerCase();
            $('#'+this.$el.attr('id')+'-drawer').removeClass('hidden');
            $('body').attr('data-'+drawerVar+'open') !== this.$el.attr('id') ? $('body').attr('data-'+drawerVar+'open', this.$el.attr('id')) : $('body').attr('data-'+drawerVar+'open', null);
        }

    });


    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
