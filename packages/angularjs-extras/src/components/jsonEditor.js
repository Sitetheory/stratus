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

      // Directive
      'stratus.directives.jsonEncode'

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
  const name = 'jsonEditor'
  const localPath = '@stratusjs/angularjs-extras/src/components'

  // This component is just a simple base.
  Stratus.Components.JsonEditor = {
    bindings: {
      // Basic Control for Designers
      elementId: '@',

      // ngModel Logic for a Symbiotic Controller Relationship
      ngModel: '=',
      // This automatically binds to the form.field controller that gets used for setting validity on the $ctrl for the input
      formFieldCtrl: '=',
      // this is the name of the field (must match formFieldCtrl form name)
      name: '@',
      ariaLabel: '@',
      rows: '@'
    },
    controller: function ($scope, $attrs, Registry, Model, Collection) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.snakeCase(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.css'
      )

      // Set to false if we ever set an initilized method
      $scope.initialized = false

      // Localized Value for the editor data
      $scope.jsonString = ''

      // This is a function bound to the same context
      $scope.initialize = () => {

        console.log('Stratus Json Editor was initialized.')

        if ($scope.initialized) {
          return
        }
        $scope.initialized = true

        /**
         * WATCHER - Data Connectivity from ngModel
         * Populate the $scope.jsonString with the ngModel from the page
         * This is a component in order to sandbox dual binding so that when the directive fires to clean the JSON, it
         * does not update the model right away
         */
        $scope.$watch(() => $ctrl.ngModel, function (jsonObject, oldJsonObject) {
          if (!jsonObject) {
            return
          }
          // This will prettify the results
          const jsonString = angular.toJson(jsonObject, true)
          if($scope.jsonString === jsonString) {
            return
          }
          $scope.jsonString = jsonString
          $scope.$applyAsync();
        })
        // Saving Data if Valid This is expecting a string
        /**
         * This turns the string from the jsonString into an object to send to the model
         * @param data {string}
         */
        $scope.$watch(() => $scope.jsonString, function (newString, oldString) {
          if (newString === oldString) {
            return
          }
          const isValid = _.isJSON(newString);
          $ctrl.formFieldCtrl.$setValidity('validJson', isValid);
          if (!isValid) {
            return
          }
          // turn it to an object
          $ctrl.ngModel = JSON.parse(newString)
        })
      }

      /**
       * Don't do anything until the $ctrl.formFieldCtrl exists (which is the form.fieldName controller that gets the
       * validity set on it.
       */
      const unwatch = $scope.$watch(() => $ctrl.formFieldCtrl, function (newValue) {
        if (!newValue) {
          return
        }
        $scope.initialize()
        unwatch()
      })

    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.html'
  }
}))
