// Registry Service
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {

  // This Collection Service handles data binding for multiple objects with the $http Service
  Stratus.Services.SocialLibraries = ['$provide', function ($provide) {
    $provide.factory('socialLibraries', ['$interpolate', '$q', function ($interpolate, $q) {
      var fbAppId = '753913441463877';
      var ggAppId = '878138862061-hsql5u9tcoonjrr99r9f5phcdrao2r8i.apps.googleusercontent.com';

      return {
        loadFacebookSDK: loadFacebookSDK,
        loadGGLibrary: loadGGLibrary
      };

      function loadFacebookSDK() {
        window.fbAsyncInit = function () {
          FB.init({
            appId: fbAppId,
            cookie: true, // enable cookies to allow the server to access the session
            xfbml: true,  // parse XFBML
            version: 'v2.10'
          });

          FB.AppEvents.logPageView();
        };

        (function (d, s, id) {
          var fjs = d.getElementsByTagName(s)[0];
          var js = null;
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.10';
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      };

      function loadGGLibrary() {
        // load javascrip
        var js = document.createElement('script'); // use global document since Angular's $document is weak
        js.src = 'https://apis.google.com/js/platform.js';
        document.body.appendChild(js);

        // load google api key
        var meta = document.createElement('meta');
        meta.name = 'google-signin-client_id';
        meta.content = ggAppId;
        document.head.append(meta);

        // 1. Load the JavaScript client library.
        gapi.load('client', start);
      };

      function start() {
        // 2. Initialize the JavaScript client library.
        gapi.client.init({
          apiKey: 'YOUR_API_KEY',
          // Your API key will be automatically added to the Discovery Document URLs.
          discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
          // clientId and scope are optional if auth is not required.
          clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
          scope: 'profile',
        }).then(function () {
          // 3. Initialize and make the API request.
          return gapi.client.people.people.get({
            resourceName: 'people/me',
            'requestMask.includeField': 'person.names'
          });
        }).then(function (response) {
          console.log(response.result);
        }, function (reason) {
          console.log('Error: ' + reason.result.error.message);
        });
      };

    }]);
  }];

}));
