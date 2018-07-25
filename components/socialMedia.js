/* global define, FB */

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
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component intends to allow editing of various selections depending on
  // context.
  Stratus.Components.SocialMedia = {
    bindings: {
      ngModel: '='
    },
    controller: function (
      $rootScope, $scope, $window, $attrs, $log, $http, $mdDialog,
      socialLibraries, commonMethods, singleSignOn
    ) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'social_media', false)
      Stratus.Internals.CssLoader(Stratus.BaseUrl +
       Stratus.BundlePath + 'components/singleSignOn' +
        (Stratus.Environment.get('production') ? '.min' : '') + '.css')

      socialLibraries.loadFacebookSDK()
      socialLibraries.loadGGLibrary()

      // css
      $scope.layout = 'column'

      // The data get from social api.
      var $ctrl = this

      $scope.$watch('$ctrl.ngModel', function () {
        if ($ctrl.ngModel) {
          var myEl = angular.element(document.querySelector('.social'))
          myEl.css('margin-bottom', '1em')
        }
      })

      $scope.removeFacebook = function () {
        if ($ctrl.ngModel && $ctrl.ngModel.hasOwnProperty('facebookId')) {
          $ctrl.ngModel.facebookId = null
        }
      }

      $scope.removeGoogle = function () {
        if ($ctrl.ngModel && $ctrl.ngModel.hasOwnProperty('googleId')) {
          $ctrl.ngModel.googleId = null
        }
      }

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

      // GOOGLE LOGIN
      window.onSignIn = function onSignIn (googleUser) {
        var profile = googleUser.getBasicProfile()
        var data = {
          email: profile.getEmail(),
          name: profile.getName(),
          id: profile.getId(),
          picture: profile.getImageUrl()
        }
        doSignIn(data, 'google', true)
      }

      // Call HTTP REQUEST
      function doSignIn (data, service, truthData) {
        if ($ctrl.ngModel) {
          updateExistData(data, service)
        } else {
          singleSignOn.signIn(data, service, truthData).then(
            function (response) { console.log('response') },
            function (error) { console.log(error) }
          )
        }
      }

      // update data into model
      function updateExistData (data, service) {
        if (data.hasOwnProperty('id')) {
          if (service === 'google') {
            $ctrl.ngModel.googleId = null
            $ctrl.ngModel.googleId = data.id
          } else {
            $ctrl.ngModel.facebookId = null
            $ctrl.ngModel.facebookId = data.id
          }
        }
        if ($ctrl.ngModel.hasOwnProperty('profile')) {
          if ($ctrl.ngModel.profile.hasOwnProperty('publicName')) {
            $ctrl.ngModel.profile.publicName = data.name
          }

          if ($ctrl.ngModel.profile.hasOwnProperty('gender') &&
            data.hasOwnProperty('gender')) {
            $ctrl.ngModel.profile.gender = (data.gender === 'male') ? 2 : 1
          }

          if ($ctrl.ngModel.profile.hasOwnProperty('locale') &&
            data.hasOwnProperty('locale')) {
            $ctrl.ngModel.profile.locale = data.locale
          }

          if ($ctrl.ngModel.profile.hasOwnProperty('phones') &&
            data.hasOwnProperty('phone')) {
            if (!$ctrl.ngModel.profile.phones) {
              $ctrl.ngModel.profile.phones = []
            }
            $ctrl.ngModel.profile.phones.push(data.phone)
          }

          if ($ctrl.ngModel.profile.hasOwnProperty('emails') &&
            data.hasOwnProperty('email')) {
            if (!$ctrl.ngModel.profile.emails) {
              $ctrl.ngModel.profile.emails = []
            }
            $ctrl.ngModel.profile.emails.push(data.email)
          }
        }
        $scope.$digest()
      }
    },
    templateUrl: Stratus.BaseUrl +
   Stratus.BundlePath + 'components/singleSignOn' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
