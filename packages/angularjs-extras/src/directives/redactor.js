System.register(["lodash", "@stratusjs/runtime/stratus", "angular"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, stratus_1, angular_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            },
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }
        ],
        execute: function () {
            stratus_1.Stratus.Directives.Redactor = ($timeout) => ({
                restrict: 'A',
                require: 'ngModel',
                link: ($attrs, $element, $scope, ngModel) => {
                    const redactorOptions = {};
                    angular_1.module('angular-redactor', []).constant('redactorOptions', redactorOptions);
                    lodash_1.forEach([
                        `${stratus_1.Stratus.BaseUrl}sitetheorycore/dist/redactor/redactor.css`,
                        `${stratus_1.Stratus.BaseUrl}sitetheorycore/dist/redactor/redactor-clips.css`,
                        `${stratus_1.Stratus.BaseUrl}${stratus_1.Stratus.BundlePath}node_modules/codemirror/lib/codemirror.css`
                    ], (url) => {
                        stratus_1.Stratus.Internals.CssLoader(url);
                    });
                    $scope.redactorLoaded = false;
                    const updateModel = (value) => {
                        $timeout(() => {
                            $scope.$apply(() => {
                                ngModel.$setViewValue(value);
                            });
                        });
                    };
                    const options = {
                        changeCallback: updateModel
                    };
                    const additionalOptions = $attrs.redactor
                        ? $scope.$eval($attrs.redactor)
                        : {};
                    let editor;
                    lodash_1.extend(options, redactorOptions, additionalOptions);
                    const changeCallback = additionalOptions.changeCallback || redactorOptions.changeCallback;
                    if (changeCallback) {
                        options.changeCallback = function (value) {
                            updateModel.call(this, value);
                            changeCallback.call(this, value);
                        };
                    }
                    $timeout(() => {
                        editor = $element.redactor(options);
                        ngModel.$render();
                        $element.on('remove', () => {
                            $element.off('remove');
                            $element.redactor('core.destroy');
                        });
                    });
                    ngModel.$render = () => {
                        if (!lodash_1.isUndefined(editor)) {
                            $timeout(() => {
                                $element.redactor('code.set', ngModel.$viewValue || '');
                                $element.redactor('placeholder.toggle');
                                $scope.redactorLoaded = true;
                            });
                        }
                    };
                }
            });
        }
    };
});

//# sourceMappingURL=redactor.js.map
