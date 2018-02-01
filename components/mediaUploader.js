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
              label: 'Google Drive',
              value: 'googledrive'
            },
            {
              label: 'Drop Box',
              value: 'dropbox'
            }
          ]
        };
        $ctrl.linkServices = $ctrl.services.link[0].value;
        $ctrl.videos = [
          {
            service: $ctrl.services.video[0],
            url: '',
            title: '',
            description: '',
            tags: []
          }
        ];

        $ctrl.uploadFiles = uploadFiles;
        $ctrl.done = done;
        $ctrl.addVideo = addVideo;
        $ctrl.removeVideo = removeVideo;
        $ctrl.uploadVideos = uploadVideos;
        $ctrl.isValidUrl = isValidUrl;
      };

      function done() {
        $mdDialog.cancel();
      }

      function addVideo() {
        var newVideo = {
          service: $ctrl.services.video[0].value,
          url: '',
          title: '',
          description: '',
          tags: []
        };
        $ctrl.videos.push(newVideo);
      }

      function removeVideo(index) {
        // Remove in UI
        $ctrl.videos.splice(index, 1);
        // TODO: remove in our S3 server
      }

      function uploadVideos() {
        console.log($ctrl.videos);
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

      function isValidUrl(service, url) {
        var urlRegex;
        if (service === 'youtube') {
          urlRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/g;
        } else {
          urlRegex = /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|)\/(video\/)?([A-Za-z0-9._%-]*)/gm;
        }
        return url.match(urlRegex);
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaUploader' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
