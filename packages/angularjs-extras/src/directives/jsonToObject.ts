// JSON to Object Directive
// -----------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'

// Angular 1 Modules
import {isJSON} from '@stratusjs/core/misc'
import {IScope, INgModelController} from 'angular'


// Environment
// const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
// const moduleName = 'directives'
const componentName = 'jsonToObject'

Stratus.Directives.JsonToObject = () => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $attrs: angular.IAttributes, // Required for ngModel.$formatters and ngModel.$parsers
        $element: angular.IAugmentedJQuery, // Required for ngModel.$formatters and ngModel.$parsers
        $scope: IScope & any,
        ngModel: INgModelController
    ) => {
        const $ctrl: any = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope

        $ctrl.convertToJsonString = (val: object) => !_.isString(val) && !_.isNumber(val) ? JSON.stringify(val) : val

        $ctrl.convertToModelObject = (val: string) =>  isJSON(val) ? JSON.parse(val) : val

        // When model data changes, this will convert any objects into stringified json so html elements can display it
        ngModel.$formatters.push((modelValue: object) => $ctrl.convertToJsonString(modelValue))

        // When the html element changes, this will convert any json into object for model use
        ngModel.$parsers.push((viewValue: string) => $ctrl.convertToModelObject(viewValue))
    }
})
