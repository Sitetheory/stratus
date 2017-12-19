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
  Stratus.Services.SingleSignOn = ['$provide', function ($provide) {
    $provide.factory('singleSignOn', ['$q', '$http', function ($q, $http, $window) {
      // variables
      var loginUrl = '/Api/Login';

      return {
        signIn: doSignIn
      };

      // SignIn url: /User/Login
      function doSignIn(data, service, truthData) {
        return $http({
          method: 'POST',
          url: loginUrl,
          data: { service: service, data: data, truthData: truthData },
          headers: { 'Content-Type': 'application/json' }
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
    }]);
  }];
}));
