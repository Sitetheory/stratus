// Stratus Media Selector Component
// ----------------------

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

      // UI Additions
      'angular-material',
      'masonry',

      // Modules
      'angular-file-upload',
      'angular-drag-and-drop-lists',

      // Components
      'stratus.components.mediaLibrary',
      'stratus.components.mediaDetails',
      'stratus.components.mediaShortDetails',
      'stratus.components.mediaUploader',

      // Directives
      'stratus.directives.singleClick',
      'stratus.directives.src',

      // Services
      'stratus.services.registry',
      'stratus.services.media'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'mediaSelector'

  // We need to ensure the ng-file-upload and dnd-lists are registered
  Stratus.Modules.ngFileUpload = true
  Stratus.Modules.dndLists = true

  Stratus.Modules.dndLists = true

  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.MediaSelector = {
    bindings: {
      ngModel: '='
    },
    controller: function ($scope, $attrs, $mdDialog, Upload, media) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Force CSS for Child Components
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/mediaLibrary' + min + '.css'
      )

      // TODO: Collection Binds

      // Bind Init
      $ctrl.$onInit = function () {
        // Variables
        $ctrl.loadLibrary = false
        $ctrl.showLibrary = false
        $ctrl.draggedFiles = []
        $ctrl.selectedFileToDrag = null

        // Methods
        $ctrl.openUploader = openUploader
        $ctrl.toggleLibrary = toggleLibrary
        $ctrl.updateDraggedFilesPriorities = updateDraggedFilesPriorities
      }

      $scope.getThumbnailImgOfVideo = function (mediaData) {
        return media.getThumbnailImgOfVideo(mediaData)
      }

      function toggleLibrary () {
        if (!$ctrl.loadLibrary) {
          $ctrl.loadLibrary = true
        }
        $ctrl.showLibrary = !$ctrl.showLibrary
      }

      function openUploader (ngfMultiple, files, invalidFiles) {
        $mdDialog.show({
          attachTo: angular.element(document.querySelector('#listContainer')),
          controller: OpenUploaderController,

          template: '<stratus-media-uploader collection="collection" ngf-multiple="ngfMultiple" dragged-files="draggedFiles" invalid-files="invalidFiles"></stratus-media-uploader>',
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

      function updateDraggedFilesPriorities () {
        var priority = 0
        $ctrl.draggedFiles.forEach(function (draggedFile) {
          draggedFile.priority = priority++
        })
      }

      $scope.showDetails = function (media) {
        $mdDialog.show({
          attachTo: angular.element(document.querySelector('#listContainer')),
          controller: DialogShowDetails,
          // FIXME: This is a weird format below
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

      $scope.removeFromSelected = function (fileId) {
        $ctrl.draggedFiles.splice(_.findIndex($ctrl.draggedFiles, function (draggedFile) { return draggedFile.id === fileId }), 1)
        if ($ctrl.loadLibrary) {
          $scope.$broadcast('mediaSelectorRemoveSelectedFile', fileId)
        }
      }

      $scope.$watch('$ctrl.ngModel', function (data) {
        if (!_.isUndefined(data) && !_.isEqual($scope.draggedFiles, data)) {
          $ctrl.draggedFiles = data || []
        }
      })
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
