// Pagination Component
// --------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'angular-material',
      'stratus.services.collection'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'pagination'

  // This component intends to handle binding and
  // full pagination for the scope's collection.
  Stratus.Components.Pagination = {
    controller: function ($scope, $attrs, Collection) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Settings
      $scope.pages = []
      $scope.startPage = 0
      $scope.endPage = 0

      // Localize Collection
      $scope.collection = null
      $scope.$watch('$parent.collection', function (data) {
        if (data && data instanceof Collection) {
          $scope.collection = data
        }
      })

      $scope.scrollTop = function () {
        document.getElementById($attrs.scrollTopElement || 'content').scrollIntoView()
      }

      // Handle Page Changes
      $scope.$watchCollection(
        '[collection.meta.data.pagination.pageCurrent, collection.meta.data.pagination.pageTotal]',
        function (newValue, oldValue) {
          let pageCurrent = newValue[0]
          if (!pageCurrent) {
            return true
          }
          if ($scope.collection.meta.get('pagination.pageTotal') <= 10) {
            // less than 10 total pages so show all
            $scope.startPage = 1
            $scope.endPage = $scope.collection.meta.get('pagination.pageTotal')
          } else {
            // more than 10 total pages so calculate start and end pages
            if ($scope.collection.meta.get('pagination.pageCurrent') <= 6) {
              $scope.startPage = 1
              $scope.endPage = 10
            } else if ($scope.collection.meta.get('pagination.pageCurrent') + 4 >=
              $scope.collection.meta.get('pagination.pageTotal')) {
              $scope.startPage = $scope.collection.meta.get('pagination.pageTotal') - 9
              $scope.endPage = $scope.collection.meta.get('pagination.pageTotal')
            } else {
              $scope.startPage = $scope.collection.meta.get('pagination.pageCurrent') - 5
              $scope.endPage = $scope.collection.meta.get('pagination.pageCurrent') + 4
            }
          }

          if (!isNaN($scope.startPage) && !isNaN($scope.endPage)) {
            $scope.pages = _.range($scope.startPage, $scope.endPage + 1)
          }
        })
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
