// Filter Component
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular', 'stratus.services.registry', 'angular-material'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // This component handles filtering for a collection
    Stratus.Components.Filter = {
        bindings: {
            ngModel: '=',
            target: '@'
        },
        controller: function ($scope, $attrs, registry) {
            Stratus.Instances[_.uniqueId('filter')] = $scope;
            $scope.collection = ($scope.$parent && $scope.$parent.collection) ? $scope.$parent.collection : null;
            $scope.query = '';
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/filter' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
