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
      'stratus.services.userAuthentication',
      'stratus.services.commonMethods',
      'stratus.directives.passwordCheck',
      'stratus.directives.compileTemplate'
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular, zxcvbn) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.UserAuthentication = {
    bindings: {
      isLoggedIn: '<',
      email: '<'
    },
    controller: function ($scope, $window, $attrs,  $compile, userAuthentication, commonMethods) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'user_authentication', true);
      var $ctrl = this;
      $ctrl.$onInit = function () {
        // variables
        $ctrl.signinData = {};
        $ctrl.resetPassData = {};
        $ctrl.allowSubmit = false;
        $ctrl.socialMode = false; // in this mode, the user just need to input email and submit to singleSignOn components
        $ctrl.loading = false;
        $ctrl.signInIndex = 0;
        $ctrl.signUpIndex = 1;
        $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
        $ctrl.phoneRegex = /^[\d+\-().]+$/;
        $ctrl.enabledForgotPassForm = false;
        $ctrl.isHandlingUrl = commonMethods.getUrlParams().type !== null;
        $ctrl.passwordReset = $ctrl.isLoggedIn ? !$ctrl.isHandlingUrl : false;
        $ctrl.enabledResetPassForm = commonMethods.getUrlParams().type === 'reset-password';
        $ctrl.enabledVerifyForm = commonMethods.getUrlParams().type === 'verify';
        $ctrl.forgotPassText = 'Forgot Password?';
        $ctrl.resetPassHeaderText = 'Reset your account password';
        $ctrl.changePassBtnText = 'Reset Password';
        $ctrl.selectedIndex = $ctrl.signInIndex;
        $ctrl.message = null;
        $ctrl.isRequestSuccess = false;
        if ($ctrl.passwordReset) {
          $ctrl.resetPassHeaderEmail = $ctrl.email;
        } else if (commonMethods.getUrlParams().type === 'reset-password') {
          $ctrl.resetPassHeaderEmail = commonMethods.getUrlParams().email;
        } else {
          $ctrl.resetPassHeaderEmail = null;
        }
        $ctrl.duplicateMessge = '<span>There is already an account registered to this email, ' +
                                'please <a href="#" ng-click="$ctrl.onTabSelected($ctrl.signInIndex)">' +
                                'Sign In</a> and then create a new site from the control panel.</span>';

        // methods
        $ctrl.showForgotPassForm = showForgotPassForm;
        $ctrl.doSignIn = doSignIn;
        $ctrl.doSignUp = doSignUp;
        $ctrl.doRequestResetPass = doRequestResetPass;
        $ctrl.doResetPass = doResetPass;
        $ctrl.onTabSelected = onTabSelected;
        $ctrl.backToLogin = backToLogin;
        $ctrl.verifyAccount = verifyAccount;
        $ctrl.safeMessage = safeMessage;
      };

      // Watcher for changing password
      $scope.$watch(angular.bind(this, function () {
        if (!_.isEmpty(this.signinData)) {
          return this.signinData.password;
        }
        if (!_.isEmpty(this.resetPassData)) {
          $ctrl.isRequestSuccess = false;
          return this.resetPassData.password;
        }
      }), function (newValue, oldValue) {
        if (newValue !== undefined && newValue !== oldValue) {
          $ctrl.progressBarClass = commonMethods.generateProgressBar(newValue).progressBarClass;
          $ctrl.progressBarValue = commonMethods.generateProgressBar(newValue).progressBarValue;

          if (newValue.length >= 8 && !commonMethods.validPassword(newValue)) {
            $ctrl.message = 'Your password must be at 8 or more characters and contain at least one lower and uppercase letter and one number.';
          } else {
            $ctrl.message = null;
            $ctrl.allowSubmit = true;
          }
        }
      });

      // Define functional methods
      function verifyAccount() {
        resetDefaultSetting();
        $ctrl.loading = true;
        var data = {
          type: 'verify',
          email: commonMethods.getUrlParams().email,
          token: commonMethods.getUrlParams().token
        };

        userAuthentication.verifyAccount(data).then(function (response) {
          $ctrl.loading = false;
          if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.verify) {
            $ctrl.message = commonMethods.getStatus(response).message;
            $ctrl.isRequestSuccess = true;
            $ctrl.enabledVerifyForm = false;
            $ctrl.enabledResetPassForm = true;
            $ctrl.resetPassHeaderText = 'Please set your password';
            $ctrl.changePassBtnText = 'Update password';
          } else {
            $ctrl.isRequestSuccess = false;
            $ctrl.message = commonMethods.getStatus(response).message;
          }
        });
      }

      function doSignIn(signinData) {
        $ctrl.loading = true;
        resetDefaultSetting();
        var data = {
          email: signinData.email,
          password: signinData.password
        };

        userAuthentication.signIn(data).then(function (response) {
          $ctrl.loading = false;
          if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
            return $window.location.href = '/';
          } else {
            $ctrl.isRequestSuccess = false;
            $ctrl.message = commonMethods.getStatus(response).message;
          }
        });
      }

      function doSignUp(signupData) {
        $ctrl.loading = true;

        // social sign up
        if ($ctrl.socialMode) return doSocialSignup(signupData.email);

        // nomal sign up
        resetDefaultSetting();
        var data = {
          email: signupData.email,
          phone: commonMethods.cleanedPhoneNumber(signupData.phone)
        };

        userAuthentication.signUp(data).then(function (response) {
          $ctrl.loading = false;
          if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
            return $window.location.href = '/';
          } else {
            $ctrl.isRequestSuccess = false;
            var status = commonMethods.getStatus(response);
            $ctrl.message = (status.code === 'DUPLICATE') ? $ctrl.duplicateMessge : status.message;
          }
        });
      }

      function doRequestResetPass(resetPassData) {
        $ctrl.loading = true;
        resetDefaultSetting();
        var data = {
          type: 'reset-password-request',
          email: resetPassData.email,
          phone: commonMethods.cleanedPhoneNumber(resetPassData.phone)
        };

        userAuthentication.requestResetPass(data).then(function (response) {
          $ctrl.loading = false;
          if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
            $ctrl.isRequestSuccess = true;
          } else {
            $ctrl.isRequestSuccess = false;
          }
          $ctrl.message = commonMethods.getStatus(response).message;
        });
      }

      function doResetPass(resetPassData) {
        $ctrl.loading = true;
        resetDefaultSetting();
        var requestType = commonMethods.getUrlParams().type === 'verify' ? 'change-password' : commonMethods.getUrlParams().type;
        var data = {
          type: requestType,
          email: commonMethods.getUrlParams().email,
          token: commonMethods.getUrlParams().token,
          password: resetPassData.password
        };

        if ($ctrl.passwordReset) {
          data.email = $ctrl.email;
          data.type = 'update-password';
        }

        userAuthentication.resetPass(data).then(function (response) {
          $ctrl.loading = false;
          if (commonMethods.getStatus(response).code === commonMethods.RESPONSE_CODE.success) {
            $window.location.href = $window.location.origin + '/Member/Sign-In';
          } else {
            $ctrl.isRequestSuccess = false;
            $ctrl.message = commonMethods.getStatus(response).message;
          }
        });
      }

      // Trigger request from Social sign on
      $scope.requireEmail = function (socialName, data) {
        onTabSelected($ctrl.signUpIndex);
        $ctrl.socialMode = true;
        $ctrl.isRequestSucces = false;
        setTimeout(function () {
          $ctrl.message = data.message;
          $scope.$apply();
        }, 100);
      };

      // emit requet to social sign on
      function doSocialSignup(email) {
        $ctrl.loading = false;
        $scope.$broadcast('doSocialSignup', email);
      };

      // Helpers
      function showForgotPassForm(isShow) {
        $ctrl.message = null;
        $ctrl.forgotPassText = isShow ? 'Back to login' : 'Forgot Password?';
        $ctrl.enabledForgotPassForm = isShow;
        if (!isShow) {
          onTabSelected($ctrl.signInIndex);
        }
      };

      function backToLogin() {
        $ctrl.message = null;
        $ctrl.isHandlingUrl = false;
      };

      function onTabSelected(index) {
        $ctrl.selectedIndex = index;
        $ctrl.message = null;
      };

      // reset socialMode and message after submit.
      function resetDefaultSetting() {
        $ctrl.socialMode = false;
        $ctrl.message = null;
      }

      function safeMessage() {
        return commonMethods.safeMessage($ctrl.message);
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
