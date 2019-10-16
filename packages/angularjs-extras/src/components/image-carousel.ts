// ImageCarousel Component
// @stratusjs/angularjs-extras/components/image-carousel
// <stratus-image-carousel>
// --------------
// FIXME this is completely broken, don't try using it

// Runtime
import * as _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
// import {isJSON} from '@stratusjs/core/misc'
import {camelToSnake} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
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
        $attrs: angular.IAttributes,
        $scope: object | any, // angular.IScope breaks references so far
        Model: any,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(packageName) + '_' + camelToSnake(moduleName) + '_' + camelToSnake(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}${min}.css`)

        $scope.initialized = false
        $scope.carouselType = 'images'

    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}${min}.html`
}
