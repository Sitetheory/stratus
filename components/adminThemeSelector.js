(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.AdminThemeSelector = {
    controller: function ($scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('admin_theme_selector_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;

      var $ctrl = this;

    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
