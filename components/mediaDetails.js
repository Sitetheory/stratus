// Media Library Component
// -----------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'jquery',
      'angular',

      // Modules
      'angular-material',
      'stratus.services.media'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.MediaDetails = {
    bindings: {
      ngModel: '=',
      media: '<',
      collection: '<'
    },
    controller: [
      '$scope',
      '$mdDialog',
      '$attrs',
      'commonMethods',
      'media',
      '$sce',
      function (
        $scope,
        $mdDialog,
        $attrs,
        commonMethods,
        media,
        $sce
      ) {
        // Initialize
        commonMethods.componentInitializer(this, $scope, $attrs,
          'media_details', true)
        var $ctrl = this

        $ctrl.$onInit = function () {
          // Variables
          initFile($ctrl.media)
          $ctrl.tags = $ctrl.media.tags
          $ctrl.infoId = $ctrl.media.id
          $ctrl.selectedChips = []

          // Methods
          $ctrl.deleteMedia = deleteMedia
          $ctrl.getLinkMedia = getLinkMedia
          $ctrl.closeDialog = closeDialog
          $ctrl.done = done
          $ctrl.openUploader = openUploader
          $ctrl.createTag = createTag
          $ctrl.editItem = editItem
          $ctrl.doneEditing = doneEditing
        }

        function initFile (fileData) {
          if (fileData.url) {
            $ctrl.mediaUrl = 'http://' + fileData.prefix + '.' +
              fileData.extension
          } else {
            $ctrl.mediaUrl = fileData.file
          }
          if (fileData.mime === 'video') {
            var videoUrl
            if (fileData.service === 'youtube') {
              videoUrl = 'https://www.youtube.com/embed/' + fileData.file.split('v=')[1].split('&')[0]
            } else if (fileData.service === 'vimeo') {
              videoUrl = 'https://player.vimeo.com/video/' + fileData.file.split(/video\/|https?:\/\/vimeo\.com\//)[1].split(/[?&]/)[0]
            }
            $ctrl.mediaUrl = $sce.trustAsResourceUrl(videoUrl)
          }
          $ctrl.selectedName = {
            name: fileData.name,
            editing: false
          }
          $ctrl.selectedDesc = {
            description: fileData.description,
            editing: false
          }
        }

        function done () {
          var dataRes = {}
          var fileId = $ctrl.media.id
          dataRes.tags = $ctrl.tags
          updateMedia(fileId, dataRes)
          $mdDialog.hide()
        }

        function deleteMedia () {
          var fileId = $ctrl.media.id
          if (!Stratus.Environment.get('production')) {
            console.log(fileId)
          }

          $mdDialog.show(
            $mdDialog.confirm()
              .title('DELETE MEDIA')
              .textContent(
                'Are you sure you want to permanently delete this from your library? You may get broken images if any content still uses this image.')
              .multiple(true)
              .ok('Yes')
              .cancel('No')
          ).then(function () {
            media.deleteMedia(fileId).then(
              function (response) {
                if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
                  $mdDialog.cancel()
                  media.getMedia($ctrl)
                } else {
                  $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(
                        document.querySelector('#popupContainer')))
                      .clickOutsideToClose(false)
                      .title('Error')
                      .multiple(true)
                      .textContent(commonMethods.getStatus(response).message)
                      .ok('Ok')
                  )
                }
              },
              function (rejection) {
                if (!Stratus.Environment.get('production')) {
                  console.log(rejection)
                }
              })
          })
        }

        function getLinkMedia () {
          if (commonMethods.copyToClipboard($ctrl.mediaUrl)) {
            $mdDialog.show(
              $mdDialog.confirm()
                .textContent('Link is copied to clipboard')
                .multiple(true)
                .ok('OK')
            )
          }
        }

        function closeDialog () {
          $mdDialog.cancel()
        }

        // Open the uploader to replace image
        function openUploader (ngfMultiple, fileId) {
          $mdDialog.show({
            attachTo: angular.element(document.querySelector('#listContainer')),
            controller: OpenUploaderController,
            template: '<stratus-media-uploader collection="collection" ngf-multiple="ngfMultiple" file-id="fileId"></stratus-media-uploader>',
            clickOutsideToClose: false,
            focusOnOpen: true,
            autoWrap: true,
            multiple: true,
            locals: {
              collection: $ctrl.collection,
              ngfMultiple: ngfMultiple,
              fileId: fileId
            }
          }).then(function (response) {
            console.log(response)
            if (fileId && !_.isEmpty(response)) {
              if (!response[0].errorUpload) {
                initFile(response[0].result)
              }
            }
          })

          function OpenUploaderController (
            scope, collection, ngfMultiple, fileId) {
            scope.collection = collection
            scope.ngfMultiple = ngfMultiple
            scope.fileId = fileId
          }
        }

      /**
       * Return the proper object when the append is called.
       * @return {name: 'value'}
       */
      $ctrl.transformChip = function (chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
          return chip
        }

        // Otherwise, create a new one
        return {name: chip}
      }

        function createTag (query, fileId, tags) {
          var data = {
            name: query
          }
          media.createTag(data).then(function (response) {
            if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
              if (fileId !== undefined && tags !== undefined) {
                var dataRes = {}
                $ctrl.tags.push(response.data.payload)
                dataRes.tags = $ctrl.tags
              }
            }
          })
        }

        // Update title, description, tags of a file
        function updateMedia (fileId, data) {
          media.updateMedia(fileId, data).then(function (response) {
            if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
              media.getMedia($ctrl)
            }
          })
        }

        // Handle click event for editing title & description
        function editItem (item) {
          item.editing = true
        }

        // Handle updating title & description
        function doneEditing (fileId, item) {
          var data = {}
          if (item.description) {
            data.description = item.description
          }
          if (item.name) {
            data.name = item.name
          }

          item.editing = false
          updateMedia(fileId, data)
        }

        $ctrl.searchFilter = function (collection, query) {
          var results = collection.filter(query)
          return Promise.resolve(results).then(function (value) {
            return value.filter(function (item) {
              return $ctrl.selectedChips.indexOf(item.name) === -1
            })
          })
        }

        // Handle saving tags after updating
        $scope.$watch('$ctrl.tags', function (items) {
          if ($ctrl.infoId !== undefined) {
            $ctrl.selectedChips = items || []
          }
        })

      }
    ],
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/mediaDetails' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
