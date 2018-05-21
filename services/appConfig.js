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

          function s3Credentials() {
            return {
              POLICY: 'ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogInNpdGV0aGVvcnljb3JlIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sCiAgICB7ImFjbCI6ICJwcml2YXRlIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiIl0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRmaWxlbmFtZSIsICIiXSwKICAgIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCA1MjQyODgwMDBdCiAgXQp9',
              SIGNATURE: '5bz7ETqEC0Gxj1vJP/a6t3DRMJc=',
              ACCESS_KEY: 'AKIAIX32Y3S7HCX4BSQA'
            }
          }

          return {
            facebookAppId: facebookAppId,
            googleAppId: googleAppId,
            s3Credentials: s3Credentials
          }
        }])
    }]
}))
