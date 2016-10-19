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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'underscore', 'stratus.views.plugins.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // OnScreen
    // --------

    // The OnScreen plugin registers all onscreen events and cycles through them in one screen scroll listener.
    Stratus.Views.Plugins.OnScreen = Stratus.Views.Plugins.Base.extend({
        // Custom Actions for View
        initialize: function (options) {
            this.prepare(options);

            // register to the single onScroll list
            Stratus.RegisterGroup.add('OnScroll', {
                method: Stratus.PluginMethods.CheckOnScreen,
                el: this.$el,
                target: this.$el.data('target') ? $(this.$el.data('target')) : this.$el,
                spy: this.$el.data('spy') ? $(this.$el.data('spy')) : this.$el,

                // event can be multiple listeners: reset
                event: this.$el.data('event') ? this.$el.data('event').split(' ') : [],

                // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
                offset: this.$el.data('offset') || 0,

                // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
                reset: this.$el.data('reset') || 0,

                // Custom Methods for On/Off Screen
                onScreen: function () {
                    return (options.onScreen) ? options.onScreen() : true;
                },
                offScreen: function () {
                    return (options.offScreen) ? options.offScreen() : true;
                }
            });
        }
    });

    // CheckOnScreen
    // --------

    /**
     * @param options
     * @constructor
     */
    Stratus.PluginMethods.CheckOnScreen = function (options) {

        // If no scrolling has occurred remain false
        var lastScroll = Stratus.Environment.get('lastScroll');

        var isReset = false;

        // Reset
        if (options.event.indexOf('reset') !== -1) {
            // remove all classes when the scroll is all the way back at the top of thepage (or the spy is above a specific location specified location)
            if ((options.reset > 0 && options.el.offset().top <= options.reset) || $(window).scrollTop() <= 0) {
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
                if (lastScroll) options.target.addClass('onScreenScroll' + _.ucfirst(lastScroll)).removeClass('onScreenScroll' + _.ucfirst(notLastScroll));

                // Execute Custom Methods
                options.onScreen();
            } else {
                options.target.removeClass('onScreen onScreenScrollUp onScreenScrollDown').addClass('offScreen');
                if (lastScroll) options.target.addClass('offScreenScroll' + _.ucfirst(lastScroll)).removeClass('offScreenScroll' + _.ucfirst(notLastScroll));

                // Execute Custom Methods
                options.offScreen();
            }
        }
    };

}));
