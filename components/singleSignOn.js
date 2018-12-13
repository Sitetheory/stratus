/* global define, FB, gapi */

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
      'stratus.services.utility',
      'stratus.services.singleSignOn'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component intends to allow editing of various selections depending on
  // context.
  Stratus.Components.SingleSignOn = {
    bindings: {},
    controller: function (
      $rootScope, $scope, $window, $attrs, $log, $http, $mdDialog,
      socialLibraries, utility, singleSignOn
    ) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs, 'single_sign_on',
        true)

      // load libraries
      socialLibraries.loadGGLibrary()
      socialLibraries.loadFacebookSDK()

      $scope.layout = 'row'

      // The data get from social api.
      let data = null
      // let $ctrl = this

      // FACEBOOK LOGIN
      window.checkLoginState = function () {
        FB.getLoginStatus(function (response) {
          switch (response.status) {
            case 'connected':
            case 'not_authorized':
              FbGetBasicProfile()
              break
            default:
              FB.login(function (response) {
                (response.authResponse !== null)
                  ? FbGetBasicProfile()
                  : FB.login()
              }, {
                scope: [
                  'email',
                  'name',
                  'gender',
                  'locale',
                  'phone',
                  'picture']
              })
          }
        })
      }

      function FbGetBasicProfile () {
        FB.api('/me?fields=name,email,gender,locale,link,picture',
          function (response) {
            doSignIn(response, 'facebook', true)
          },
          {scope: ['email', 'name', 'gender', 'locale', 'phone', 'picture']})
      }

      // HANDLE ERROR LOGIN
      // emit to userAuthentication to show error message when cannot retrieve
      // the email and give an email from input.
      function requireEmail (socialName, response) {
        data = response
        $scope.$parent.requireEmail(socialName, data)
      }

      $scope.$on('doSocialSignup', function (event, email) {
        data.email = email
        doSignIn(data, 'facebook', false)
      })

      // GOOGLE LOGIN
      window.onbeforeunload = function (e) {
        gapi.auth2.getAuthInstance().signOut()
      }

      // Useful data for your client-side scripts:
      window.onSignIn = function onSignIn (googleUser) {
        let profile = googleUser.getBasicProfile()
        let data = {
          email: profile.getEmail(),
          name: profile.getName(),
          id: profile.getId(),
          picture: profile.getImageUrl()
        }
        doSignIn(data, 'google', true)
      }

      // Call HTTP REQUEST
      function doSignIn (data, service, truthData) {
        singleSignOn.signIn(data, service, truthData).then(
          function (response) {
            if (utility.getStatus(response).code === 'CREDENTIALS') {
              data.message = utility.getStatus(response).message
              requireEmail(service, data)
            } else {
              $window.location.href = '/'
            }
          },
          function (error) {
            console.log(error)
          })
      }
    },
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/singleSignOn' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
