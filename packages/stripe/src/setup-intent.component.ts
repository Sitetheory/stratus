// Stripe Setup Intent Component
// @stratusjs/stripe/setup-intent.component
// <stratus-stripe-setup-intent>
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
// import {StripeService} from '@stratusjs/stripe/stripe'

// Stratus Dependencies
import {
    isJSON,
    ObjectWithFunctions
} from '@stratusjs/core/misc'
// import {Collection} from '@stratusjs/angularjs/services/collection'
import {Model} from '@stratusjs/angularjs/services/model'

// Component Preload
import '@stratusjs/stripe/payment-method.component'

// Environment
// const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
// const moduleName = 'components'
const componentName = 'setup-intent'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type StripeSetupIntentScope = angular.IScope & ObjectWithFunctions & {
    elementId: string
    localDir: string
    initialized: boolean

    detailedBillingInfo: boolean,

    newPaymentMethodPrompt: boolean
    newPaymentMethodPending: boolean

    paymentMethodApiPath: string

    addPaymentMethod(): Promise<void>
    inputPaymentMethod(clientSecret: string, publishKey: string, ev?: any): void
}

Stratus.Components.StripeSetupIntent = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',
        // When true, Requests for Name + Address to be added
        detailedBillingInfo: '@',
    },
    controller(
        $attrs: angular.IAttributes,
        $element: angular.IRootElementService,
        $mdDialog: angular.material.IDialogService,
        // $sce: angular.ISCEService,
        $scope: StripeSetupIntentScope, // angular.IScope breaks references so far
        // $timeout: angular.ITimeoutService,
        // $window: angular.IWindowService,
        // Stripe: StripeService
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.localDir = localDir

        $scope.initialized = false
        $scope.newPaymentMethodPrompt = false
        $scope.newPaymentMethodPending = false

        $scope.detailedBillingInfo = $attrs.detailedBillingInfo && isJSON($attrs.detailedBillingInfo) ?
            JSON.parse($attrs.detailedBillingInfo) : false
        $scope.paymentMethodApiPath = 'PaymentMethod' // FIXME allow this to be customizable

        /**
         * On load, attempt to prepare and render the Card element
         */
        $ctrl.$onInit = async () => {

            $scope.$applyAsync(() => {
                $scope.initialized = true
            })
        }

        $scope.addPaymentMethod = async (ev?: any): Promise<void> => {
            if (!$scope.newPaymentMethodPending && !$scope.newPaymentMethodPrompt) {
                console.log('running addPaymentMethod')
                let clientSecret = ''
                let publishKey = ''
                $scope.$applyAsync(() => {
                    $scope.newPaymentMethodPending = true
                })
                const model = new Model({
                    target: $scope.paymentMethodApiPath
                })
                await model.save()
                console.log('model', model)
                if (
                    Object.prototype.hasOwnProperty.call(model, 'meta') &&
                    Object.prototype.hasOwnProperty.call(model.meta, 'data') &&
                    Object.prototype.hasOwnProperty.call(model.meta.data, 'clientSecret') &&
                    Object.prototype.hasOwnProperty.call(model.meta.data, 'publishKey') &&
                    !_.isEmpty(model.meta.data.clientSecret) &&
                    !_.isEmpty(model.meta.data.publishKey)
                ) {
                    clientSecret = model.meta.data.clientSecret
                    publishKey = model.meta.data.publishKey
                }
                // TODO check status

                if (
                    !_.isEmpty(clientSecret) &&
                    !_.isEmpty(publishKey)
                ) {
                    // $scope.templatePaymentMethod = $sce.trustAsHtml(`<span>${$scope.disclaimerString}</span>`)
                    /*$scope.templatePaymentMethod = $sce.trustAsHtml(
                        `<stratus-stripe-payment-method data-client-secret="${$scope.clientSecret}"
                         data-publish-key="${$scope.publishKey}"></stratus-stripe-payment-method>`
                    )*/
                    //
                    // $scope.paymentEl.innerHTML = `<stratus-stripe-payment-method data-client-secret="${$scope.clientSecret}"
                    // data-publish-key="${$scope.publishKey}"></stratus-stripe-payment-method>`
                    // Been unable to get Stratus to render added Components, so we're working with a popup dialog instead
                    $scope.newPaymentMethodPrompt = true
                    $scope.inputPaymentMethod(clientSecret, publishKey, ev)
                }
                $scope.$applyAsync(() => {
                    $scope.newPaymentMethodPending = false
                })
            }
            return
        }

        $scope.inputPaymentMethod = (clientSecret: string, publishKey: string, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            // Opening a popup will load the propertyDetails and adjust the hashbang URL
            const templateOptions: {
                // 'element-id': string,
                'detailed-billing-info'?: string,
                'client-secret': string,
                'publish-key': string
            } = {
                // 'element-id': 'property_detail_popup_' + model.ListingKey,
                'detailed-billing-info': $scope.detailedBillingInfo ? 'true' : 'false',
                'client-secret': clientSecret,
                'publish-key': publishKey
            }

            let template =
                `<md-dialog aria-label="Add Payment Method" class="stratus-stripe-setup-intent-dialog">` +
                `<div class="popup-close-button-container">` +
                `<div aria-label="Close Popup" class="close-button" data-ng-click="closePopup()" aria-label="Close Payment Popup"></div>` +
                `</div>` +
                '<stratus-stripe-payment-method ' +
                'style="min-width:420px;margin:5px"' // didnt want a whole css file
            _.forEach(templateOptions, (optionValue, optionKey) => {
                template += `data-${optionKey}='${optionValue}'`
            })
            template +=
                '></stratus-stripe-payment-method>' +
                '</md-dialog>'

            $mdDialog.show({
                template, // equates to `template: template`
                parent: angular.element(document.body), // TODO try this element
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: true, // Only for -xs, -sm breakpoints.
                scope: $scope,
                preserveScope: true,
                // tslint:disable-next-line:no-shadowed-variable
                controller: ($scope: object | any, $mdDialog: angular.material.IDialogService) => {
                    $scope.closePopup = () => {
                        if ($mdDialog) {
                            $mdDialog.hide()
                            // Let's destroy it to save memory
                            // $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup', 'property'), 10)
                            // TODO kill the element
                        }
                        $scope.$applyAsync(() => {
                            $scope.newPaymentMethodPrompt = false
                        })
                    }
                }
            })
                .then(() => {
                }, () => {
                    // Let's destroy it to save memory
                    // $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup', 'property'), 10)
                    // TODO kill the element
                    $scope.$applyAsync(() => {
                        $scope.newPaymentMethodPrompt = false
                    })
                })
        }

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
            // delete Stripe Elements?
        }
    },
    template:
        '<md-button data-ng-click="addPaymentMethod($event)" data-ng-disabled="newPaymentMethodPending || newPaymentMethodPrompt">Add Payment Method</md-button>'
}
