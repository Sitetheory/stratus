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
    controller: function ($scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('signle_sign_on_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;

      // define functions which html able to call.
      $ctrl.constructor = init;
      $ctrl.FBStatus = FBStatus;

      // variables
      var loginUrl = '/Api/Login';
      var fbId = '753913441463877';

      // methods
      function init() {
        loadFacebookSDK();
      }

      // FACEBOOK LOGIN
      function loadFacebookSDK() {
        window.fbAsyncInit = function () {
          FB.init({
            appId: fbId,
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

      function FBStatus() {
        FB.getLoginStatus(function (response) {
          switch (response.status) {
            case 'connected':
            case 'not_authorized':
              FbGetBasicProfile();
              break;
            default:
              FB.login(function (response) {
                (response.authResponse != null) ? FbGetBasicProfile() : FB.login();
              });
          }
        });
      };

      function FbGetBasicProfile() {
        FB.api('/me', { fields: 'email, name' }, function (response) {
          doSignIn(response.email, response.id, response.name, 'facebook');
        });
      }

      // GOOGLE LOGIN
      window.onbeforeunload = function (e) {
        gapi.auth2.getAuthInstance().signOut();
      };

      window.GGLogin = function (googleUser) {
        var profile = googleUser.getBasicProfile();
        doSignIn(profile.getEmail(), profile.getId(), profile.getName(), 'google');
      };

      // SignIn url: /User/Login
      function doSignIn(email, id, name, service) {
        var data = {
          email: email,
          service: service,
          name: name,
          socialId: id,
        };

        $http({
          method: 'POST',
          url: loginUrl,
          data: data
        }).then(
          function (response) {
            $window.location.href = '/';
          },
          function (error) {
            console.log(error);
          });
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));

// 878138862061-hsql5u9tcoonjrr99r9f5phcdrao2r8i.apps.googleusercontent.com
