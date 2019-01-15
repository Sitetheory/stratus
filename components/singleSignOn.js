/* global define, FB, gapi */

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
  const name = 'singleSignOn'

  // This component intends to allow editing of various selections depending on
  // context.
  Stratus.Components.SingleSignOn = {
    bindings: {},
    controller: function (
      $rootScope, $scope, $window, $attrs, $http, $mdDialog,
      socialLibraries, Model
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

      // load libraries
      socialLibraries.loadGGLibrary()
      socialLibraries.loadFacebookSDK()

      $scope.layout = 'row'

      // The data get from social api.
      let data = null

      // FACEBOOK LOGIN
      window.checkLoginState = function () {
        FB.getLoginStatus(function (response) {
          console.log('loginStatus:', response)
          switch (response.status) {
            case 'connected':
            case 'not_authorized':
              getFBProfileBasic()
              break
            default:
              FB.login(function (response) {
                (response.authResponse !== null)
                  ? getFBProfileBasic()
                  : FB.login()
              },
              {
                scope: [
                  'name',
                  'email',
                  'picture'
                ]
              })
          }
        })
      }

      function getFBProfileBasic () {
        // old: name,email,gender,locale,link,picture
        FB.api('/me?fields=id,name,email,picture',
          function (response) {
            apiLogin(response, 'facebook', true)
          },
          {
            scope: [
              'name',
              'email',
              'picture'
            ]
          }
        )
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
        if (!Stratus.Environment.get('production')) {
          console.log('SocialSignup:', event, email, data)
        }
        apiLogin(data, 'facebook', false)
      })

      // TODO: Evaluate moving this to the SocialLibraries service
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
        if (!Stratus.Environment.get('production')) {
          console.log('Google:', data)
        }
        apiLogin(data, 'google', true)
      }

      // Call HTTP REQUEST
      // FIXME: What the hell is truthData?
      function apiLogin (data, service, truthData) {
        let model = new Model({
          'target': 'Login'
        }, {
          service: service,
          data: data,
          truthData: truthData
        })
        model.save()
          .then(function (data) {
            // $window.location.href = '/'
            if (!Stratus.Environment.get('production')) {
              console.log('Successful login:', data)
            }
          })
          .catch(function (error, response) {
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            if (status.code === 'CREDENTIALS') {
              data.message = status.message
              requireEmail(service, response)
            } else {
              console.error(error)
            }
          })
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/singleSignOn' + min + '.html'
  }
}))
