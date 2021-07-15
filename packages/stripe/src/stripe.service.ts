// Angular Core
import { Injectable } from '@angular/core'
// Runtime
import _ from 'lodash'

// Stratus Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import {Collection} from '@stratusjs/angularjs/services/collection'


interface StripeVariables {
    stripe?: stripe.Stripe
    stripeElements?: stripe.elements.Elements
}

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private publishKey = ''
    private Stripe: StripeVariables = {}
    private currentElement: {
        id: string
        paymentMethodType: stripe.elements.elementsType
        element: stripe.elements.Element
    }
    collections: Collection[] = []
    initializing = false
    initialized = false

    constructor(
        // private http: HttpClient
    ) {
        // Initialization
        Stratus.Services.Stripe = this
    }

    async initialize(): Promise<void> {
        if (!this.initialized && !this.initializing) {
            this.initializing = true
            try {
                await Stratus.Internals.JsLoader('https://js.stripe.com/v3/')
                if (!Object.prototype.hasOwnProperty.call(window, 'Stripe')) {
                    console.error('Stripe Api was not initialized, cannot continue')
                    this.initializing = false
                    return
                }
            } catch (e) {
                console.error('Stripe Api could not be fetched, cannot continue')
                this.initializing = false
                return
            }
            this.Stripe.stripe = (window.Stripe as stripe.StripeStatic)(this.publishKey)
            this.Stripe.stripeElements = this.Stripe.stripe.elements()

            this.initialized = true
            this.initializing = false
        } else if (this.initializing) {
            // wait for completion
            return await this.waitForInitialization()
        }
    }

    async waitForInitialization(): Promise<void> {
        await new Promise(() => {
            setTimeout(async () => {
                if (this.initializing) {
                    return await this.waitForInitialization()
                } else if (!this.initialized) {
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

    private async elements(key: string): Promise<stripe.elements.Elements> {
        this.publishKey = key
        await this.initialize()

        return this.Stripe.stripeElements
    }

    async confirmCardSetup(
        id: string,
        clientSecret: string,
        data?: {
            payment_method?: {
                billing_details?: stripe.BillingDetails
            }
        },
        options?: stripe.ConfirmCardSetupOptions,
    ): Promise<stripe.SetupIntentResponse> {
        if (
            _.isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            // TODO throw
            const error: stripe.Error = {
                type: 'invalid_request_error',
                charge: null,
                message: 'The Element for ' + id + 'no longer exists. Cannot attach confirmCardSetup'
            }
            return {error}
        }
        const stripeData: stripe.ConfirmCardSetupData = {
            payment_method: {
                card: this.currentElement.element
            }
        }
        if (
            data
            && !_.isEmpty(data.payment_method)
            && !_.isString(data.payment_method)
            && !_.isEmpty(data.payment_method.billing_details)
            && !_.isString(stripeData.payment_method)
        ) {
            stripeData.payment_method.billing_details = data.payment_method.billing_details
        }
        return this.Stripe.stripe.confirmCardSetup(clientSecret, stripeData, options)
    }

    registerCollection(collection: Collection) {
        this.collections.push(collection)
    }

    fetchCollections() {
        this.collections.forEach((collection) => {
            collection.fetch()
            console.log('refetching this collection')
        })
    }

    // we can only have one instance of card at a time, creating from managing features for it
    async createElement(
        id: string,
        publishKey: string,
        paymentMethodType: stripe.elements.elementsType,
        options: stripe.elements.ElementsOptions,
        mountElement?: any
    ) {
        if (!_.isEmpty(this.currentElement)) {
            console.warn('StripeElement for', this.currentElement.id, 'already exists. Destroying existing (consider cleaning up first)')
            this.destroyElement()
        }
        const element = (await this.elements(publishKey)).create(paymentMethodType, options)
        this.currentElement = {
            id: _.uniqueId(id+'_'),
            paymentMethodType,
            element
        }

        if (mountElement) {
            // element.mount(mountElement)
            this.mountElement(this.currentElement.id, mountElement)
        }

        // return element
        return this.currentElement.id
    }

    mountElement(id: string, mountElement: any) {
        if (
            _.isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            return
        }
        this.currentElement.element.mount(mountElement)
    }

    unmountElement(id: string) {
        if (
            _.isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            return
        }
        this.currentElement.element.unmount()
    }

    elementAddEventListener(
        id: string,
        event: stripe.elements.eventTypes,
        handler: stripe.elements.handler
    ) {
        if (
            _.isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            console.error('The StripeElement for', id, 'no longer exists. Cannot attach listener')
            return
        }
        return this.currentElement.element.addEventListener(event, handler)
    }

    destroyElement(id?: string) {
        if (
            !_.isEmpty(this.currentElement) &&
            (
                _.isNil(id) ||
                (_.isString(id) && this.currentElement.id === id)
            )
        ) {
            if (this.currentElement.element) {
                this.currentElement.element.unmount()
                this.currentElement.element.destroy()
            }
            this.currentElement = undefined
            // console.warn('Destroying StripeElement', id)
        }
    }
}
