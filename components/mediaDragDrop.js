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
      'stratus.services.commonMethods',
      'stratus.services.media'
    ], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _, angular) {
  Stratus.Components.MediaDragDrop = {
    controller: function ($scope, $mdDialog, $attrs, commonMethods, media) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_drag_drop', true);

      // Code
      var $ctrl = this;
      var isShowDialog = angular.element(document.body).hasClass('md-dialog-is-showing');
      $scope.files = [];

      document.addEventListener('dragenter', media.dragenter, false);
      document.addEventListener('dragleave', media.dragleave, false);
      document.addEventListener('drop', drop, false);

      $(window).focus(function () {
        $('.drag-drop').removeClass('show-overlay');
      }).blur(function () {
        $('.drag-drop').addClass('show-overlay');
      });

      function drop(event) {
        if (!angular.element(document.body).hasClass('md-dialog-is-showing')) {
          $scope.files = $scope.files.concat(Array.from(event.dataTransfer.files));
          $mdDialog.show({
            controller: media.DialogController,
            locals: {
              files: event.dataTransfer.files
            },
            templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDragDropDialog' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
          }).then(function (answer) {

          }, function () {

          });
        };
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDragDrop' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };

}));
