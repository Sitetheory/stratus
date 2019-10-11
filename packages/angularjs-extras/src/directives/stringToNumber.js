// String to Number Directive
// -----------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This directive intends to handle binding of a model to convert value
  // string to number
  Stratus.Directives.StringToNumber = function ($parse, $log) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, $element, $attrs, ngModel) {
        Stratus.Instances[_.uniqueId('string_to_number_')] = $scope
        ngModel.$parsers.push(function (value) {
          return '' + value
        })
        ngModel.$formatters.push(function (value) {
          return parseFloat(value)
        })
      }
    }
  }
}))
