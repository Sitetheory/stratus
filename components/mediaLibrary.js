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
      limit: '@'
    },
    controller: function ($scope, $http, $attrs, $parse, $element, Upload, $compile, registry, $mdPanel, $q, $mdDialog, commonMethods, media) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'media_library', true);

      // fetch media collection and hydrate to $scope.collection
      $scope.registry = new registry();
      $scope.registry.fetch({
        target: $attrs.target || 'Media',
        id: null,
        manifest: false,
        decouple: true,
        api: {
          limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 30
        }
      }, $scope);

      // set media library to false
      $scope.showLibrary = false;
      $scope.files = [];
      $scope.tagsModel = {};
      $scope.infoId = null;

      // Data Connectivity
      $scope.$watch('tagsModel', function (data) {
        if ($scope.infoId !== undefined) {
          var dataRes = {};
          dataRes.tags = $scope.tagsModel.tags;
          $scope.updateMedia($scope.infoId, dataRes);
        }
      }, true);

      // done button when uploading is finished
      $scope.uploadComp = false;

      $scope.movedFileId = '';

      $scope.errorUpload = false;

      // UI Settings
      $scope.libraryVisible = true;

      $scope.zoomView = function (event) {
        $scope.mediaDetail = event;
        $scope.selectedName = {
          name: $scope.mediaDetail.name,
          editing: false
        };
        $scope.selectedDesc = {
          description: $scope.mediaDetail.description,
          editing: false
        };

        var position = $mdPanel.newPanelPosition()
          .absolute()
          .center();
        var config = {
          attachTo: angular.element(document.body),
          scope: $scope,
          disableParentScroll: this.disableParentScroll,
          controller: ZoomController,
          templateUrl: 'mediaDetail.html',
          hasBackdrop: true,
          panelClass: 'media-dialog',
          position: position,
          trapFocus: true,
          zIndex: 150,
          clickOutsideToClose: false,
          escapeToClose: true,
          focusOnOpen: true
        };
        $mdPanel.open(config);
        $scope.tagsModel.tags = $scope.mediaDetail.tags;
        $scope.infoId = $scope.mediaDetail.id;
        $scope.imageSrc = $scope.mediaDetail.url;
      };

      $scope.draggedFileId = '';

      $scope.imageMoved = false;

      $scope.dragClass = false;

      $scope.deleteFromMedia = function (fileId) {
        if (!Stratus.Environment.get('production')) {
          console.log(fileId);
        }

        // mdPanelRef.close();
        var confirmMedia = $mdDialog.confirm()
          .title('DELETE MEDIA')
          .textContent('Are you sure you want to permanently delete this from your library? You may get broken images if any content still uses this image.')
          .ok('Yes')
          .cancel('No');

        $mdDialog.show(confirmMedia).then(function () {
          $http({
            method: 'DELETE',
            url: '/Api/Media/' + fileId
          }).then(function (response) {
            // fetch media library list
            $scope.uploadMedia();
          }, function (rejection) {
            if (!Stratus.Environment.get('production')) {
              console.log(rejection.data);
            }
          });
        });

      };

      // upload directly to media library
      $scope.uploadToLibrary = function (files) {
        // update scope of files for watch
        // $scope.uploadComp = false;
        // $scope.imageMoved = false;

        // var position = $mdPanel.newPanelPosition()
        //   .absolute()
        //   .center();
        // var config = {
        //   attachTo: angular.element(document.body),
        //   scope: $scope,
        //   controller: DialogController,
        //   controllerAs: 'ctrl',
        //   disableParentScroll: this.disableParentScroll,
        //   templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDragDropDialog' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',
        //   hasBackdrop: true,
        //   panelClass: 'media-dialog',
        //   position: position,
        //   trapFocus: true,
        //   zIndex: 150,
        //   clickOutsideToClose: false,
        //   escapeToClose: false,
        //   focusOnOpen: true
        // };
        // $mdPanel.open(config);
        // $scope.files = files;

        if (files.length > 0) {
          $('#main').addClass('blurred');
          $('.drag-drop').addClass('show-overlay');

          $mdDialog.show({
            controller: media.DialogController,
            locals: {
              files: files
            },
            templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDragDropDialog' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            escapeToClose: false,
            focusOnOpen: true
          }).then(function (answer) {
            $scope.files = $scope.files.concat(files);
          }, function () {});
        };
      };

      $scope.editItem = function (item) {
        item.editing = true;
      };

      $scope.doneEditing = function (fileId, item) {
        var data = {};
        if (item.description) {
          data.description = item.description;
        }
        if (item.name) {
          data.name = item.name;
        }
        $scope.updateMedia(fileId, data);
        item.editing = false;
      };

      $scope.updateMedia = function (fileId, data) {
        $http({
          method: 'PUT',
          url: '/Api/Media/' + fileId,
          data: data
        }).then(function (response) {
          // fetch media library list
          $scope.uploadMedia();
        }, function (rejection) {
          if (!Stratus.Environment.get('production')) {
            console.log(rejection.data);
          }
        });
      };

      // check if ng-model value changes
      $scope.$watch('files', function (files) {
        if (files !== null) {
          $scope.dragClass = false;

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
            (function (f) {
              // setTimeout(function(){ promises.push($scope.saveMedia(f)); }, 3000);
              if ($scope.imageMoved === false) {
                promises.push($scope.saveMedia(f));
              }
            })(files[i]);
          }

          // show done button when all promises are completed
          if (promises.length > 0) {
            $q.all(promises).then(function (data) {
              $scope.uploadComp = true;
              $scope.uploadMedia();
            }).catch(function (error) {
              $scope.uploadComp = true;
            });
          }
        }
      });

      // common function to load media library from collection
      $scope.uploadMedia = function () {
        // switch to registry controls
        $scope.collection.fetch().then(function (response) {});
      };

      function updateFilesModel(files) {
        if (files !== null) {
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
            (function (f) {
              promises.push($scope.saveMedia(f));
            })(files[i]);
          }

          // show done button when all promises are completed
          if (promises.length > 0) {
            $q.all(promises).then(function (data) {
              $scope.uploadComp = true;
              $scope.uploadMedia();
            }).catch(function (error) {
              $scope.uploadComp = true;
            });

          }
        }
      }

      $scope.createTag = function (query, fileId, tags) {
        var data = {
          name: query
        };
        media.createTag(data).then(
          function (response) {
            if (fileId !== undefined) {
              if (tags !== undefined) {
                var dataRes = {};
                $scope.tagsModel.tags.push(response.data.payload);
                dataRes.tags = $scope.tagsModel.tags;
                $scope.updateMedia(fileId, dataRes);
              }
            }
          },
          function (rejection) {
            if (!Stratus.Environment.get('production')) {
              console.log(rejection.data);
            }
          }
        );
      };

      // common function to save media to server
      $scope.saveMedia = function (file) {
        if (!Stratus.Environment.get('production')) {
          console.log(['savemedia'], file);
        }

        file.errorMsg = null;
        file.uploadStatus = false;
        file.errorUpload = false;
        file.upload = media.uploadToS3(file);

        file.upload.then(
          function (response) {
            file.result = response.data;

            // set status of upload to success
            file.uploadStatus = true;
            file.errorUpload = false;
            $scope.infoId = null;
            $scope.imageSrc = file.result.url;
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

      // Add Class on Popup Image
      $scope.addClassOnPopup = function (event) {
        var myEl = angular.element(document.querySelector($(event.target).attr('data-target')));
        myEl.addClass($(event.target).attr('data-class'));
      };

      // controller for zoom panel
      function ZoomController(mdPanelRef) {
        // delete media from library
        $scope.deleteMediaFromLibrary = function (fileId) {
          mdPanelRef.close();
          $scope.deleteFromMedia(fileId);
        };

        $scope.closeZoom = function () {

          $scope.infoId = null;
          mdPanelRef.close();

        };
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaLibrary' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
