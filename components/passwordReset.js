(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define([

        // Libraries
        'stratus',
        'underscore',
        'angular',

        // Modules
        'zxcvbn',
        'stratus.services.userAuthentication'
      ], factory);
    } else {
      // Browser globals
      factory(root.Stratus, root._, root.angular, root.zxcvbn);
    }
  }(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular, zxcvbn) {
    // This component intends to allow editing of various selections depending on context.
    Stratus.Components.PasswordReset = {
      binding: {
        userEmail: '@'
      },
      controller: function ($scope, $window, $attrs, userAuthentication) {
        // Initialize
        this.uid = _.uniqueId('password_reset_');
        Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/passwordReset' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
        Stratus.Instances[this.uid] = $scope;
        $scope.elementId = $attrs.elementId || this.uid;

        var $ctrl = this;

        // variables
        $ctrl.resetPassData = {};
        $ctrl.loading = false;
        $ctrl.isRequestSuccess = false;
        var isRequested = false;
        var RESPONSE_CODE = { verify: 'VERIFY', success: 'SUCCESS' };

        // methods
        $ctrl.doResetPass = doResetPass;

        // Watcher for changing password
        $scope.$watch(angular.bind(this, function () {
          if (!isRequested) {
            $ctrl.isRequestSuccess = false;
            var password = this.resetPassData.password;
            var confirmPassword = this.resetPassData.confirm_password;

            if (password && validPassword(password) && $ctrl.progressBarValue >= 40) {
              if (password !== confirmPassword) {
                $ctrl.message = 'Your password did not match.';
              } else {
                $ctrl.message = null;
              }
            }

            return password;
          }
        }), function (newValue, oldValue) {
          if (newValue !== undefined && newValue !== oldValue) {
            $ctrl.progressBarClass = null;
            $ctrl.progressBarValue = null;

            generateProgressBar(newValue);

            if (!validPassword(newValue)) {
              $ctrl.message = 'Your password must be at 8 or more characters and contain at least one lower and uppercase letter and one number.';
            } else {
              $ctrl.message = null;
              $ctrl.allowSubmit = true;
            }
          }
        });

        // Define functional methods
        function doResetPass(resetPassData) {
          $ctrl.loading = true;
          isRequested = true;
          var requestType = getUrlParams().token ? 'reset-pasword' : 'change-password';
          var data = {
            type: requestType,
            email: $attrs.userEmail,
            token: getUrlParams().token,
            password: resetPassData.password
          };

          userAuthentication.resetPass(data).then(function (response) {
            $ctrl.loading = false;
            if (getStatus(response).code === RESPONSE_CODE.success) {
              $ctrl.isRequestSuccess = true;
            } else {
              $ctrl.isRequestSuccess = false;
            }
            $ctrl.message = getStatus(response).message;
          });
        }

        // Helpers
        function validPassword(password) {
          var passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/;
          return password.length >= 8 && passwordRegex.test(password);
        };

        function getUrlParams() {
          var url = new URL($window.location.href);
          return {
            type: url.searchParams.get('type'),
            email: url.searchParams.get('email'),
            token: url.searchParams.get('token')
          };
        };

        function getStatus(response) {
          return response.data.meta.status['0'];
        };

        function generateProgressBar(password) {
          switch (zxcvbn(password).score) {
            case 0:
              $ctrl.progressBarClass = 'risky';
              $ctrl.progressBarValue = 20;
              break;
            case 1:
              $ctrl.progressBarClass = 'guessable';
              $ctrl.progressBarValue = 40;
              break;
            case 2:
              $ctrl.progressBarClass = 'safely';
              $ctrl.progressBarValue = 60;
              break;
            case 3:
              $ctrl.progressBarClass = 'moderate';
              $ctrl.progressBarValue = 80;
              break;
            case 4:
              $ctrl.progressBarClass = 'strong';
              $ctrl.progressBarValue = 100;
              break;
          }
        };
      },
      templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/passwordReset' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
  }));
