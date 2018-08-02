/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.registry',
      'stratus.services.details',
      'stratus.services.utility'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Services.VisualSelector = [
    '$provide', function ($provide) {
      $provide.factory('visualSelector', [
        '$q',
        '$http',
        '$mdPanel',
        'Registry',
        'details',
        'utility',
        function (
          $q,
          $http,
          $mdPanel,
          Registry,
          Details,
          utility
        ) {
          function selectTheme (data) {
            return utility.sendRequest(data, 'POST', '/Api/Site')
          }

          function fetchCollection (scope, attrs, defaultLimit, defaultTarget) {
            scope.registry = new Registry()
            var request = {
              target: attrs.type || defaultTarget,
              id: null,
              manifest: false,
              decouple: true,
              selectedid: attrs.selectedid,
              property: attrs.property,
              api: {
                options: {},
                limit: _.isJSON(attrs.limit)
                  ? JSON.parse(attrs.limit)
                  : defaultLimit
              }
            }
            if (scope.api && angular.isObject(scope.api)) {
              request.api = _.extendDeep(request.api, scope.api)
            }
            scope.registry.fetch(request, scope)

            // Get Details of selected template by attribute selectedid
            scope.selectedDetails = new Details()
            scope.selectedDetails.fetch(request, scope)
            return scope
          }

          function zoomviewDialog (scope, viewDetailData, template) {
            scope[template] = viewDetailData
            var position = $mdPanel.newPanelPosition().absolute().center()
            var config = {
              attachTo: angular.element(document.body),
              scope: scope,
              controller: [
                'mdPanelRef', function (mdPanelRef) {
                  scope.closeDialog = function () {
                    mdPanelRef.close()
                  }
                }],
              templateUrl: template + '.html',
              hasBackdrop: true,
              panelClass: 'media-dialog',
              position: position,
              trapFocus: true,
              zIndex: 150,
              clickOutsideToClose: true,
              escapeToClose: false,
              focusOnOpen: true
            }

            $mdPanel.open(config)
          }

          return {
            zoomviewDialog: zoomviewDialog,
            selectTheme: selectTheme,
            fetchCollection: fetchCollection
          }
        }])
    }]
}))
