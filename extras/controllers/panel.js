// Panel Controller
// ----------------

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
  // This Controller handles simple panel display
  // with bindings for the associated data types.
  Stratus.Controllers.Panel = [
    '$scope',
    '$element',
    '$parse',
    '$mdPanel',
    function ($scope, $element, $parse, $mdPanel) {
      // Store Instance
      Stratus.Instances[_.uniqueId('panel_')] = $scope

      // Digest Template
      $scope.template = $element.attr('template') || null
      $scope.template = $scope.template ? document.querySelector(
        $scope.template) : null
      $scope.template = $scope.template ? $scope.template.innerHTML : null

      // Digest Model Bindings
      $scope.model = null
      if ($element.attr('ng-model')) {
        $scope.$parent.$watch($element.attr('ng-model'), function (model) {
          if (model && typeof model === 'object') {
            $scope.model = model
          }
        })
      }

      // Digest Collection Bindings
      $scope.collection = null
      if ($element.attr('ng-collection')) {
        $scope.$parent.$watch($element.attr('ng-collection'),
          function (collection) {
            if (collection && typeof collection === 'object') {
              $scope.collection = collection
            }
          })
      }

      // Handle Panel
      $scope.show = function ($event) {
        let position = $mdPanel.newPanelPosition()
          .relativeTo($element)
          .addPanelPosition($mdPanel.xPosition.OFFSET_END,
            $mdPanel.yPosition.ALIGN_TOPS)
        $mdPanel.open({
          attachTo: angular.element(document.body),
          template: $scope.template || 'Template Not Found!',
          panelClass: 'dialogueContainer',
          position: position,
          openFrom: $event,
          clickOutsideToClose: true,
          escapeToClose: true,
          focusOnOpen: false,
          locals: {
            ngModel: $scope.model,
            ngCollection: $scope.collection
          },
          controller: function ($scope, mdPanelRef, ngModel, ngCollection) {
            $scope.model = ngModel
            $scope.collection = ngCollection
            $scope.close = function () {
              if (mdPanelRef) {
                mdPanelRef.close()
              }
            }
          }
        })
      }
    }]
}))
