// Trigger Directive
// -----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a model to a function, triggered upon true
  Stratus.Directives.Trigger = function ($parse, $log) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, $element, $attrs, ngModel) {
        Stratus.Instances[_.uniqueId('trigger_')] = $scope;
        $scope.$watch(function () {
          return ngModel.$modelValue;
        }, function (newValue) {
          if (typeof newValue !== 'undefined' && $attrs.stratusTrigger) {
            ($parse($attrs.stratusTrigger))($scope.$parent);
          }
        });
      }
    };
  };
}));
