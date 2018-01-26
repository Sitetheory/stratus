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

  // This Collection Service handles data binding for multiple objects with the $http Service
  Stratus.Services.AdminThemeSelector = ['$provide', function ($provide) {
    $provide.factory('adminThemeSelector', ['$q', '$http', function ($q, $http) {
      var urlApi = '/Api/Template';

      // TODO: This can use collections from the registry

      function selectTheme(data) {
        return $http({
          url: urlApi,
          method: 'POST',
          data: data
        }).then(
          function (response) {
            // success
            return $q.resolve(response);
          },
          function (response) {
            // something went wrong
            return $q.reject(response);
          });
      }

      return {
        selectTheme: selectTheme
      };
    }]);
  }];
}));
