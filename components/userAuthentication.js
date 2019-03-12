/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'zxcvbn',
      'stratus.components.singleSignOn',
      'stratus.services.model',
      'stratus.services.utility',
      'stratus.directives.passwordCheck',
      'stratus.directives.compileTemplate'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn)
  }
}(this, function (Stratus, _, angular, zxcvbn) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'userAuthentication'

  // This component intends to allow editing of various selections depending
  // on context.
  Stratus.Components.UserAuthentication = {
    // TODO: determine if these are necessary. these one way bindings don't appear to be used on the DOM, i.e. updated on DOM
    bindings: {
      isLoggedIn: '<',
      email: '<'
    },
    controller: function (
      $scope,
      $window,
      $attrs,
      $compile,
      Model,
      utility // TODO: Remove this
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

      // Events
      $ctrl.$onInit = function () {
        // regular expression patterns
        $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i
        $ctrl.phoneRegex = /^[\d+\-().]+$/

        // variables
        $ctrl.signinData = {}
        $ctrl.resetPassData = {}
        $ctrl.allowSubmit = false
        $ctrl.socialMode = false // in this mode, the user just need to input email and submit to singleSignOn components
        $ctrl.loading = false
        $ctrl.message = null
        $ctrl.isRequestSuccess = false
        $ctrl.signInIndex = 0
        $ctrl.signUpIndex = 1
        $ctrl.selectedIndex = $ctrl.signInIndex
        // TODO: make sure these are used
        $ctrl.forgotPassText = 'Password Trouble?'
        $ctrl.resetPassHeaderText = 'Reset Your Account Password'
        $ctrl.changePassBtnText = 'Reset Password'

        // forms to show
        $ctrl.isHandlingUrl = _.getUrlParams('type') !== null
        $ctrl.passwordReset = $ctrl.isLoggedIn ? !$ctrl.isHandlingUrl : false
        $ctrl.enabledForgotPassForm = false
        $ctrl.enabledResetPassForm = _.getUrlParams('type') === 'passwordReset'
        $ctrl.enabledVerificationForm = _.getUrlParams('type') === 'verify'

        // TODO: remove since we don't use this anymore
        /*
                if ($ctrl.passwordReset) {

                    $ctrl.resetPassHeaderEmail = $ctrl.email
                } else if (_.getUrlParams("type") === 'reset-password') {
                    $ctrl.resetPassHeaderEmail = _.getUrlParams("email")
                } else {
                    $ctrl.resetPassHeaderEmail = null
                }
                */
        $ctrl.resetPassHeaderEmail = null

        $ctrl.duplicateMessge = '<span>There is already an account registered to this email, ' +
                    'please <a href="#" ng-click="$ctrl.onTabSelected($ctrl.signInIndex)">' +
                    'Sign In</a>.</span>'

        // methods
        $ctrl.doVerifyAccount = doVerifyAccount
        $ctrl.showForgotPassForm = showForgotPassForm
        $ctrl.doSignIn = doSignIn
        $ctrl.doSignUp = doSignUp
        $ctrl.doRequestPasswordReset = doRequestPasswordReset
        $ctrl.doResetPass = doResetPass
        $ctrl.onTabSelected = onTabSelected
        $ctrl.backToLogin = backToLogin
        $ctrl.safeMessage = safeMessage

        // data sets
        $ctrl.login = new Model({
          'target': 'Login'
        })
        $ctrl.user = new Model({
          'target': 'User'
        })
      }

      // Watcher for changing password
      $scope.$watch(angular.bind(this, function () {
        if (!_.isEmpty(this.signinData)) {
          return this.signinData.password
        }
        if (!_.isEmpty(this.resetPassData)) {
          $ctrl.isRequestSuccess = false
          return this.resetPassData.password
        }
      }), function (newValue, oldValue) {
        if (newValue !== undefined && newValue !== oldValue) {
          // TODO: fix strength bar
          /*
                    let strengthBar = utility.generateStrengthBar(newValue, zxcvbn)
                    $ctrl.progressBarClass = strengthBar.progressBarClass
                    $ctrl.progressBarValue = strengthBar.progressBarValue
                    if (!utility.validPassword(newValue)) {
                        $ctrl.message = 'Your password must be at 8 or more characters and contain at least one lower and uppercase letter and one number. Consider using a unique "pass phrase".'
                        $ctrl.allowSubmit = false
                    } else {
                        $ctrl.message = null
                        $ctrl.allowSubmit = true
                        if ($ctrl.resetPassData.confirm_password !== undefined && $ctrl.resetPassData.confirm_password !== newValue) {
                            $ctrl.message = 'Your passwords did not match.'
                            $ctrl.allowSubmit = false
                        }
                    }
                    */
        }
      })

      function doSignUp (signupData) {
        $ctrl.loading = true

        // social sign up
        if ($ctrl.socialMode) {
          return doSocialSignup(signupData.email)
        }

        // normal sign up
        resetDefaultSettings()
        let data = {
          email: signupData.email,
          phone: utility.cleanedPhoneNumber(signupData.phone)
        }

        $ctrl.user.save(data)
          .then(function (data) {
            $ctrl.loading = false
            $ctrl.isRequestSuccess = true
            $window.location.href = '/'
          })
          .catch(function (error, response) {
            $ctrl.loading = false
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            $ctrl.isRequestSuccess = false
            $ctrl.message = (status.code === 'DUPLICATE')
              ? $ctrl.duplicateMessge
              : status.message
            if (error) {
              console.error(error.stack)
            }
          })
      }

      // Define functional methods
      function doVerifyAccount () {
        $ctrl.loading = true

        resetDefaultSettings()

        // Custom API Action is Required
        $ctrl.login.meta.temp('api.options.action', 'Verify')
        $ctrl.login.set('token', _.getUrlParams('token'))

        $ctrl.login.save()
          .then(function (data) {
            $ctrl.loading = false
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            console.log(response);

            $ctrl.message = status.message
            console.log('STATUS: '+status.message)
            $ctrl.enabledVerificationForm = false
            $ctrl.isRequestSuccess = true
            $ctrl.enabledResetPassForm = true
            $ctrl.resetPassHeaderText = 'Please create a new secure password for your account.'
            $ctrl.changePassBtnText = 'Update password'
          })
          .catch(function (error, response) {
            $ctrl.loading = false
            console.log(response);
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            $ctrl.isRequestSuccess = false
            $ctrl.message = status.message
            console.log('ERROR: '+$ctrl.message)
            if (error) {
              console.error(error.stack)
            }
          })
      }
      // verifyAccount returns the User model which allows us to do a save (PUT) action here on the /Api/User/{ID}.
      function doResetPass (resetPassData) {
        $ctrl.loading = true
        resetDefaultSettings()
        // reset meta because we want a normal PUT not a custom API action
        $ctrl.user.meta.set('api', {})
        $ctrl.user.data.password = resetPassData.password
        $ctrl.user.save()
          .then(function (data) {
            $ctrl.enabledResetPassForm = false
            $ctrl.resetPassHeaderText = null
            $ctrl.message = 'Your password has been reset successfully!'
            $window.location.href = '/'
          })
          .catch(function (error, response) {
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            $ctrl.isRequestSuccess = false
            $ctrl.message = status.message
            if (error) {
              console.error(error.stack)
            }
          })
      }

      function doSignIn (signInData) {
        $ctrl.loading = true
        resetDefaultSettings()
        $ctrl.login.set('email', signInData.email)
        $ctrl.login.set('password', signInData.password)
        $ctrl.login.save()
          .then(function (data) {
            $ctrl.loading = false
            $window.location.href = '/'
          })
          .catch(function (error, response) {
            $ctrl.loading = false
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            $ctrl.isRequestSuccess = false
            $ctrl.message = status.message
            if (error) {
              console.error(error.stack)
            }
          })
      }

      function doRequestPasswordReset (resetPassData) {
        $ctrl.loading = true
        resetDefaultSettings()

        $ctrl.login.meta.temp('api.options.action', 'RequestPasswordReset')

        $ctrl.login.set('email', resetPassData.email)
        $ctrl.login.set('phone', utility.cleanedPhoneNumber(resetPassData.phone))
        $ctrl.login.save()
          .then(function (data) {
            $ctrl.loading = false
            $ctrl.isRequestSuccess = true
          })
          .catch(function (error, response) {
            $ctrl.loading = false
            let status = (response.meta && _.isArray(response.meta.status) && response.meta.status.length) ? _.first(response.meta.status) : null
            $ctrl.isRequestSuccess = false
            if (error) {
              console.error(error.stack)
            }
          })
      }

      // Trigger request from Social sign on
      $scope.requireEmail = function (socialName, data) {
        onTabSelected($ctrl.signUpIndex)
        $ctrl.socialMode = true
        $ctrl.isRequestSucces = false
        setTimeout(function () {
          $ctrl.message = data.message
          $scope.$apply()
        }, 100)
      }

      // emit requet to social sign on
      function doSocialSignup (email) {
        $ctrl.loading = false
        $scope.$broadcast('doSocialSignup', email)
      }

      // Helpers
      function showForgotPassForm (isShow) {
        $ctrl.message = null
        $ctrl.forgotPassText = isShow ? 'Back to login' : 'Forgot Password?'
        $ctrl.enabledForgotPassForm = isShow
        if (!isShow) {
          onTabSelected($ctrl.signInIndex)
        }
      }

      function backToLogin () {
        $ctrl.message = null
        $ctrl.isHandlingUrl = false
      }

      function onTabSelected (index) {
        $ctrl.selectedIndex = index
        $ctrl.message = null
      }

      // reset socialMode and message after submit.
      function resetDefaultSettings () {
        $ctrl.socialMode = false
        $ctrl.message = null
      }

      // FIXME: This is a third level of abstraction...  Seriously?!?
      function safeMessage () {
        return utility.safeMessage($ctrl.message)
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/userAuthentication' + min + '.html'
  }
}))
