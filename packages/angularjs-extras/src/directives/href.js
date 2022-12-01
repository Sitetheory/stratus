System.register(["lodash", "@stratusjs/runtime/stratus"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, stratus_1, name;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            }
        ],
        execute: function () {
            name = 'href';
            stratus_1.Stratus.Directives.Href = ($location, $log, $parse) => ({
                restrict: 'A',
                link: ($scope, $element, $attrs) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(name + '_')] = $scope;
                    $scope.href = null;
                    if ($attrs.stratusHref) {
                        const href = $parse($attrs.stratusHref);
                        $scope.$watch('$parent', newValue => {
                            if (typeof newValue !== 'undefined') {
                                $scope.href = href($scope.$parent);
                                $log.log('stratus-href:', href($scope.href));
                            }
                        });
                        $element.bind('click', () => {
                            $scope.$applyAsync(() => {
                                if ($scope.href) {
                                    $location.path($scope.href);
                                }
                            });
                        });
                    }
                }
            });
        }
    };
});

//# sourceMappingURL=href.js.map
