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
      ngModel: '='
    },
    controller: function ($scope, $attrs, registry, $mdDialog, commonMethods, media) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_library', true);

      // Variables
      var $ctrl = this;
      $ctrl.showDetails = showDetails;
      $ctrl.deleteMedia = deleteMedia;
      $ctrl.openUploader = openUploader;

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

      function openUploader(ngfMultiple, fileId) {
        media.openUploader($scope, ngfMultiple, fileId);
      }

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
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaLibrary' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
