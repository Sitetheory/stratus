/* global define */

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
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This component intends to allow editing of various selections depending on
  // context.
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
      details: '<',
      isNewTheme: '@'
    },
    controller: function (
      $scope,
      $mdPanel,
      $attrs,
      Registry,
      details,
      Model,
      $sce,
      Collection,
      $window,
      commonMethods,
      visualSelector,
      $filter
    ) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'theme_selector',
        true)

      var $ctrl = this

      $ctrl.$onInit = function () {
        // Hydrate Settings
        $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false

        $ctrl.errorMsg = null
        $ctrl.heartCollor = []
        $ctrl.zoomView = zoomView
        $ctrl.selectedTheme = null
        $ctrl.showGallery = $ctrl.isNewTheme
        $ctrl.currentThemes = []

        // mock DB
        $ctrl.categories = [
          'Lorem ipsum',
          'Lorem ipsum',
          'Lorem ipsum',
          'Lorem ipsum',
          'Lorem ipsum',
          'Lorem ipsum'
        ]

        // define methods
        $ctrl.sortBy = sortBy
        $ctrl.setFavorite = setFavorite
        $ctrl.showCategory = showCategory
        $ctrl.chooseTheme = chooseTheme
        $ctrl.themeRawDesc = themeRawDesc
        $ctrl.toggleGallery = toggleGallery
        $ctrl.finishChoosingTheme = finishChoosingTheme

        // Asset Collection
        if ($attrs.type) {
          $scope = visualSelector.fetchCollection($scope, $attrs, 3,
            'Template')
        }
      }

      // Store Asset Property for Verification
      $scope.property = $attrs.property || null

      // Store Toggle Options for Custom Actions
      $scope.toggleOptions = {
        multiple: _.isJSON($attrs.multiple)
          ? JSON.parse($attrs.multiple)
          : false
      }

      // Data Connectivity
      $scope.$watch('[model.data.version.template, collection.models]',
        function (theme) {
          if (theme[0] && theme[1] && theme[1].length > 0) {
            $ctrl.currentThemes = theme[1]

            if (!$ctrl.selectedTheme) {
              var themeData = $ctrl.currentThemes.map(function (obj) {
                return obj.data
              })
              $ctrl.selectedTheme = $filter('filter')(themeData, {
                id: theme[0].id
              })[0]
            }
          }
        })

      // automatically run security check the result of html
      function themeRawDesc (plainText) {
        return $sce.trustAsHtml(plainText)
      }

      // display expanded view if clicked on change button
      function zoomView (themeDetail) {
        visualSelector.zoomviewDialog($scope, themeDetail.data, 'themeDetail')
      }

      // Functionality methods
      function showCategory (index) {
        console.log('Not implement yet')
      }

      function toggleGallery () {
        $ctrl.showGallery = !$ctrl.showGallery
      }

      function setFavorite (id) {
        console.log('Not implement yet')
      }

      function chooseTheme (themeData) {
        $ctrl.selectedTheme = themeData
        $scope.model.data.version.template = themeData
      }

      /**
       * @param themeData
       */
      function finishChoosingTheme (themeData) {
        var data = {
          templateId: themeData.id
        }
        visualSelector.selectTheme(data).then(function (res) {
          if (commonMethods.getStatus(res).code ===
            commonMethods.RESPONSE_CODE.success) {
            $window.location.href = '/Site/Edit/Success'
          } else {
            $ctrl.errorMsg = commonMethods.getStatus(res).message
          }
        })
      }

      function sortBy (type) {
        console.log('Not implement yet')
        // $ctrl.currentThemes = (function (type) {
        //   switch (type) {
        //     case 'latest':
        //       return latest();
        //     case 'populate':
        //       return populate();
        //     case 'favorite':
        //       return favorite();
        //     default:
        //       return $ctrl.currentThemes;
        //   }
        // })(type);
      }

      // Helpers
      // function latest() {
      //   return $ctrl.currentThemes.sort(function (a, b) {
      //     return parseFloat(a.data.timeEdit) - parseFloat(b.data.timeEdit);
      //   });
      // }

      // function populate() {
      //   return $ctrl.currentThemes.sort(function (a, b) {
      //     return parseFloat(b.populate) - parseFloat(a.populate);
      //   });
      // }

      // function favorite() {
      //   return $ctrl.currentThemes.sort(function (a) {
      //     return $ctrl.favorites.includes(a.id) ? -1 : 1;
      //   });
      // }

      $scope.model = null
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        }
      })
    },
    templateUrl: Stratus.BaseUrl +
    'sitetheorystratus/stratus/components/themeSelector' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
