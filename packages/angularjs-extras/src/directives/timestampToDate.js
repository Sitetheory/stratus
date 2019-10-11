/* global define */

// Timestamp to Date Directive
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
  // This directive intends to handle binding of a model to convert value as
  // timestamp to date, the value is persisted into ng-model still timestamp
  // type.
  Stratus.Directives.TimestampToDate = function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        format: '<'
      },
      link: function ($scope, $element, $attrs, ngModel) {
        Stratus.Instances[_.uniqueId('timestamp_to_date_')] = $scope
        $scope.format |= 'yyyy/MM/dd'
        ngModel.$parsers.push(function (value) {
          return new Date(value).getTime() / 1000
        })
        ngModel.$formatters.push(function (value) {
          return new Date(value * 1000)
        })
      }
    }
  }
}))
