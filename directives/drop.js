// Drop Directive
// --------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.Drop = function ($parse, $log) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=ngModel'
      },
      link: function ($scope, $element, $attrs) {
        Stratus.Instances[_.uniqueId('drop_')] = $scope;
        $log.log('drop:', $element);
      }
    };
  };
}));
