// Base Component
// --------------

/* global define */

// Define AMD (Universal Module Definition: https://github.com/umdjs/umd), Require.js, or Contextual Scope
// We are making a factory (Javascript function prototype that is wrapped so that it can be loaded asynchronously)
(function (root, factory) {
  // This will define the dependencies that will load in require.js
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.model',
      'stratus.services.collection'
    ], factory)
  } else {
    // If there is no define then it starts the function instantly, but it wouldn't have any requirements, only root (window) available objects
    factory(root.Stratus, root._, root.angular)
  }
  // this=root (window), function = factory
  // the properties passed to the function, are the items (in order) defined in the define() or factory()
  // These properties are now available inside the factory
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'base'
  const localPath = 'components'

  // This component is just a simple base.
  Stratus.Components.Base = {
    // Angular Components allow transclude options directly in the object. So whatever you put in Foo, will overwrite
    // whatever is in this component's template `stratus-base-model` area.
    // <stratus-base><stratus-base-model>Foo</stratus-base-model></stratus-base>
    transclude: {
      // This is a sample only
      // See ngTransclude for more character options, e.g. ? means it won't freak out if child node doesn't exist
      model: '?stratusBaseModel'
    },
    // These are attribute that can be passed from the tag to this factory, they are accessed in the factory as
    // $attrs.x (flat string - used with @ sign) or
    // $ctrl.x (parsed - needed with = sign)
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
      // One way bound (will parse once and never touch again)
      options: '<'
    },
    controller: function ($scope, $attrs, Registry, Model, Collection) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.css'
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

      // Delayed Initialization
      $scope.initialize = function () {
        if ($scope.initialized) {
          return
        }
        if ($scope.model) {
          $scope.initialized = true
          $scope.model.on('change', function () {
            console.log('model changed:', arguments)
          })
        }
        if ($scope.collection) {
          $scope.initialized = true
          console.log('collection available')
        }
      }

      // Model Watcher
      $scope.$watch('$scope.model.completed', function (newVal, oldVal) {
        if (!newVal || _.isEqual(newVal, oldVal)) {
          return
        }
        $scope.initialize()
      })

      // Collection Watcher
      $scope.$watch('$scope.collection.completed', function (newVal, oldVal) {
        if (!newVal || _.isEqual(newVal, oldVal)) {
          return
        }
        $scope.initialize()
      })

      // Display Complete Build
      if (!Stratus.Environment.get('production')) {
        console.log(name, 'component:', $scope, $attrs)
      }
    },
    // template: '<div id="{{ elementId }}"><div ng-if="model && property && model.get(property)" style="list-style-type: none;">{{ model.get(property) | json }}</div><ul ng-if="collection && model && property" ng-cloak><stratus-search></stratus-search><li ng-repeat="model in collection.models">{{ model.data | json }}</li><stratus-pagination></stratus-pagination></ul></div>',
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.html'
  }
}))
