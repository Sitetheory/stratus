System.register(["lodash", "stratus", "angular-material", "@stratusjs/angularjs/services/registry", "@stratusjs/angularjs/services/model", "@stratusjs/angularjs/services/collection", "@stratusjs/core/conversion"], function (exports_1, context_1) {
    "use strict";
    var _, Stratus, conversion_1, model_1, collection_1, min, name, localPath;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_2) {
            },
            function (_3) {
            },
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (collection_1_1) {
                collection_1 = collection_1_1;
            },
            function (conversion_1_1) {
                conversion_1 = conversion_1_1;
            }
        ],
        execute: function () {
            min = Stratus.Environment.get('production') ? '.min' : '';
            name = 'base';
            localPath = 'components';
            Stratus.Components.Base = {
                transclude: {
                    model: '?stratusBaseModel'
                },
                bindings: {
                    elementId: '@',
                    ngModel: '=',
                    property: '@',
                    target: '@',
                    id: '@',
                    manifest: '@',
                    decouple: '@',
                    direct: '@',
                    api: '@',
                    urlRoot: '@',
                    limit: '@',
                    options: '<'
                },
                controller($scope, $attrs, R, M, C) {
                    const $ctrl = this;
                    $ctrl.uid = _.uniqueId(conversion_1.camelToSnake(name) + '_');
                    Stratus.Instances[$ctrl.uid] = $scope;
                    $scope.elementId = $attrs.elementId || $ctrl.uid;
                    Stratus.Internals.CssLoader(Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.css');
                    $scope.initialized = false;
                    $scope.property = $attrs.property || null;
                    $scope.data = null;
                    $scope.model = null;
                    $scope.collection = null;
                    if ($attrs.target) {
                        R.fetch($attrs, $scope);
                    }
                    $scope.$watch('$ctrl.ngModel', (data) => {
                        if (data instanceof model_1.Model && data !== $scope.model) {
                            $scope.model = data;
                        }
                        else if (data instanceof collection_1.Collection && data !== $scope.collection) {
                            $scope.collection = data;
                        }
                    });
                    $scope.initialize = () => {
                        if ($scope.initialized) {
                            return;
                        }
                        if ($scope.model) {
                            $scope.initialized = true;
                            $scope.model.on('change', () => {
                                console.log('model changed:', $scope.model.patch);
                            });
                        }
                        if ($scope.collection) {
                            $scope.initialized = true;
                            console.log('collection available');
                        }
                    };
                    $scope.$watch('$scope.model.completed', (newVal, oldVal) => {
                        if (!newVal || _.isEqual(newVal, oldVal)) {
                            return;
                        }
                        $scope.initialize();
                    });
                    $scope.$watch('$scope.collection.completed', (newVal, oldVal) => {
                        if (!newVal || _.isEqual(newVal, oldVal)) {
                            return;
                        }
                        $scope.initialize();
                    });
                    if (!Stratus.Environment.get('production')) {
                        console.log(name, 'component:', $scope, $attrs);
                    }
                },
                templateUrl: Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.html'
            };
        }
    };
});
