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
      var commonUrl = '/Api/User';
      var loginUrl = '/Api/Login';

      return {
        signIn: signIn,
        signUp: signUp,
        requestResetPass: requestResetPass,
        resetPass: resetPass,
        verifyAccount: verifyAccount
      };

      /**
       * @param data
       * @param url
       */
      function sendPost(data, url) {
        return $http({
          url: url || commonUrl,
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

      function signIn(data) {
        return sendPost(data, loginUrl);
      };

      function signUp(data) {
        return sendPost(data);
      };

      function requestResetPass(data) {
        return sendPost(data);
      };

      function resetPass(data) {
        return sendPost(data);
      };

      function verifyAccount(data) {
        return sendPost(data);
      };
    }]);
  }];

}));
