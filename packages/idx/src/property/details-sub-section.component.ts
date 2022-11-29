// IdxPropertyDetailsSubSection Component
// @stratusjs/idx/property/details-sub-section.component
// <stratus-idx-property-details-sub-section>
// --------------

// Runtime
import {camelCase, forEach, get, isArray, isString, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Services
import '@stratusjs/angularjs/services/model'
// tslint:disable-next-line:no-duplicate-imports
import {Model} from '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {
    isJSON,
    LooseFunction,
    LooseObject
} from '@stratusjs/core/misc'
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

interface SubSectionOptionItem {
    name?: string,
    prepend?: string, // Adds a text string to the front of a value
    append?: string, // Adds a text string to the end of a value (appendField/appendFieldBackup defaults to this)
    appendField?: string, // Attempts to find this Field and append it to end of a value (if it exists)
    // If appendField is not found, attempts to find this Field and append it to end of a value (if it exists)
    appendFieldBackup?: string,
    comma?: boolean, // Only for Numbers, If true, will add a grammatical comma for thousands
    true?: string, // Only used for booleans. If true, display this text. Defaults to 'Yes'
    false?: string, // Only used for booleans. If true, display this text. Defaults to 'No'
    // Only used for booleans. If value is false text is empty (''), hide the element. Enabled by default
    hideEmpty?: false
    hide?: true // Only to be used by this component to forcible hide this element at all times (set with hideEmpty)
}

interface SubSectionOptionItems {
    [key: string]: string | SubSectionOptionItem
}

export type IdxPropertyDetailsSubSectionScope = angular.IScope & LooseObject<LooseFunction> & {
    elementId: string
    initialized: boolean
    model: Model

    className: string
    sectionName: string
    sectionNameId: string
    items: SubSectionOptionItems
    visibleFields: boolean

    convertItemsToObject(): void
    typeOf(item: any): string
    isArray(item: any): boolean
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
        $scope: IdxPropertyDetailsSubSectionScope,
        // tslint:disable-next-line:no-shadowed-variable
        Model: any,
    ) {
        // Initialize
        const $ctrl = this

        $ctrl.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.className = $attrs.className || 'sub-detail-section'
        $scope.sectionName = $attrs.sectionName || ''
        $scope.sectionNameId = camelCase($scope.sectionName) + '_' + $scope.elementId
        const defaultItems: SubSectionOptionItems = {} // Simply to type cast into SubSectionOptionItems
        $scope.items = $attrs.items && isJSON($attrs.items) ? JSON.parse($attrs.items) : defaultItems

        $scope.visibleFields = false
        $scope.model = null

        const checkForVisibleFields = () => {
            Object.keys($scope.items).forEach((item: string) => {
                if (
                    Object.prototype.hasOwnProperty.call($scope.model.data, item) &&
                    $scope.model.data[item] !== 0 && // ensure we skip 0 or empty sections that can appear
                    $scope.model.data[item] !== '' && // ensure we skip "0" sections that can appear
                    $scope.model.data[item] !== '0' && // ensure we skip blanks or empty sections that can appear
                    !isString($scope.items[item]) // skip SubSectionOptionItems that are just a string
                ) {
                    if (!(
                        $scope.model.data[item] === false &&
                        get($scope.items[item], 'false') === ''
                    )) {
                        // Adjust the text being appended if there is a appendField being set
                        if (
                            Object.prototype.hasOwnProperty.call($scope.items[item], 'appendField') &&
                            Object.prototype.hasOwnProperty.call(
                                $scope.model.data, ($scope.items[item] as SubSectionOptionItem).appendField
                            ) &&
                            $scope.model.data[($scope.items[item] as SubSectionOptionItem).appendField] !== ''
                        ) {
                            ($scope.items[item] as SubSectionOptionItem).append =
                                ' ' + $scope.model.data[($scope.items[item] as SubSectionOptionItem).appendField]
                        } else if (
                            Object.prototype.hasOwnProperty.call($scope.items[item], 'appendFieldBackup') &&
                            Object.prototype.hasOwnProperty.call(
                                $scope.model.data, ($scope.items[item] as SubSectionOptionItem).appendFieldBackup
                            ) &&
                            $scope.model.data[($scope.items[item] as SubSectionOptionItem).appendFieldBackup] !== ''
                        ) {
                            ($scope.items[item] as SubSectionOptionItem).append =
                                ' ' + $scope.model.data[($scope.items[item] as SubSectionOptionItem).appendFieldBackup]
                        }

                        if (
                            get($scope.items[item], 'hideEmpty') !== false &&
                            (isArray($scope.model.data[item]) && $scope.model.data[item].length <= 0) // skip empty array
                        ) {
                            ($scope.items[item] as SubSectionOptionItem).hide = true
                        } else {
                            $scope.visibleFields = true
                        }

                    } else if (
                        $scope.model.data[item] === false &&
                        get($scope.items[item], 'hideEmpty') !== false
                    ) {
                        ($scope.items[item] as SubSectionOptionItem).hide = true
                    }
                }
            })
        }

        if ($scope.sectionName.startsWith('{')) {
            $ctrl.stopWatchingSectionName = $scope.$watch('$ctrl.sectionName', (data: string) => {
                $scope.sectionName = data
                $scope.sectionNameId = camelCase($scope.sectionName) + '_' + $scope.elementId
                $ctrl.stopWatchingSectionName()
            })
        }

        if (Object.keys($scope.items).length === 0) {
            $ctrl.stopWatchingItems = $scope.$watch('$ctrl.items', (data: string) => {
                if (Object.keys($scope.items).length === 0) {
                    const blankItems: SubSectionOptionItems = {} // Simply to type cast into SubSectionOptionItems
                    $scope.items = data && isJSON(data) ? JSON.parse(data) : blankItems
                    $scope.convertItemsToObject()
                }
                $ctrl.stopWatchingItems()
            })
        }

        $ctrl.stopWatchingModel = $scope.$watch('$ctrl.ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                checkForVisibleFields()
                $ctrl.stopWatchingModel()
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
            forEach($scope.items, (itemValue: any, itemKey: string) => {
                if (typeof itemValue === 'string') {
                    $scope.items[itemKey] = {
                        name: itemValue
                    }
                }
            })
        }

        $scope.typeOf = (item: any): string => isArray(item) ? 'array' : typeof item

        $scope.isArray = (item: any): boolean => isArray(item)
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
