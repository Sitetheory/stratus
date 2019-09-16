// OnScreen Directive
// ------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'jquery',
      'angular'
    ], factory)
  } else {
    factory(
      root.Stratus,
      root._,
      root.jQuery,
      root.angular
    )
  }
}(this, function (Stratus, _, jQuery, angular) {
  // Environment
  const name = 'onScreen'

  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.OnScreen = function () {
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
        animation: '@animation', // by default: none
        event: '@event', // event can be multiple listeners: reset
        offset: '@offset', // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        reset: '@reset' // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
      },
      link: function ($scope, element, attrs) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        const $element = element instanceof jQuery ? element : jQuery(element)
        $scope.elementId = $element.elementId || $ctrl.uid
        $scope.initialized = false

        // Etc..
        element.uid = $ctrl.uid
        Stratus.Instances[element.uid] = $scope
        $scope.elementId = attrs.elementId || element.uid

        // event can be multiple listeners: reset
        const event = attrs.event ? attrs.event.split(' ') : []
        const target = attrs.target ? jQuery(attrs.target) : $element
        let spy = attrs.spy ? jQuery(attrs.spy) : $element
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
        let animation = _.hydrate(attrs.animation)
        if (typeof animation !== 'number') {
          animation = false
        }
        let lastUpdate = 0
        let isWaiting = false
        let wasOnScreen = false
        let wipeJob = null

        // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        const offset = _.hydrate(attrs.offset) || 0

        // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
        const reset = _.hydrate(attrs.reset) || 0

        // Custom Methods for On/Off Screen
        // TODO: Add Parsing Here
        const onScreen = function () {
          return attrs.onScreen && typeof attrs.onScreen === 'function' ? attrs.onScreen() : true
        }
        const offScreen = function () {
          return attrs.offScreen && typeof attrs.offScreen === 'function' ? attrs.offScreen() : true
        }
        const isOnScreen = function () {
          // FIXME: This needs to be converted to the Chronos structure.
          if (isWaiting) {
            return wasOnScreen
          }
          const calculation = (new Date()).getTime()
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
        const wipe = function (request) {
          if (!animation) {
            return
          }
          if (_.isUndefined(request)) {
            // FIXME: This needs to be converted to the Chronos structure.
            if (_.isNumber(wipeJob)) {
              clearTimeout(wipeJob)
            }
            wipeJob = setTimeout(function () {
              wipe(true)
            }, animation)
          } else {
            target.removeClass('reveal conceal')
          }
        }

        // Bind Angular to Environment
        const calculate = function () {
          // remove all classes when the scroll is all the way back at the top of the page (or the spy is above a specific location specified location)
          if (event.indexOf('reset') !== -1 && ((reset > 0 && $element.offset().top <= reset) || jQuery(window).scrollTop() <= 0)) {
            target.removeClass('on-screen off-screen scroll-up scroll-down reveal conceal')
            target.addClass('reset')
            return
          }
          if (isOnScreen()) {
            // Add init class so we can know it's been on screen before
            if (!target.hasClass('on-screen')) {
              target.addClass('on-screen on-screen-init')
            }
            if (target.hasClass('off-screen')) {
              target.removeClass('off-screen')
            }
            // Execute Custom Methods
            onScreen()
            // Success
            return true
          } else {
            if (target.hasClass('on-screen')) {
              target.removeClass('on-screen')
            }
            if (!target.hasClass('off-screen')) {
              target.addClass('off-screen')
            }
            // Execute Custom Methods
            offScreen()
            // Failure
            return false
          }
        }

        // FIXME: This needs to be converted to the new event structure.
        // Ensure OnScroll is listening
        Stratus.Internals.OnScroll()

        // Listen for Screen Changes
        Stratus.Environment.on('change:viewPortChange', calculate)
        Stratus.Environment.on('change:lastScroll', function () {
          // If no scrolling has occurred remain false
          const lastScroll = Stratus.Environment.get('lastScroll')

          // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
          if (lastScroll === 'down' && !target.hasClass('reset')) {
            if (!target.hasClass('scroll-down')) {
              target.addClass('scroll-down')
            }
            if (target.hasClass('scroll-up')) {
              target.removeClass('scroll-up')
            }
            if (animation && Stratus.Internals.IsOnScreen(spy, offset, partial)) {
              if (target.hasClass('reveal')) {
                target.removeClass('reveal')
              }
              if (!target.hasClass('conceal')) {
                target.addClass('conceal')
              }
              wipe()
            }
          }

          if (lastScroll === 'up') {
            if (!target.hasClass('scroll-up')) {
              target.addClass('scroll-up')
            }
            if (target.hasClass('scroll-down')) {
              target.removeClass('scroll-down')
            }
            if (target.hasClass('reset')) {
              target.removeClass('reset')
            }
            if (animation) {
              if (!target.hasClass('reveal')) {
                target.addClass('reveal')
              }
              if (target.hasClass('conceal')) {
                target.removeClass('conceal')
              }
              wipe()
            }
          }
        })

        // Run Initial & Delayed Calculations
        const limit = 8
        let i = 0
        const delayed = function () {
          if (++i > limit) {
            // console.log('exit:', target)
            return
          }
          // console.log('attempt:', i, target)
          if (calculate()) {
            // console.log('success:', target, 'attempts:', i)
            return
          }
          setTimeout(delayed, 250)
        }
        delayed()
      }
    }
  }
}))
