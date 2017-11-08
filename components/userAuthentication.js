(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'zxcvbn',
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular, zxcvbn) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.UserAuthentication = {
    controller: function ($scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('user_authentication_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;

      // variables
      var url = '/Api/User';
      var loginUrl = '/Api/Login';
      $ctrl.signinData = {};
      $ctrl.resetPassData = {};
      $ctrl.allowSubmit = false;
      $ctrl.signInIndex = 0;
      $ctrl.signUpIndex = 1;
      $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
      $ctrl.phoneRegex = /^[\d+\-()]+$/;
      $ctrl.enabledForgotPassForm = false;
      $ctrl.isHandlingUrl = getUrlParams().type !== null ? true : false;
      $ctrl.enabledResetPassForm = getUrlParams().type === 'reset-password' ? true : false;
      $ctrl.resetPassHeaderEmail = getUrlParams().type === 'reset-password' ? getUrlParams().email : null;
      $ctrl.enabledVerifyForm = getUrlParams().type === 'verify' ? true : false;
      $ctrl.forgotPassText = 'Forgot Password?';
      $ctrl.resetPassHeaderText = 'Reset your account password';
      $ctrl.changePassBtnText = 'Reset Password';
      $ctrl.selectedIndex = $ctrl.signInIndex;
      $ctrl.errorMsg = null;

      // methods
      $ctrl.showForgotPassForm = showForgotPassForm;
      $ctrl.doSignIn = doSignIn;
      $ctrl.doSignUp = doSignUp;
      $ctrl.doRequestResetPass = doRequestResetPass;
      $ctrl.doResetPass = doResetPass;
      $ctrl.onTabSelected = onTabSelected;
      $ctrl.backToLogin = backToLogin;
      $ctrl.verifyAccount = verifyAccount;

      // Watcher
      $scope.$watch(angular.bind(this, function () {
        if (!_.isEmpty(this.signinData)) {
          return this.signinData.password;
        }
        if (!_.isEmpty(this.resetPassData)) {
          return this.resetPassData.password;
        }
      }), function (newValue, oldValue) {
        if (newValue !== undefined && newValue !== oldValue) {
          $ctrl.progressBarClass = null;
          $ctrl.progressBarValue = null;

          generateProgressBar(newValue);

          if (!validPassword(newValue)) {
            $ctrl.errorMsg = 'Password must contain at least 8 characters, 1 lower and uppercase letter and 1 number.';
          } else if ($ctrl.progressBarValue <= 40) {
            $ctrl.errorMsg = 'Your password is not strong.';
            $ctrl.allowSubmit = true;
          } else {
            $ctrl.errorMsg = '';
            $ctrl.allowSubmit = true;
          }
        }
      });

      // Define functional methods
      function showForgotPassForm(isShow) {
        $ctrl.errorMsg = null;
        $ctrl.forgotPassText = isShow ? 'Back to login' : 'Forgot Password?';
        $ctrl.enabledForgotPassForm = isShow;
        if (!isShow) {
          onTabSelected($ctrl.signInIndex);
        }
      }

      function backToLogin() {
        $ctrl.errorMsg = null;
        $ctrl.isHandlingUrl = false;
      }

      function verifyAccount() {
        var data = {
          type: 'verify',
          email: getUrlParams().email,
          token: getUrlParams().token
        };

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(
          function (response) {
            var code = getStatus(response).code;
            var message = getStatus(response).message;
            $ctrl.errorMsg = message;
            $ctrl.enabledVerifyForm = false;
            $ctrl.enabledResetPassForm = true;
            $ctrl.resetPassHeaderText = 'Please set your password';
            $ctrl.changePassBtnText = 'Update password';
          },
          function (error) {
            console.log(error);
          });
      }

      function onTabSelected(index) {
        $ctrl.selectedIndex = index;
        $ctrl.errorMsg = null;
      }

      function doSignIn(signinData) {
        $ctrl.errorMsg = null;
        var data = {
          email: signinData.email,
          password: signinData.password
        };

        $http({
          method: 'POST',
          url: loginUrl,
          data: data
        }).then(
          function (response) {
            var code = getStatus(response).code;
            var message = getStatus(response).message;
            if (code == 'SUCCESS') {
              return $window.location.href = '/';
            } else {
              $ctrl.errorMsg = message;
            }
          },
          function (error) {
            console.log(error);
          });
      }

      function doSignUp(signupData) {
        $ctrl.errorMsg = null;
        var data = {
          email: signupData.email,
          phone: cleanedPhoneNumber(signupData.phone)
        };

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(
          function (response) {
            var code = getStatus(response).code;
            var message = getStatus(response).message;

            if (code == 'SUCCESS') {
              return $window.location.href = '/';
            } else {
              $ctrl.errorMsg = message;
            }
          },
          function (error) {
            console.log(error);
          });
      }

      function doRequestResetPass(resetPassData) {
        $ctrl.errorMsg = null;
        var data = {
          type: 'reset-password-request',
          email: resetPassData.email,
          phone: cleanedPhoneNumber(resetPassData.phone)
        };

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(
          function (response) {
            $ctrl.errorMsg = getStatus(response).message;
          },
          function (error) {
            console.log(error);
          }
        );
      }

      function doResetPass(resetPassData) {
        $ctrl.errorMsg = null;
        if (resetPassData.password !== resetPassData.confirm_password) {
          $ctrl.errorMsg = 'Password and Confirm password must be identical';
          return;
        }

        var requestType = getUrlParams().type === 'verify' ? 'update-password' : getUrlParams().type;
        var data = {
          type: requestType,
          email: getUrlParams().email,
          token: getUrlParams().token,
          password: resetPassData.password
        };

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(function (response) {
          var code = getStatus(response).code;
          var message = getStatus(response).message;
          if (code == 'SUCCESS') {
            $ctrl.isHandlingUrl = false;
            return $window.location.href = '/Member/Sign-In';
          } else {
            $ctrl.errorMsg = message;
          }
        }, function (error) {
          console.log(error);
        });
      }

      // Helpers
      function validPassword(password) {
        var passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/;
        return password.length >= 8 && passwordRegex.test(password);
      };

      function cleanedPhoneNumber(phone) {
        var keepNumberOnlyRegex = /\D+/g;
        return phone.replace(keepNumberOnlyRegex, '');
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
      }

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
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
