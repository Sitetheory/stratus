// Sort Component
// --------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular', 'stratus.services.registry', 'angular-material'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // This component handles sorting for a collection
    Stratus.Components.Sort = {
        bindings: {
            ngModel: '=',
            target: '@'
        },
        controller: function ($scope, $attrs, registry) {
            Stratus.Instances[_.uniqueId('sort')] = $scope;
            $scope.collection = ($scope.$parent && $scope.$parent.collection) ? $scope.$parent.collection : null;
            $scope.query = '';
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/sort' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
