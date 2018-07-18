// Panel Controller
// ----------------

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
        // default parameters
        var outClickClose = true // close on outside click
        var allowOnePanel = false // set to true if we need to close previous panel before opening new one
        var escapeToClose = true // set to false if no need to close the panel on Esc key pressed
        // overrides
        // attached to $scope.model not just to $scope cause some objects have different scopes but share the same model
        if ($scope.model.hasOwnProperty('outClickClose')) outClickClose = $scope.model.outClickClose
        if ($scope.model.hasOwnProperty('allowOnePanel')) allowOnePanel = $scope.model.allowOnePanel
        if ($scope.model.hasOwnProperty('escapeToClose')) escapeToClose = $scope.model.escapeToClose
        if ($scope.model.hasOwnProperty('panelRelatedToEdit') && $scope.model.panelRelatedToEdit === true) {
          escapeToClose = true
          var myOnRemoving = function (event, removePromise) {
            if (typeof Stratus.activeEdit !== "undefined" && Stratus.activeEdit !== null) Stratus.activeEdit.setEdit(false)
            delete $scope.model.done
          }
        } else {
          var myOnRemoving = function (event, removePromise) { }
        }
        // Disallow duplicate panels unconditionally: check if it is already open with the same model. Same model? Close!
        if (Stratus.hasOwnProperty('openPanelKey') && Stratus.openPanelKey === $scope.model.$$hashKey) return;
        else Stratus.openPanelKey = $scope.model.$$hashKey;
        // do we have another panel open at the same time? do we need to close it?
        if (allowOnePanel === true && Stratus.hasOwnProperty('openPanel') && Stratus.openPanel !== null) {
          Stratus.openPanel.close();
        }

        var position = $mdPanel.newPanelPosition()
          .relativeTo($element)
          .addPanelPosition($mdPanel.xPosition.OFFSET_END,
            $mdPanel.yPosition.ALIGN_TOPS)
        $mdPanel.open({
          attachTo: angular.element(document.body),
          template: $scope.template || 'Template Not Found!',
          panelClass: 'dialogueContainer',
          position: position,
          openFrom: $event,
          clickOutsideToClose: outClickClose,
          escapeToClose: escapeToClose,
          onRemoving: myOnRemoving,
          focusOnOpen: false,
          locals: {
            ngModel: $scope.model,
            ngCollection: $scope.collection
          },
          controller: function ($scope, mdPanelRef, ngModel, ngCollection) {
            $scope.model = ngModel
            $scope.collection = ngCollection
            $scope.close = function (mode) {
              delete Stratus.openPanelKey
              Stratus.openPanel = null;

              // if this panel is attached to some Edit, we need to exit this edit
              // when panel is closed with 'done' 'apply' or some other similar button
              if (
                (
                  mode === 'done' &&
                  typeof Stratus.activeEdit !== "undefined" &&
                  Stratus.activeEdit !== null
                )
                ||
                (
                  $scope.model.hasOwnProperty('done') &&
                  $scope.model.done === true &&
                  Stratus.hasOwnProperty('activeEdit') &&
                  typeof Stratus.activeEdit !== "undefined" &&
                  Stratus.activeEdit !== null
                )
              ) {
                Stratus.activeEdit.commit()
                Stratus.activeEdit.setEdit(false)
                delete $scope.model.done
                $scope.model.save()
              }

              if (mdPanelRef) {
                mdPanelRef.close().then(function() {
                  // TODO: Sitetheory-specific code
                  if (typeof setEditBlocksPositions !== 'undefined') setEditBlocksPositions()
                })
              }

            }

            Stratus.openPanel = $scope

          }

        }).then(function(result) {

          // TODO: Sitetheory-specific code
          if (typeof setEditBlocksPositions !== 'undefined') {
            console.log('panel opened')
            setEditBlocksPositions()
          }

        });
      }
    }]
}))
