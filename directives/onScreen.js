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
        scrollChange: '@scrollChange',
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
        let spy = attrs.spy ? $(attrs.spy) : element
        if (!spy.length) {
          spy = element
        }

        // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        const offset = _.hydrate(attrs.offset || 0)

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

        // Ensure OnScroll is listening
        Stratus.Internals.OnScroll()

        const isOnScreen = function () {
          if (Stratus.Internals.IsOnScreen(spy, offset)) { // TODO: Move this part to a function so it can be either on scroll change or constant
            // Add init class so we can know it's been on screen before
            if (!target.hasClass('onScreen')) {
              target.addClass('onScreen onScreenInit')
            }

            if (target.hasClass('offScreen')) {
              target.removeClass('offScreen')
            }

            // Execute Custom Methods
            onScreen()
          } else {
            if (target.hasClass('onScreen')) {
              target.removeClass('onScreen')
            }
            if (!target.hasClass('offScreen')) {
              target.addClass('offScreen')
            }

            // Execute Custom Methods
            offScreen()
          }
        }

        // Bind Angular to Environment
        Stratus.Environment.on('change:viewPortChange', function (model) {
          // Reset
          let isReset = false
          if (event.indexOf('reset') !== -1) {
            // remove all classes when the scroll is all the way back at the top of the page (or the spy is above a specific location specified location)
            if ((reset > 0 && $(element).offset().top <= reset) || $(window).scrollTop() <= 0) {
              isReset = true
              target.removeClass('onScreen offScreen scrollUp scrollDown ascend descend')
            }
          }
          if (!isReset && !_.hydrate(attrs.scrollChange)) {
            isOnScreen()
          }
        })
        Stratus.Environment.on('change:lastScroll', function (model) {
          // If no scrolling has occurred remain false
          let lastScroll = Stratus.Environment.get('lastScroll')

          // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
          if (lastScroll === 'down') {
            if (!target.hasClass('scrollDown')) {
              target.addClass('scrollDown')
            }
            if (target.hasClass('scrollUp')) {
              target.removeClass('scrollUp')
            }
          }

          if (lastScroll === 'up') {
            if (!target.hasClass('scrollUp')) {
              target.addClass('scrollUp')
            }
            if (target.hasClass('scrollDown')) {
              target.removeClass('scrollDown')
            }
          }

          if (_.hydrate(attrs.scrollChange)) {
            isOnScreen()
          }

          /* *
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
