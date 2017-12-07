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
  Stratus.Services.Selectors = ['$provide', function ($provide) {
    $provide.factory('selectors', ['$q', '$http', function ($q, $http) {
      var apiUrl = '/Api/Media/';
      return {
        beforeChange: beforeChange,
        confirmMedia: confirmMedia,
        updateMedia: updateMedia,
        createTag: createTag
      };

      function beforeChange(fileId) {
        return $http({
          url: apiUrl + fileId,
          method: 'GET'
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

      function confirmMedia(fileId) {
        return $http({
          url: apiUrl + fileId,
          method: 'DELETE',
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
          url: apiUrl + fileId,
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

      function createTag(data) {
        var apiTag = '/Api/Tag';
        return $http({
          method: 'POST',
          url: apiTag,
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
    }]);
  }];

}));
