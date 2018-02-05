// Permissions Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'jquery',
      'underscore',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.collection'

    ], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {
  // Permissions
  Stratus.Components.Permissions = {
    bindings: {
      ngModel: '='
    },
    controller: function ($scope, $timeout, $attrs, registry) {

      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

      // mock up list permissions
      $scope.permissions = [];
      $scope.permissionSelected = [];
      $scope.permissionSearchTerm = null;

      // mock up list roles
      $scope.userRoles = [];
      $scope.userRoleSelected = null;

      // mock up list contents
      $scope.contents = [];
      $scope.contentSelected = null;

      /**
      * Load data demo.
      */
      $scope.loadPermissions = function () {
        // Use timeout to simulate a 400ms request.
        return $timeout(function () {
          $scope.permissions = [
            { value: 1, name: 'View' },
            { value: 2, name: 'Create' },
            { value: 4, name: 'Edit' },
            { value: 8, name: 'Delete' },
            { value: 16, name: 'Publish' },
            { value: 32, name: 'Design' },
            { value: 64, name: 'Dev' },
            { value: 128, name: 'Master' }
          ];
        }, 400);
      };

      /**
      * Load data demo.
      */
      $scope.loadContents = function () {
        // Use timeout to simulate a 400ms request.
        return $timeout(function () {
          $scope.contents = [
            { id: 1, name: 'Art Bundle' },
            { id: 2, name: 'Articles' },
            { id: 3, name: 'The Art of being' }
          ];
        }, 400);
      };

      /**
      * Load data demo.
      */
      $scope.loadUserRoles = function () {
        // Use timeout to simulate a 400ms request.
        return $timeout(function () {
          $scope.userRoles = [
            { id: 1, name: 'Daniela' },
            { id: 2, name: 'Desmond' },
            { id: 3, name: 'Desiree' }
          ];
        }, 400);
      };

      /**
      * If user selected the master Action, the other action selected will be ignored.
      * If user selected all of actions except the master action, the action Selected will be converted to only contain master.
      */
      $scope.processSelectAction = function () {
        var masterIndex = $scope.permissionSelected.indexOf(128);
        if ((masterIndex != -1) || ($scope.permissionSelected.length == $scope.permissions.length - 1)) {
          $scope.permissionSelected = [$scope.permissions[$scope.permissions.length - 1].value];
        }
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };

}));
