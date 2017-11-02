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
    controller: function($scope ,$window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('user_authentication_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.less');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;
      $ctrl.signInIndex = 0;
      $ctrl.signUpIndex = 1;
      $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
      $ctrl.passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/i;
      $ctrl.enabledForgotPassForm = false;
      $ctrl.forgotPasstext = 'Forgot Password?';
      $ctrl.showForgotPassForm = showForgotPassForm;
      $ctrl.doSignIn = doSignIn;
      $ctrl.doSignUp = doSignUp;
      $ctrl.doResetPass = doResetPass;
      $ctrl.onTabSelected = onTabSelected;
      $ctrl.showAlert = showAlert;
      $ctrl.errorMsg = null;
      $ctrl.selectedIndex = $ctrl.signInIndex;
      var url = '/Api/User';
      var loginUrl = '/Api/Login';

      function showForgotPassForm(isShow) {
          $ctrl.forgotPasstext = isShow ? 'Back to login' : 'Forgot Password?';
          $ctrl.enabledForgotPassForm = isShow;
          if(!isShow){
            onTabSelected($ctrl.signInIndex);
          }
      }

      //Show Tab
      function onTabSelected(index) {
        $ctrl.selectedIndex = index;
        $ctrl.errorMsg = null;
      }

      //API/Login
      function doSignIn(signinData) {
        $ctrl.errorMsg = null;
        var data = {
          'email': signinData.email,
          'password': signinData.password
        }

        $http({ method: 'POST', url: loginUrl, data: data }).then(
          function(response){
            console.log('sign in ', response);
            var code = getStatus(response).code;
            var message = getStatus(response).message;
            if(code == 'SUCCESS'){
              return $window.location.href = '/';
            }else {
              $ctrl.errorMsg = message;
            }
          }, function(error) {
              console.log(error);
          })
        }

      //[POST]API/User
      function doSignUp(signupData) {
        $ctrl.errorMsg = null;
        var data = {
          'email': signupData.email,
          'phone': validatePhoneNumber(signupData.phone)
        }

        $http({ method: 'POST',  url: url,  data: data}).then(
          function(response) {
            console.log(getStatus(response));
            var code = getStatus(response).code;
            var message = getStatus(response).message;

            if(code == 'SUCCESS'){
              return $window.location.href = '/';
            }else {
              $ctrl.errorMsg = message;
            }
          }, function(error) {
              console.log(error);
          });
        }

        function doResetPass(resetPassData) {
          var data = {
            'type': 'reset-password-request',
            'email': resetPassData.email,
            'phone': validatePhoneNumber(resetPassData.phone)
          }

          $http({ method: 'POST', url: url, data: data}).then(
            function(response) {
              console.log(response);
              showAlert(getStatus(response));
            }, function(error) {
              console.log(error);
            }
          );
        }

        // Internal method
      function showAlert(data) {
        alert = $mdDialog.alert({
          title: data.code,
          textContent: data.message,
          ok: 'OK'
        });

        $mdDialog
          .show( alert )
          .finally(function() {
            alert = undefined;
          });
      }

      // Helpers
      var validatePhoneNumber = function(phone) {
        var phoneRegex = /^[0-9().+-]*/g;
        return phone.match(phoneRegex)[0];
      };

      var getStatus = function(response){
        return response.data.meta.status['0'];
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
