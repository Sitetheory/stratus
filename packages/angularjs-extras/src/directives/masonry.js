System.register(["lodash", "@stratusjs/runtime/stratus", "angular-material", "@stratusjs/core/misc"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, stratus_1, misc_1, name;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            },
            function (_1) {
            },
            function (misc_1_1) {
                misc_1 = misc_1_1;
            }
        ],
        execute: function () {
            name = 'masonry';
            stratus_1.Stratus.Directives.Masonry = () => ({
                restrict: 'A',
                link: ($attrs, $element, $scope) => {
                    const $ctrl = this;
                    $ctrl.uid = lodash_1.uniqueId(lodash_1.snakeCase(name) + '_');
                    stratus_1.Stratus.Instances[$ctrl.uid] = $scope;
                    $scope.elementId = $element.elementId || $ctrl.uid;
                    $scope.initialized = false;
                    const masonryOptions = $attrs.stratusMasonry && misc_1.isJSON($attrs.stratusMasonry) ? JSON.parse($attrs.stratusMasonry) : {};
                    masonryOptions.elementSelector = masonryOptions.elementSelector || '.grid';
                    masonryOptions.itemSelector = masonryOptions.itemSelector || '.grid-item';
                    masonryOptions.columnWidth = masonryOptions.columnWidth || '.grid-sizer';
                    masonryOptions.percentPosition = masonryOptions.percentPosition || true;
                    masonryOptions.horizontalOrder = masonryOptions.horizontalOrder || true;
                    $ctrl.init = () => {
                        $scope.initialized = true;
                    };
                    setTimeout(() => {
                        $ctrl.init();
                    }, 1);
                }
            });
        }
    };
});

//# sourceMappingURL=masonry.js.map
