// Selector Component
// ------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.signleSignOn = {
    bindings: {},
    controller: function ($scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('signle_sign_on_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/signleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;

      // define functions which html able to call.
      $ctrl.constructor = init;
      $ctrl.FBLogin = FBLogin;
      $ctrl.TwitterLogin = TwitterLogin;
      $ctrl.GithubLogin = GithubLogin;

      // variables
      var url = '/Api/User';
      var loginUrl = '/Api/Login';
      var gitCliendID = 'ec02e22a403643f3d439';
      var gitClientSecret = 'daed61e51b18d68ed75d1b47242926b764cf0295';

      // methods
      function init() {
        loadFacebookSDK();
        gitAuthenticate();
      }

      // FACEBOOK LOGIN
      function loadFacebookSDK() {
        window.fbAsyncInit = function () {
          FB.init({
            appId: '753913441463877',
            cookie: true,
            xfbml: true,
            version: 'v2.9'
          });

          FB.AppEvents.logPageView();
        };

        (function (d, s, id) {
          var fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {return;}
          var js = d.createElement(s); js.id = id;
          js.src = 'https://connect.facebook.net/en_US/sdk.js';
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      };

      function FBLogin() {
        console.log('11111111');
        FB.login(function (response) {
          if (response.authResponse) {
            console.log('Welcome to facebook. Fetching your inform. . .', response);
            FB.api('/me', { fields: 'email,name, age_range, gender, is_verified, context, address' }, function (response) {
              console.log(response);
              console.log('Good to see ', response.name);
            });
          } else {
            FB.login();
          }
        });
      };

      // GITHUB LOGIN
      function GithubLogin() {
        console.log('GithubLogin');
        window.location.replace('https://github.com/login/oauth/authorize?client_id=' + 'ec02e22a403643f3d439' + '&scopes=scopes&state=unguessable-string');
      };

      // Extract the auth code from the original URL

      function gitGetAuthCode() {
        var url = window.location.href;
        var error = url.match(/[&\?]error=([^&]+)/);
        if (error != null) {
          throw 'Error getting authorization code: ' + error;
        }
        return url.match(/[&\?]code=([\w\/\-]+)/);
      };

      function gitAuthenticate() {
        var code = gitGetAuthCode();
        if (code == null) {
          return;
        }

        var data = {
          client_id: gitCliendID,
          client_secret: gitClientSecret,
          code: code[1]
        };

        console.log('data', data);

        $http({
          method: 'POST',
          url: 'https://github.com/login/oauth/access_token',
          data: data
        }).then(
          function (response) {
            console.log('git response', response);
          },
          function (error) {
            console.log('git error', error);
          }
        );
      }

      // GOOGLE LOGIN
      window.GGLogin = function (googleUser) {
        var profile = googleUser.getBasicProfile();

        // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        // console.log('Name: ' + profile.getName());
        // console.log('Image URL: ' + profile.getImageUrl());
        // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
      };

      // TWITTER LOGIN
      function TwitterLogin() {
        console.log('TwitterLogin');
        $http({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Access-Control-Allow-Origin': 'http://beta.sitetheory.io',
            Authorization: {
              oauth_consumer_key: 'lulAGJG3dJVV31CMxZ7Ez9zYE',
              oauth_token: '929936670241071104-NFK3QRri9epJSg4FmCyNNs3URRYvGge',

              oauth_nonce: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
              oauth_signature: 'tnnArxj06cWHq44gCs1OSKk%2FjLY%3D',
              oauth_signature_method: 'HMAC-SHA1',
              oauth_timestamp: '1318622958',
              oauth_version: '1.0'
            }
          },
          url: 'https://api.twitter.com/oauth/request_token',
          data: { oauth_callback: 'http://beta.sitetheory.io/Member/Sign-In' }
        }).then(
          function (response) {
            console.log(response);
          },
          function (error) {
            console.log(error);
          }
        );
      };

    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/signleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
