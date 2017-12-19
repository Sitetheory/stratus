(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',

      'stratus.services.socialLibraries',
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.SingleSignOut = [
    '$scope',
    '$element',
    '$mdToast',
    '$log',
    '$parse',
    'socialLibraries',
    function ($scope, $element, $mdToast, $log, $parse, socialLibraries) {
      // Store Instance
      Stratus.Instances[_.uniqueId('single_sign_out_')] = $scope;
      var signOutUrl = '/Member/Sign-Out';

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;

      socialLibraries.loadFacebookSDK();
      socialLibraries.loadGGLibrary();

      $scope.signOut = function () {
        console.log('google sign out', gapi.auth2);
        gapi.auth2.getAuthInstance().signOut();
        $window.location.href = signOutUrl;
      };

    }];
}));
