// Stripe Payment Method Component
// @stratusjs/stripe/payment-method.component
// <stratus-stripe-payment-method>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Services
import '@stratusjs/stripe/stripe' // Ensures the files loads, rather than the TYPE
// tslint:disable-next-line:no-duplicate-imports
import {StripeService} from '@stratusjs/stripe/stripe'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {isJSON, ObjectWithFunctions} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
// const moduleName = 'components'
const componentName = 'payment-method'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type StripePaymentMethodScope = angular.IScope & ObjectWithFunctions & {
    elementId: string
    localDir: string
    // Stripe: stripe.StripeStatic
    stripe: stripe.Stripe
    stripeElements: stripe.elements.Elements
    stripeCard: stripe.elements.Element

    detailedBillingInfo: boolean,
    billingInfo: {
        name?: string
        email?: string
        phone?: string
        address: {
            line1?: string
            line2?: string
            city?: string
            state?: string
            postal_code?: string
            country?: string
        }
    }
    initialized: boolean
    cardComplete: boolean
    cardSaved: boolean
    formPending: boolean

    paymentMethodApiPath: string
}

Stratus.Components.StripePaymentMethod = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',
        // The SetupIntent Secret. This allows altering the SetupIntent that was created such as changing card details
        clientSecret: '@',
        // When true, Requests for Name + Address to be added
        detailedBillingInfo: '@',
        // Stripe Publish Key
        publishKey: '@',
    },
    controller(
        $attrs: angular.IAttributes,
        $element: angular.IRootElementService,
        $scope: StripePaymentMethodScope, // angular.IScope breaks references so far
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

        // The SetupIntent Secret. This allows altering the SetupIntent that was created such as changing card details
        const clientSecret: string = $attrs.clientSecret || null
        const publishKey = $attrs.publishKey || ''
        let card: stripe.elements.Element = null
        $scope.initialized = false
        $scope.cardComplete = false
        $scope.cardSaved = false
        $scope.formPending = false
        // TODO Add an option for dispalying an existing card/info (to update)
        $scope.detailedBillingInfo = $attrs.detailedBillingInfo && isJSON($attrs.detailedBillingInfo) ?
            JSON.parse($attrs.detailedBillingInfo) : false
        $scope.billingInfo = {
            address: {}
        }

        $scope.paymentMethodApiPath = 'PaymentMethod' // FIXME allow this to be customizable

        /**
         * On load, attempt to prepare and render the Card element
         */
        $ctrl.$onInit = async () => {
            // Stripe.elements() will await until it all loaded and ready to use
            // create(card) will make a 'card' type of Setup
            const options: stripe.elements.ElementsOptions = {
                // {} // style options
                hidePostalCode: $scope.detailedBillingInfo // option can remove postal
            }
            card = (await Stripe.elements(publishKey)).create('card', options)
            console.log('loading', _.clone(options))
            // Render the Card
            card.mount(`#${$scope.elementId}-mount`)
            // Provide possible Stripe errors
            card.addEventListener('change', (event) => {
                const displayError = document.getElementById(`${$scope.elementId}-errors`)
                console.log('event', event) // Can get postal code from here
                // need to track if button is able to save
                if (
                    Object.prototype.hasOwnProperty.call(event, 'complete') &&
                    $scope.cardComplete !== event.complete
                ) {
                    $scope.$applyAsync(() => {
                        $scope.cardComplete = event.complete
                    })
                }
                // Ensure we display any errors
                if (event.error) {
                    displayError.textContent = event.error.message
                } else {
                    displayError.textContent = ''
                }
            })

            $scope.$applyAsync(() => {
                $scope.initialized = true
            })
        }

        $scope.isEditable = () => {
            return !$scope.formPending && $scope.initialized
        }

        /**
         * If all text fields are filled out (other than card details)
         */
        $scope.isBillingDetailsFilled = () => {
            if (
                !_.isEmpty($scope.billingInfo.name) &&
                !_.isEmpty($scope.billingInfo.email) &&
                !_.isEmpty($scope.billingInfo.address.line1) &&
                !_.isEmpty($scope.billingInfo.address.city) &&
                !_.isEmpty($scope.billingInfo.address.state) &&
                !_.isEmpty($scope.billingInfo.address.postal_code)
            ) {

            }
            return !$scope.formPending && $scope.initialized
        }

        $scope.isSubmittable = () => {
            return $scope.cardComplete && $scope.isEditable() && $scope.isBillingDetailsFilled()
        }

        /**
         * Check and template fields and submit to Stripe to attempt a Confirm Card Setup
         */
        $scope.saveCard = async () => {
            if (!$scope.isSubmittable()) {
                // prevent trying to submit when not needed
                return
            }
            // TODO need to freeze all input fields as this could take a moment and changes will do nothing
            // TODO add loading bar to show something is being worked on
            $scope.formPending = true
            const {setupIntent, error} = await Stripe.confirmCardSetup(
                clientSecret,
                {
                    payment_method: {
                        card,
                        billing_details: $scope.billingInfo
                        //    name: 'Test'
                        // }
                    }
                }
            )

            if (error) {
                // Display error.message in your UI.
                console.error('error:', error, setupIntent) // only run this in dev mode

                $scope.$applyAsync(() => {
                    $scope.formPending = false
                    const displayError = document.getElementById(`${$scope.elementId}-errors`)
                    let errorMessage = 'An Unknown Error has occurred'
                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                        errorMessage = error.message
                    }
                    displayError.textContent = errorMessage
                })
                return
            }

            if (
                setupIntent.status === 'succeeded'
                && _.isString(setupIntent.payment_method)
            ) {
                // The setup has succeeded.
                // Send setupIntent.payment_method to your server to save the card to a Customer as default
                const model = new Model({
                    target: $scope.paymentMethodApiPath
                })
                model.data = {
                    payment_method: setupIntent.payment_method
                }
                await model.save()
                // TODO check if Sitetheory refreshed
                // hide form and Display a success message
                $scope.$applyAsync(() => {
                    $scope.cardSaved = true
                    $scope.formPending = false
                    // Reload any collections listing PMs
                    Stripe.fetchCollections()
                })
            } else {
                // handle everything else
                $scope.$applyAsync(() => {
                    $scope.formPending = false
                    console.error('something went wrong. no error, no success', setupIntent)
                    const displayError = document.getElementById(`${$scope.elementId}-errors`)
                    displayError.textContent = 'An unknown Error has occurred'
                })
            }
        }

        // TODO other options like form submission

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
            // delete Stripe Elements?
        }
    },
    templateUrl: (): string => `${localDir}${componentName}.component${min}.html`
}
