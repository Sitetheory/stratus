// IdxPropertyDetailsSubSection Component
// @stratusjs/idx/property/details-sub-section.component
// <stratus-idx-property-details-sub-section>
// --------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'details-sub-section'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

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
        $scope.items = $attrs.items && isJSON($attrs.items) ? JSON.parse($attrs.items) : []

        $scope.visibleFields = false
        $scope.model = null

        if ($scope.sectionName.startsWith('{')) {
            $scope.stopWatchingSectionName = $scope.$watch('$ctrl.sectionName', (data: string) => {
                $scope.sectionName = data
                $scope.stopWatchingSectionName()
            })
        }
        if ($scope.items.length === 0) {
            $scope.stopWatchingItems = $scope.$watch('$ctrl.items', (data: string) => {
                if ($scope.items.length === 0) {
                    $scope.items = data && isJSON(data) ? JSON.parse(data) : []
                    $scope.convertItemsToObject()
                }
                $scope.stopWatchingItems()
            })
        }

        $scope.stopWatchingModel = $scope.$watch('$ctrl.ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                Object.keys($scope.items).forEach((item: string) => {
                    if (
                        Object.prototype.hasOwnProperty.call($scope.model.data, item) &&
                        $scope.model.data[item] !== 0 && // ensure we skip 0 or empty sections can appear
                        $scope.model.data[item] !== '' // ensure we skip blanks or empty sections can appear
                    ) {
                        $scope.visibleFields = true
                    }
                })
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
            _.each($scope.items, (itemValue: any, itemKey: string) => {
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
