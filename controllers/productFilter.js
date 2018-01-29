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
    Stratus.Controllers.ProductFilter = [
      '$scope',
      '$element',
      '$log',
      '$http',
      '$parse',
      function ($scope, $element, $log, $http, $parse) {
        // Store Instance
        Stratus.Instances[_.uniqueId('product_filter_')] = $scope;

        // Wrappers
        $scope.Stratus = Stratus;
        $scope._ = _;

        // the models get from collection
        $scope.models = [];

        // the content is showing
        $scope.contents = [];

        // status
        $scope.status = [{ desc: 'Active', value: 1 }, { desc: 'Inactive', value: 0 }, { desc: 'Deleted', value: -1 }];
        $scope.showOnly = [];

        /**
        * Default Billing Increment Options for Product
        */
        $scope.billingIncrementOptions = { i: 'Minutely', h: 'Hourly', d: 'Daily', w: 'Weekly', m: 'Monthly', q: 'Quarterly', y: 'Yearly' };

        // Data Connectivity
        $scope.$watch('collection.models', function (models) {
          if (models && models.length > 0) {
            $scope.models = $scope.contents = models;
          }
        });

        // handle click action
        $scope.toggle = function (value) {
          var index = $scope.showOnly.indexOf(value);
          (index !== -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(value);
          filterStatus();
        };

        function filterStatus() {
          filter('api.options.status', $scope.showOnly);
        };

        function filter(type, data) {
          $scope.collection.meta.set(type, data);
          $scope.collection.fetch().then(function (response) { $scope.contents = response; });
        }

        // /*
        // * Filter by status: active: 1, inactive: 0, deleted: -1
        // */
        // function filterStatus() {
        //   $scope.contents = [];
        //   if ($scope.showOnly.length == 0) {
        //     $scope.contents = $scope.models;
        //     return;
        //   }
        //   angular.forEach($scope.models, function (model) {
        //     if ($scope.showOnly.indexOf(model.data.status)  != -1) {
        //       $scope.contents.push(model);
        //     }
        //   });
        // };
      }];
  }));
