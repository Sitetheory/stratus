// Base Component
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.model',
      'stratus.services.collection',

      // Components
      // TODO: determine if this should really be in Base, or if it's even Stratus specific
      'stratus.components.pagination',
      'stratus.components.search'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'base'

  // This component is just a simple base.
  Stratus.Components.Base = {
    transclude: {
      model: '?stratusBaseModel'
    },
    bindings: {
      // Basic Control for Designers
      elementId: '@',

      // ngModel Logic for a Symbiotic Controller Relationship
      ngModel: '=',
      property: '@',

      // Registry Elements
      target: '@',
      id: '@',
      manifest: '@',
      decouple: '@',
      direct: '@',
      api: '@',
      urlRoot: '@',

      // Collection Options
      limit: '@',
      options: '<'
    },
    controller: function ($scope, $attrs, $log, Registry, Model, Collection) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Hoist Attributes
      $scope.property = $attrs.property || null

      // Data References
      $scope.data = null
      $scope.model = null
      $scope.collection = null

      // Registry Connectivity
      if ($attrs.target) {
        Registry.fetch($attrs, $scope)
      }

      // Symbiotic Data Connectivity
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        } else if (data instanceof Collection && data !== $scope.collection) {
          $scope.collection = data
        }
      })

      // Display Complete Build
      if (!Stratus.Environment.get('production')) {
        $log.log(name, 'component:', $scope, $attrs)
      }
    },
    // template: '<div id="{{ elementId }}"><div ng-if="model && property && model.get(property)" style="list-style-type: none;">{{ model.get(property) | json }}</div><ul ng-if="collection && model && property" ng-cloak><stratus-search></stratus-search><li ng-repeat="model in collection.models">{{ model.data | json }}</li><stratus-pagination></stratus-pagination></ul></div>',
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
