// Selector Component
// ------------------

// Define AMD, Require.js, or Contextual Scope
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function(Stratus, _) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.UserAuthentication = {
    bindings: {},
    controller: function($scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('user_authentication_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.less');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;

      // variables
      var url = '/Api/User';
      var loginUrl = '/Api/Login';
      $ctrl.signInIndex = 0;
      $ctrl.signUpIndex = 1;
      $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
      $ctrl.passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/;
      $ctrl.phoneRegex = /^[\d+\-()]+$/;
      $ctrl.enabledForgotPassForm = false;
      $ctrl.enabledResetPassForm = getUrlParams().type === 'reset-password' ? true : false;
      $ctrl.forgotPasstext = 'Forgot Password?';
      $ctrl.errorMsg = null;

      // methods
      $ctrl.showForgotPassForm = showForgotPassForm;
      $ctrl.doSignIn = doSignIn;
      $ctrl.doSignUp = doSignUp;
      $ctrl.doRequestResetPass = doRequestResetPass;
      $ctrl.doResetPass = doResetPass;
      $ctrl.onTabSelected = onTabSelected;
      $ctrl.showAlert = showAlert;
      $ctrl.selectedIndex = $ctrl.signInIndex;

      function showForgotPassForm(isShow) {
        $ctrl.forgotPasstext = isShow ? 'Back to login' : 'Forgot Password?';
        $ctrl.enabledForgotPassForm = isShow;
        if (!isShow) {
          onTabSelected($ctrl.signInIndex);
        }
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
        }

        $http({
          method: 'POST',
          url: loginUrl,
          data: data
        }).then(
          function(response) {
            var code = getStatus(response).code;
            var message = getStatus(response).message;
            if (code == 'SUCCESS') {
              return $window.location.href = '/';
            } else {
              $ctrl.errorMsg = message;
            }
          },
          function(error) {
            console.log(error);
          })
      }

      function doSignUp(signupData) {
        $ctrl.errorMsg = null;
        var data = {
          email: signupData.email,
          phone: cleanedPhoneNumber(signupData.phone)
        }

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(
          function(response) {
            var code = getStatus(response).code;
            var message = getStatus(response).message;

            if (code == 'SUCCESS') {
              return $window.location.href = '/';
            } else {
              $ctrl.errorMsg = message;
            }
          },
          function(error) {
            console.log(error);
          });
      }

      function doRequestResetPass(resetPassData) {
        var data = {
          type: 'reset-password-request',
          email: resetPassData.email,
          phone: cleanedPhoneNumber(resetPassData.phone)
        }

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(
          function(response) {
            showAlert(getStatus(response));
          },
          function(error) {
            console.log(error);
          }
        );
      }

      function doResetPass(resetPassData) {
        if (resetPassData.password !== resetPassData.confirm_password) {
          $ctrl.errorMsg = 'Password and Confirm password must be identical';
          return;
        }

        var data = {
          type: getUrlParams().type,
          email: getUrlParams().email,
          token: getUrlParams().token,
          password: resetPassData.password
        }

        $http({
          method: 'POST',
          url: url,
          data: data
        }).then(function(response) {
          var code = getStatus(response).code;
          var message = getStatus(response).message;
          if (code == 'SUCCESS') {
            return $window.location.href = '/';
          } else {
            $ctrl.errorMsg = message;
          }
        }, function(error) {
          console.log(error);
        });
      }

      // Helpers method
      function showAlert(data) {
        alert = $mdDialog.alert({
          title: data.code,
          textContent: data.message,
          ok: 'OK'
        });

        $mdDialog
          .show(alert)
          .finally(function() {
            alert = undefined;
          });
      }

      function cleanedPhoneNumber(phone) {
        var keepNumberOnlyRegex = /\D+/g;
        return phone.replace(keepNumberOnlyRegex, '');
      };

      function getUrlParams() {
        var url = new URL($window.location.href);
        return {
          'type': url.searchParams.get('type'),
          'email': url.searchParams.get('email'),
          'token': url.searchParams.get('token')
        };
      };

      function getStatus(response) {
        return response.data.meta.status['0'];
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
