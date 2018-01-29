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
    Stratus.Controllers.InvoiceProductFilter = [
      '$scope',
      '$element',
      '$log',
      '$http',
      '$parse',
      function ($scope, $element, $log, $http, $parse) {
        // Store Instance
        Stratus.Instances[_.uniqueId('invoice_product_filter_')] = $scope;

        // Wrappers
        $scope.Stratus = Stratus;
        $scope._ = _;

        // the models get from collection
        $scope.models = [];
        $scope.siteId = null;

        // the content is showing
        $scope.subscriptions = [];

        // status
        $scope.status = [{ desc: 'Cancelled', value: -1 }, { desc: 'Active', value: 1 }, { desc: 'Pending Activatioin', value: 0 }];
        $scope.status = [{ desc: 'Cancelled', value: -1 }, { desc: 'Active', value: 1 }, { desc: 'Pending Activatioin', value: 0 }];
        $scope.status = [{ desc: 'Cancelled', value: -1 }, { desc: 'Active', value: 1 }, { desc: 'Pending Activatioin', value: 0 }];
        $scope.showOnly = [];

        /**
        * Default Billing Increment Options for Product
        */
        $scope.billingIncrementOptions = { i: 'Minutely', h: 'Hourly', d: 'Daily', w: 'Weekly', m: 'Monthly', q: 'Quarterly', y: 'Yearly' };

        // Data Connectivity
        $scope.$watch('collection.models', function (models) {
          if (models && models.length > 0) {
            $scope.models = $scope.subscriptions = models;
          }
        });

        // handle click action
        $scope.toggle = function (value) {
          var index = $scope.showOnly.indexOf(value);
          (index !== -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(value);
          filterStatus();
        };

        /**
        * Get status of invoice_product
        * Active: timeStart <= currentTime <= timeEnd
        * Pending Activation: currentTime < timeStart
        * Cancelled: timeEnd <= currentTime
        */
        $scope.getStatus = function (invoiceProduct) {
          invoiceProduct = invoiceProduct.data;
          var currentTime = Math.floor(Date.now());
          var timeEnd = (invoiceProduct.timeEnd) ? invoiceProduct.timeEnd : currentTime + 1000;
          var timeStart = invoiceProduct.timeStart || currentTime + 1000;
          if (timeEnd <= currentTime) return 'cancelled';
          if (currentTime < timeStart) return 'pendingActivation';
          if (timeStart <= currentTime && currentTime <= timeEnd) return 'active';
        };

        /*
        * Filter by status: active: 1, inactive: 0, deleted: -1
        */
        function filterStatus() {
          $scope.collection.meta.set('api.invoiceStatus', $scope.showOnly);
          $scope.collection.fetch().then(function (response) { $scope.subscriptions = response; });
        };

        $scope.filterSite = function (siteId) {
          $scope.collection.meta.set('api.options.siteId', siteId);
          $scope.collection.fetch().then(function (response) { $scope.subscriptions = response; });
        };
      }];
  }));
