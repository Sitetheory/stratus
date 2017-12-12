// Media Library Component
// -----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'jquery',
      'underscore',
      'angular',

      // Modules
      'angular-material',

    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {

  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.MediaDetails = {
    bindings: {
      ngModel: '=',
      target: '@',
      limit: '@',
      media: '<',
    },
    controller: function ($scope, $mdDialog, $attrs, commonMethods, media) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_details', true);
      var $ctrl = this;

      // console.log($scope.);
      this.$onInit = function () {
        // this.itemGotFromParent = this.data;
        console.log('this/data', this.media);
      };

      $ctrl.remove = function () {
        console.log('handle remove event');
      };

      $ctrl.dowload = function () {
        console.log('handle dowload event');
      };

      $ctrl.getLink = function () {
        console.log('handle getLink event');
      };

      $ctrl.close = function () {
        $scope.$parent.close();
      };

    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDetails' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));

// ('Media', function () {
//   const state  = {
//     data: null
//   };
//   return {
//     get() {
//       return state.data;
//     },
//     set(data) {
//       Object.assign(state.data, data);
//     }
//   };
// })
