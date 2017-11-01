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
    controller: function($scope, $attrs, $log) {
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
          console.log(signupData.email);
          console.log(validatePhoneNumber(signupData.phone));
      }

      function doResetPass(resetPassData) {
          console.log(resetPassData.email);
          console.log(resetPassData.phone);
      }

      function doResetPass(resetPassData) {
        $log.log('doResetPass', resetPassData.email, resetPassData.phone);
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

