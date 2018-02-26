(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.commonMethods'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {

  // This Collection Service handles data binding for multiple objects with the $http Service
  Stratus.Services.CreateNewSite = ['$provide', function ($provide) {
    $provide.factory('createNewSite', ['$q', '$http', 'commonMethods', function ($q, $http, commonMethods) {
      // TODO: This can use collections from the registry

      function create(data) {
        return commonMethods.sendRequest(data, 'POST', '/Api/Site');
      };

      function checkMaster(data) {
        return commonMethods.sendRequest(data, 'GET', '/Api/SiteGenre');
      };

      return {
        create: create,
        checkMaster: checkMaster
      };
    }]);
  }];

}));
