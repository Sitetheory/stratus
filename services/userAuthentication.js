/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.commonMethods'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  Stratus.Services.UserAuthentication = [
    '$provide', function ($provide) {
      $provide.factory('userAuthentication', [
        '$q', '$http', 'commonMethods', function ($q, $http, commonMethods) {
          var commonUrl = '/Api/User'
          var loginUrl = '/Api/Login'

          function signIn (data) {
            return commonMethods.sendRequest(data, 'POST', loginUrl)
          }

          function signUp (data) {
            return commonMethods.sendRequest(data, 'POST', commonUrl)
          }

          function requestResetPass (data) {
            return commonMethods.sendRequest(data, 'POST', commonUrl)
          }

          function resetPass (data) {
            return commonMethods.sendRequest(data, 'POST', commonUrl)
          }

          function verifyAccount (data) {
            return commonMethods.sendRequest(data, 'POST', commonUrl)
          }

          return {
            signIn: signIn,
            signUp: signUp,
            requestResetPass: requestResetPass,
            resetPass: resetPass,
            verifyAccount: verifyAccount
          }
        }])
    }]
}))
