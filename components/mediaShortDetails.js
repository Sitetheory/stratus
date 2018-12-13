// Media Short Details Component
// ----------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material'

    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component intends to show media short details
  Stratus.Components.MediaShortDetails = {
    bindings: {
      ngModel: '=',
      media: '<',
      isSelector: '<'
    },
    controller: function ($scope) {
      let $ctrl = this
      $ctrl.$onInit = function () {
        // Methods
        $ctrl.showDetails = showDetails
        $ctrl.deleteMedia = deleteMedia
        $ctrl.removeFromSelected = removeFromSelected
      }

      function showDetails (media) {
        $scope.$parent.showDetails(media)
      }

      function deleteMedia (fileId) {
        $scope.$parent.deleteMedia(fileId)
      }

      function removeFromSelected (fileId) {
        $scope.$parent.removeFromSelected(fileId)
      }
    },
    templateUrl: Stratus.BaseUrl +
      Stratus.BundlePath + 'components/mediaShortDetails' +
      (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
