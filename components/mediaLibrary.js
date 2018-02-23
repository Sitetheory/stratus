// Media Library Component
// -----------------------

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
      'stratus.components.search',
      'stratus.components.pagination',
      'stratus.components.mediaDetails',
      'stratus.components.mediaUploader',

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

  // We need to ensure the ng-file-upload and ng-cookies are registered
  Stratus.Modules.ngFileUpload = true;

  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.MediaLibrary = {
    bindings: {
      ngModel: '=',
      isSelector: '<'
    },
    controller: function ($scope, $attrs, registry, $mdDialog, commonMethods, media) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_library', true);

      var $ctrl = this;
      $ctrl.$onInit = function () {
        // Variables
        $ctrl.showLibrary = !$ctrl.isSelector;
        $ctrl.showPlusIcon = true;
        $ctrl.draggedFiles = [];

        // Methods
        $ctrl.showDetails = showDetails;
        $ctrl.deleteMedia = deleteMedia;
        $ctrl.openUploader = openUploader;
        $ctrl.toggleLibrary = toggleLibrary;
        $ctrl.addOrRemoveFile = addOrRemoveFile;
        $ctrl.removeFromSelected = removeFromSelected;

        // fetch media collection and hydrate to $scope.collection
        $ctrl.registry = new registry();
        $ctrl.registry.fetch({
          target: $attrs.target || 'Media',
          id: null,
          manifest: false,
          decouple: true,
          api: {
            limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 30
          }
        }, $scope);
      };

      function toggleLibrary() {
        if (!$ctrl.showLibrary) {
          $ctrl.showLibrary = true;
        } else {
          $ctrl.showLibrary = false;
        }
      };

      function openUploader(ngfMultiple) {
        // media.openUploader($scope, ngfMultiple);
        $mdDialog.show({
          attachTo: angular.element(document.querySelector('#listContainer')),
          controller: OpenUploaderController,
          template: '<stratus-media-uploader collection="collection" ngf-multiple="ngfMultiple" file-id="fileId"></stratus-media-uploader>',
          clickOutsideToClose: false,
          focusOnOpen: true,
          autoWrap: true,
          multiple: true,
          locals: {
            collection: $scope.collection,
            ngfMultiple: ngfMultiple
          }
        });

        function OpenUploaderController(scope, collection, ngfMultiple) {
          scope.collection = collection;
          scope.ngfMultiple = ngfMultiple;
        };
      };

      function showDetails(media) {
        $mdDialog.show({
          attachTo: angular.element(document.querySelector('#listContainer')),
          controller: DialogShowDetails,
          template: '<stratus-media-details media="media" collection="collection"></stratus-media-details>',
          clickOutsideToClose: true,
          focusOnOpen: true,
          autoWrap: true,
          locals: {
            media: media,
            collection: $scope.collection
          }
        });

        function DialogShowDetails($scope, media, collection) {
          $scope.media = media;
          $scope.collection = collection;
        }
      };

      function deleteMedia(fileId) {
        if (!Stratus.Environment.get('production')) {
          console.log(fileId);
        }

        $mdDialog.show(
          $mdDialog.confirm()
            .title('DELETE MEDIA')
            .textContent('Are you sure you want to permanently delete this from your library? You may get broken images if any content still uses this image.')
            .multiple(true)
            .ok('Yes')
            .cancel('No')
        ).then(function () {
          media.deleteMedia(fileId).then(
            function (response) {
              if (commonMethods.getStatus(response).code == commonMethods.RESPONSE_CODE().success) {
                // fetch media library list
                media.getMedia($scope);
              } else {
                $mdDialog.show(
                  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(false)
                    .title('Error')
                    .multiple(true)
                    .textContent(commonMethods.getStatus(response).message)
                    .ok('Ok')
                );
              }
            },
            function (rejection) {
              if (!Stratus.Environment.get('production')) {
                console.log(rejection.data);
              }
            });
        });
      };

      function addOrRemoveFile(selectedStatus, fileId) {
        $ctrl.showPlusIcon = !$ctrl.showPlusIcon;

        if (selectedStatus === true) {
          for (i = 0; i < $ctrl.draggedFiles.length; i++) {
            if ($ctrl.draggedFiles[i].id === fileId) {
              $ctrl.draggedFiles.splice(i, 1);
              for (i = 0; i < $scope.collection.models.length; i++) {
                if ($scope.collection.models[i].data.id === fileId) {
                  $scope.collection.models[i].data.selectedClass = false;
                }
              }
            }
          }
        } else if (selectedStatus === false || selectedStatus === undefined) {
          // show plus icon,move to draggedFiles and add selectedClass
          media.fetchOneMedia(fileId).then(function (response) {
            $ctrl.draggedFiles.push(response.data.payload);
            for (var i = 0; i < $scope.collection.models.length; i++) {
              if ($scope.collection.models[i].data.id === fileId) {
                $scope.collection.models[i].data.selectedClass = true;
              }
            }
          });
        }
      };

      function removeFromSelected(fileId) {
        $ctrl.showPlusIcon = !$ctrl.showPlusIcon;

        for (i = 0; i < $ctrl.draggedFiles.length; i++) {
          if ($ctrl.draggedFiles[i].id === fileId) {
            $ctrl.draggedFiles.splice(i, 1);
          }
        }

        for (var i = 0; i < $scope.collection.models.length; i++) {
          if ($scope.collection.models[i].data.id === fileId) {
            $scope.collection.models[i].data.selectedClass = false;
          }
        }
      }

      $scope.$watch('$ctrl.ngModel', function (data) {
        console.log(data);
        if (!_.isUndefined(data) && !_.isEqual($scope.draggedFiles, data)) {
          $ctrl.draggedFiles = data || [];
        }
      });

      $scope.$watch('collection.models', function (data) {
        if (!_.isUndefined(data) && $ctrl.draggedFiles.length > 0) {
          for (var i = 0; i < $ctrl.draggedFiles.length; i++) {
            var addedFile = $ctrl.draggedFiles[i];
            for (var j = 0; j < $scope.collection.models.length; j++) {
              var media = $scope.collection.models[j];
              if (addedFile.id === media.data.id) {
                media.data.selectedClass = true;
              }
            }
          }
        }
      });
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaLibrary' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
