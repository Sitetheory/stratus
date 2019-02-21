/* global define, FB */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Services
      'stratus.services.registry',
      'stratus.services.model',
      'stratus.services.collection',

      // Modules
      'angular-material',
      'stratus.services.socialLibraries'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'socialMedia'

  // This component intends to allow editing of various selections depending on
  // context.
  Stratus.Components.SocialMedia = {
    bindings: {
      ngModel: '='
    },
    controller: function (
      $rootScope,
      $scope,
      $window,
      $attrs,
      $log,
      $http,
      $mdDialog,
      socialLibraries,
      Model
    ) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Data References
      $scope.model = null

      // Symbiotic Data Connectivity
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data !== $scope.model) {
          $scope.model = data

          let myEl = angular.element(document.querySelector('.social'))
          myEl.css('margin-bottom', '1em')
        }
      })

      // Social Libraries
      socialLibraries.loadFacebookSDK()
      socialLibraries.loadGGLibrary()

      // css
      $scope.layout = 'column'

      function signOutFromFacebook () {
        return FB.logout()
      }

      $scope.removeFacebook = function () {
        if ($scope.model.get('facebookId')) {
          $mdDialog.show(
            $mdDialog.confirm()
              .title('CONFIRM DISCONNECTION')
              .textContent(
                'Are you sure you want to disconnect your account with google?')
              .ok('Yes')
              .cancel('No')
          ).then(function () {
            try {
              signOutFromFacebook()
            } catch (e) {
              // Do Nothing
            }
            $scope.model.set('facebookId', null)
            $scope.model.save()
          })
        }
      }

      // SIGN OUT FROM GOOGLE
      function signOutFromGoogle () {
        return gapi.auth2.getAuthInstance().signOut()
      }

      $scope.removeGoogle = function () {
        if ($scope.model.get('googleId')) {
          $mdDialog.show(
            $mdDialog.confirm()
              .title('CONFIRM DISCONNECTION')
              .textContent(
                'Are you sure you want to disconnect your account with google?')
              .ok('Yes')
              .cancel('No')
          ).then(function () {
            try {
              signOutFromGoogle()
            } catch (e) {
              // Do Nothing
            }
            $scope.model.set('googleId', null)
            $scope.model.save()
          })
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
          {
            scope: [
              'email',
              'name',
              'gender',
              'locale',
              'phone',
              'picture'
            ]
          }
        )
      }

      // GOOGLE LOGIN
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
        if ($scope.model) {
          updateExistData(data, service)
        } else {
          let model = new Model({
            'target': 'Login'
          }, {
            service: service,
            data: data,
            truthData: truthData
          })
          model.save()
            .then(function (data) {
              console.log('response:', data)
            })
            .catch(function (error) {
              console.error(error)
            })
        }
      }

      // update data into model
      function updateExistData (data, service) {
        if (data.hasOwnProperty('id')) {
          if (service === 'google') {
            $scope.model.set('googleId', data.id)
            $scope.model.save()
          } else {
            $scope.model.set('facebookId', data.id)
            $scope.model.save()
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
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/singleSignOn' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
