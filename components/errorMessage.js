/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      // Libraries
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'errorMessage'

  // This component intends to show display error messages
  // on the page until user dismissal
  Stratus.Components.ErrorMessage = {
    bindings: {
      errors: '<'
    },
    controller: function ($scope, $window, $attrs, $sce) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // variables
      $ctrl.errors = $attrs.errors || []

      // class for icon;
      let iconCss = {
        error: 'fa-times-circle red',
        notice: 'fa-exclamation-circle blue',
        warning: 'fa-exclamation-triangle yellow',
        success: 'fa-check-circle green'
      }

      // default icon is notice type
      $ctrl.icon = iconCss.notice

      $ctrl.safeText = function (error) {
        $ctrl.icon = iconCss[error.class]
        return $sce.trustAsHtml(error.text)
      }

      // remove element from errors
      $ctrl.hideError = function (message) {
        // let index = $ctrl.errors.indexOf(message)
        $ctrl.errors.splice(0, 1)
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
