/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'jquery',
      'angular',
      'stratus.services.commonMethods'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  Stratus.Services.Media = [
    '$provide', function ($provide) {
      $provide.factory('media', [
        '$q',
        '$http',
        '$mdDialog',
        'Upload',
        'commonMethods',
        function (
          $q,
          $http,
          $mdDialog,
          Upload,
          commonMethods
        ) {
          var tagApi = '/Api/Tag'
          var mediaApi = '/Api/Media'

          return {
            dragenter: dragenter,
            dragleave: dragleave,
            createTag: createTag,
            uploadToS3: uploadToS3,
            deleteMedia: deleteMedia,
            updateMedia: updateMedia,
            getMedia: getMedia,
            fileUploader: fileUploader,
            saveMediaUrl: saveMediaUrl,
            fetchOneMedia: fetchOneMedia
          }

          function dragenter (event) {
            jQuery('#main').addClass('blurred')
          }

          function dragleave (event) {
            jQuery('#main').removeClass('blurred')
          }

          function getMedia (scope) {
            var currentPage = scope.collection.meta.data.pagination.pageCurrent
            if (currentPage == null) return scope.collection.fetch()
            return scope.collection.page(currentPage)
          }

          function createTag (data) {
            return commonMethods.sendRequest(data, 'POST', tagApi)
          }

          function deleteMedia (fileId) {
            return commonMethods.sendRequest(null, 'DELETE', mediaApi + '/' +
              fileId)
          }

          function fetchOneMedia (fileId) {
            return commonMethods.sendRequest(null, 'GET', mediaApi + '/' +
              fileId)
          }

          function saveMediaUrl (data) {
            return commonMethods.sendRequest(data, 'POST', mediaApi)
          }

          // Update title, description, tags of a file
          function updateMedia (fileId, data) {
            return commonMethods.sendRequest(data, 'PUT', mediaApi + '/' + fileId)
          }

          // TODO: Evaluate this functionality
          function uploadToS3 (file, infoId) {
            // var s3Credentials = appConfig.s3Credentials();
            // var POLICY = s3Credentials.POLICY
            // var SIGNATURE = s3Credentials.SIGNATURE
            // var ACCESS_KEY = s3Credentials.ACCESS_KEY
            var url = '//app.sitetheory.io:3000/?session=' +
              _.cookie('SITETHEORY') + (infoId ? ('&id=' + infoId) : '')

            return Upload.upload({
              url: url,
              method: 'POST',
              data: {
                // AWSAccessKeyId: ACCESS_KEY,
                key: file.name, // the key to store the file on S3, could be
                // file name or customized
                acl: 'private', // sets the access to the uploaded file in the
                // bucket: private, public-read, ...
                // policy: POLICY, // base64-encoded json policy
                // signature: SIGNATURE, // base64-encoded signature based on
                // policy string
                'Content-Type': file.type !== ''
                  ? file.type
                  : 'application/octet-stream', // content type of the file
                // (NotEmpty)
                filename: file.name, // this is needed for Flash polyfill IE8-9
                file: file
              }
            })
          }

          function fileUploader (file, infoId) {
            file.errorMsg = null
            file.errorUpload = false
            file.progress = 0

            file.upload = uploadToS3(file, infoId)
            file.upload.then(
              function (res) {
                file.result = res.data
                file.errorUpload = false
              },
              function (rej) {
                file.errorUpload = true
                if (rej.config.data.file.upload.aborted === true) {
                  file.errorMsg = 'Aborted'
                } else {
                  file.errorMsg = 'Server Error! Please try again'
                }
              }
            )

            file.upload.progress(function (evt) {
              file.progress = evt.total === 0 ? 0 : Math.min(100,
                parseInt(100.0 * evt.loaded / evt.total))
            })

            return file
          }
        }
      ])
    }]
}))
