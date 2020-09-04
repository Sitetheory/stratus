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
import {cookie} from '@stratusjs/core/environment'
import {IdxComponentScope, IdxService} from '@stratusjs/idx/idx'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
// const moduleName = 'property'
const componentName = 'map'
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type IdxMapScope = IdxComponentScope & {
    linkId: string
    linkInitialized: boolean
}

Stratus.Components.IdxMap = {
    bindings: {
        ngModel: '=',
        items: '@',
        sectionName: '@',
        className: '@',
        template: '@',
    },
    controller(
        $attrs: angular.IAttributes,
        $scope: IdxMapScope,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid

        $ctrl.$onInit = () => {
            $scope.Idx = Idx
            $scope.linkId = $attrs.listId || null
            $scope.linkInitialized = false

            // TODO attempt to connect to with Idx

            // Register this Map with the Property service
            Idx.registerMapInstance($scope.elementId, $scope, $scope.linkId)
        }

        /*$scope.stopWatchingModel = $scope.$watch('$ctrl.ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                $scope.stopWatchingModel()
            }
        })*/

        $scope.getUid = (): string => $ctrl.uid

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
