// Selector Component
// ------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'lodash',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.model',
      'stratus.services.collection',

      // Components
      'stratus.components.pagination',
      'stratus.components.search'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component intends to allow editing of various selections depending on
  // context.
  Stratus.Components.Selector = {
    transclude: {
      image: '?stratusSelectorImage',
      label: '?stratusSelectorLabel',
      option: '?stratusSelectorOption',
      selected: '?stratusSelectorSelected'
    },
    bindings: {
      elementId: '@',
      ngModel: '=',
      type: '@',
      property: '@',
      multiple: '@',
      api: '@',
      limit: '@',
      options: '<'
    },
    controller: function ($scope, $attrs, $log, Registry, Model, Collection) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId('selector_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid

      // Hydrate Settings
      $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false
      $scope.property = $attrs.property || null
      $scope.model = null
      $scope.collection = null

      // Registry Connectivity
      if ($attrs.type) {
        const request = {
          target: $attrs.type,
          decouple: true,
          api: {
            options: this.options ? this.options : {},
            limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 40
          }
        }
        if ($scope.api && angular.isObject($scope.api)) {
          request.api = _.extendDeep(request.api, $scope.api)
        }
        Registry.fetch(request, $scope)
      }

      // Store Toggle Options for Custom Actions
      $scope.toggleOptions = {
        multiple: _.isJSON($attrs.multiple)
          ? JSON.parse($attrs.multiple)
          : true
      }

      // Data Connectivity
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        } else if (data instanceof Collection && data !== $scope.collection) {
          $scope.collection = data
        }
      })
    },
    templateUrl: Stratus.BaseUrl +
     Stratus.BundlePath + 'components/selector' +
      (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
