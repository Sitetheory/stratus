// Runtime
import {camelCase, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {LooseFunction, LooseObject} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

export type CitationComponentScope = angular.IScope & LooseObject<LooseFunction> & {
    uid: string
    title: string
    content: string // HTML
    citationOpened: boolean
    auto: boolean

    toggleCitation(): void
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'citation'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.Citation = {
    transclude: {
        content: 'stratusCitationContent',
        title: '?stratusCitationTitle',
    },
    controller(
        $scope: CitationComponentScope,
        $transclude: angular.ITranscludeFunction
    ) {
        // Initialize
        const $ctrl = this
        $scope.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        Stratus.Instances[$scope.uid] = $scope
        $scope.auto = true

        Stratus.Internals.CssLoader(`${localDir}${componentName}${min}.css`)

        // Initialization
        $ctrl.$onInit = () => {
            if ($transclude.isSlotFilled('title')) {
                // We need to use the custom title
                $scope.auto = false
            }
        }
        $scope.toggleCitation = () => {
            $scope.citationOpened = !$scope.citationOpened
        }
    },
    templateUrl: `${localDir}${componentName}${min}.html`,
}
