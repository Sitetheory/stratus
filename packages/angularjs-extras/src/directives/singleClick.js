System.register(["@stratusjs/runtime/stratus"], function (exports_1, context_1) {
    "use strict";
    var stratus_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            }
        ],
        execute: function () {
            stratus_1.Stratus.Directives.SingleClick = ($log, $parse) => ({
                restrict: 'A',
                link: ($attrs, $element, $scope) => {
                    const fn = $parse($attrs.stratusSingleClick);
                    const delay = 300;
                    let clicks = 0;
                    let timer = null;
                    $element.on('click', event => {
                        clicks++;
                        if (clicks === 1) {
                            timer = setTimeout(() => {
                                $scope.$applyAsync(() => {
                                    fn($scope, { $event: event });
                                });
                                clicks = 0;
                            }, delay);
                        }
                        else {
                            clearTimeout(timer);
                            clicks = 0;
                        }
                    });
                }
            });
        }
    };
});

//# sourceMappingURL=singleClick.js.map
