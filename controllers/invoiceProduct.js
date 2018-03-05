// Invoice Product Filter Controller
// -----------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.collection'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.InvoiceProduct = [
    '$timeout',
    '$scope',
    '$log',
    'collection',
    function ($timeout, $scope, $log, collection) {
      // Store Instance
      Stratus.Instances[_.uniqueId('invoice_product_')] = $scope;

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;

      $scope.products = [];
      $scope.collection = null;

      $scope.init = function () {
        collection = new collection();
        collection.target = 'Product';
        collection.urlRoot = '/Api/Product';
        $scope.collection = collection;
        $scope.loadProducts(null);
      };

      $scope.loadProducts = function (siteId) {
        $scope.collection.meta.set('api.options.siteId', siteId |= null);
        return $timeout(function () {
          $scope.collection.fetch().then(function (results) {
            $log.log('response:', results);
            $scope.products = results;
          });
        }, 50);
      };
    }];
}));
