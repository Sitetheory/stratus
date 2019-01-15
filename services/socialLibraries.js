// Social Library Service
// ----------------------

/* global define, FB */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.appConfig'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  Stratus.Services.SocialLibraries = [
    '$provide', function ($provide) {
      $provide.factory('socialLibraries', [
        '$interpolate', '$q', 'appConfig',
        function ($interpolate, $q, appConfig) {
          return {
            loadFacebookSDK: loadFacebookSDK,
            loadGGLibrary: loadGGLibrary
          }

          function loadFacebookSDK () {
            // console.info('Setting Facebook Callback...')
            window.fbAsyncInit = function () {
              // console.info('Initializing Facebook...')
              FB.init({
                appId: appConfig.facebookAppId(),
                autoLogAppEvents: true,
                cookie: true, // enable cookies to allow the server to access the session
                xfbml: true, // parse social plugins on this page
                version: 'v3.2'
              })
              // FB.AppEvents.logPageView()
            }

            if (!_.cookie('disableFacebook')) {
              require(['https://connect.facebook.net/en_US/sdk.js'])
            }
          }

          function loadGGLibrary () {
            if (!_.cookie('disableGoogle')) {
              require(['https://apis.google.com/js/platform.js'])
            }

            // load google api key
            var meta = document.createElement('meta')
            meta.name = 'google-signin-client_id'
            meta.content = appConfig.googleAppId()
            document.head.append(meta)
          }
        }])
    }]
}))
