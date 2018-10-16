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
      'utility',
      'media',
      '$sce',
      function (
        $scope,
        $mdDialog,
        $attrs,
        utility,
        media,
        $sce
      ) {
        // Initialize
        utility.componentInitializer(this, $scope, $attrs,
          'media_details', true)
        var $ctrl = this

        $ctrl.$onInit = function () {
          // Variables
          initFile($ctrl.media)
          $ctrl.tags = $ctrl.media.tags
          $ctrl.infoId = $ctrl.media.id

          // Methods
          $ctrl.deleteMedia = deleteMedia
          $ctrl.getLinkMedia = getLinkMedia
          $ctrl.closeDialog = closeDialog
          $ctrl.done = done
          $ctrl.openUploader = openUploader
          $ctrl.createTag = createTag
          $ctrl.editItem = editItem
          $ctrl.doneEditing = doneEditing
          $ctrl.searchFilter = searchFilter
        }

        function initFile (fileData) {
          if (fileData.url) {
            if (fileData.mime === 'video') {
              var videoUrl
              if (fileData.service === 'youtube') {
                videoUrl = 'https://www.youtube.com/embed/' + media.getYouTubeID(fileData.url)
              } else if (fileData.service === 'vimeo') {
                videoUrl = 'https://player.vimeo.com/video/' + fileData.url.split(/video\/|https?:\/\/vimeo\.com\//)[1].split(/[?&]/)[0]
              }
              $ctrl.mediaUrl = $sce.trustAsResourceUrl(videoUrl)
            } else {
              $ctrl.mediaUrl = 'http://' + fileData.prefix + '.' + fileData.extension
            }
          } else if(fileData.embed) {
            $ctrl.mediaUrl = $sce.trustAsHtml(fileData.embed)
          } else {
            $ctrl.mediaUrl = fileData.file
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
          media.getMedia($ctrl)
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
                if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
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
                      .textContent(utility.getStatus(response).message)
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
          if (utility.copyToClipboard($ctrl.mediaUrl)) {
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

        function createTag (query, fileId, tags) {
          var data = {
            name: query
          }
          media.createTag(data).then(function (response) {
            if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
              if (fileId !== undefined && tags !== undefined) {
                var dataRes = {}
                $ctrl.tags.push(response.data.payload)
                dataRes.tags = $ctrl.tags
                updateMedia(fileId, dataRes)
              }
            }
          })
        }

        // Update title, description, tags of a file
        function updateMedia (fileId, data) {
          media.updateMedia(fileId, data).then(function (response) {
            if (utility.getStatus(response).code === utility.RESPONSE_CODE.success) {
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

        function searchFilter (query) {
          return $ctrl.collection.filter(query)
        }

        // Handle saving tags after updating
        $scope.$watch('$ctrl.tags', function (data) {
          if ($ctrl.infoId !== undefined) {
            var dataRes = {}

            dataRes.tags = $ctrl.tags
            media.updateMedia($ctrl.infoId, dataRes).then(
              function (response) {
                media.fetchOneMedia($ctrl.media.id)
              },
              function (rejection) {
                if (!Stratus.Environment.get('production')) {
                  console.log(rejection)
                }
              })
          }
        })
      }
    ],
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/mediaDetails' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
