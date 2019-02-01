/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.FilterStreamsByTag = [
    '$scope',
    '$element',
    '$mdToast',
    '$log',
    '$http',
    '$parse',
    function ($scope, $element, $mdToast, $log, $http, $parse) {
      // Store Instance
      Stratus.Instances[_.uniqueId('filter_streams_by_tag_')] = $scope

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      // the contents get from collection
      $scope.contents = []

      // the contents type used for filter list.
      $scope.filterTags = []

      $scope.filterTagIds = []

      // constraint the contentType is choosed in showOnly
      $scope.showOnly = []
      $scope.meta = []

      $scope.separateSections = false

      // show more
      $scope.more = false

      // Data Connectivity
      $scope.$watch('collection.models', function (models) {
        if (models && models.length > 0) {
          $scope.contents = $scope.data.contents = models
        }
      })

      $scope.$watch('collection.meta.attributes.separateSections', function (separateSections) {
        $scope.separateSections = separateSections
      })

      $scope.$watch('collection.meta.attributes.filterTags',
        function (filterTag) {
          if (filterTag && filterTag.length > 0) {
            $scope.filterTags = filterTag
          }
        })

      $scope.$watch('collection.meta', function (meta) {
        if (meta) {
          $scope.meta = meta
        }
      })

      /*
       * Handle showOnly check
       */
      $scope.toggle = function (filterTag) {
        var index = $scope.showOnly.findIndex(
          function (x) {
            return x.id === filterTag.id
          })
        console.log($scope.showOnly);
        (index !== -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(filterTag);
        (index !== -1) ? $scope.filterTagIds.splice(index, 1) : $scope.filterTagIds.push(filterTag.id)
        reloadAssets()
      }

      $scope.moreFilter = function () {
        $scope.more = !$scope.more
      }

      /*
       * Recall api to get contents
       */
      function reloadAssets () {
        if (!$scope.separateSections) {
          /* *
          angular.forEach($scope.filterTagIds, function (value) {
            $scope.meta.set('api.options.tagIds', value)
            $scope.collection.fetch()
              .then(function (response) {
                console.log('response', response)
              })
          })
        } else {
          /* */
          $scope.meta.set('api.options.tagIds',
            $scope.showOnly.map(function (item) {
              return item.id
            }))
          $scope.collection.fetch()
            .then(function (response) {
              console.log('response', response)
            })
        }
      }
    }
  ]
}))
