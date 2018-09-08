//     Stratus.Views.Plugins.OnScreen.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
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

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'zepto', 'underscore', 'stratus.views.plugins.base'], factory)
  } else {
    factory(root.Stratus, root.$, root._)
  }
}(this, function (Stratus, $, _) {
  // OnScreen
  // --------

  // The OnScreen plugin registers all onscreen events and cycles through them in one screen scroll listener.
  Stratus.Views.Plugins.OnScreen = Stratus.Views.Plugins.Base.extend({
    // Custom Actions for View
    initialize: function (options) {
      this.prepare(options)

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
          return options.onScreen ? options.onScreen() : true
        },
        offScreen: function () {
          return options.offScreen ? options.offScreen() : true
        }
      })
    }
  })

  // CheckOnScreen
  // --------

  /**
   * @param options
   * @constructor
   */
  Stratus.PluginMethods.CheckOnScreen = function (options) {
    // If no scrolling has occurred remain false
    var lastScroll = Stratus.Environment.get('lastScroll')

    var isReset = false

    // Reset
    if (options.event.indexOf('reset') !== -1) {
      // remove all classes when the scroll is all the way back at the top of the page (or the spy is above a specific location specified location)
      if ((options.reset > 0 && options.el.offset().top <= options.reset) || $(window).scrollTop() <= 0) {
        isReset = true
        options.target.removeClass('onScreen offScreen scrollUp scrollDown reveal unreveal')
      }
    }

    // don't detect anything else if it's reset
    if (!isReset) {
      // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
      if (lastScroll === 'down') {
        options.target.addClass('scrollDown')
      } else {
        options.target.removeClass('scrollDown')
      }
      if (lastScroll === 'up') {
        options.target.addClass('scrollUp')
      } else {
        options.target.removeClass('scrollUp')
      }

      if (Stratus.Internals.IsOnScreen(options.spy, options.offset)) {
        // Add init class so we can know it's been on screen before
        // remove the reveal/unreveal classes that are used for elements revealed when something is offscreen
        /*  'reveal unreveal' */
        options.target.removeClass('offScreen').addClass('onScreen onScreenInit')

        // Execute Custom Methods
        options.onScreen()
      } else {
        options.target.removeClass('onScreen').addClass('offScreen')

        // Headers that use this to reveal when offscreen, need to know when to trigger the 'retract' which
        // should happen only when it's already open (.offScreen.scrollUp and then you are scrolling down).
        // You can't just make the retract animation happen '.offScreen.scrollDown' because that happens
        // immediately when you scroll down from the header, which triggers a retract before the reveal has
        // engaged the header to begin with, which makes an odd pop open then close.
        // So we really need to add a class ONLY if the reveal class was there.
        if (lastScroll === 'down' && options.target.hasClass('reveal')) {
          options.target.removeClass('reveal').addClass('unreveal')
        } else if (lastScroll === 'up') {
          options.target.removeClass('unreveal').addClass('reveal')
        }

        // If you want to reveal the opposite direction (e.g. a footer)
        if (lastScroll === 'up' && options.target.hasClass('revealDown')) {
          options.target.removeClass('revealDown').addClass('unrevealDown')
        } else if (lastScroll === 'down') {
          options.target.removeClass('unrevealDown').addClass('revealDown')
        }

        // Execute Custom Methods
        options.offScreen()
      }
    }

    /* FIXME: Native IsOnScreen is broken... *
    console.log('CheckOnScreen:', {
      direction: lastScroll,
      spy: options.spy,
      offset: options.offset
    }, Stratus.Internals.IsOnScreen(options.spy, options.offset))
    /* */
  }
}))
