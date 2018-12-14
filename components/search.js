// Search Component
// ----------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.collection'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''

  // This component handles searching to filter a collection
  Stratus.Components.Search = {
    bindings: {
      ngModel: '=',
      target: '@',
      display: '@',
      placeholder: '@'
    },
    controller: function ($scope, $attrs, Registry, Collection, $log) {
      Stratus.Instances[_.uniqueId('search_')] = $scope
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/search' + min + '.css'
      )

      // Settings
      $scope.display = $attrs.display && _.isJSON($attrs.display) ? JSON.parse($attrs.display) : false

      // Localize Data
      $scope.data = null
      $scope.collection = null
      $scope.$watch('$parent.data', function (data) {
        if (data && data instanceof Collection) {
          $scope.collection = data
        }
      })

      // Initial Query
      $scope.query = ''

      // TODO: Add the ability to use either its own collection or hoist the parent's

      /* *
      $scope.$watch('query', function (query) {
          console.log('query:', query);
      });
      console.log('attributes:', $attrs.ngModel);
      $scope.registry = new registry();
      $scope.registry.fetch('Media', $scope);
      /* */
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/search' + min + '.html'
  }
}))
