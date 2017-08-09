// Permission Component
// --------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'stratus',
            'underscore',
            'angular',
            'angular-material',
            'stratus.services.collection'
        ], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to allow editing of various permissions depending on context.
    Stratus.Components.Permission = {
        bindings: {
            elementId: '@',
            ngModel: '=',
            user: '@',
            role: '@',
            bundle: '@',
            type: '@',
            target: '@',
            sentinel: '@'
        },
        controller: function ($scope, $attrs, $log, collection) {
            // Initialize
            this.uid = _.uniqueId('permission_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;

            // Permission Collection
            $scope.collection = null;
            $scope.$watch('$ctrl.ngModel', function (data) {
                if (data instanceof collection) {
                    $scope.collection = data;
                }
            });

            // Handle Complete Requests
            $scope.$watch('collection.completed', function (completed) {
                // Handle empty collections
                if (completed && !$scope.collection.models.length) {
                    $scope.collection.add({});
                }
            });

            // Sentinel Objects
            $scope.sentinel = {};
            $scope.$watch('collection.models.length', function () {
                _.each($scope.collection ? $scope.collection.models : [], function (model) {
                    if (model.exists('id') && model.exists('sentinel')) {
                        var sentinel = new Stratus.Prototypes.Sentinel();
                        sentinel.permissions(model.get('permissions'));
                        $scope.sentinel[model.get('id')] = sentinel;
                    }
                });
            });

            // Permission Calculations
            $scope.$watch('sentinel', function (sentinels) {
                if (!angular.isObject(sentinels)) return;
                _.each(sentinels, function (sentinel, id) {
                    if (!angular.isObject($scope.collection) || !angular.isObject(sentinel)) return;
                    _.each($scope.collection.models || [], function (model) {
                        if (!angular.isObject(model) || model.get('id') !== parseInt(id)) return;
                        model.set('permissions', sentinel.permissions());
                    });
                });
            }, true);
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permission' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
