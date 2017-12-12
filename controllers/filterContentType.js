(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',

      'stratus.services.filterContentType',
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.FilterContentType = [
    '$scope',
    '$element',
    '$mdToast',
    '$log',
    '$parse',
    'filterContentType',
    function ($scope, $element, $mdToast, $log, $parse, filterContentType) {
      // Store Instance
      Stratus.Instances[_.uniqueId('filter_content_type_')] = $scope;

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;

      // get data from filterContentType services, this data is used for show in html.
      $scope.data = filterContentType;

      // the contents get from collection
      $scope.contents = [];

      // the contents type used for filter list.
      $scope.contentTypes = [];

      // constraint the contentType is choosed in showOnly
      $scope.showOnly = [];

      // Data Connectivity
      $scope.$watch('collection.models', function (models) {
        if (models && models.length > 0) {
          $scope.contents = $scope.data.contents = models;
        }
      });

      $scope.$watch('collection.meta.attributes.usedContentTypes', function (contentType) {
        if (contentType) {
          $scope.contentTypes = contentType;
        }
      });

      //  Handle showOnly check
      $scope.toggle = function (contentType) {
        var index = $scope.showOnly.findIndex(function (x) {
          return x.value === contentType.value;
        });
        (index !== -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(contentType);
        reloadContents();
      };

      $scope.moreFilter = function () {
        $scope.more = !$scope.more;
      };

      // reload contents
      function reloadContents() {
        if ($scope.showOnly.length > 0) {
          $scope.data.contents = [];
          angular.forEach($scope.contents, function (content) {
            if ($scope.showOnly.findIndex(function (x) {
                return x.prompt === content.data.contentType.name;
              }) !== -1) {
              $scope.data.contents.push(content);
            }
          });
        } else {
          $scope.data.contents = $scope.contents;
        }
      }
    }];
}));
