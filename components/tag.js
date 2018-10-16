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
      'stratus.services.utility',
      'stratus.services.media'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This component intends to allow editing of various tags
  Stratus.Components.Tag = {
    bindings: {
      ngModel: '=',
      collection: '<'
    },
    controller: function ($scope, $parse, $attrs, utility, media, $location, $rootScope) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs, 'tag', true)
      var $ctrl = this
      $ctrl.selectedChips = []
      $ctrl.collection = []
      $ctrl.queryText = ''

      // init model for md-chips
      $scope.$watch('$ctrl.ngModel', function (items) {
        $ctrl.selectedChips = items || []
      })

      // init model for autocomplete
      $scope.$watch('$ctrl.collection', function (data) {
        $ctrl.collection = data
      })
      // this watch function use to watch changes in tags and save and delete automatically when add or delete route.
      $scope.$watch('$ctrl.selectedChips', function (newData, oldData) {
        if (oldData.length > 0) {
          var dataRes = {}
          dataRes.tags = $ctrl.selectedChips
          if ($rootScope.$$childHead.collection !== undefined) {
            if ($rootScope.$$childHead.collection.target === 'Media') {
              if ($rootScope.mediaId !== undefined) {
                media.updateMedia($rootScope.mediaId, dataRes).then(
                  function (response) {
                    media.fetchOneMedia($rootScope.mediaId)
                  },
                  function (rejection) {
                    if (!Stratus.Environment.get('production')) {
                    }
                  })
              }
            }
          } else {
            var contentId = $location.absUrl().split('?id=')[1]
            if (contentId) {
              var apiUrl = $rootScope.$$childHead.data.urlRoot
              updateContent(contentId, dataRes, apiUrl).then(function (response) {
                $rootScope.$$childHead.data.changed = false
              })
            }
          }
        }
      })
      // Update  tags of a content
      function updateContent (fileId, data, apiUrl) {
        return utility.sendRequest(data, 'PUT', apiUrl + '/' + fileId)
      }

      /**
       * Init value for search list
       */
      $ctrl.queryData = function () {
        var results = $ctrl.collection.filter($ctrl.queryText)
        $scope.status = true
        return Promise.resolve(results).then(function (value) {
          // return value
          var returnArr = value.filter(function (item) {
            if ($ctrl.queryText && ($ctrl.queryText !== '' || $ctrl.queryText !== undefined)) {
              for (var i = 0; i < $ctrl.selectedChips.length; i++) {
                if (item.name.toUpperCase() === $ctrl.queryText.toUpperCase()) {
                  $scope.status = true
                  if ($ctrl.selectedChips[i].name.toUpperCase() === $ctrl.queryText.toUpperCase()) {
                    $ctrl.queryText = null
                    jQuery('input').blur()
                    $rootScope.$$childHead.data.meta.data.status = [{ code: 'INVALID', message: 'You have already selected a tag with that name', origin: 'name' }]
                    $rootScope.$$childHead.data.error = true
                    $scope.status = true
                  } else {
                    $rootScope.$$childHead.data.error = false
                    $scope.status = true
                    // return true;
                  }
                } else {
                  $scope.status = false
                }
              }
            } else {
              $scope.status = true
            }
            return $scope.status
          })
          $ctrl.selectedChips.forEach(predata => {
            var resultData = returnArr.find(mainArr => mainArr.name === predata.name)
            if (resultData !== undefined) {
              returnArr = returnArr.filter(function (itemNew) {
                return itemNew.name !== resultData.name
              })
            }
          })
          return returnArr
        })
      }

      /**
       * Return the proper object when the append is called.
       * @return {name: 'value'}
       */
      $ctrl.transformChip = function (chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
          return chip
        }

        // Otherwise, create a new one
        return { name: chip }
      }

      /**
       * Add an object when it isn't match with the exists list;
       */
      $ctrl.createTag = function (query) {
        var data = { name: query }
        media.createTag(data).then(function (response) {
          if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
            $ctrl.selectedChips.push(response.data.payload)
            $rootScope.$$childHead.data.save()
          } else {
            $rootScope.$$childHead.data.meta.data.status = response.data.meta.status
            $rootScope.$$childHead.data.error = true
          }
        })
        $ctrl.queryText = null
        jQuery('input').blur()
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/tag' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
