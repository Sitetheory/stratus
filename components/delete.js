// Delete Component
// ----------------

/* global define */

// TODO: this component needs to be finished

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component intends to allow publishing a versionable entity with
  // additional advanced options
  Stratus.Components.Delete = {
    bindings: {
      ngModel: '=',
      elementId: '@',
      versionEntity: '@',
      showDateTimePicker: '@',
      showUnpublish: '@',
      showVersionHistory: '@',
      redirect: '@'
    },
    controller: function ($scope, $element, $parse, $attrs) {
      Stratus.Instances[_.uniqueId('delete_')] = $scope
      $scope.model = $scope.$parent.model
      $scope.versionEntity = $attrs.versionEntity || null

      console.log('setup publish controller', $scope.model, $scope.versionEntity)
      $scope.version = null
      if ($scope.versionEntity && !$scope.model.has($scope.versionEntity)) {
        $scope.version = $scope.model.get($scope.versionEntity)
        console.log('version', $scope.version)
      }

      // Options
      $scope.elementId = $attrs.elementId || 'delete'
      $scope.showDataTimePicker = $attrs.versionEntity || null
      $scope.showUnpublish = $attrs.showUnpublish || false
      $scope.showVersionHistory = $attrs.showVersionHistory || false
      $scope.showMore = !!($scope.showDateTimePicker || $scope.showUnpublish || $scope.showVersionHistory)

      // TODO: add a redirect if requested
      $scope.redirect = $attrs.redirect || false

      // Methods
      $scope.setDelete = function (time) {
        $scope.model.set('status', -1)
        $scope.model.save()
      }

      // Watchers
      $scope.timePublish = ''
      $scope.$watch('timePublish', $scope.setTimePublish(
        Math.floor((new Date()).getTime() / 1000)
      ))
    },
    template: '<md-button ng-if="model.id" aria-label="Delete" id="{{ elementId }}" class="btn btn-delete" ng-click="setDelete()"><div class="btnGradientLight"></div><md-icon class="deleteIcon" md-svg-src="/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg"></md-icon><span class="delete-text">Delete</span></md-button>'
  }
}))
