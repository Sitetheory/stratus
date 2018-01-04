// Visual Selector Component
// -------------------------

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
      'stratus.components.pagination',
      'stratus.services.commonMethods'
    ], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // This component intends to handle binding of an
  // item array into a particular attribute.
  // code layout-option{'collapsed','expanded'}
  Stratus.Components.VisualSelector = {
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
      layoutOption: '@',
      details: '<',
      search: '<'
    },
    controller: function ($scope, $mdPanel, $attrs, registry, details, model, $http, $sce, commonMethods, $filter) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'visual_selector', true);

      // Variables
      var $ctrl = this;
      $ctrl.layoutData = null;
      $ctrl.selectedLayoutData = null;

      // Settings
      $scope.showGallery = false;
      $scope.galleryClass = 'fa fa-plus';

      // Hydrate Settings
      $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false;

      $scope.$watch('[model.data.version.layout.id, collection.models]', function (layout) {
        if (layout[0] && layout[1] && layout[1].length > 0) {
          $ctrl.layoutData = layout[1].map(function (obj) {
            return obj.data;
          });
          $ctrl.selectedLayoutData = $filter('filter')($ctrl.layoutData, { id: layout[0] })[0];
          $scope.selectedName = $ctrl.selectedLayoutData.name;
          $scope.selectedDesc = $ctrl.selectedLayoutData.description;
        }
      });

      // Asset Collection
      if ($attrs.type) {
        $scope.registry = new registry();
        var request = {
          target: $attrs.type || 'Layout',
          id: null,
          manifest: false,
          decouple: true,
          selectedId: $attrs.selectedId,
          property: $attrs.property,
          api: {
            options: {},
            limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 40
          }
        };
        if ($scope.api && angular.isObject($scope.api)) {
          request.api = _.extendDeep(request.api, $scope.api);
        }
        $scope.registry.fetch(request, $scope);

        $scope.selectedDetails = new details();
        $scope.selectedDetails.fetch(request, $scope);

      }

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

      $scope.layoutRawDesc = function (plainText) {
        return $sce.trustAsHtml(plainText);
      };

      // Update the Selected Layout Details
      $scope.selectedName = null;
      $scope.selectedDesc = null;

      $scope.updateDetails = function (options) {
        if (!Stratus.Environment.get('production')) {
          console.log(options.description);
        }
        $scope.selectedName = options.name;
        $scope.selectedDesc = options.description;
      };

      // display expanded view if clicked on change button
      $scope.displayGallery = function () {
        $scope.showGallery = true;
        $scope.galleryClass = 'fa fa-minus';
      };

      // zoom view for chosen  layout
      $scope.zoomView = function (layoutDetail) {
        $scope.layoutDetail = layoutDetail;
        var position = $mdPanel.newPanelPosition()
          .absolute()
          .center();
        var config = {
          attachTo: angular.element(document.body),
          scope: $scope,
          controller: ZoomController,
          templateUrl: 'layoutDetail.html',
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

      $scope.toggleGallery = function () {
        if ($scope.showGallery === true) {
          $scope.galleryClass = 'fa fa-plus';
          $scope.showGallery = false;
        } else if ($scope.showGallery === false) {
          $scope.galleryClass = 'fa fa-minus';
          $scope.showGallery = true;
        }
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/visualSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };

}));
