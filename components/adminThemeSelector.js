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

      // Components
      'stratus.components.search',
      'stratus.components.pagination',
      'stratus.services.commonMethods',
      'stratus.services.adminThemeSelector'
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.$, root.angular);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, $, angular) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.AdminThemeSelector = {
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
    controller: function (
      $scope,
      $mdPanel,
      $attrs,
      registry,
      details,
      model,
      $sce,
      collection,
      $window,
      $log,
      $http,
      $mdDialog,
      commonMethods,
      adminThemeSelector
    ) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'admin_theme_selector', true);

      // Hydrate Settings
      $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false;

      var $ctrl = this;

      $ctrl.errorMsg = null;
      $ctrl.heartCollor = [];
      $ctrl.themes = [];
      $ctrl.currentThemes = $ctrl.themes;
      $ctrl.zoomView = zoomView;
      $ctrl.selectedTheme = null;

      // mock DB
      $ctrl.categories = ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum'];

      // define methods
      $ctrl.sortBy = sortBy;
      $ctrl.setFavorite = setFavorite;
      $ctrl.getFavoriteStatus = getFavoriteStatus;
      $ctrl.showCategory = showCategory;
      $ctrl.chooseTheme = chooseTheme;
      $ctrl.finishChoosingTheme = finishChoosingTheme;

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
      $scope.$watch('collection.models', function (models) {
        if (models.length > 0) {
          $ctrl.themes = models;
          $ctrl.currentThemes = models;
        }
      });

      // automatically run security check the result of html
      $scope.themeRawDesc = function (plainText) {
        return $sce.trustAsHtml(plainText);
      };

      // display expanded view if clicked on change button
      function zoomView(themeDetail, $event) {
        $scope.themeDetail = themeDetail.data;

        var position = $mdPanel.newPanelPosition()
          .absolute()
          .center();

        var config = {
          attachTo: angular.element(document.body),
          scope: $scope,
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          fullscreen: false,
          controller: ZoomController,
          templateUrl: 'themeDetail.html',
          hasBackdrop: true,
          panelClass: 'media-dialog',
          position: position,
          trapFocus: true,
          clickOutsideToClose: true,
          escapeToClose: false,
          focusOnOpen: true,
          zIndex: 2
        };

        $mdPanel.open(config);
      };

      function ZoomController(mdPanelRef) {
        $scope.closeDialog = function () {
          mdPanelRef.close();
        };
      }

      // Functionality methods
      function showCategory(index) {
        $ctrl.currentThemes = $ctrl.themes.filter(theme => theme.category == $ctrl.categories[index]);
        if (index < 0) {
          $ctrl.currentThemes = $ctrl.themes;
        }
      }

      function setFavorite(id) {
        var index = $ctrl.themes.findIndex(x => x.data.id == id);
        return $ctrl.themes[index].preferred = !$ctrl.themes[index].preferred;
      };

      function getFavoriteStatus(id) {
        var index = $ctrl.themes.findIndex(x => x.data.id == id);
        return $ctrl.themes[index].preferred ? 'fa fa-heart favorite' : 'fa fa-heart-o';
      };

      function chooseTheme(themeData) {
        $ctrl.selectedTheme = themeData;
      }

      function finishChoosingTheme(themeData) {
        var data = {
          templateId: themeData.data.id
        };
        adminThemeSelector.selectTheme(data).then(function (res) {
          if (commonMethods.getStatus(res).code == commonMethods.RESPONSE_CODE().success) {
            $window.location.href = '/Site/Edit/Success';
          } else {
            $ctrl.errorMsg = commonMethods.getStatus(res).message;
          }
        });
      }

      function sortBy(type) {
        $ctrl.currentThemes = (function (type) {
          switch (type) {
            case 'latest':
              return latest();
            case 'populate':
              return populate();
            case 'favorite':
              return favorite();
            default:
              return $ctrl.currentThemes;
          }
        })(type);
      };

      // Helpers
      function latest() {
        return $ctrl.currentThemes.sort(function (a, b) {
          return parseFloat(a.data.timeEdit) - parseFloat(b.data.timeEdit);
        });
      }

      function populate() {
        return $ctrl.currentThemes.sort(function (a, b) {
          return parseFloat(b.populate) - parseFloat(a.populate);
        });
      }

      function favorite() {
        return $ctrl.currentThemes.sort(function (a) {
          return $ctrl.favorites.includes(a.id) ? -1 : 1;
        });
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
