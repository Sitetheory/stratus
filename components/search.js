// Search Component
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([

            // Libraries
            'stratus',
            'angular',

            // Modules
            'angular-material',

            // Services
            'stratus.services.registry',
            'stratus.services.collection'
        ], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {

    // This component handles searching to filter a collection
    Stratus.Components.Search = {
        bindings: {
            ngModel: '=',
            target: '@',
            display: '@'
        },
        controller: function ($scope, $attrs, registry, collection) {
            Stratus.Instances[_.uniqueId('search_')] = $scope;
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/search' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            // Settings
            $scope.display = $attrs.display && _.isJSON($attrs.display) ? JSON.parse($attrs.display) : false;

            // Localize Collection
            $scope.collection = null;
            $scope.$watch('$parent.collection', function (data) {
                if (data && data instanceof collection) {
                    $scope.collection = data;
                }
            });

            // Initial Query
            $scope.query = '';

            // TODO: Add the ability to use either its own collection or hoist the parent's

            /* *
            $scope.$watch('query', function (query) {
                console.log('query:', query);
            });
            console.log('attributes:', $attrs.ngModel);
            $scope.registry = new registry();
            $scope.registry.fetch('Media', $scope);
            /* */
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/search' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
