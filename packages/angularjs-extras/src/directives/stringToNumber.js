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
            name = 'stringToNumber';
            stratus_1.Stratus.Directives.StringToNumber = ($filter) => ({
                restrict: 'A',
                require: 'ngModel',
                link: ($attrs, $element, $scope, ngModel) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(lodash_1.snakeCase(name) + '_')] = $scope;
                    const setDisplayNumber = (val, formatter) => {
                        let displayValue;
                        if (typeof val === 'undefined' ||
                            val === null) {
                            return null;
                        }
                        const valStr = val.toString();
                        displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z]/g, '');
                        displayValue = parseFloat(displayValue);
                        displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';
                        if (valStr.length === 1 && valStr[0] === '-') {
                            displayValue = valStr[0];
                        }
                        else if (valStr.length === 1 && valStr[0] === '0') {
                            displayValue = '';
                        }
                        else {
                            displayValue = $filter('number')(displayValue);
                        }
                        if (!$attrs.integer) {
                            if (displayValue.indexOf('.') === -1) {
                                if (valStr.slice(-1) === '.') {
                                    displayValue += '.';
                                }
                                else if (valStr.slice(-2) === '.0') {
                                    displayValue += '.0';
                                }
                                else if (valStr.slice(-3) === '.00') {
                                    displayValue += '.00';
                                }
                            }
                            else {
                                if (valStr.slice(-1) === '0') {
                                    displayValue += '0';
                                }
                            }
                        }
                        if ($attrs.positive && displayValue[0] === '-') {
                            displayValue = displayValue.substring(1);
                        }
                        if (typeof formatter !== 'undefined') {
                            return (displayValue === '') ? '' : displayValue;
                        }
                        else {
                            $element.val((displayValue === '0') ? '' : displayValue);
                        }
                    };
                    const setModelNumber = (val) => {
                        const modelString = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                        let modelNum = parseFloat(modelString);
                        modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                        if (modelNum.toString().indexOf('.') !== -1) {
                            modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                        }
                        if ($attrs.positive) {
                            modelNum = Math.abs(modelNum);
                        }
                        return modelNum;
                    };
                    if ($attrs.stratusStringToNumber === 'comma') {
                        ngModel.$formatters.push(modelValue => setDisplayNumber(modelValue, true));
                        ngModel.$parsers.push((viewValue) => {
                            setDisplayNumber(viewValue);
                            return setModelNumber(viewValue);
                        });
                    }
                    else {
                        ngModel.$parsers.push(value => '' + value);
                        ngModel.$formatters.push(value => parseFloat(value));
                    }
                }
            });
        }
    };
});

//# sourceMappingURL=stringToNumber.js.map
