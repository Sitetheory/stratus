/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'stratus.services.utility'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular)
  }
}(this,
  function (Stratus, _, angular) {
    // This component intends to show display error messages
    // on the page until user dismissal
    Stratus.Components.ErrorMessage = {
      bindings: {
        errors: '<'
      },
      controller: function (
        $scope, $window, $attrs, $sce, $compile, utility) {
        // Initialize
        utility.componentInitializer(this, $scope, $attrs, 'error_message', true)

        // variables
        var $ctrl = this
        $ctrl.errors = $attrs.errors || []

        // class for icon;
        var iconCss = {
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
          // var index = $ctrl.errors.indexOf(message)
          $ctrl.errors.splice(0, 1)
        }
      },
      templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/errorMessage' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    }
  }))
