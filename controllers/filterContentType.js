(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',

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
      '$http',
      '$parse',
      function ($scope, $element, $mdToast, $log, $http, $parse) {
        // Store Instance
        Stratus.Instances[_.uniqueId('filter_content_type_')] = $scope;

        // Wrappers
        $scope.Stratus = Stratus;
        $scope._ = _;

        // the contents get from collection
        $scope.contents = [];

        // the contents type used for filter list.
        $scope.contentTypes = [];

        // constraint the contentType is choosed in showOnly
        $scope.showOnly = [];
        $scope.meta = [];

        // show more
        $scope.more = false;

        // Data Connectivity
        $scope.$watch('collection.models', function (models) {
          if (models && models.length > 0) {
            $scope.contents = $scope.data.contents = models;
          }
        });

        $scope.$watch('collection.meta.attributes.usedContentTypes', function (contentType) {
          if (contentType && contentType.length > 0) {
            $scope.contentTypes = contentType;
          }
        });

        $scope.$watch('collection.meta', function (meta) {
          if (meta) $scope.meta = meta;
        });

        /*
        * Handle showOnly check
        */
        $scope.toggle = function (contentType) {
          var index = $scope.showOnly.findIndex(function (x) { return x.value === contentType.value; });
          (index !== -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(contentType);
          reloadContents();
        };

        $scope.moreFilter = function () {
          $scope.more = !$scope.more;
        };

        /*
        * Recall api to get contents
        */
        function reloadContents() {
          $scope.meta.set('api.options.contentType', $scope.showOnly.map(x => x.value));
          $scope.collection. fetch().then(function (response) { console.log('response', response); });
        }
      }];
  }));
