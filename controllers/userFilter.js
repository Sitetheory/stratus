// Product Filter Controller
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
  // This Controller handles member role filter
  Stratus.Controllers.UserFilter = [
    '$scope',
    '$log',
    'collection',
    function ($scope, $log, collection) {
      // Store Instance
      Stratus.Instances[_.uniqueId('user_filter_')] = $scope;

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;

      // status selected
      $scope.userRoles = [];
      $scope.showOnly = [];

      // show more
      $scope.more = false;

      /**
      * get status of member
      */

      $scope.getStatus = function (member) {
        status = '';
        if (member.flags) {
          if (!$scope.isVerify(member)) {
            status = 'unverified';
          }
        }
        return status;
      };

      /**
      * return true if user verified
      */
      $scope.isVerify = function (member) {
        if (!member || !member.flags) return false;
        return -1 != member.flags.findIndex(function (x) {
          return (x.flagType && x.flagType.title == 'verify');
        });
      };

      /**
      * Load the roles for filter
      */
      $scope.init = function () {
        collection = new collection();
        collection.target = 'Role';
        collection.urlRoot = '/Api/Role';
        collection.fetch().then(function (response) {
          $scope.userRoles = response;
        });
      };

      // handle click action
      $scope.toggle = function (roleId) {
        var index = $scope.showOnly.indexOf(roleId);
        (index !== -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(roleId);
        filter();
      };

      /**
       * Add filter and Request to api.
       */
      function filter(type, data) {
        $scope.collection.meta.set('api.options.identityRoles', $scope.showOnly);
        $scope.collection.fetch().then(function (response) {
          $log.log('users', response);
        });
        removeFilter();
      }

      /**
       * Remove the filter condition after filter request
       */
      function removeFilter() {
        delete $scope.collection.meta.get('api').options;
      }

      $scope.moreFilter = function () {
        $scope.more = !$scope.more;
      };
    }];
}));
