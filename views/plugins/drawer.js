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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'underscore', 'stratus.views.plugins.base', 'stratus.views.plugins.addclass', 'stratus.views.plugins.addclose'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Drawer
    // -------------

    // Like a MoreBox but attached to the side and pushes the app body over. Will only allow one drawer to
    // be open at a time.
    Stratus.Views.Plugins.Drawer = Stratus.Views.Plugins.Base.extend({

        events: {
            click: 'toggle'
        },

        initialize: function (options) {
            this.prepare(options);


            if (!this.$el.attr('id')) {
                console.warn('No ID supplied for data-plugin="Drawer" button.', this.$el);
                return false;
            }

            // If a second element needs to toggle the drawer, you would need to give it the identical id with a
            // suffix "-*" (dash anything). Everything after the dash gets removed.

            // get base id
            var toggleId = this.$el.attr('id').replace(/-.*$/, '');
            var drawer = this.$el.data('target') ? $(this.$el.data('target')) : $('#' + toggleId + '-drawer');
            if (!drawer) {
                console.warn('No ID supplied for data-plugin="Drawer" targetted drawer.', this.$el);
                return false;
            }

            // Determine if this is a drawer that only shows up for mobile
            this.drawerClass = this.$el.data('mobileonly') ? 'mobileDrawer' : 'drawer';

            // Add Default Classes
            drawer.addClass(this.drawerClass);
            // Only add the label if it's not there yet (in case there are multiple drawer buttons acting on the same
            // drawer
            if(!drawer.attr('aria-labelledby')) {
                drawer.attr('aria-labelledby', toggleId);
            }

            // Add a close button
            var close = drawer.find('.btnClose');
            if (!close.length) {
                new Stratus.Views.Plugins.AddClose({ el: drawer });
                close = drawer.find('.btnClose');
            }
            close.unbind('click');
            close.on('click', function () { this.toggle();}.bind(this));
        },

        // NOTE: with this method only one drawer can be open at a time
        toggle: function () {

            var toggleId = this.$el.attr('id').replace(/-.*$/, '');

            $('#' + toggleId + '-drawer').removeClass('hidden');
            var drawerVar = this.drawerClass.toLowerCase();
            var $body = $('body');
            ($body.attr('data-' + drawerVar + 'open') !== toggleId) ? $body.attr('data-' + drawerVar + 'open', toggleId) : $body.attr('data-' + drawerVar + 'open', null);
        }

    });

}));
