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
      'angular',

      // UI Additions
      'angular-material',

      // Modules
      'angular-file-upload',

      // Components
      'stratus.components.tag',
      'stratus.components.search',
      'stratus.components.pagination',
      'stratus.components.mediaDetails',
      'stratus.components.mediaShortDetails',
      'stratus.components.mediaUploader',

      // Directives
      'stratus.directives.singleClick',
      'stratus.directives.src',

      // Services
      'stratus.services.registry',
      'stratus.services.utility',
      'stratus.services.media'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // We need to ensure the ng-file-upload and ng-cookies are registered
  Stratus.Modules.ngFileUpload = true

  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.MediaLibrary = {
    bindings: {
      ngModel: '=',
      isSelector: '<',
      mediaSelectorDraggedFiles: '='
    },
    controller: function (
      $scope, $attrs, Registry, $mdDialog, utility, media) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs, 'media_library',
        true)

      var $ctrl = this
      $ctrl.$onInit = function () {
        // Variables

        // Methods
        $ctrl.openUploader = openUploader

        // fetch media collection and hydrate to $scope.collection
        $ctrl.registry = new Registry()
        $ctrl.registry.fetch({
          target: $attrs.target || 'Media',
          id: null,
          manifest: false,
          decouple: true,
          api: {
            limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 30
          }
        }, $scope)
      }

      $scope.getThumbnailImgOfVideo = function (mediaData) {
        return media.getThumbnailImgOfVideo(mediaData)
      }

      function openUploader (ngfMultiple, files, invalidFiles) {
        $mdDialog.show({
          attachTo: angular.element(document.querySelector('#listContainer')),
          controller: OpenUploaderController,
          template: '<stratus-media-uploader collection="collection" ngf-multiple="ngfMultiple" file-id="fileId" dragged-files="draggedFiles" invalid-files="invalidFiles"></stratus-media-uploader>',
          clickOutsideToClose: false,
          focusOnOpen: true,
          autoWrap: true,
          multiple: true,
          locals: {
            collection: $scope.collection,
            ngfMultiple: ngfMultiple,
            draggedFiles: files,
            invalidFiles: invalidFiles
          }
        })

        function OpenUploaderController (
          scope, collection, ngfMultiple, draggedFiles, invalidFiles) {
          scope.collection = collection
          scope.ngfMultiple = ngfMultiple
          scope.draggedFiles = draggedFiles
          scope.invalidFiles = invalidFiles
        }
      }

      $scope.showDetails = function (media) {
        $mdDialog.show({
          attachTo: angular.element(document.querySelector('#listContainer')),
          controller: DialogShowDetails,
          template: '<stratus-media-details media="media" collection="collection"></stratus-media-details>',
          clickOutsideToClose: false,
          focusOnOpen: true,
          autoWrap: true,
          locals: {
            media: media,
            collection: $scope.collection
          }
        })

        function DialogShowDetails ($scope, media, collection) {
          $scope.media = media
          $scope.collection = collection
        }
      }

      $scope.deleteMedia = function (fileId) {
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
                // fetch media library list
                media.getMedia($scope)
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
                console.log(rejection.data)
              }
            })
        })
      }

      $scope.mediaSelectorAddOrRemoveFile = function (media) {
        if (media.selectedClass === true) {
          $ctrl.mediaSelectorDraggedFiles.splice(_.findIndex($ctrl.mediaSelectorDraggedFiles, function (mediaSelectorDraggedFile) { return mediaSelectorDraggedFile.id === media.id }), 1)
          media.selectedClass = false
        } else {
          $ctrl.mediaSelectorDraggedFiles.push(media)
          media.selectedClass = true
        }
      }

      $scope.$watch('collection.models', function (data) {
        if (!_.isUndefined(data) && $ctrl.mediaSelectorDraggedFiles && $ctrl.mediaSelectorDraggedFiles.length > 0) {
          for (var i = 0; i < $ctrl.mediaSelectorDraggedFiles.length; i++) {
            var addedFile = $ctrl.mediaSelectorDraggedFiles[i]
            for (var j = 0; j < $scope.collection.models.length; j++) {
              var media = $scope.collection.models[j]
              if (addedFile.id === media.data.id) {
                media.data.selectedClass = true
              }
            }
          }
        }
      })

      $scope.$on('mediaSelectorRemoveSelectedFile', function (evt, removedFileId) {
        let removedFileIndex = _.findIndex($scope.collection.models, function (media) {
          return removedFileId === media.data.id
        })
        if (removedFileIndex !== -1) {
          $scope.collection.models[removedFileIndex].data.selectedClass = false
        }
      })
    },
    templateUrl: Stratus.BaseUrl +
     Stratus.BundlePath + 'components/mediaLibrary' +
      (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
