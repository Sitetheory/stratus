// Idx Service
// @stratusjs/idx/idx

// Runtime
// import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
// import {IPromise} from 'angular'

// Services
// import '@stratusjs/angularjs/services/model' // Needed as $provider
// import {Model, ModelOptions} from '@stratusjs/angularjs/services/model' // Needed as Class
// import '@stratusjs/angularjs/services/collection' // Needed as $provider
// import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class
// import '@stratusjs/idx/listTrac'

// Stratus Dependencies
// import {isJSON, LooseObject} from '@stratusjs/core/misc'
// import {cookie} from '@stratusjs/core/environment'
import {AnyFunction, ObjectWithFunctions} from '@stratusjs/core/misc'


// Environment
// const min = !cookie('env') ? '.min' : ''
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`


export type StripeService = ObjectWithFunctions & {
    [key: string]: AnyFunction // | IdxSharedValue
    elements: () => Promise<stripe.elements.Elements>
    confirmCardSetup: (
        clientSecret: string,
        data?: stripe.ConfirmCardSetupData,
        options?: stripe.ConfirmCardSetupOptions,
    ) => Promise<stripe.SetupIntentResponse>

    // Variables
    // sharedValues: IdxSharedValue
}

interface StripeVariables {
    stripe?: stripe.Stripe
    stripeElements?: stripe.elements.Elements
}


// All Service functionality
const angularJsService = (
    // $injector: angular.auto.IInjectorService,
    // $http: angular.IHttpService,
    // $location: angular.ILocationService,
    // $q: angular.IQService,
    // $rootScope: angular.IRootScopeService,
    $window: angular.IWindowService,
    // tslint:disable-next-line:no-shadowed-variable
    // Collection: any, // FIXME type 'Collection' is invalid, need to fix
    // ListTrac: any,
    // tslint:disable-next-line:no-shadowed-variable
    // Model: any, // FIXME type 'Model' is invalid, need to fix
    // orderByFilter: angular.IFilterOrderBy
): StripeService => {
    /*const sharedValues: IdxSharedValue = {
        contactUrl: null,
        contactCommentVariable: null,
        contact: null,
        integrations: {
            analytics: {},
            maps: {}
        }
    }*/

    // TODO set publish key externally
    const publishKey = 'pk_test_ULCczPO0jFXoZFatM8IoKhty'
    const Stripe: StripeVariables = {}
    let initializing = false
    let initialized = false

    async function initialize(): Promise<void> {
        if (!initialized && !initializing) {
            initializing = true
            try {
                await Stratus.Internals.JsLoader('https://js.stripe.com/v3/')
                if (!Object.prototype.hasOwnProperty.call($window, 'Stripe')) {
                    console.error('Stripe Api was not initialized, cannot continue')
                    initializing = false
                    return
                }
            } catch (e) {
                console.error('Stripe Api could not be fetched, cannot continue')
                initializing = false
                return
            }
            // $scope.Stripe = $window.Stripe
            Stripe.stripe = ($window.Stripe as stripe.StripeStatic)(publishKey)
            Stripe.stripeElements = Stripe.stripe.elements()

            initialized = true
            initializing = false
        } else if (initializing) {
            // wait for completion
            return await waitForInitialization()
        }
    }

    async function waitForInitialization(): Promise<void> {
        await new Promise(() => {
            setTimeout(async () => {
                if (initializing) {
                    return await waitForInitialization()
                } else if (!initialized) {
                    // FAILED
                    throw new Error('Unable to initialize')
                } else {
                    // succeeded
                    return
                }
            }, 1000)
        })
        return
    }

    async function elements(): Promise<stripe.elements.Elements> {
        await initialize()

        return Stripe.stripeElements
    }

    async function confirmCardSetup(
        clientSecret: string,
        data?: stripe.ConfirmCardSetupData,
        options?: stripe.ConfirmCardSetupOptions,
    ): Promise<stripe.SetupIntentResponse> {
        return Stripe.stripe.confirmCardSetup(clientSecret, data, options)
    }

    return {
        elements,
        initialize,
        confirmCardSetup
    }
}

Stratus.Services.Stripe = [
    '$provide',
    ($provide: angular.auto.IProvideService) => {
        $provide.factory('Stripe', angularJsService)
    }
]
