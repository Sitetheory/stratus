// Help Component
// --------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'angular', 'angular-material'], factory);
  } else {
    factory(root.Stratus);
  }
}(this, function (Stratus) {
  // TODO: Possibly Convert to Tether-Tooltip
  // This component intends to display help information
  // in an widely accessible tooltip icon standard.
  Stratus.Components.Help = {
    transclude: true,
    controller: function ($scope) {
      Stratus.Instances[_.uniqueId('help_')] = $scope;
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/help' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/help' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
