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
    bindings: {
      ngModel: '='
    },
    controller: function ($scope, $attrs, $timeout, Upload, registry, $mdPanel, $q, $mdDialog, commonMethods, media, $rootElement) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_uploader', true);
      var $ctrl = this;
      $ctrl.$onInit = function () {
        $ctrl.files = [];
        $ctrl.uploadingFiles = true;
        $ctrl.invalidFilesMsg = [];
        $ctrl.video = {
          services: [{
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
          services: [{
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
      };

      function done() {
        $mdDialog.cancel();
      }

      function uploadFiles(files, invalidFiles) {
        if (invalidFiles.length > 0) {
          $ctrl.invalidFilesMsg = [];
          invalidFiles.forEach(file => {
            var msg;
            switch (file.$error) {
              case 'maxSize':
                msg = 'Looks like some of your files is too large. You can upload files up to ';
                break;
              case 'maxFiles':
                msg = 'Maximum number of files allowed up to ';
                break;
              case 'pattern':
                msg = 'Sitetheory only allow file with types ';
                break;
            }
            $ctrl.invalidFilesMsg = _.union($ctrl.invalidFilesMsg, [msg + file.$errorParam]);
          });
        }

        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            $ctrl.files.push(media.fileUploader(files[i]));
          }
          $ctrl.uploadingFiles = false;
          media.getMedia($ctrl);
        }
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaUploader' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
