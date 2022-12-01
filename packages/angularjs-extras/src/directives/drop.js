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
            name = 'drop';
            stratus_1.Stratus.Directives.Drop = ($log) => ({
                restrict: 'A',
                scope: {
                    ngModel: '=ngModel'
                },
                link: ($scope, $element) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(name + '_')] = $scope;
                    $log.log('drop:', $element);
                },
            });
        }
    };
});

//# sourceMappingURL=drop.js.map
