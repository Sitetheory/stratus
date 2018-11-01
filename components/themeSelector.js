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
      'stratus.directives.src',
      'stratus.services.utility',
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
      utility,
      visualSelector,
      $filter,
      $http
    ) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs, 'theme_selector',
        true)

      var $ctrl = this
        $scope.sort='oldest';
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
        // $ctrl.categories = [
        //   'Lorem ipsum',
        //   'Lorem ipsum',
        //   'Lorem ipsum',
        //   'Lorem ipsum',
        //   'Lorem ipsum',
        //   'Lorem ipsum'
        // ]
          $ctrl.categories = [{'catId':'all','catName':'All'}];
              listTag().then(function (response) {
                   var carData = response.data.payload;
                   if(carData){
                      carData.forEach(catName => {
                          if(catName.name){
                              if ($ctrl.categories.indexOf(catName.name) === -1) $ctrl.categories.push({'catId':catName.id,'catName':catName.name});
                          }
                      })
                  }else{
                      $ctrl.categories = [];
                  }
              })

          // mock DB to this
          $ctrl.sortingoptions = [
              'oldest',
              'latest',
              'popular',
              'favorite'
          ]

        // define methods
        $ctrl.sortBy = sortBy
        $ctrl.setFavorite = setFavorite
        $ctrl.showCategory = showCategory
        $ctrl.chooseTheme = chooseTheme
        $ctrl.themeRawDesc = themeRawDesc
        $ctrl.toggleGallery = toggleGallery
        $ctrl.finishChoosingTheme = finishChoosingTheme
        $ctrl.sortByCategory = sortByCategory

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
      // used to show selected frame in popup
        $scope.iframeView = function(type){
            switch (type) {
                case 'desktop':
                    $scope.desktop = true
                    $scope.mobile = false
                    $scope.tablet = false
                    $scope.selecteddesktopframe = 'selected-frame'
                    $scope.selectedtabletframe = ''
                    $scope.selectedmobileframe = ''
                    break;
                case 'tablet':
                    $scope.tablet = true
                    $scope.desktop = false
                    $scope.mobile = false
                    $scope.selectedtabletframe = 'selected-frame'
                    $scope.selecteddesktopframe = ''
                    $scope.selectedmobileframe = ''
                    break;
                case 'mobile':
                    $scope.mobile = true
                    $scope.tablet = false
                    $scope.desktop = false
                    $scope.selectedmobileframe = 'selected-frame'
                    $scope.selectedtabletframe = ''
                    $scope.selecteddesktopframe = ''
                    break;
                default:
                    $scope.desktop = true;
                    $scope.selecteddesktopframe = 'selected-frame'
                    $scope.selectedmobileframe = ''
                    $scope.selectedtabletframe = ''
            }
        }
        $scope.desktop = true;
        $scope.selecteddesktopframe = 'selected-frame'
        $scope.selectedmobileframe = ''
        $scope.selectedtabletframe = ''
      // Data Connectivity
      $scope.$watch('[model.data.version.template, collection.models]',
        function (theme) {
          if (theme[0] && theme[1] && theme[1].length > 0) {
            $ctrl.currentThemes = theme[1]
            if (!$ctrl.selectedTheme) {
              var themeData = $ctrl.currentThemes.map(function (obj) {
                return obj.data
              })
              $ctrl.selectedTheme = theme[0]
              $ctrl.selectedTheme = themeData.filter(function (themeItem) {
                return (themeItem.id === theme[0].id)
              })[0]
            }
          }
            // $ctrl.categories = [];
            // angular.forEach($ctrl.currentThemes, function (value, key) {
            //     if(value.data.tags.length > 0 ){
            //         angular.forEach(value.data.tags, function (value1, key1) {
            //             var resultData = $ctrl.categories.find( mainArr => mainArr === value1.name );
            //             if(resultData === undefined){
            //                 $ctrl.categories.push(value1.name)
            //             }
            //         })
            //
            //     }
            //
            // })
        })

      // automatically run security check the result of html
      function themeRawDesc (plainText) {
        return $sce.trustAsHtml(plainText)
      }

      // display expanded view if clicked on change button
      function zoomView (themeDetail) {
          console.log(themeDetail);
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
        //     console.log(id);
        //   var data = {themeId: id,flagTypeId:3}
        // console.log('Not implement yet')
        //    var prototype = {};
        //    prototype.header.set({});
        //    prototype.meta.set({"options":{"action":"templatesAddFavorite"}})
        //   prototype.meta.set({"method":"POST"})
        //   var data = {name: query}
        //   media.createTag(data).then(function (response) {
        //       if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
        //           $ctrl.selectedChips.push(response.data.payload)
        //           $rootScope.$$childHead.data.save();
        //       }else{
        //           $rootScope.$$childHead.data.meta.data.status = response.data.meta.status
        //           $rootScope.$$childHead.data.error = true
        //       }
        //   })
      //     var prototype = {
      //         method: "POST",
      //         url: that.url(),
      //         headers: {},
      //         headers.meta.set(response.data.meta || {})
      //        // headers.meta:{"options":{"action":"fancy"}}
      // }
      //     $http(prototype).then(function (response) {
      //         if (response.status === 200 && angular.isObject(response.data)) {
      //
      //         } else {
      //
      //         }
      //     }).catch(function () {
      //
      //     })
          var data = {flagEntityId: id,flagEntity:'Template',alias:'SitetheoryTemplateBundle:Template'};
          saveFavorite(data).then(function (response) {
              //       if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
              //           $ctrl.selectedChips.push(response.data.payload)
              //           $rootScope.$$childHead.data.save();
              //       }else{
              //           $rootScope.$$childHead.data.meta.data.status = response.data.meta.status
              //           $rootScope.$$childHead.data.error = true
              //       }
          })
      }
      function saveFavorite(data) {
          // var prototype = {
          //     headers: { meta: {"options":{"action":"templatesAddFavorite"}}}
          // }
          //prototype.headers.set({});
          //prototype.meta.set({"options":{"action":"templatesAddFavorite"}})
          return utility.sendRequest(data, 'PUT', '/Api/Flag?&options[action]=addFavorite')
      }


      function chooseTheme (themeData) {
        $ctrl.selectedTheme = themeData
        $scope.model.data.version.templateId = themeData.id
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
          if (utility.getStatus(res).code ===
            utility.RESPONSE_CODE.success) {
            $window.location.href = '/Site/Edit/Success'
          } else {
            $ctrl.errorMsg = utility.getStatus(res).message
          }
        })
      }
      function sortBy (type) {
        $ctrl.currentThemes = (function (type) {
          switch (type) {
            case 'oldest':
              return oldest();
            case 'latest':
              return latest();
            case 'popular':
              return popular();
            case 'favorite':
              return favorite();
            default:
              return $ctrl.currentThemes;
          }
        })(type);
      }

      function sortByCategory(catName) {
          listTemplateOfSelectedTag(catName.catId).then(function (response) {
              $scope.collection.models = response.data.payload;
              $ctrl.showGallery = true;
          })
      }
        function listTemplateOfSelectedTag (id) {
            return utility.sendRequest(null,'GET', '/Api/Asset?q='+id+'&options[action]=templatesByTag');
        }
          function listTag () {
              return utility.sendRequest(null,'GET', '/Api/Template/Tag?&options[action]=templateTags');
          }
      // Helpers
      function latest() {
        return $ctrl.currentThemes.sort(function (a, b) {
            if(b.timeEdit){
                return parseFloat(a.timeEdit) - parseFloat(b.timeEdit);
            }else{
                return parseFloat(a.data.timeEdit) - parseFloat(b.data.timeEdit);
            }

        });
      }

        function oldest() {
            return $ctrl.currentThemes.sort(function (a, b) {
                if(a.timeEdit){
                    return parseFloat(b.timeEdit) - parseFloat(a.timeEdit);
                }else{
                    return parseFloat(b.data.timeEdit) - parseFloat(a.data.timeEdit);
                }

            });
        }
      function popular() {
        return $ctrl.currentThemes.sort(function (a, b) {
          return parseFloat(b.populate) - parseFloat(a.populate);
        });
      }

      function favorite() {
          return $ctrl.currentThemes.sort(function (a, b) {
              return (b.data.preferred) - (a.data.preferred);
          });
      }

      $scope.model = null
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        }
      })
    },
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/themeSelector' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
