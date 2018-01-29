// Product Filter Controller
// -----------------

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
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.ProductFilter = [
    '$scope',
    '$log',
    function ($scope, $log) {
      // Store Instance
      Stratus.Instances[_.uniqueId('product_filter_')] = $scope;

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;

      // status selected
      $scope.showOnly = [];

      // status
      $scope.status = [
        {
          desc: 'Active',
          value: 1
        },
        {
          desc: 'Inactive',
          value: 0
        },
        {
          desc: 'Deleted',
          value: -1
        }
      ];
      $scope.minPrice = 0.00;
      $scope.maxPrice = 0.00;

      /**
       * Default Billing Increment Options for Product
       */
      $scope.billingIncrementOptions = {
        i: 'Minutely',
        h: 'Hourly',
        d: 'Daily',
        w: 'Weekly',
        m: 'Monthly',
        q: 'Quarterly',
        y: 'Yearly'
      };

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
        $scope.collection.fetch().then(function (response) {
          $log.log('response', response);
        });
      }

      $scope.$watchCollection('[minPrice, maxPrice]', function (newVal, oldVal) {
        if ($scope.minPrice >= 0 && $scope.maxPrice >= 0) {
          $scope.collection.meta.set('api.options.minPrice', $scope.minPrice);
          $scope.collection.meta.set('api.options.maxPrice', $scope.maxPrice);
          $scope.collection.fetch().then(function (response) {
            $log.log('response', response);
          });
        }
      });
    }];
}));
