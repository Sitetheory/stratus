// IdxPropertyDetailsSubSection Component
// @stratusjs/idx/property/details-sub-section.component
// <stratus-idx-property-details-sub-section>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'details-sub-section'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export interface SubSectionOptions {
    section: string,
    items: SubSectionOptionItems
}

interface SubSectionOptionItems {
    [key: string]: string | {
        name?: string,
        prepend?: string,
        append?: string,
        comma?: boolean,
        true?: string, // Only used for booleans. If true, display this text. Defaults to 'Yes'
        false?: string, // Only used for booleans. If true, display this text. Defaults to 'No'
        // Only used for booleans. If value is false text is empty (''), hide the element. Enabled by default
        hideEmpty?: false
        hide?: true // Only to be used by this component to forcible hide this element at all times (set with hideEmpty)
    }
}

Stratus.Components.IdxPropertyDetailsSubSection = {
    bindings: {
        ngModel: '=',
        items: '@',
        sectionName: '@',
        className: '@',
        template: '@',
    },
    controller(
        $attrs: angular.IAttributes,
        $scope: object | any, // angular.IScope breaks references so far
        Model: any,
    ) {
        // Initialize
        const $ctrl = this

        $scope.className = $attrs.className || 'sub-detail-section'
        $scope.sectionName = $attrs.sectionName || ''
        const defaultItems: SubSectionOptionItems = {} // Simply to type cast into SubSectionOptionItems
        $scope.items = $attrs.items && isJSON($attrs.items) ? JSON.parse($attrs.items) : defaultItems

        $scope.visibleFields = false
        $scope.model = null

        const checkForVisibleFields = () => {
            Object.keys($scope.items).forEach((item: string) => {
                if (
                    Object.prototype.hasOwnProperty.call($scope.model.data, item) &&
                    $scope.model.data[item] !== 0 && // ensure we skip 0 or empty sections can appear
                    $scope.model.data[item] !== '' // ensure we skip blanks or empty sections can appear
                ) {
                    if (!(
                        $scope.model.data[item] === false &&
                        _.get($scope.items[item], 'false') === ''
                    )) {
                        $scope.visibleFields = true
                    } else if (
                        $scope.model.data[item] === false &&
                        _.get($scope.items[item], 'hideEmpty') !== false
                    ) {
                        $scope.items[item].hide = true
                    }
                }
            })
        }

        if ($scope.sectionName.startsWith('{')) {
            $scope.stopWatchingSectionName = $scope.$watch('$ctrl.sectionName', (data: string) => {
                $scope.sectionName = data
                $scope.stopWatchingSectionName()
            })
        }

        if (Object.keys($scope.items).length === 0) {
            $scope.stopWatchingItems = $scope.$watch('$ctrl.items', (data: string) => {
                if (Object.keys($scope.items).length === 0) {
                    const blankItems: SubSectionOptionItems = {} // Simply to type cast into SubSectionOptionItems
                    $scope.items = data && isJSON(data) ? JSON.parse(data) : blankItems
                    $scope.convertItemsToObject()
                }
                $scope.stopWatchingItems()
            })
        }

        $scope.stopWatchingModel = $scope.$watch('$ctrl.ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                checkForVisibleFields()
                $scope.stopWatchingModel()
            }
        })

        $ctrl.$onInit = () => {
            $scope.convertItemsToObject()
        }

        $scope.convertItemsToObject = (): void => {
            /*Object.keys($scope.items).forEach((item: string) => {
                if (typeof $scope.items[item] === 'string') {
                    $scope.items[item] = {
                        name: $scope.items[item]
                    }
                }
            })*/
            _.forEach($scope.items, (itemValue: any, itemKey: string) => {
                if (typeof itemValue === 'string') {
                    $scope.items[itemKey] = {
                        name: itemValue
                    }
                }
            })
        }

        $scope.typeOf = (item: any): string => _.isArray(item) ? 'array' : typeof item

        $scope.isArray = (item: any): boolean => _.isArray(item)
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
