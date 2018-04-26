// Registry Service
// ----------------

/* global define, FB */

// Define AMD, Require.js, or Contextual Scope
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
  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  Stratus.Services.SocialLibraries = [
    '$provide', function ($provide) {
      $provide.factory('socialLibraries', [
        '$interpolate', '$q', function ($interpolate, $q) {
          var fbAppId = '753913441463877'
          var ggAppId = '878138862061-hsql5u9tcoonjrr99r9f5phcdrao2r8i.apps.googleusercontent.com'

          return {
            loadFacebookSDK: loadFacebookSDK,
            loadGGLibrary: loadGGLibrary
          }

          function loadFacebookSDK () {
            window.fbAsyncInit = function () {
              FB.init({
                appId: fbAppId,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v2.11'
              })
            }

            require(['https://connect.facebook.net/en_US/sdk.js'])

            // window.fbAsyncInit = function () {
            //   FB.init({
            //     appId: fbAppId,
            //     cookie: true, // enable cookies to allow the server to
            // access the session xfbml: true,  // parse XFBML version: 'v2.10'
            // });  FB.AppEvents.logPageView(); };  (function (d, s, id) { var
            // fjs = d.getElementsByTagName(s)[0]; var js = null; if
            // (d.getElementById(id)) return; js = d.createElement(s); js.id =
            // id; js.src =
            // 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.10';
            // fjs.parentNode.insertBefore(js, fjs); }(document, 'script',
            // 'facebook-jssdk'));
          }

          function loadGGLibrary () {
            if (!_.cookie('disableGoogle')) {
              require(['https://apis.google.com/js/platform.js'])
            }

            // load google api key
            var meta = document.createElement('meta')
            meta.name = 'google-signin-client_id'
            meta.content = ggAppId
            document.head.append(meta)
          }
        }])
    }]
}))
