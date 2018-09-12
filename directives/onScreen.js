// OnScreen Directive
// ------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'jquery',
      'angular'
    ], factory)
  } else {
    factory(
      root.Stratus,
      root._,
      root.$,
      root.angular
    )
  }
}(this, function (Stratus, _, $, angular) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.OnScreen = function ($parse, $interpolate) {
    return {
      restrict: 'A',
      scope: {
        onScreen: '@onScreen',
        stratusOnScreen: '@stratusOnScreen',
        offScreen: '@offScreen',
        spy: '@spy',
        target: '@target',
        event: '@event', // event can be multiple listeners: reset
        offset: '@offset', // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        reset: '@reset' // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
      },
      link: function (scope, element, attrs) {
        element.uid = _.uniqueId('on_screen_')
        Stratus.Instances[element.uid] = scope
        scope.elementId = attrs.elementId || element.uid

        // event can be multiple listeners: reset
        const event = attrs.event ? attrs.event.split(' ') : []
        const target = attrs.target ? $(attrs.target) : element
        const spy = attrs.spy ? $(attrs.spy) : element

        // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        const offset = attrs.offset || 0

        // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
        const reset = attrs.reset || 0

        // Custom Methods for On/Off Screen
        // TODO: Add Parsing Here
        const onScreen = function () {
          return attrs.onScreen && typeof attrs.onScreen === 'function' ? attrs.onScreen() : true
        }
        const offScreen = function () {
          return attrs.offScreen && typeof attrs.offScreen === 'function' ? attrs.offScreen() : true
        }

        console.log(attrs)

        // Ensure OnScroll is listening
        Stratus.Internals.OnScroll()

        // Bind Angular to Environment
        Stratus.Environment.on('change:viewPortChange', function (model) {
          // If no scrolling has occurred remain false
          let lastScroll = Stratus.Environment.get('lastScroll')

          let isReset = false

          // Reset
          if (event.indexOf('reset') !== -1) {
            // remove all classes when the scroll is all the way back at the top of the page (or the spy is above a specific location specified location)
            if ((reset > 0 && element.offset().top <= reset) || $(window).scrollTop() <= 0) {
              isReset = true
              target.removeClass('onScreen offScreen scrollUp scrollDown reveal unreveal')
            }
          }

          // don't detect anything else if it's reset
          if (!isReset) {
            // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
            if (lastScroll === 'down') {
              target.addClass('scrollDown')
            } else {
              target.removeClass('scrollDown')
            }
            if (lastScroll === 'up') {
              target.addClass('scrollUp')
            } else {
              target.removeClass('scrollUp')
            }

            // Headers that use this to reveal when offscreen, need to know when to trigger the 'retract' which
            // should happen only when it's already open (.offScreen.scrollUp and then you are scrolling down).
            // You can't just make the retract animation happen '.offScreen.scrollDown' because that happens
            // immediately when you scroll down from the header, which triggers a retract before the reveal has
            // engaged the header to begin with, which makes an odd pop open then close.
            // So we really need to add a class ONLY if the reveal class was there.
            if (lastScroll === 'down' && target.hasClass('reveal')) {
              target.removeClass('reveal').addClass('unreveal')
            } else if (lastScroll === 'up') {
              target.removeClass('unreveal').addClass('reveal')
            }

            // If you want to reveal the opposite direction (e.g. a footer)
            if (lastScroll === 'up' && target.hasClass('revealDown')) {
              target.removeClass('revealDown').addClass('unrevealDown')
            } else if (lastScroll === 'down') {
              target.removeClass('unrevealDown').addClass('revealDown')
            }

            if (Stratus.Internals.IsOnScreen(spy, offset)) {
              // Add init class so we can know it's been on screen before
              // remove the reveal/unreveal classes that are used for elements revealed when something is offscreen
              /*  'reveal unreveal' */
              target.removeClass('offScreen').addClass('onScreen onScreenInit')

              // Execute Custom Methods
              onScreen()
            } else {
              target.removeClass('onScreen').addClass('offScreen')

              // Execute Custom Methods
              offScreen()
            }
          }

          /* */
          console.log('OnScreen:', {
            direction: lastScroll,
            spy: spy,
            reset: reset,
            isReset: isReset,
            offset: offset
          }, Stratus.Internals.IsOnScreen(spy, offset))
          /* */
        })
      }
    }
  }
}))
