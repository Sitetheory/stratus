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
          function facebookAppId () {
            return '255517234835369'
          }

          function googleAppId () {
            return '202027898788-39l581kkvg6kqfc0bq5c4s322btkmnqb.apps.googleusercontent.com'
          }

          return {
            facebookAppId: facebookAppId,
            googleAppId: googleAppId
          }
        }])
    }]
}))
