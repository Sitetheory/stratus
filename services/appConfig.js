/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Services.appConfig = [
    '$provide', function ($provide) {
      $provide.factory('appConfig', [
        '$q', '$http', function ($q, $http) {
          // TODO: This can use collections from the registry

          function facebookAppId () {
            return '244333872792483'
          }

          function googleAppId () {
            return '560074394524-csqefvbcv1mgjjqr65vs3skabk4m1vbc.apps.googleusercontent.com'
          }

          return {
            facebookAppId: facebookAppId,
            googleAppId: googleAppId
          }
        }])
    }]
}))
