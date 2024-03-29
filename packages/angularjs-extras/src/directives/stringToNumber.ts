// String to Number Directive
// -----------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IAugmentedJQuery,
    IFilterService,
    INgModelController,
    IScope
} from 'angular'
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'stringToNumber'

// This directive intends to handle binding of a model to convert value string to number
Stratus.Directives.StringToNumber = (
    $filter: IFilterService
): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $scope: IScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes,
        ngModel: INgModelController
    ) => {
        // Initialize
        Stratus.Instances[safeUniqueId(packageName, moduleName, directiveName)] = $scope

        const setDisplayNumber = (val: string | number, formatter?: boolean) => {
            let displayValue

            if (
                typeof val === 'undefined' ||
                val === null
            ) {
                return null
            }

            const valStr = val.toString()
            displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z]/g, '')
            displayValue = parseFloat(displayValue)
            displayValue = (!isNaN(displayValue)) ? displayValue.toString() : ''

            // handle leading character -/0
            if (valStr.length === 1 && valStr[0] === '-') {
                displayValue = valStr[0]
            } else if (valStr.length === 1 && valStr[0] === '0') {
                displayValue = ''
            } else {
                displayValue = $filter('number')(displayValue)
            }

            // handle decimal
            if (!$attrs.integer) {
                if (displayValue.indexOf('.') === -1) {
                    if (valStr.slice(-1) === '.') {
                        displayValue += '.'
                    } else if (valStr.slice(-2) === '.0') {
                        displayValue += '.0'
                    } else if (valStr.slice(-3) === '.00') {
                        displayValue += '.00'
                    }
                } else {
                    // handle last character 0 after decimal and another number
                    if (valStr.slice(-1) === '0') {
                        displayValue += '0'
                    }
                }
            }

            if ($attrs.positive && displayValue[0] === '-') {
                displayValue = displayValue.substring(1)
            }

            if (typeof formatter !== 'undefined') {
                return (displayValue === '') ? '' : displayValue
            } else {
                $element.val((displayValue === '0') ? '' : displayValue)
            }
        }

        const setModelNumber = (val: number | string) => {
            // let modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '')
            const modelString = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '')
            let modelNum = parseFloat(modelString)
            modelNum = (!isNaN(modelNum)) ? modelNum : 0
            if (modelNum.toString().indexOf('.') !== -1) {
                modelNum = Math.round((modelNum + 0.00001) * 100) / 100
            }
            if ($attrs.positive) {
                modelNum = Math.abs(modelNum)
            }
            return modelNum
        }

        /**
         * @credits to Ben K at https://jsfiddle.net/benlk/4dto9738/
         */
        if ($attrs.stratusStringToNumber === 'comma') {
            // Keep the number comma parsed while processing as a number

            ngModel.$formatters.push(modelValue => setDisplayNumber(modelValue, true))

            ngModel.$parsers.push((viewValue) => {
                setDisplayNumber(viewValue)
                return setModelNumber(viewValue)
            })
        } else {
            // Default to standard behavior
            ngModel.$parsers.push(value => '' + value)
            ngModel.$formatters.push(value => parseFloat(value))
        }
    }
})
