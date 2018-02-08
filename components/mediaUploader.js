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
      'stratus.directives.validateUrl',
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
        $ctrl.services = {
          video: [
            {
              label: 'Youtube',
              value: 'youtube'
            },
            {
              label: 'Vimeo',
              value: 'vimeo'
            }
          ],
          link: [
            {
              label: 'Direct Link',
              value: 'directlink'
            },
            // {
            //   label: 'Google Drive',
            //   value: 'googledrive'
            // },
            // {
            //   label: 'Drop Box',
            //   value: 'dropbox'
            // }
          ]
        };
        $ctrl.videos = [
          {
            service: $ctrl.services.video[0],
            url: null,
            title: null,
            tags: [],
            mime: 'video',
            description: null,
            isUploaded: false
          }
        ];
        $ctrl.links = [
          {
            service: $ctrl.services.link[0],
            url: null,
            title: null,
            tags: [],
            description: null,
            isUploaded: false
          }
        ];

        $ctrl.done = done;
        $ctrl.uploadFiles = uploadFiles;
        $ctrl.createTag = createTag;
        $ctrl.addExternalFile = addExternalFile;
        $ctrl.removeExternalFile = removeExternalFile;
        $ctrl.saveOneFile = saveOneFile;
        $ctrl.saveAllFiles = saveAllFiles;
      };

      function done() {
        $mdDialog.hide($ctrl.files);
      }

      function addExternalFile(fileType) {
        var newFile = {
          url: null,
          name: null,
          tags: [],
          description: null,
          isUploaded: false
        };

        if (fileType === 'video') {
          newFile.service = $ctrl.services.video[0];
          $ctrl.videos.push(newFile);
        } else {
          newFile.service = $ctrl.services.link[0];
          $ctrl.links.push(newFile);
        }
      }

      function removeExternalFile(index, fileType) {
        if (fileType && fileType === 'video') {
          $ctrl.videos.splice(index, 1);
        } else {
          $ctrl.links.splice(index, 1);
        }
      }

      function saveOneFile(file, fileType) {
        data = {
          service: file.service.value,
          file: file.url,
          name: file.title,
          tags: file.tags,
          description: file.description
        };

        if (fileType && fileType === 'video') {
          data.mime = 'video';
        } else {
          data.mime = 'image/' + file.url.split('.').pop();
        }

        media.saveMediaUrl(data).then(function (response) {
          if (commonMethods.getStatus(response).code == commonMethods.RESPONSE_CODE().success) {
            if (fileType && fileType === 'video') {
              var index = $ctrl.videos.indexOf(file);
              $ctrl.videos[index].isUploaded = true;
            } else {
              var index = $ctrl.links.indexOf(file);
              $ctrl.links[index].isUploaded = true;
            }
          } else {
            console.error(commonMethods.getStatus(response).code + ' - ' + commonMethods.getStatus(response).message);
          }
        });
      }

      function saveAllFiles(files, fileType) {
        files.forEach(function (file) {
          if (!file.isUploaded) {
            saveOneFile(file, fileType);
          }
        });
      }

      function uploadFiles(files, invalidFiles) {
        // Handle error messages for invalid files
        $ctrl.invalidFilesMsg = [];
        if (invalidFiles.length > 0) {
          invalidFiles.forEach(function (file) {
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
            for (i = 0; i < files.length; i++) {
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

      function createTag(file, query) {
        var data = { name: query };
        media.createTag(data).then(function (response) {
          if (commonMethods.getStatus(response).code == commonMethods.RESPONSE_CODE().success) {
            if (file.mime === 'video') {
              var index = $ctrl.videos.indexOf(file);
              $ctrl.videos[index].tags.push(response.data.payload);
            } else {
              var index = $ctrl.links.indexOf(file);
              $ctrl.links[index].tags.push(response.data.payload);
            }
          }
        });
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaUploader' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
