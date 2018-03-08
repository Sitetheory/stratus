(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.registry',
      'stratus.services.details',
      'stratus.services.commonMethods'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  Stratus.Services.VisualSelector = ['$provide', function ($provide) {
    $provide.factory('visualSelector', [
      '$q',
      '$http',
      '$mdPanel',
      'registry',
      'details',
      'commonMethods',
      function (
        $q,
        $http,
        $mdPanel,
        registry,
        details,
        commonMethods
      ) {
      var apiUrl = '/Api/Media/';

      function selectTheme(data) {
        return commonMethods.sendRequest(data, 'POST', '/Api/Template');
      }

      function fetchCollection(scope, attrs, defaultLimit, defaultTarget) {
        scope.registry = new registry();
        var request = {
          target: attrs.type || defaultTarget,
          id: null,
          manifest: false,
          decouple: true,
          selectedid: attrs.selectedid,
          property: attrs.property,
          api: {
            options: {},
            limit: _.isJSON(attrs.limit) ? JSON.parse(attrs.limit) : defaultLimit
          }
        };
        if (scope.api && angular.isObject(scope.api)) {
          request.api = _.extendDeep(request.api, scope.api);
        }
        scope.registry.fetch(request, scope);

        // Get Details of selected template by attribute selectedid
        scope.selectedDetails = new details();
        scope.selectedDetails.fetch(request, scope);
        return scope;
      }

      function zoomviewDialog(scope, viewDetailData, template) {
        scope[template] = viewDetailData;
        var position = $mdPanel.newPanelPosition()
          .absolute()
          .center();
        var config = {
          attachTo: angular.element(document.body),
          scope: scope,
          controller: ['mdPanelRef', function (mdPanelRef) {
            scope.closeDialog = function () {
              mdPanelRef.close();
            };
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
        };

        $mdPanel.open(config);
      }

      return {
        zoomviewDialog: zoomviewDialog,
        selectTheme: selectTheme,
        fetchCollection: fetchCollection
      };
    }]);
  }];

}));
