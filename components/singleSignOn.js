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
  Stratus.Components.singleSignOn = {
    bindings: {},
    controller: function ($rootScope, $scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('signle_sign_on_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      // the data get from social api.
      var data;

      var $ctrl = this;

      // define functions which html able to call.
      $ctrl.constructor = init;

      // variables
      var loginUrl = '/Api/Login';
      var fbAppId = '753913441463877';
      var ggAppId = '878138862061-hsql5u9tcoonjrr99r9f5phcdrao2r8i.apps.googleusercontent.com';

      // methods
      function init() {
        loadFacebookSDK();
        loadGGLibrary();
      }

      // FACEBOOK LOGIN
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

      window.checkLoginState = function () {
        FB.getLoginStatus(function (response) {
          switch (response.status) {
            case 'connected':
            case 'not_authorized':
              FbGetBasicProfile();
              break;
            default:
              FB.login(function (response) {
                (response.authResponse != null) ? FbGetBasicProfile() : FB.login();
              }, { scope: ['email', 'name', 'gender', 'locale', 'phone', 'picture'] });
          }
        });
      };

      function FbGetBasicProfile() {
        FB.api('/me?fields=name,email,gender,locale,link,picture', function (response) {
          console.log('response', response);
          doSignIn(response, 'facebook', true);
        }, { scope: ['email', 'name', 'gender', 'locale', 'phone', 'picture'] });
      }

      // ERROR LOGIN
      // emit to userAuthentication to show error message when cannot retrieve the email and give an email from input.
      function emitParrent(socialName, response) {
        data = response;
        $scope.$parent.requireEmail(socialName, data);
      }

      $scope.$on('doSocialSignup', function (event, email) {
        data.email = email;
        doSignIn(data, 'facebook', false);
      });

      // GOOGLE LOGIN
      window.onbeforeunload = function (e) {

        // gapi.auth2.getAuthInstance().signOut();
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
      };

      // Useful data for your client-side scripts:
      window.onSignIn = function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        var data = {
          email: profile.getEmail(),
          name: profile.getName(),
          id: profile.getId(),
          picture: profile.getImageUrl()
        };
        doSignIn(data, 'google', true);
      };

      // SignIn url: /User/Login
      function doSignIn(data, service, truthData) {
        $http({
          method: 'POST',
          url: loginUrl,
          data: { service: service, data: data, truthData: truthData },
          headers: { 'Content-Type': 'application/json' }
        }).then(
          function (response) {
            console.log('response', response);
            switch (response.data.meta.status[0].code) {
              case 'CREDENTIALS': // social login without email, we need to let user input email manually
                data.message = response.data.meta.status[0].message;
                emitParrent(service, data);
                break;
              default: $window.location.href = '/';
            }
          },
          function (error) {
            console.log(error);
          });
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
