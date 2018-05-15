// Sort Component
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(
      ['stratus', 'underscore', 'angular', 'stratus.services.registry', 'angular-material'],
      factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component handles sorting for a collection
  Stratus.Components.Sort = {
    bindings: {
      ngModel: '=',
      target: '@'
    },
    controller: function ($scope, $attrs, Registry) {
      Stratus.Instances[_.uniqueId('sort')] = $scope
      $scope.collection = ($scope.$parent && $scope.$parent.collection)
        ? $scope.$parent.collection
        : null
      $scope.query = ''
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/sort' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
