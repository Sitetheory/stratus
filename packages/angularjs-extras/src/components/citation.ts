// Runtime
import {camelCase, isEmpty, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {LooseFunction, LooseObject} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

export type CitationComponentScope = angular.IScope & LooseObject<LooseFunction> & {
    title: string
    citationOpened: boolean

    toggleCitation(): void
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'citation'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.Citation = {
    transclude: true,
    bindings: {
        title: '@',
    },
    controller(
        $scope: CitationComponentScope
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope

        Stratus.Internals.CssLoader(`${localDir}${componentName}${min}.css`)

        // Initialization
        $ctrl.$onInit = () => {
            if (isEmpty($scope.title) && !isEmpty($ctrl.title)) {
                $scope.title = $ctrl.title
            }
            if (isEmpty($scope.title)) {
                $scope.title = '..'
            }
        }
        $scope.toggleCitation = () => {
            $scope.citationOpened = !$scope.citationOpened
        }
    },
    templateUrl: `${localDir}${componentName}${min}.html`,
}
