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
        var mediaApi = '/Api/Media/'

        return {
          dragenter: dragenter,
          dragleave: dragleave,
          createTag: createTag,
          uploadToS3: uploadToS3,
          deleteMedia: deleteMedia,
          updateMedia: updateMedia
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

        function deleteMedia(fileId) {
          return $http({
            method: 'DELETE',
            url: mediaApi + fileId
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

        function updateMedia(fileId, data) {
          return $http({
            method: 'PUT',
            url: mediaApi + fileId,
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

        // =================== Ultilities =================== //
        function uploadToS3(file, infoId) {
          const POLICY = 'ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogInNpdGV0aGVvcnljb3JlIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sCiAgICB7ImFjbCI6ICJwcml2YXRlIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiIl0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRmaWxlbmFtZSIsICIiXSwKICAgIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCA1MjQyODgwMDBdCiAgXQp9';
          const SIGNATURE = '5bz7ETqEC0Gxj1vJP/a6t3DRMJc=';
          const ACCESS_KEY = 'AKIAIX32Y3S7HCX4BSQA';
          var url = '//app.sitetheory.io:3000/?session=' + _.cookie('SITETHEORY') + (infoId ? ('&id=' + infoId) : '');

          return Upload.upload({
            url: url,
            method: 'POST',
            data: {
              AWSAccessKeyId: ACCESS_KEY,
              key: file.name, // the key to store the file on S3, could be file name or customized
              acl: 'private', // sets the access to the uploaded file in the bucket: private, public-read, ...
              policy: POLICY, // base64-encoded json policy (see article below)
              signature: SIGNATURE, // base64-encoded signature based on policy string (see article below)
              'Content-Type': file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
              filename: file.name, // this is needed for Flash polyfill IE8-9
              file: file
            }
          });
        }

        function loadMedia() {
          $scope.collection.fetch().then(function (response) {
            console.log(response);
          });
        };
      }
    ]);
  }];
}));
