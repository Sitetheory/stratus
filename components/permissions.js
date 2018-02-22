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
      'angular-material'
    ], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {
  // Permissions
  Stratus.Components.Permissions = {
    controller: function ($scope, $timeout, $attrs, $http) {
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

      // mock up list permissions
      $scope.permissions = [];
      $scope.permissionSelected = [];

      // mock up list roles
      $scope.userRoleSelected = null;

      // mock up list contents
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
      * If user selected the master Action, the other action selected will be ignored.
      * If user selected all of actions except the master action, the action Selected will be converted to only contain master.
      */
      $scope.processSelectAction = function () {
        var masterIndex = $scope.permissionSelected.indexOf(128);
        if ((masterIndex != -1) || ($scope.permissionSelected.length == $scope.permissions.length - 1)) {
          $scope.permissionSelected = [$scope.permissions[$scope.permissions.length - 1].value];
        }
      };

      /**
      * Retrieve data from server
      */
      $scope.permissionQuery = function (collection, query) {
        var results = collection.filter(query);
        return Promise.resolve(results).then(function (value) {
          console.log('value', value);
          var response = [];
          if (value.User) {
            response = response.concat(value.User);
          }else if (value.Role) {
            response = response.concat(value.Role);
          }else {
            response = response.concat(value);
          }
          console.log('response', response);
          return response;
        });
      };

      $scope.selectedUserRoleChange = function (item) {
        $scope.userRoleSelected = item;
      };

      $scope.selectedContentChange = function (content) {
        $scope.contentSelected = content;
      };

      /**
      * process data for submit
      * return {*}
      */
      $scope.processDataSubmit = function () {
        if ($scope.userRoleSelected && $scope.userRoleSelected.name) {
          return { identity: { role: $scope.userRoleSelected.id }, asset: { asset: 'SitetheoryUserBundle:User', id: $scope.contentSelected.id }, permissions: $scope.permissionSelected };
        }
        return { identity: { user: $scope.userRoleSelected.id }, asset: { asset: 'SitetheoryUserBundle:User', id: $scope.contentSelected.id }, permissions: $scope.permissionSelected };
      };

      //
      $scope.submit = function () {
        return $http({
          method: 'PUT',
          url: '/Api/Permission',
          data: processDataSubmit(),
          headers: { 'Content-Type': 'application/json' }
        }).then(
          function (response) {
            // success
            console.log('response', response);
          },
          function (response) {
            // something went wrong
            console.log('response error', response);

          });
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
