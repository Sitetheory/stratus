/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'jquery',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.collection',
      'stratus.services.details'

      // Components
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.StreamExcerpt = {
    bindings: {},
    controller: function ($scope, $mdPanel, $attrs) {
      this.uid = _.uniqueId('stream_excerpt_')
      Stratus.Instances[this.uid] = $scope
      $scope.elementId = $attrs.elementId || this.uid

      Stratus.Internals.CssLoader(Stratus.BaseUrl +
        'sitetheorystratus/stratus/components/streamExcerpt' +
        (Stratus.Environment.get('production') ? '.min' : '') + '.css')
    },
    templateUrl: Stratus.BaseUrl +
    'sitetheorystratus/stratus/components/streamExcerpt' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
