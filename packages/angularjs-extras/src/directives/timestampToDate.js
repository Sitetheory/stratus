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
            name = 'baseNew';
            stratus_1.Stratus.Directives.TimestampToDate = () => ({
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    format: '<'
                },
                link: ($attrs, $element, $scope, ngModel) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(lodash_1.snakeCase(name) + '_')] = $scope;
                    $scope.format = $scope.format || 'yyyy/MM/dd';
                    ngModel.$parsers.push(value => new Date(value).getTime() / 1000);
                    ngModel.$formatters.push(value => new Date(value * 1000));
                },
            });
        }
    };
});

//# sourceMappingURL=timestampToDate.js.map
