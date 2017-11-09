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
  Stratus.Services.UserAuthentication = ['$provide', function ($provide) {
    $provide.factory('userAuthentication', ['$q', '$http', function ($q, $http) {
      var userAuthenticationServices = {};
      var commonUrl = '/Api/User';
      var loginUrl = '/Api/Login';

      userAuthenticationServices.signIn = function (data) {
        return $http({
          url: loginUrl,
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
      };

      userAuthenticationServices.signUp = function (data) {
        return $http({
          url: commonUrl,
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
      };

      userAuthenticationServices.requestResetPass = function (data) {
        return $http({
          method: 'POST',
          url: commonUrl,
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
      };

      userAuthenticationServices.resetPass = function (data) {
        return $http({
          method: 'POST',
          url: commonUrl,
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
      };

      userAuthenticationServices.verifyAccount = function (data) {
        return $http({
          method: 'POST',
          url: commonUrl,
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
      };

      return userAuthenticationServices;
    }]);
  }];

}));
