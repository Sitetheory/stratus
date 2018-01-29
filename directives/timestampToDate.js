// Timestamp to Date Directive
// -----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a model to convert value as timestamp to date
  Stratus.Directives.TimestampToDate = function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        format: '<'
      },
      link: function ($scope, $element, $attrs, ngModel) {
        Stratus.Instances[_.uniqueId('timestamp_to_date_')] = $scope;
        $scope.format |= 'yyyy/MM/dd';
        ngModel.$parsers.push(function (value) {
          return '' + value;
        });
        ngModel.$formatters.push(function (value) {
          return new Date(value);
        });
      }
    };
  };
}));
