(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'stratus.services.commonMethods',
      'stratus.directives.compileTemplate'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn)
  }
}(typeof self !== 'undefined' ? self : this,
  function (Stratus, _, angular, zxcvbn) {
    // This component intends to allow editing of various selections depending
    // on context.
    Stratus.Components.ProposalAlert = {
      bindings: {
        proposals: '<'
      },
      controller: function (
        $scope, $window, $attrs, $sce, $compile, commonMethods) {
        // Initialize
        commonMethods.componentInitializer(this, $scope, $attrs,
          'proposal_alert', true)

        // variables
        var $ctrl = this
        $ctrl.proposals = $attrs.proposals || []

        // class for icon;
        var iconCss = {
          error: 'fa-times-circle red',
          notice: 'fa-exclamation-circle blue',
          warning: 'fa-exclamation-triangle yellow',
          success: 'fa-check-circle green'
        }

        // default icon is notice type
        $ctrl.icon = iconCss.notice

        $ctrl.safeText = function (proposal) {
          $ctrl.icon = iconCss[proposal.class]
          return $sce.trustAsHtml(proposal.text)
        }

        // remove element from proposols
        $ctrl.hideProposal = function (proposal) {
          var index = $ctrl.proposals.indexOf(proposal)
          $ctrl.proposals.splice(0, 1)
        }
      },
      templateUrl: Stratus.BaseUrl +
      'sitetheorystratus/stratus/components/proposalAlert' +
      (Stratus.Environment.production ? '.min' : '') + '.html'
    }
  }))
