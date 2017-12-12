(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {

  // This Collection Service handles data binding for multiple objects with the $http Service
  Stratus.Services.Media = ['$provide', function ($provide) {
    $provide.factory('media', [
      '$q',
      '$http',
      '$mdDialog',
      'Upload',
      function (
        $q,
        $http,
        $mdDialog,
        Upload
      ) {
        var urlApi = '/Api/Template';
        var tagApi = '/Api/Tag';

        return {
          dragenter: dragenter,
          dragleave: dragleave,
          createTag: createTag,
          uploadToS3: uploadToS3,
          DialogController: DialogController
        };

        function dragenter(event) {
          $('#main').addClass('blurred');
        }

        function dragleave(event) {
          $('#main').removeClass('blurred');
        }

        function createTag(data) {
          return $http({
            url: tagApi,
            method: 'POST',
            data: data
          }).then(
            function (response) {
              // success
              return $q.resolve(response);
            },
            function (response) {
              // something went wrong
              return $q.reject(response);
            });
        }

        function uploadToS3(file) {
          return Upload.upload({
            url: 'https://xxxxxxxxxxxxxxxxxx.s3.amazonaws.com/', // S3 upload url including bucket name
            method: 'POST',
            data: {
              key: file.name, // the key to store the file on S3, could be file name or customized
              AWSAccessKeyId: 'AKIAIX32Y3S7HCX4BSQA',
              acl: 'private', // sets the access to the uploaded file in the bucket: private, public-read, ...
              policy: 'xxxxxxxxxxxxxxxxxxxxxxxxxx', // base64-encoded json policy (see article below)
              signature: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx', // base64-encoded signature based on policy string (see article below)
              'Content-Type': file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
              filename: file.name, // this is needed for Flash polyfill IE8-9
              file: file
            }
          });
        }

        function DialogController($scope, files) {
          // Do upload stuffs
          $scope.files = files;

          $scope.done = function () {
            $mdDialog.hide();
            media.dragleave();
          };

          $scope.cancel = function () {
            $mdDialog.cancel();
            media.dragleave();
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
              var promises = [];
              for (var i = 0; i < newFiles.length; i++) {
                promises.push(saveMedia(newFiles[i]));
              }

              // show done button when all promises are completed
              if (promises.length > 0) {
                $q.all(promises).then(
                  function (response) {
                    loadMedia();
                  }, function (error) {
                    console.log(error);
                  }
                );
              }
            }
          });
        };

        // Ultilities
        function saveMedia(file) {
          if (!Stratus.Environment.get('production')) {
            console.log(['savemedia'], file);
          }

          file.errorMsg = null;
          file.uploadStatus = false;
          file.errorUpload = false;
          file.upload = uploadToS3(file);

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

        function loadMedia() {
          $scope.collection.fetch().then(function (response) {
            console.log(response);
          });
        };
      }
    ]);
  }];
}));
