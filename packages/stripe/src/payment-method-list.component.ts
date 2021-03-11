// Stripe Payment Method List Component
// @stratusjs/stripe/payment-method-list.component
// <stratus-stripe-payment-method-list>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Services
// TODO: We don't need to force the stripe import here if the StripeService below is used
import '@stratusjs/stripe/stripe'
// tslint:disable-next-line:no-duplicate-imports
import {StripeService} from '@stratusjs/stripe/stripe'

// Stratus Dependencies
// import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {
    isJSON,
    ObjectWithFunctions
} from '@stratusjs/core/misc'
import {Collection} from '@stratusjs/angularjs/services/collection'
// import {Model} from '@stratusjs/angularjs/services/model'

// Component Preload
import '@stratusjs/stripe/payment-method.component'
import '@stratusjs/stripe/setup-intent.component'


// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
// const moduleName = 'components'
const componentName = 'payment-method-list'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type StripePaymentMethodListScope = angular.IScope & ObjectWithFunctions & {
    elementId: string
    localDir: string
    initialized: boolean
    collection: Collection

    detailedBillingInfo: boolean,

    paymentMethodApiPath: string

    fetchPaymentMethods(): Promise<void>
}

Stratus.Components.StripePaymentMethodList = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',
        // When true, Requests for Name + Address to be added on PaymentMethod creation
        detailedBillingInfo: '@',
    },
    controller(
        $attrs: angular.IAttributes,
        $element: angular.IRootElementService,
        $mdDialog: angular.material.IDialogService,
        // $sce: angular.ISCEService,
        $scope: StripePaymentMethodListScope, // angular.IScope breaks references so far
        // $timeout: angular.ITimeoutService,
        // $window: angular.IWindowService,
        Stripe: StripeService
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.localDir = localDir
        Stratus.Internals.CssLoader(`${localDir}${componentName}.component${min}.css`)

        $scope.initialized = false

        $scope.detailedBillingInfo = $attrs.detailedBillingInfo && isJSON($attrs.detailedBillingInfo) ?
            JSON.parse($attrs.detailedBillingInfo) : false
        $scope.paymentMethodApiPath = 'PaymentMethod' // FIXME allow this to be customizable

        $scope.collection = new Collection({
            autoSave: false,
            // autoSaveInterval: 10000, // 10 secs
            target: $scope.paymentMethodApiPath,
            watch: true
            // TODO remove pagination?
        })

        /**
         * On load, attempt to prepare and render the Card element
         */
        $ctrl.$onInit = async () => {

            await $scope.fetchPaymentMethods()
            Stripe.registerCollection($scope.collection)
            $scope.$applyAsync(() => {
                $scope.initialized = true
            })
        }

        $scope.fetchPaymentMethods = async () => {
            await $scope.collection.fetch()
        }

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
            // delete setup-intent widgets?
        }
    },
    templateUrl: (): string => `${localDir}${componentName}.component${min}.html`
}
