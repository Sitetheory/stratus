// Base Component
// --------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular', 'angular-material'], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This component is just a simple base.
  Stratus.Components.Base = {
    transclude: true,
    bindings: {
      elementId: '@',
      hello: '@'
    },
    controller: function ($scope, $attrs, $log) {
      this.uid = _.uniqueId('base_');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;
      $log.log('component:', this);
    },
    template: '<div id="{{ elementId }}">\
            hello: {{ hello }}\
        </div>'
  };
}));
