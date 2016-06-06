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
        define(['stratus', 'jquery', 'underscore', 'stratus.views.plugins.base', 'stratus.views.plugins.addclass'], factory);
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
            var drawer = this.$el.data('target') ? $(this.$el.data('target')) : $('#' + this.$el.attr('id') + '-drawer');
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
            close.on('click', function () { this.toggle();}.bind(this));
        },

        // NOTE: with this method only one drawer can be open at a time
        toggle: function () {
            $('#' + this.$el.attr('id') + '-drawer').removeClass('hidden');
            var drawerVar = this.drawerClass.toLowerCase();
            var $body = $('body');
            ($body.attr('data-' + drawerVar + 'open') !== this.$el.attr('id')) ? $body.attr('data-' + drawerVar + 'open', this.$el.attr('id')) : $body.attr('data-' + drawerVar + 'open', null);
        }

    });

}));
