// Invoice Product Filter Controller
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
  Stratus.Controllers.InvoiceProductFilter = [
    '$scope',
    '$log',
    function ($scope, $log) {
      // Store Instance
      Stratus.Instances[_.uniqueId('invoice_product_filter_')] = $scope;

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;

      // the models get from collection
      $scope.timeStart = null;
      $scope.timeEnd = null;

      // status
      $scope.status = [
        {
          desc: 'Cancelled',
          value: -1
        },
        {
          desc: 'Active',
          value: 1
        },
        {
          desc: 'Pending Activation',
          value: 0
        }
      ];

      // status selected
      $scope.showOnly = [];

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

      /**
       * Get status of invoice_product
       * Active: timeStart <= currentTime <= timeEnd
       * Pending Activation: currentTime < timeStart
       * Cancelled: timeEnd <= currentTime
       */
      $scope.getStatus = function (invoiceProduct) {
        var currentTime = Math.floor(Date.now());
        var timeEnd = (invoiceProduct.timeEnd) ? invoiceProduct.timeEnd : currentTime + 1000;
        var timeStart = invoiceProduct.timeStart || currentTime + 1000;
        if (timeEnd <= currentTime) {
          return 'cancelled';
        }
        if (currentTime < timeStart) {
          return 'pendingActivation';
        }
        if (timeStart <= currentTime && currentTime <= timeEnd) {
          return 'active';
        }
      };

      /*
      * Filter by status: active: 1, inactive: 0, deleted: -1
      */
      function filterStatus() {
        filter('api.options.invoiceStatus', $scope.showOnly);
      };

      $scope.filterSite = function (siteId) {
        filter('api.options.siteId', siteId);
      };

      $scope.filterProduct = function (productContentId) {
        filter('api.options.productContentId', productContentId);
      };

      function filter(type, data) {
        $scope.collection.meta.set(type, data);
        $scope.collection.fetch().then(function (response) {
          $log.log('response:', response);
        });
      }

      $scope.filterDateRanger = function () {
        if ($scope.timeStart && $scope.timeEnd && angular.isDate($scope.timeStart) && angular.isDate($scope.timeEnd)) {
          $scope.timeStart = new Date($scope.timeStart);
          $scope.timeEnd = new Date($scope.timeEnd);
          $scope.collection.meta.set('api.options.timeStart', $scope.timeStart.getTime() / 1000);
          $scope.collection.meta.set('api.options.timeEnd', $scope.timeEnd.getTime() / 1000);
          $scope.collection.fetch().then(function (response) {
            $log.log('response:', response);
          });
        }
      };

      /**
      * Return site name
      * (String)
      */
      $scope.getSiteName = function (siteId, siteList) {
          var siteName;
          if (siteList.length > 0) {
            siteList.forEach(function (site) {
                if (site.id === siteId) {
                  siteName = site.name;
                }
              });
            return siteName;
          }
          return 'Site Name';
        };

      $scope.getTags = function (contentId, tagList) {
        var tags = [];
        if (tagList.length > 0) {
          tagList.forEach(function (tag) {
            if (contentId === tag.assets[0].id) {
              if (tags.indexOf($scope.upperFirst(tag.name)) == -1) {
                tags.push($scope.upperFirst(tag.name));
              }
            }
          });
          return '(' + tags.toString() + ')';
        }
        return '';
      };

      $scope.upperFirst = function (string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        };
    }];
}));
