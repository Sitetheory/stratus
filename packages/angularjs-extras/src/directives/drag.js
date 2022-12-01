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
            name = 'drag';
            stratus_1.Stratus.Directives.Drag = () => ({
                restrict: 'A',
                scope: {
                    ngModel: '=ngModel'
                },
                link: ($scope, $element) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(name + '_')] = $scope;
                    $element.bind('dragstart', function (rawEvent) {
                        const event = rawEvent;
                        console.log('dragstart:', event);
                        event.dataTransfer.effectAllowed = 'copy';
                        event.dataTransfer.setData('Text', lodash_1.get(this, 'id'));
                    });
                    $element.bind('dragenter', rawEvent => {
                        const event = rawEvent;
                        console.log('dragenter:', event);
                        return false;
                    });
                    $element.bind('dragover', rawEvent => {
                        const event = rawEvent;
                        console.log('dragover:', event);
                        if (event.preventDefault) {
                            event.preventDefault();
                        }
                        event.dataTransfer.dropEffect = 'move';
                        return false;
                    });
                    $element.bind('dragleave', rawEvent => {
                        const event = rawEvent;
                        console.log('dragleave:', event);
                    });
                    $element.bind('drop', rawEvent => {
                        const event = rawEvent;
                        console.log('drop:', event);
                        if (event.stopPropagation) {
                            event.stopPropagation();
                        }
                        const el = document.getElementById(event.dataTransfer.getData('Text'));
                        el.parentNode.removeChild(el);
                        return false;
                    });
                },
            });
        }
    };
});

//# sourceMappingURL=drag.js.map
