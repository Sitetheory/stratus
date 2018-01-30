// Timestamp to Date Directive
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
  // This directive intends to handle binding of a model to convert value as timestap to date, the value is persisted into ng-model still timestamp type.
  Stratus.Directives.TimestampToDate = function ($parse, $log) {
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
          return new Date(value).getTime() / 1000;
        });
        ngModel.$formatters.push(function (value) {
          return new Date(value);
        });
      }
    };
  };
}));
