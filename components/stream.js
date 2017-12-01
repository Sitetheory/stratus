(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'jquery',
      'underscore',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.collection',
      'stratus.services.details',

      // Components
      'stratus.components.streamExcerpt',
    ], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.Stream = {
    bindings: {},
    controller: function ($scope, $mdPanel, $attrs) {
      this.uid = _.uniqueId('stream_');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/stream' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/stream' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };

}));
