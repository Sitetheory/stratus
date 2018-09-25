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
        partial: '@partial', // by default: true
        update: '@update', // by default: 100 ms
        event: '@event', // event can be multiple listeners: reset
        offset: '@offset', // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        reset: '@reset' // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
      },
      link: function (scope, element, attrs) {
        element.uid = _.uniqueId('on_screen_')
        Stratus.Instances[element.uid] = scope
        scope.elementId = attrs.elementId || element.uid

        // event can be multiple listeners: reset
        let $element = element instanceof $ ? element : $(element)
        let event = attrs.event ? attrs.event.split(' ') : []
        let target = attrs.target ? $(attrs.target) : $element
        let spy = attrs.spy ? $(attrs.spy) : $element
        if (!spy.length) {
          spy = $element
        }
        let partial = _.hydrate(attrs.partial)
        if (typeof partial !== 'boolean') {
          partial = true
        }
        let update = _.hydrate(attrs.update)
        if (typeof update !== 'number') {
          update = 100
        }
        let lastUpdate = 0
        let isWaiting = false
        let wasOnScreen = false

        // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        let offset = _.hydrate(attrs.offset) || 0

        // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
        let reset = _.hydrate(attrs.reset) || 0

        // Custom Methods for On/Off Screen
        // TODO: Add Parsing Here
        let onScreen = function () {
          return attrs.onScreen && typeof attrs.onScreen === 'function' ? attrs.onScreen() : true
        }
        let offScreen = function () {
          return attrs.offScreen && typeof attrs.offScreen === 'function' ? attrs.offScreen() : true
        }
        let isOnScreen = function () {
          if (isWaiting) {
            return
          }
          let calculation = (new Date()).getTime()
          if (calculation - lastUpdate > update) {
            lastUpdate = calculation
            wasOnScreen = Stratus.Internals.IsOnScreen(spy, offset, partial)
          } else {
            isWaiting = true
            setTimeout(function () {
              isWaiting = false
              calculate()
            }, ((lastUpdate + update) - calculation) + 1)
          }
          return wasOnScreen
        }

        // Bind Angular to Environment
        let calculate = function () {
          // remove all classes when the scroll is all the way back at the top of the page (or the spy is above a specific location specified location)
          if (event.indexOf('reset') !== -1 && ((reset > 0 && $element.offset().top <= reset) || $(window).scrollTop() <= 0)) {
            target.removeClass('onScreen offScreen scrollUp scrollDown reveal conceal')
            target.addClass('reset')
            return
          }
          if (isOnScreen()) {
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

        // Ensure OnScroll is listening
        Stratus.Internals.OnScroll()
        Stratus.Environment.on('change:viewPortChange', calculate)
        Stratus.Environment.on('change:lastScroll', function () {
          // If no scrolling has occurred remain false
          let lastScroll = Stratus.Environment.get('lastScroll')

          // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
          if (lastScroll === 'down' && !target.hasClass('reset')) {
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
            if (target.hasClass('reset')) {
              target.removeClass('reset')
            }
          }
        })
      }
    }
  }
}))
