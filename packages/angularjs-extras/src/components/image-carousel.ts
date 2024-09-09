// ImageCarousel Component
// @stratusjs/angularjs-extras/components/image-carousel
// <stratus-image-carousel>
// --------------
// FIXME this is completely broken, don't try using it

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
// import * as angular from 'angular'
import {IAttributes, IScope} from 'angular'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
// import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {LooseObject,safeUniqueId} from '@stratusjs/core/misc'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'image-carousel'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `/${boot.deployment}@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.ImageCarousel = {
    bindings: {
        ngModel: '=',
        items: '@',
        sectionName: '@',
        template: '@',
    },
    controller(
        $attrs: IAttributes,
        $scope: IScope&LooseObject, // angular.IScope breaks references so far
        // Model: any,
    ) {
        // Initialize
        // const $ctrl = this
        // $scope.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}${min}.css`).then()

        $scope.initialized = false
        $scope.carouselType = 'images'

    },
    templateUrl: ($attrs: IAttributes): string => `${localDir}${$attrs.template || componentName}${min}.html`
}
