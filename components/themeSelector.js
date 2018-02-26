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
      'stratus.components.pagination',
      'stratus.services.commonMethods',
      'stratus.services.visualSelector'
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.$, root.angular);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, $, angular) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.ThemeSelector = {
    bindings: {
      // Basic
      elementId: '@',
      ngModel: '=',
      property: '@',

      // Selector
      type: '@',
      limit: '@',

      // Custom
      details: '<'
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
      commonMethods,
      visualSelector
    ) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'theme_selector', true);

      var $ctrl = this;

      $ctrl.$onInit = function () {
        // Hydrate Settings
        $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false;

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
        $ctrl.themeRawDesc = themeRawDesc;
        $ctrl.finishChoosingTheme = finishChoosingTheme;

        // Asset Collection
        if ($attrs.type) {
          $scope = visualSelector.fetchCollection($scope, $attrs, 3, 'Template');
        }
      };

      // Store Asset Property for Verification
      $scope.property = $attrs.property || null;

      // Store Toggle Options for Custom Actions
      $scope.toggleOptions = {
        multiple: _.isJSON($attrs.multiple) ? JSON.parse($attrs.multiple) : false
      };

      // Data Connectivity
      $scope.$watch('collection.models', function (models) {
        if (models && models.length > 0) {
          $ctrl.themes = models;
          $ctrl.currentThemes = models;
        }
      });

      // automatically run security check the result of html
      function themeRawDesc(plainText) {
        return $sce.trustAsHtml(plainText);
      };

      // display expanded view if clicked on change button
      function zoomView(themeDetail) {
        visualSelector.zoomviewDialog($scope, themeDetail.data, 'themeDetail');
      }

      // Functionality methods
      function showCategory(index) {
        $ctrl.currentThemes = $ctrl.themes.filter(function (theme) {
          return (theme.category === $ctrl.categories[index]);
        });
        if (index < 0) {
          $ctrl.currentThemes = $ctrl.themes;
        }
      }

      function setFavorite(id) {
        var index = $ctrl.themes.findIndex(function (x) {
          return (x.data.id === id);
        });

        // The return value is setting, so is this intended to be a chained return?
        return $ctrl.themes[index].preferred = !$ctrl.themes[index].preferred;
      }

      function getFavoriteStatus(id) {
        var index = $ctrl.themes.findIndex(function (x) {
          return (x.data.id === id);
        });
        return $ctrl.themes[index].preferred ? 'fa fa-heart favorite' : 'fa fa-heart-o';
      }

      function chooseTheme(themeData) {
        $ctrl.selectedTheme = themeData;
      }

      function finishChoosingTheme(themeData) {
        var data = {
          templateId: themeData.id
        };
        visualSelector.selectTheme(data).then(function (res) {
          if (commonMethods.getStatus(res).code === commonMethods.RESPONSE_CODE.success) {
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
      }

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
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
