(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'stratus.services.commonMethods',
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular, zxcvbn) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.ProposalNotice = {
    bindings: {
      notices: '<',
    },
    controller: function ($scope, $window, $attrs, $sce, $compile, commonMethods) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'proposal_notice', true);

      // variables
      var $ctrl = this;

      $ctrl.notices =  $attrs.notices || null;
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/proposalNotice' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
