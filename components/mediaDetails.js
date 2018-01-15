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

      $ctrl.delete = function () {
        // var fileId = $ctrl.media.data.id;
        // if (!Stratus.Environment.get('production')) {
        //   console.log(fileId);
        // }

        // var confirmMedia = $mdDialog.confirm()
        //   .title('DELETE MEDIA')
        //   .textContent('Are you sure you want to permanently delete this from your library? You may get broken images if any content still uses this image.')
        //   .ok('Yes')
        //   .cancel('No');

        // $mdDialog.show(confirmMedia).then(function () {
        //   media.deleteMedia(fileId).then(
        //     function (response) {
        //       // fetch media library list
        //       getMedia();
        //     },
        //     function (rejection) {
        //       if (!Stratus.Environment.get('production')) {
        //         console.log(rejection.data);
        //       }
        //     });
        // });

        $mdDialog.show({
          controllerAs: 'dialogCtrl',
          clickOutsideToClose: true,
          bindToController: true,
          controller: function ($mdDialog) {
            this.click = function click() {
              $mdDialog.show({
                controllerAs: 'dialogCtrl',
                controller: function ($mdDialog) {
                  this.click = function () {
                    $mdDialog.hide();
                  }
                },
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                template: '<md-dialog class="confirm"><md-conent><md-button ng-click="dialogCtrl.click()">I am in a 2nd dialog!</md-button></md-conent></md-dialog>'
              })
            }
          },
          autoWrap: false,
          template: '<md-dialog class="stickyDialog" data-type="{{::dialogCtrl.thing.title}}"><md-conent><md-button ng-click="dialogCtrl.click()">I am in a dialog!</md-button></md-conent></md-dialog>'
        });
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
