(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material',
      'stratus.services.socialLibraries',
      'stratus.services.commonMethods',
      'stratus.services.singleSignOn'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.SocialMedia = {
    bindings: {},
    controller: function ($rootScope, $scope, $window, $attrs, $log, $http, $mdDialog, socialLibraries, commonMethods, singleSignOn) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'social_media', true);
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

      socialLibraries.loadFacebookSDK();
      socialLibraries.loadGGLibrary();

      // The data get from social api.
      var $ctrl = this;

      // FACEBOOK LOGIN
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
          doSignIn(response, 'facebook', true);
        }, { scope: ['email', 'name', 'gender', 'locale', 'phone', 'picture'] });
      }

      // GOOGLE LOGIN
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

      // Call HTTP REQUEST
      function doSignIn(data, service, truthData) {
        singleSignOn.signIn(data, service, truthData).then(
          function (response) {
            console.log('response');
          },
          function (error) {
            console.log(error);
          });
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
