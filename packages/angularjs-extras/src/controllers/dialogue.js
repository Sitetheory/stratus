// Dialogue Controller
// -------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles simple dialogue display
  // with bindings for the associated model
  Stratus.Controllers.Dialogue = [
    '$attrs',
    '$mdDialog',
    '$parse',
    '$scope',
    function ($attrs, $mdDialog, $parse, $scope) {
      // Store Instance
      const uid = _.uniqueId('dialogue_')
      Stratus.Instances[uid] = $scope

      // Digest Template
      $scope.template = $attrs.template || null
      $scope.template = $scope.template ? document.querySelector(
        $scope.template) : null
      $scope.template = $scope.template ? $scope.template.innerHTML : null

      // Digest Model Bindings
      $scope.model = null
      $scope.$parent.$watch($attrs.ngModel, function (model) {
        if (model && typeof model === 'object') {
          $scope.model = model
        }
      })

      // Handle Dialogue
      $scope.show = function ($event) {
        $mdDialog.show({
          parent: angular.element(document.body),
          template: $scope.template || 'Template Not Found!',
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {
            ngModel: $scope.model
          },
          controller: function ($scope, $mdDialog, ngModel) {
            Stratus.Instances[uid + '_mdDialog'] = $scope
            $scope.model = ngModel
            $scope.hide = function () {
              $mdDialog.hide()
            }
          }
        })
      }
    }]
}))
