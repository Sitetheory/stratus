// JSON to Object Directive
// -----------------

import {isNumber, isString} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {StratusDirective} from './baseNew'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {IAttributes, IAugmentedJQuery, IScope, INgModelController} from 'angular'

export type JsonToObjectScope = IScope & {
    uid: string
}

// Environment
// const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'jsonToObject'

Stratus.Directives.JsonToObject = (): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $scope: JsonToObjectScope,
        $element: IAugmentedJQuery, // Required for ngModel.$formatters and ngModel.$parsers
        $attrs: IAttributes, // Required for ngModel.$formatters and ngModel.$parsers
        ngModel: INgModelController
    ) => {
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope

        const convertToJsonString = (val: object) => !isString(val) && !isNumber(val) ? JSON.stringify(val) : val

        const convertToModelObject = (val: string) =>  isJSON(val) ? JSON.parse(val) : val

        // When model data changes, this will convert any objects into stringified json so html elements can display it
        ngModel.$formatters.push((modelValue: object) => convertToJsonString(modelValue))

        // When the html element changes, this will convert any json into object for model use
        ngModel.$parsers.push((viewValue: string) => convertToModelObject(viewValue))
    }
})
