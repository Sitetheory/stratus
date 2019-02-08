/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'stratus.directives.compileTemplate'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn)
  }
}(this, function (Stratus, _, angular, zxcvbn) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'proposalAlert'

  // This component intends to allow editing of various selections depending
  // on context.
  Stratus.Components.ProposalAlert = {
    bindings: {
      proposals: '<'
    },
    controller: function ($scope, $window, $attrs, $sce, $compile) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Scope Attributes
      $ctrl.proposals = $attrs.proposals || []

      // class for icon;
      let iconCss = {
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

      // remove element from proposals
      $ctrl.hideProposal = function (proposal) {
        // let index = $ctrl.proposals.indexOf(proposal)
        $ctrl.proposals.splice(0, 1)
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
