(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // UI Additions
      'angular-material',

      // Modules
      'angular-file-upload',

      // Directives
      'stratus.directives.singleClick',
      'stratus.directives.src',

      // Services
      'stratus.services.registry',
      'stratus.services.commonMethods',
      'stratus.services.media'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  Stratus.Components.MediaUploader = {
    controller: function ($scope, $http, $attrs, $parse, $element, $timeout, Upload, $compile, registry, $mdPanel, $q, $mdDialog, commonMethods, media, $rootElement) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_uploader', true);

      // Variables
      var $ctrl = this;
      $ctrl.video = {
        services: [
          {
            label: 'Youtube',
            value: 'youtube'
          },
          {
            label: 'Vimeo',
            value: 'vimeo'
          }
        ]
      };
      $ctrl.link = {
        services: [
          {
            label: 'Google Drive',
            value: 'googledrive'
          },
          {
            label: 'Drop Box',
            value: 'dropbox'
          }
        ]
      };

      $ctrl.uploadFiles = uploadFiles;
      $ctrl.done = done;

      function done() {
        $mdDialog.cancel();
      }

      function uploadFiles(files) {
        $ctrl.files = files;
        $scope.$parent.uploadToLibrary(files);
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaUploader' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
