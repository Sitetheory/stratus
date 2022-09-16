// FullHeight Directive
// -----------------
// Expected inputs
// stratus-full-height: void (required)
// full-height-minus-elements: string[] // [".header-common-parent",".search-filter-top",".sf-toolbar"]
// full-height-reference-parent: 'document' | 'window' |  '#elementName'

// Runtime
import {camelCase, isEmpty, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import {LooseFunction, LooseObject} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'


// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const componentName = 'citation'
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `/${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type CitationDirectiveScope = angular.IScope & LooseObject<LooseFunction> & {
    title: string
    popupOpened: boolean

    togglePopup(): void
}

Stratus.Directives.Citation = (
    // $timeout: angular.ITimeoutService,
    // $window: angular.IWindowService
) => ({
    restrict: 'E',
    transclude: true,
    /*transclude: {
        // we can set a new identifier
        new: 'span' // could be a div, why not?
    },*/
    scope: {
        title: '@',
    },
    link: (
        $attrs: angular.IAttributes,
        $element: angular.IAugmentedJQuery,
        $scope: CitationDirectiveScope,
    ) => {
        // Initialize
        const $ctrl: any = this
        $ctrl.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope

        const init = () => {
            console.log('citation directive initialized!')
            if (isEmpty($scope.title)) {
                $scope.title = 'Left me blank...'
            }
        }
        $scope.togglePopup = () => {
            $scope.popupOpened = !$scope.popupOpened
        }

        init()

    },
    template: `
        <span class="citation-popup" data-ng-class="{'opened': popupOpened}">
            <span class="citation-title" data-ng-bind="title">.</span>
            <span class="citation-popup-close" data-ng-click="togglePopup()"></span>
            <span class="citation-text"><div data-ng-transclude></div></span>
        </span>
        <sup class="citation-title-sup" data-ng-click="togglePopup()" data-ng-bind="title"></sup>
    `
})
