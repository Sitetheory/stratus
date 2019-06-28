// Src Directive
// -------------

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
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.Src = function ($parse, $interpolate) {
    return {
      restrict: 'A',
      scope: {
        src: '@src',
        stratusSrc: '@stratusSrc',
        style: '@style'
      },
      link: function ($scope, $element, $attr) {
        Stratus.Instances[_.uniqueId('src_')] = $scope
        $scope.whitelist = [
          'jpg',
          'jpeg',
          'png',
          'gif'
        ]
        $scope.filter = null

        // Add Watchers
        $scope.$watch(function () {
          return $attr.stratusSrc || $attr.src || $attr.style
        }, function (newVal, oldVal, scope) {
          if (newVal && $element.attr('data-size')) {
            $scope.registered = false
          }
          $scope.register()
        })

        // Group Registration
        $scope.registered = false
        $scope.register = function () {
          // find background image in CSS if there is no src (e.g. for div)
          let backgroundImage = null
          if ($element.prop('tagName').toLowerCase() !== 'img') {
            backgroundImage = $element.css('background-image') || null
            if (backgroundImage) {
              backgroundImage = backgroundImage.slice(4, -1).replace(/"/g, '')
            }
          }
          const src = $attr.stratusSrc || $attr.src || backgroundImage

          // Get Extension
          let ext = src ? src.match(/\.([0-9a-z]+)(\?.*)?$/i) : null
          if (ext) {
            ext = ext[1] ? ext[1].toLowerCase() : null
          }

          // Limit Resizable Types
          $scope.filter = _.filter($scope.whitelist, function (value) {
            return ext === value
          })
          if (!_.size($scope.filter)) {
            return true
          }

          // Don't re-register
          if ($scope.registered) {
            return true
          }
          $scope.registered = true
          if (!src && !backgroundImage) {
            return false
          }

          // Begin Registration
          $element.attr('data-src', src)

          // FIXME: This needs to be converted to the new event structure.
          // TODO: this also needs to listen for if the src or stratus-src changes, so it retriggers, e.g. in a reusable popup where the contents change.
          // TODO: this also needs to work in popups that may not be trigger "onScroll" or "onScreen" because they are outside the flow of the page (usually at the bottom of the page out of view, but in the window with an absolute position)
          $scope.group = {
            method: Stratus.Internals.LoadImage,
            el: $element,
            spy: $element.data('spy') ? jQuery($element.data('spy')) : $element
          }
          Stratus.Internals.OnScroll()
          Stratus.RegisterGroup.add('OnScroll', $scope.group)
          Stratus.Internals.LoadImage($scope.group)
        }

        // Source Interpolation
        /* *
        $scope.src = $scope.src || $scope.stratusSrc
        $scope.interpreter = $interpolate($scope.src, false, null, true)
        $scope.initial = $scope.interpreter($scope.$parent)
        if (angular.isDefined($scope.initial)) {
          $element.attr('stratus-src', $scope.initial)
          $scope.register()
        }

        $scope.$watch('stratusSrc', function (value) {
          if (angular.isDefined(value) && !_.isEmpty(value)) {
            $element.attr('stratus-src', value)
            $element.attr('data-loading', false)
            $scope.registered = false
            $scope.register()
          }
        })
        /* */
      }
    }
  }
}))
