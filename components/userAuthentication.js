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
    controller: function($scope, $attrs, $log, $http) {
      // Initialize
      this.uid = _.uniqueId('user_authentication_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.less');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;
      $ctrl.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
      $ctrl.passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/i;
      $ctrl.enabledForgotPassForm = false;
      $ctrl.forgotPasstext = 'Forgot Password ?';
      $ctrl.showForgotPassForm = showForgotPassForm;
      $ctrl.doSignIn = doSignIn;
      $ctrl.doSignUp = doSignUp;
      $ctrl.doResetPass = doResetPass;
      var url = '/Api/User';

      function showForgotPassForm(isShow) {
          $ctrl.forgotPasstext = isShow ? 'Back to login' : 'Forgot Password ?';
          $ctrl.enabledForgotPassForm = isShow;
      }

      //API/Login
      function doSignIn(signinData) {
          console.log(signinData);
          //
      }

      //[POST]API/User
      function doSignUp(signupData) {
          var data = {
              'email': signupData.email,
              'phone': validatePhoneNumber(signupData.phone)
          }

          $http({ method: 'POST',  url: url,  data: data}).then(
              function(response) {
                  console.log(response);
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

          $http({
              method: 'POST',
              url: url,
              data: data
          }).then(function(response) {
              console.log(response);
          }, function(response) {
              console.log(response);
          });
      }

      // Helpers
      var validatePhoneNumber = function(phone) {
        var phoneRegex = /^[0-9().+-]*/g;
        return phone.match(phoneRegex)[0];
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/userAuthentication' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));

