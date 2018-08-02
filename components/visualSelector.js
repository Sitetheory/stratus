// Visual Selector Component
// -------------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'jquery',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.collection',
      'stratus.services.model',
      'stratus.services.details',
      'stratus.directives.src',

      // Components
      'stratus.components.search',
      'stratus.components.pagination',
      'stratus.services.utility',
      'stratus.services.visualSelector'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
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
    controller: function (
      $scope,
      $mdPanel,
      $attrs,
      Registry,
      details,
      Model,
      $http,
      $sce,
      utility,
      $filter,
      visualSelector
    ) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs,
        'visual_selector', true)

      // Variables
      var $ctrl = this

      $ctrl.$onInit = function () {
        $ctrl.layoutData = null
        $ctrl.selectedLayoutData = null

        // Asset Collection
        if ($attrs.type) {
          $scope = visualSelector.fetchCollection($scope, $attrs, 40, 'Layout')
        }
      }

      // Settings
      $scope.showGallery = false
      $scope.galleryClass = 'fa fa-plus'

      // Hydrate Settings
      $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false

      $scope.$watch('[model.data.version.layout, collection.models]',
        function (layout) {
          if (layout[0] && layout[1] && layout[1].length > 0) {
            $ctrl.layoutData = layout[1].map(function (obj) {
              return obj.data
            })
            $ctrl.selectedLayoutData = $filter('filter')($ctrl.layoutData,
              {id: layout[0].id})[0]
            $scope.selectedLayout = $ctrl.selectedLayoutData
          }
        })

      // Store Asset Property for Verification
      $scope.property = $attrs.property || null

      // Store Toggle Options for Custom Actions
      $scope.toggleOptions = {
        multiple: _.isJSON($attrs.multiple)
          ? JSON.parse($attrs.multiple)
          : false
      }

      // Data Connectivity
      $scope.model = null
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        }
      })

      $scope.layoutRawDesc = function (plainText) {
        return $sce.trustAsHtml(plainText)
      }

      // Update the Selected Layout Details
      $scope.selectedLayout = null

      $scope.chooseLayout = function (property, data) {
        $scope.updateDetails(data)
        $scope.model.data.version.layout = data
      }

      $scope.updateDetails = function (layoutData) {
        if (!Stratus.Environment.get('production')) {
          console.log(layoutData)
        }
        $scope.selectedLayout = layoutData
      }

      // display expanded view if clicked on change button
      $scope.displayGallery = function () {
        $scope.showGallery = true
        $scope.galleryClass = 'fa fa-minus'
      }

      // zoom view for chosen  layout
      $scope.zoomView = function (layoutDetail) {
        console.log(layoutDetail)
        visualSelector.zoomviewDialog($scope, layoutDetail, 'layoutDetail')
      }

      $scope.toggleGallery = function () {
        if ($scope.showGallery === true) {
          $scope.galleryClass = 'fa fa-plus'
          $scope.showGallery = false
        } else if ($scope.showGallery === false) {
          $scope.galleryClass = 'fa fa-minus'
          $scope.showGallery = true
        }
      }
    },
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/visualSelector' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
