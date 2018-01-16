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
      target: '@',
      limit: '@',
      data: '&'
    },
    controller: function ($scope, $http, $attrs, $parse, $element, Upload, $compile, registry, $mdPanel, $q, $mdDialog, commonMethods, media, $rootElement) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_library', true);

      // Variables
      var $ctrl = this;
      $ctrl.uploadToLibrary = uploadToLibrary;
      $ctrl.showDetails = showDetails;
      $ctrl.deleteFromMedia = deleteFromMedia;

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

      // set media library to false
      $ctrl.files = [];
      $ctrl.tagsModel = {};
      $ctrl.infoId = null;

      // Data Connectivity
      $scope.$watch('tagsModel', function (data) {
        if ($ctrl.infoId !== undefined) {
          var dataRes = {};
          dataRes.tags = $ctrl.tagsModel.tags;
          media.updateMedia($ctrl.infoId, dataRes).then(
            function (response) {
              // fetch media library list
              media.getMedia($scope);
            },
            function (rejection) {
              if (!Stratus.Environment.get('production')) {
                console.log(rejection.data);
              }
            });
        }
      }, true);

      $scope.$watch('files', function (newFiles, oldFiles) {
        if (newFiles !== null && newFiles != oldFiles) {
          preProcessOfSavingMedia(_.difference(newFiles, oldFiles));
        }
      });

      // done button when uploading is finished
      $ctrl.uploadComp = false;

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
          $scope.uploadToLibrary = function (files) {
            uploadToLibrary(files);
          };
        };
      };

      function deleteFromMedia(fileId) {
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

      // upload directly to media library
      function uploadToLibrary(files) {
        if (files.length > 0) {
          $('#main').addClass('blurred');
          $('.drag-drop').addClass('show-overlay');
          $scope.files = files;

          $mdDialog.show({
            controller: DialogController,
            locals: {
              files: files
            },
            templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDragDropDialog' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            escapeToClose: false,
            focusOnOpen: true,
            multiple: true
          }).then(function (answer) {
            $ctrl.files = $ctrl.files.concat(files);
          }, function () {});

          // controller for media upload dialog
          function DialogController($scope, files) {
            // Do upload stuffs
            $scope.files = files;
            $scope.uploadComp = false;

            $scope.done = function () {
              $mdDialog.hide();
              media.dragleave();
            };

            $scope.cancel = function () {
              $mdDialog.cancel();
              media.dragleave();
            };

            $scope.abort = function () {
              console.log('aborted');
            };

            $scope.addFiles = function (newFiles) {
              if (newFiles.length > 0) {
                $scope.files = Array.from($scope.files).concat(newFiles);
              }
            };

            $scope.removeFiles = function (file) {
              $scope.files = _.without($scope.files, file);
            };

            $scope.$watch('files', function (newFiles, oldFiles) {
              if (newFiles !== null && newFiles != oldFiles) {
                preProcessOfSavingMedia(_.difference(newFiles, oldFiles));
              }
            });
          };
        };
      };

      function preProcessOfSavingMedia(files) {
        // make files array for not multiple to be able to be used in ng-repeat in the ui
        if (!angular.isArray(files)) {
          $timeout(function () {
            $scope.files = files = [files];
          });
          return;
        }
        var promises = [];
        for (var i = 0; i < files.length; i++) {
          $scope.errorMsg = null;
          promises.push(saveMedia(files[i]));
        }

        // show done button when all promises are completed
        if (promises.length > 0) {
          $q.all(promises).then(
            function (response) {
              media.getMedia($scope);
            },
            function (error) {
              console.log(error);
            });
          $ctrl.uploadComp = true;
        }
      }

      // common function to save media to server
      function saveMedia(file) {
        file.errorMsg = null;
        file.uploadStatus = false;
        file.errorUpload = false;
        file.progress = 1;

        file.upload = media.uploadToS3(file, $ctrl.infoId);
        file.upload.then(
          function (response) {
            file.result = response.data;

            // set status of upload to success
            file.uploadStatus = true;
            file.errorUpload = false;
            $ctrl.infoId = null;
            $ctrl.imageSrc = file.result.url;
          },
          function (rejection) {
            // if file is aborted handle error messages
            if (rejection.config.data.file.upload.aborted === true) {
              file.uploadStatus = false;

              // show cross icon if upload failed
              file.errorUpload = true;
              file.errorMsg = 'Aborted';
            }

            // if file not uploaded due to server error
            // else if (rejection.status > 0)
            else {
              // hide progress bar
              file.uploadStatus = false;

              // show cross icon if upload failed
              file.errorUpload = true;

              // $scope.errorMsg = rejection.status + ': ' + rejection.data;
              file.errorMsg = 'Server Error! Please try again';
            }
          }
        );

        file.upload.progress(function (evt) {
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

        return file.upload;
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaLibrary' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
