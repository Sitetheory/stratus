// Theme Selector Component
// ------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'jquery',
      'underscore',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.collection',
      'stratus.services.model',
      'stratus.services.details',

      // Components
      'stratus.components.search',
      'stratus.components.pagination'
    ], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.ThemeSelector = {
    bindings: {
      // Basic
      elementId: '@',
      ngModel: '=',
      property: '@',

      // Selector
      type: '@',
      limit: '@',
      multiple: '<',

      // Custom
      details: '<',
      search: '<'
    },
    controller: function ($scope, $mdPanel, $attrs, registry, details, model, $sce, collection) {
      $scope.themeRawDesc = function (plainText) {
        return $sce.trustAsHtml(plainText);
      };

      this.uid = _.uniqueId('theme_selector_');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      // Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

      // Hydrate Settings
      $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false;

      // Asset Collection
      if ($attrs.type) {
        $scope.registry = new registry();
        var request = {
          target: $attrs.type || 'Template',
          id: null,
          manifest: false,
          decouple: true,
          selectedid: $attrs.selectedid,
          property: $attrs.property,
          api: {
            options: {},
            limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 3
          }
        };
        if ($scope.api && angular.isObject($scope.api)) {
          request.api = _.extendDeep(request.api, $scope.api);
        }
        $scope.registry.fetch(request, $scope);

        // Get Details of selected template by attribute selectedid
        $scope.selectedDetails = new details();
        $scope.selectedDetails.fetch(request, $scope);
      }

      // console.log($scope);
      // Store Asset Property for Verification
      $scope.property = $attrs.property || null;

      // Store Toggle Options for Custom Actions
      $scope.toggleOptions = {
        multiple: _.isJSON($attrs.multiple) ? JSON.parse($attrs.multiple) : false
      };

      // Data Connectivity
      $scope.model = null;

      $scope.$watch('$ctrl.ngModel', function (data) {

        if (data instanceof model && data !== $scope.model) {
          $scope.model = data;
        }

      });

      // Update the Selected Theme Details

      $scope.selectedName = null;
      $scope.selectedDesc = null;

      $scope.updateDetails = function (options) {
        $scope.selectedName = options.name;
        $scope.selectedDesc = options.description;
      };

      // display expanded view if clicked on change button
      $scope.zoomView = function (themeDetail) {
        $scope.themeDetail = themeDetail;
        var position = $mdPanel.newPanelPosition()
          .absolute()
          .center();
        var config = {
          attachTo: angular.element(document.body),
          scope: $scope,
          controller: ZoomController,
          templateUrl: 'themeDetail.html',
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
      };

      function ZoomController(mdPanelRef) {

        $scope.closeDialog = function () {

          mdPanelRef.close();
        };
      }
    },
    // templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };

}));
