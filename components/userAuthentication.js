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
  // This component intends to allow editing of various selections depending
  // on context.
  Stratus.Components.UserAuthentication = {
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
      utility
    ) {
      // Initialize
      utility.componentInitializer(this, $scope, $attrs, 'user_authentication', true)
      var $ctrl = this
      $ctrl.$onInit = function () {
        // variables
        $ctrl.signinData = {}
        $ctrl.resetPassData = {}
        $ctrl.allowSubmit = false
        $ctrl.socialMode = false // in this mode, the user just need to
        // input email and submit to singleSignOn
        // components
        $ctrl.loading = false
        $ctrl.signInIndex = 0
        $ctrl.signUpIndex = 1
        $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i
        $ctrl.phoneRegex = /^[\d+\-().]+$/
        $ctrl.enabledForgotPassForm = false
        $ctrl.isHandlingUrl = utility.getUrlParams().type !== null
        $ctrl.passwordReset = $ctrl.isLoggedIn ? !$ctrl.isHandlingUrl : false
        $ctrl.enabledResetPassForm = utility.getUrlParams().type === 'reset-password'
        $ctrl.enabledVerificationForm = utility.getUrlParams().type === 'verify'
        $ctrl.forgotPassText = 'Forgot Password?'
        $ctrl.resetPassHeaderText = 'Reset your account password'
        $ctrl.changePassBtnText = 'Reset Password'
        $ctrl.selectedIndex = $ctrl.signInIndex
        $ctrl.message = null
        $ctrl.isRequestSuccess = false
        if ($ctrl.passwordReset) {
          $ctrl.resetPassHeaderEmail = $ctrl.email
        } else if (utility.getUrlParams().type === 'reset-password') {
          $ctrl.resetPassHeaderEmail = utility.getUrlParams().email
        } else {
          $ctrl.resetPassHeaderEmail = null
        }
        $ctrl.duplicateMessge = '<span>There is already an account registered to this email, ' +
          'please <a href="#" ng-click="$ctrl.onTabSelected($ctrl.signInIndex)">' +
          'Sign In</a> and then create a new site from the control panel.</span>'

        // methods
        $ctrl.showForgotPassForm = showForgotPassForm
        $ctrl.doSignIn = doSignIn
        $ctrl.doSignUp = doSignUp
        $ctrl.doRequestResetPass = doRequestResetPass
        $ctrl.doResetPass = doResetPass
        $ctrl.onTabSelected = onTabSelected
        $ctrl.backToLogin = backToLogin
        $ctrl.verifyAccount = verifyAccount
        $ctrl.safeMessage = safeMessage

        // data sets
        $ctrl.login = new Model({
          'target': 'login'
        })
        $ctrl.user = new Model({
          'target': 'user'
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
          var strengthBar = utility.generateStrengthBar(newValue, zxcvbn)
          $ctrl.progressBarClass = strengthBar.progressBarClass
          $ctrl.progressBarValue = strengthBar.progressBarValue
          if (!utility.validPassword(newValue)) {
            $ctrl.message = 'Your password must be at 8 or more characters and contain at least one lower and uppercase letter and one number.'
            $ctrl.allowSubmit = false
          } else {
            $ctrl.message = null
            $ctrl.allowSubmit = true
            if ($ctrl.resetPassData.confirm_password !== undefined && $ctrl.resetPassData.confirm_password !== newValue) {
              $ctrl.message = 'Your passwords did not match.'
              $ctrl.allowSubmit = false
            }
          }
        }
      })

      // Define functional methods
      function verifyAccount () {
        // FIXME: This runs from an ng-init
        resetDefaultSettings()
        $ctrl.loading = true
        $ctrl.user.meta.temp('api.options.action', 'Verify')
        // $ctrl.user.meta.temp('api.options.token', utility.getUrlParams().token)
        $ctrl.user.set('token', utility.getUrlParams().token)
        $ctrl.user.save().then(function () {
          $ctrl.loading = false
          $ctrl.message = _.first($ctrl.user.meta.get('status')).message
          $ctrl.enabledVerificationForm = false
          $ctrl.isRequestSuccess = !$ctrl.user.error
          if (!$ctrl.user.error) {
            $ctrl.enabledResetPassForm = true
            $ctrl.resetPassHeaderText = 'Please create a new secure password for your account.'
            $ctrl.changePassBtnText = 'Update password'
          }
        })
      }

      function doSignIn (signInData) {
        $ctrl.loading = true
        resetDefaultSettings()

        $ctrl.login.set('email', signInData.email)
        $ctrl.login.set('password', signInData.password)

        $ctrl.login.save().then(function (response) {
          $ctrl.loading = false
          if (!$ctrl.login.error) {
            return ($window.location.href = '/')
          } else {
            $ctrl.isRequestSuccess = false
            $ctrl.message = _.first($ctrl.login.meta.get('status')).message
          }
        })
      }

      function doSignUp (signupData) {
        $ctrl.loading = true

        // social sign up
        if ($ctrl.socialMode) {
          return doSocialSignup(signupData.email)
        }

        // normal sign up
        resetDefaultSettings()
        var data = {
          email: signupData.email,
          phone: utility.cleanedPhoneNumber(signupData.phone)
        }

        $ctrl.user.meta.temp('api.options.apiSpecialAction', 'SignUp')
        $ctrl.user.save(data).then(function (response) {
          $ctrl.loading = false
          if (utility.getStatus(response).code ===
            utility.RESPONSE_CODE.success) {
            return ($window.location.href = '/')
          } else {
            $ctrl.isRequestSuccess = false
            var status = utility.getStatus(response)
            $ctrl.message = (status.code === 'DUPLICATE')
              ? $ctrl.duplicateMessge
              : status.message
          }
        })
      }

      function doRequestResetPass (resetPassData) {
        $ctrl.loading = true
        resetDefaultSettings()
        var data = {
          type: 'reset-password-request',
          email: resetPassData.email,
          phone: utility.cleanedPhoneNumber(resetPassData.phone)
        }

        $ctrl.user.meta.temp('api.options.apiSpecialAction', 'ResetPasswordRequest')
        $ctrl.user.save(data).then(function (response) {
          $ctrl.loading = false
          if (utility.getStatus(response).code ===
            utility.RESPONSE_CODE.success) {
            $ctrl.isRequestSuccess = true
          } else {
            $ctrl.isRequestSuccess = false
          }
          $ctrl.message = utility.getStatus(response).message
        })
      }

      function doResetPass (resetPassData) {
        $ctrl.loading = true
        resetDefaultSettings()
        var requestType = utility.getUrlParams().type === 'verify'
          ? 'change-password'
          : utility.getUrlParams().type
        var data = {
          type: requestType,
          email: utility.getUrlParams().email,
          token: utility.getUrlParams().token,
          password: resetPassData.password
        }

        if ($ctrl.passwordReset) {
          data.email = $ctrl.email
          data.type = 'update-password'
          data.confirm_password = resetPassData.confirm_password
        }

        $ctrl.user.meta.temp('api.options.apiSpecialAction', 'ResetPassword')
        $ctrl.user.save(data).then(function (response) {
          $ctrl.loading = false
          if (utility.getStatus(response).code ===
            utility.RESPONSE_CODE.success) {
            $window.location.href = $window.location.origin +
              '/Member/Sign-In'
          } else {
            $ctrl.isRequestSuccess = false
            $ctrl.message = utility.getStatus(response).message
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

      function safeMessage () {
        return utility.safeMessage($ctrl.message)
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
