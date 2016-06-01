//     Stratus.Views.Plugins.OnScreen.js 1.0

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
define("stratus.views.plugins.onscreen", ["stratus", "jquery", "stratus.views.plugins.base"], function (Stratus, $) {

    // OnScreen
    // -------------

    // The OnScreen plugin registers all onscreen events and cycles through them in one screen scroll listener.
    Stratus.Views.Plugins.OnScreen = Stratus.Views.Plugins.Base.extend({

        // Custom Actions for View
        initialize: function (options) {

            this.prepare(options);

            // register onscreen plugins so we only loop once
            var options = {};
            options.method = Stratus.PluginMethods.CheckOnScreen;
            options.el = this.$el;
            options.target =   this.$el.data('target') ? $(this.$el.data('target')) : this.$el;
            options.spy =      this.$el.data('spy') ? $(this.$el.data('spy')) : this.$el;
            // event can be multiple listeners: reset
            options.event =    this.$el.data('event') ? this.$el.data('event').split(' ') : [];
            // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
            options.offset =   this.$el.data('offset') ? this.$el.data('offset') : 0;
            // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
            options.reset =   this.$el.data('reset') ? this.$el.data('reset') : 0;

            // register to the single onScroll list
            Stratus.RegisterGroup.add('OnScroll', options);

        }

    });

    Stratus.PluginMethods.CheckOnScreen = function(options) {

        // If no scrolling has occurred remain false
        var lastScroll = Stratus.Environment.get('lastScroll');

        var isReset = false;

        // Reset
        if (options.event.indexOf('reset') !== -1) {
            // remove all classes when the scroll is all the way back at the top of thepage (or the spy is above a specific location specified location)
            if ((options.reset > 0 && options.el.offset().top <= options.reset ) || $(window).scrollTop() <= 0) {
                isReset = true;
                options.target.removeClass('onScreen offScreen scrollUp scrollDown');
            }
        }

        // don't detect anything else if it's reset
        if (!isReset) {

            // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
            if (lastScroll === 'down') {
                options.target.addClass('scrollDown').removeClass('scrollUp');
            } else {
                options.target.removeClass('scrollDown');
            }
            if (lastScroll === 'up') {
                options.target.addClass('scrollUp').removeClass('scrollDown');
            } else {
                options.target.removeClass('scrollUp');
            }

            // Always detect if it's OnScreen (top OR bottom is within screen, or top AND bottom are outside of screen and the whole element is displayed)
            // NOTE: top and bottom don't change positions, but windowTop and windowBottom do
            var notLastScroll = !lastScroll || lastScroll === 'up' ? 'down' : 'up';
            if (Stratus.Internals.IsOnScreen(options.spy, options.offset)) {
                // Add init class so we can know it's been on screen before

                options.target.removeClass('offScreen offScreenScrollUp offScreenScrollDown').addClass('onScreen onScreenInit');
                if (lastScroll) options.target.addClass('onScreenScroll'+ _.ucfirst(lastScroll)).removeClass('onScreenScroll'+ _.ucfirst(notLastScroll));
            } else {
                options.target.removeClass('onScreen onScreenScrollUp onScreenScrollDown').addClass('offScreen');
                if (lastScroll) options.target.addClass('offScreenScroll'+ _.ucfirst(lastScroll)).removeClass('offScreenScroll'+ _.ucfirst(notLastScroll));
            }
        }

    };


    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
