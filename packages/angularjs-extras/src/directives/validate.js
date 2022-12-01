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
            name = 'validate';
            stratus_1.Stratus.Directives.Validate = () => ({
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    validateValid: '=validateValid',
                    validateInvalid: '=validateInvalid',
                    validateComparison: '=validateComparison'
                },
                link: ($scope, $element, $attrs, $ctrl) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(name + '_')] = $scope;
                    const checkValues = (ngModelValue) => {
                        $scope.checks = {};
                        if ($attrs.validateComparison) {
                            $scope.checks.validateComparison = !$scope.validateComparison;
                        }
                        if ($scope.validateInvalid) {
                            $scope.checks.validateInvalid = !lodash_1.includes(lodash_1.isArray($scope.validateInvalid)
                                ? $scope.validateInvalid
                                : [$scope.validateInvalid], ngModelValue);
                        }
                        else if ($scope.validateValid) {
                            $scope.checks.validateValid = lodash_1.includes(lodash_1.isArray($scope.validateValid)
                                ? $scope.validateValid
                                : [$scope.validateValid], ngModelValue);
                        }
                        lodash_1.forEach($scope.checks, (el, key) => {
                            if ($ctrl && $ctrl.$setValidity) {
                                $ctrl.$setValidity(key, el);
                            }
                        });
                        if ($ctrl && $ctrl.$setValidity) {
                            $ctrl.$setValidity('validateAny', lodash_1.every($scope.checks));
                        }
                        return ngModelValue;
                    };
                    $ctrl.$parsers.push(checkValues);
                }
            });
        }
    };
});

//# sourceMappingURL=validate.js.map
