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
  Stratus.Controllers.SelectedLayout = [
    '$scope',
    '$mdDialog',
    '$rootScope',
    function ($scope, $mdDialog, $rootScope) {
      // Store Instance
      Stratus.Instances[_.uniqueId('selected_layout_')] = $scope
      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _
      $scope.layoutsSelected = []
      $scope.layouts = []

      $scope.$watch('model.data', function (modelData) {
        if (angular.isObject(modelData) && modelData.version) {
          let availableLayout = modelData.version.availableLayouts
          angular.forEach(availableLayout, function (layout) {
            $scope.layoutsSelected.push(
              layout.id)
          })
        }
      })

      $scope.processSelected = function () {
        if ($scope.$parent && $scope.$parent.collection) {
          $scope.layouts = $scope.$parent.collection.models
        } else {
          return
        }
        if ($scope.$parent.model.data.version.availableLayouts.length !== $scope.layoutsSelected.length) {
          let array = []
          angular.forEach($scope.layoutsSelected, function (id) {
            let index = $scope.layouts.findIndex(function (layout) {
              return layout.data.id === id
            })
            if (index > -1) {
              array.push($scope.layouts[index].data)
            }
          })
          $scope.$parent.model.data.version.availableLayouts = array
        }
      }
    }
  ]
}))
