System.register(["lodash", "@stratusjs/runtime/stratus"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, stratus_1, directiveEvents, forceAsyncEvents;
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
            directiveEvents = [
                'focusin',
                'focusout'
            ];
            forceAsyncEvents = {
                focusin: true,
                focusout: true
            };
            directiveEvents.forEach(eventName => {
                const directiveName = lodash_1.capitalize(eventName);
                const attributeName = 'stratus' + directiveName;
                stratus_1.Stratus.Directives[directiveName] = ($exceptionHandler, $parse, $rootScope) => ({
                    restrict: 'A',
                    compile: ($element, $attrs) => {
                        const fn = $parse($attrs[attributeName]);
                        return function ngEventHandler(scope, element) {
                            element.on(eventName, event => {
                                const callback = () => {
                                    fn(scope, { $event: event });
                                };
                                if (!$rootScope.$$phase) {
                                    scope.$apply(callback);
                                }
                                else if (forceAsyncEvents.hasOwnProperty(eventName) && forceAsyncEvents[eventName]) {
                                    scope.$evalAsync(callback);
                                }
                                else {
                                    try {
                                        callback();
                                    }
                                    catch (error) {
                                        $exceptionHandler(error);
                                    }
                                }
                            });
                        };
                    }
                });
            });
        }
    };
});

//# sourceMappingURL=domEvents.js.map
