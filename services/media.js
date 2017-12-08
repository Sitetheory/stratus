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
    $provide.factory('media', ['$q', '$http', '$mdDialog', function ($q, $http, $mdDialog) {
      var urlApi = '/Api/Template';
      var tagApi = '/Api/Tag';

      return {
        dragenter: dragenter,
        dragleave: dragleave,
        DialogController: DialogController,
        createTag: createTag
      };

      function dragenter(event) {
        $('#main').addClass('blurred');
      }

      function dragleave(event) {
        $('#main').removeClass('blurred');
      }

      function DialogController($scope, files) {
        // Do upload stuffs
        $scope.files = files;

        $scope.done = function () {
          $mdDialog.hide();
          dragleave();
        };

        $scope.cancel = function () {
          $mdDialog.cancel();
          dragleave();
        };

        $scope.addFiles = function (newFiles) {
          if (newFiles.length > 0) {
            $scope.files = Array.from($scope.files).concat(newFiles);
          }
        };

        $scope.removeFiles = function (file) {
          $scope.files = _.without($scope.files, file);
        };
      };

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
    }]);
  }];
}));
