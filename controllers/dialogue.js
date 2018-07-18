// Dialogue Controller
// -------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles simple dialogue display
  // with bindings for the associated model
  Stratus.Controllers.Dialogue = [
    '$scope',
    '$element',
    '$parse',
    '$mdDialog',
    function ($scope, $element, $parse, $mdDialog) {
      // Store Instance
      var uid = _.uniqueId('dialogue_')
      Stratus.Instances[uid] = $scope

      // Digest Template
      $scope.template = $element.attr('template') || null
      $scope.template = $scope.template ? document.querySelector(
        $scope.template) : null
      $scope.template = $scope.template ? $scope.template.innerHTML : null

      // Digest Model Bindings
      var ownModel = $scope.model
      $scope.model = null
      $scope.$parent.$watch($element.attr('ng-model'), function (model) {
        if (model && typeof model === 'object') {
          $scope.model = model
        }
      })
      if ($scope.model === null) {
        $scope.model = ownModel
      }

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
              $mdDialog.hide().then(function() {
                // TODO: Sitetheory-specific code
                if (typeof setEditBlocksPositions !== 'undefined') setEditBlocksPositions()
              })
            }
            // TODO: Sitetheory-specific code
            $scope.jsTreeRemove = function(menuLinkId) {
              var jsTreeElId = $("#menuLine"+menuLinkId).parent().attr('id')
              node = $("#" + jsTreeElId)
              tree.jstree(true).delete_node([node])
              setEditBlocksPositions()
            }
            // end of TODO
          }
        }).then(function() {
          // TODO: Sitetheory-specific code
          if (typeof setEditBlocksPositions !== 'undefined') setEditBlocksPositions()
        })
      }

    }]
}))
