/* global define */

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
      'stratus.services.utility',
      'stratus.services.media'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Components.MediaUploader = {
    bindings: {
      ngModel: '=',
      collection: '<',
      ngfMultiple: '<',
      fileId: '<',
      draggedFiles: '<',
      invalidFiles: '<'
    },
    controller: function ($http, $sce, $q, $scope, $attrs, $mdDialog, utility, media) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs, 'media_uploader',
        true)
      var $ctrl = this
      $ctrl.$onInit = function () {
        $ctrl.files = []
        $ctrl.uploadingFiles = false
        $ctrl.invalidFilesMsg = []
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
            }

            // {
            //   label: 'Google Drive',
            //   value: 'googledrive'
            // },
            // {
            //   label: 'Drop Box',
            //   value: 'dropbox'
            // }
          ]
        }
        $ctrl.videos = [
          {
            service: $ctrl.services.video[0],
            url: null,
            name: null,
            tags: [],
            mime: 'video',
            description: null,
            isUploaded: false
          }
        ]
        $ctrl.links = [
          {
            service: $ctrl.services.link[0],
            url: null,
            name: null,
            tags: [],
            description: null,
            isUploaded: false
          }
        ]

        $ctrl.done = done
        $ctrl.uploadFiles = uploadFiles
        $ctrl.createTag = createTag
        $ctrl.addExternalFile = addExternalFile
        $ctrl.removeExternalFile = removeExternalFile
        $ctrl.saveOneFile = saveOneFile
        $ctrl.saveAllFiles = saveAllFiles

        uploadFiles($ctrl.draggedFiles, $ctrl.invalidFiles)
      }

      function done () {
        $mdDialog.hide($ctrl.files)
      }

      function addExternalFile (fileType) {
        var newFile = {
          url: null,
          name: null,
          tags: [],
          description: null,
          isUploaded: false
        }

        if (fileType === 'video') {
          newFile.service = $ctrl.services.video[0]
          $ctrl.videos.push(newFile)
        } else {
          newFile.service = $ctrl.services.link[0]
          $ctrl.links.push(newFile)
        }
      }

      function removeExternalFile (index, fileType) {
        if (fileType && fileType === 'video') {
          $ctrl.videos.splice(index, 1)
        } else {
          $ctrl.links.splice(index, 1)
        }
      }

      function saveOneFile (file, fileType) {
        if (file.isUploaded) {
          return
        }

        var data = {
          service: file.service.value,
          file: file.url,
          name: file.name,
          tags: file.tags,
          description: file.description,
          meta: []
        }

        if (fileType && fileType === 'video') {
          data.mime = 'video'
        } else {
          data.mime = 'image/' + file.url.split('.').pop()
        }

        processMediaMeta(file).then(function (response) {
          if(response) {
            data.meta = response
          }
          media.saveMediaUrl(data).then(function (response) {
            if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
              // Refresh the library
              media.getMedia($ctrl)

              var type = fileType && fileType === 'video' ? 'videos' : 'links'
              var index = $ctrl[type].indexOf(file)
              $ctrl[type][index].isUploaded = true
            } else {
              console.error(utility.getStatus(response).code + ' - ' +
                utility.getStatus(response).message)
            }
          })  
        })
        
      }

      function saveAllFiles (files, fileType) {
        files.forEach(function (file) {
          if (!file.isUploaded) {
            saveOneFile(file, fileType)
          }
        })
      }

      function uploadFiles (files, invalidFiles) {
        // Handle error messages for invalid files
        $ctrl.invalidFilesMsg = []
        if (invalidFiles && invalidFiles.length > 0) {
          $ctrl.uploadingFiles = false
          invalidFiles.forEach(function (file) {
            var msg
            switch (file.$error) {
              case 'maxSize':
                msg = 'Looks like some of your files is too large. You can upload files up to '
                break
              case 'maxFiles':
                msg = 'Maximum number of files allowed up to '
                break
              case 'pattern':
                msg = 'Sitetheory only allow file with types '
                break
            }
            $ctrl.invalidFilesMsg = _.union($ctrl.invalidFilesMsg,
              [msg + file.$errorParam])
          })
        }

        // Handle uploading status for valid files
        if (files && files.length > 0) {
          console.log(files)
          $ctrl.uploadingFiles = true
          var uploadFilePromise = []
          if ($ctrl.ngfMultiple) {
            // Upload new files
            var i
            for (i = 0; i < files.length; i++) {
              var singleFile = media.fileUploader(files[i])
              uploadFilePromise.push(singleFile.upload)
              $ctrl.files.push(singleFile)
            }
          } else {
            // Replace old file with new file
            $ctrl.files = [media.fileUploader(files[0], $ctrl.fileId)]
          }

          $q.all(uploadFilePromise).then(function (response) {
            console.log(response)
            $ctrl.uploadingFiles = false

            // Refresh the library
            media.getMedia($ctrl)
          })
        }
      }

      function createTag (file, query) {
        var data = {name: query}
        media.createTag(data).then(function (response) {
          if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
            var type = file.mime === 'video' ? 'videos' : 'links'
            var index = $ctrl[type].indexOf(file)
            $ctrl[type][index].tags.push(response.data.payload)
          }
        })
      }

      function processMediaMeta(file) {
        return $q(function(resolve, reject) {
          if (file.service.value === 'vimeo') {
            let vimeoApiUrl = $sce.trustAsResourceUrl('https://vimeo.com/api/v2/video/' + getVimeoID(file.url) + '.json')
            $http.jsonp(vimeoApiUrl, {jsonpCallbackParam: 'callback'})
            .then( function successCallback(response) {
              let meta = {}
              meta['thumbnail_small'] = response.data[0].thumbnail_small 
              meta['thumbnail_medium'] = response.data[0].thumbnail_medium 
              meta['thumbnail_large'] = response.data[0].thumbnail_large 
              resolve(meta)
            })
          } else {
            resolve()
          }
        })
      }

      function getVimeoID (url) {
        var ID = ''
        url = url.split('https://vimeo.com/')
        if (url[1] !== undefined) {
          ID = url[1]
        }
        return ID
      }

    },
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/mediaUploader' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
