/* global define, URL */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'zxcvbn',
      'stratus.services.utility',
      'stratus.services.userAuthentication'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn)
  }
}(this,
  function (Stratus, _, angular, zxcvbn) {
    // This component intends to allow editing of various selections depending
    // on context.
    Stratus.Components.PasswordReset = {
      binding: {
        userEmail: '@'
      },
      controller: function ($scope, $window, $attrs, userAuthentication, utility) {
        // Initialize
        utility.componentInitializer(this, $scope, $attrs, 'password_reset', true)
        let $ctrl = this

        // variables
        $ctrl.resetPassData = {}
        $ctrl.loading = false
        $ctrl.isRequestSuccess = false
        let isRequested = false

        // methods
        $ctrl.doResetPass = doResetPass

        // Watcher for changing password
        $scope.$watch(angular.bind(this, function () {
          if (!isRequested) {
            $ctrl.isRequestSuccess = false
            let password = this.resetPassData.password
            let confirmPassword = this.resetPassData.confirm_password

            if (password && validPassword(password) && $ctrl.progressBarValue >= 40) {
              $ctrl.message = password !== confirmPassword ? 'Your password did not match.' : null
            }

            return password
          }
        }), function (newValue, oldValue) {
          if (newValue !== undefined && newValue !== oldValue) {
            let strengthBar = utility.generateStrengthBar(newValue, zxcvbn)

            $ctrl.progressBarClass = strengthBar.progressBarClass
            $ctrl.progressBarValue = strengthBar.progressBarValue

            if (!validPassword(newValue)) {
              $ctrl.message = 'Your password must be at 8 or more characters and contain at least one lower and uppercase letter and one number.'
            } else {
              $ctrl.message = null
              $ctrl.allowSubmit = true
            }
          }
        })

        // Define functional methods
        function doResetPass (resetPassData) {
          $ctrl.loading = true
          isRequested = true
          let requestType = getUrlParams().token
            ? 'reset-pasword'
            : 'change-password'
          let data = {
            type: requestType,
            email: $attrs.userEmail,
            token: getUrlParams().token,
            password: resetPassData.password
          }

          userAuthentication.resetPass(data).then(function (response) {
            $ctrl.loading = false
            $ctrl.isRequestSuccess = getStatus(response).code === utility.RESPONSE_CODE.success
            $ctrl.message = getStatus(response).message
          })
        }

        // Helpers
        function validPassword (password) {
          let passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/
          return password.length >= 8 && passwordRegex.test(password)
        }

        function getUrlParams () {
          let url = new URL($window.location.href)
          return {
            type: url.searchParams.get('type'),
            email: url.searchParams.get('email'),
            token: url.searchParams.get('token')
          }
        }

        function getStatus (response) {
          // TODO: Clean up this function
          return response.data.meta.status['0']
        }
      },
      templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/passwordReset' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    }
  }))
