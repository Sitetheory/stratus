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
  Stratus.Services.SingleSignOn = [
    '$provide', function ($provide) {
      $provide.factory('singleSignOn', [
        '$q',
        '$http',
        '$window',
        'commonMethods',
        function ($q, $http, $window, commonMethods) {
          function doSignIn (data, service, truthData) {
            var requestData = {
              service: service,
              data: data,
              truthData: truthData
            }
            var headers = {
              'Content-Type': 'application/json'
            }
            return commonMethods.sendRequest(requestData, 'POST', '/Api/Login',
              headers)
          }

          return {
            signIn: doSignIn
          }
        }])
    }]
}))
