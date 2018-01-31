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
      'stratus.services.commonMethods',
      'stratus.services.media'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  Stratus.Components.MediaUploader = {
    bindings: {
      ngModel: '=',
      collection: '<',
      ngfMultiple: '<',
      fileId: '<'
    },
    controller: function ($scope, $attrs, $mdDialog, commonMethods, media) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_uploader', true);
      var $ctrl = this;
      $ctrl.$onInit = function () {
        $ctrl.files = [];
        $ctrl.uploadingFiles = false;
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
        // Handle error messages for invalid files
        $ctrl.invalidFilesMsg = [];
        if (invalidFiles.length > 0) {
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

        // Handle uploading status for valid files
        if (files.length > 0) {
          if ($ctrl.ngfMultiple) {
            // Upload new files
            for (let i = 0; i < files.length; i++) {
              $ctrl.files.push(media.fileUploader(files[i]));
            }
          } else {
            // Replace old file with new file
            $ctrl.files = [media.fileUploader(files[0], $ctrl.fileId)];
          }

          // Refresh the library
          media.getMedia($ctrl);
        }
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaUploader' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
