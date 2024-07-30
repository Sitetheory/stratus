import {Injectable, Input} from '@angular/core'
import {RootComponent} from '@stratusjs/angular/core/root.component'
import {isEmpty, isNil, isString, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {LooseObject, safeUniqueId} from '@stratusjs/core/misc'
import {
    Stripe, SetupIntent, ConfirmCardSetupData, StripeElements, StripeElement, StripeElementsOptionsClientSecret, StripeElementsOptionsMode,
    PaymentMethodCreateParams, ConfirmCardSetupOptions, StripeElementBase, StripePaymentElement, ConfirmSetupData, StripeCardElement,
    SetupIntentResult, StripeError, StripePaymentElementOptions, StripePaymentElementChangeEvent
} from '@stripe/stripe-js'
import {loadStripe} from '@stripe/stripe-js/pure'
import Toastify from 'toastify-js'

/*interface StripeVariables {
    stripe?: stripe.Stripe
    stripeElements?: stripe.elements.Elements
}*/

export class StripeComponent extends RootComponent {
    title: string
    uid: string
    @Input() elementId: string
    styled = false
    initialized = false
}
export class StripeListComponent<T = LooseObject> extends StripeComponent {
    collection: Collection<T>
}
export type StripeEmitter = (source: StripeComponent, ...variables: any) => any
export type StripeEmitterInit = StripeEmitter & ((source: StripeComponent) => any)
export type StripeEmitterCollectionUpdated = StripeEmitter & ((source: StripeListComponent, ...collection: [Collection]) => any)
export type StripeEmitterPMCreated =
    StripeEmitter & ((source: StripeListComponent, ...details: [PaymentMethodCreateParams.BillingDetails & {type:'card'|'ach'}]) => any)

export type StripePaymentElementEvent =
    StripePaymentElementChangeEvent & {error: any} | {elementType: 'payment'} | {elementType: 'payment'; error: StripeError}

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private publishKey = ''
    // private Stripe: StripeVariables = {}
    private stripe: Stripe
    private currentElement: {
        id: string
        // paymentMethodType: stripe.elements.elementsType
        // element: stripe.elements.Element
        element: StripePaymentElement
        elements: StripeElements
    }
    private instanceOnEmitters: {
        [emitterUid: string]: {
            // [onMethodName: string]: StripeEmitter[]
            [onMethodName: string]: {[uid: string]: StripeEmitter}
            init?: {[uid: string]: StripeEmitterInit}
            collectionUpdated?: {[uid: string]: StripeEmitterCollectionUpdated}
            paymentMethodCreated?: {[uid: string]: StripeEmitterPMCreated}
        }
    } = {
        /*idx_property_list_7: {
            somethingChangedFake: [
                (source) => {
                    console.log('The something updated in this scope', source)
                }
            ],
            collectionUpdated: [
                (source: IdxComponentScope, collection: Collection) => {
                    console.log('The collection in this scope updated', source)
                    console.log('collection is now', collection)
                }
            ]
        }*/
    }
    // collections: Collection[] = []
    collections: {
        [uid:string]: {
            uid: string
            component: StripeComponent
            collection: Collection
        }
    } = {}
    initializing = false
    initialized = false

    constructor(
        // private http: HttpClient
        // private ngZone: NgZone
    ) {
        // Initialization
        Stratus.Services.Stripe = this
    }

    async initialize(key: string): Promise<void> {
        this.publishKey = key
        if (this.initialized || this.initializing) {
            // wait for completion
            return await this.waitForInitialization()
        }
        this.initializing = true
        try {
            await Stratus.Internals.JsLoader('https://js.stripe.com/v3/')
            const stripe = await loadStripe(key)
            if (!Object.prototype.hasOwnProperty.call(window, 'Stripe')) {
                // FIXME find other checks for stripe here
                console.warn('Stripe Api was not initialized yet, waiting...')
                await this.delay(3000)
                if (!Object.prototype.hasOwnProperty.call(window, 'Stripe')) {
                    const error = 'Stripe Api was not initialized, payment widgets cannot load.'
                    console.error(error)
                    this.initializing = false
                    Toastify({
                        text: error,
                        duration: 3000,
                        close: true,
                        stopOnFocus: true,
                        style: {
                            background: '#E14D45',
                        }
                    }).showToast()
                    return
                }
            }
            this.stripe = stripe
        } catch (e) {
            const error = 'Stripe Api could not be fetched, payment widgets cannot load.'
            console.error(error)
            this.initializing = false
            Toastify({
                text: error,
                duration: 3000,
                close: true,
                stopOnFocus: true,
                style: {
                    background: '#E14D45',
                }
            }).showToast()
            return
        }
        // this.Stripe.stripe = (window.Stripe as stripe.StripeStatic)(this.publishKey)
        // this.Stripe.stripeElements = this.Stripe.stripe.elements() // TODO do we need a client secret here now?

        this.initialized = true
        this.initializing = false
    }

    async delay(ms: number): Promise<ReturnType<typeof setTimeout>> {
        return new Promise((resolve) => {
            return setTimeout(resolve, ms)
        })
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

    // private async elements(key: string): Promise<stripe.elements.Elements> {
    private async getElements(key: string) {
        await this.initialize(key)

        // return this.Stripe.stripeElements
        return this.stripe.elements
    }

    /*async confirmCardSetup(
        id: string,
        clientSecret: string,
        data?: {
            payment_method?: {
                billing_details?: PaymentMethodCreateParams.BillingDetails
            }
        },
        options?: ConfirmCardSetupOptions,
    // ): Promise<SetupIntentResponse> {
    ): Promise<SetupIntentResult> {
        if (
            isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            // TODO throw
            // const error: stripe.Error = {
            const error: StripeError = {
                type: 'invalid_request_error',
                charge: null,
                message: 'The Element for ' + id + 'no longer exists. Cannot attach confirmCardSetup'
            }
            return {error}
        }
        // const stripeData: stripe.ConfirmCardSetupData = {
        const stripeData: ConfirmCardSetupData = {
            payment_method: {
                card: this.currentElement.element as unknown as StripeCardElement
            }
        }
        if (
            data
            && !isEmpty(data.payment_method)
            && !isString(data.payment_method)
            && !isEmpty(data.payment_method.billing_details)
            && !isString(stripeData.payment_method)
        ) {
            stripeData.payment_method.billing_details = data.payment_method.billing_details
        }
        // setupIntents.ConfirmCardSetupData
        return this.stripe.confirmCardSetup(clientSecret, stripeData, options)
    }*/

    async confirmSetup(
        id: string,
        clientSecret: string,
        confirmParams: ConfirmSetupData, // FIXME the card gets injected here?
        /*data?: {
            payment_method?: {
                billing_details?: PaymentMethodCreateParams.BillingDetails
            }
        },*/
        // options?: ConfirmSetupOptions, // FIXME there is no ConfirmSetupOptions, which doesnt look to have been used at all
        // ): Promise<SetupIntentResponse> {
    ): Promise<SetupIntentResult> {
        if (
            isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            // TODO throw
            // const error: stripe.Error = {
            const error: StripeError = {
                type: 'invalid_request_error',
                charge: null,
                message: 'The Element for ' + id + 'no longer exists. Cannot attach confirmSetup'
            }
            return {error}
        }
        const elements = this.currentElement.elements
        // Submit is required first
        const possibleError = await elements.submit()
        if (possibleError.error) {
            console.warn('submit error', possibleError.error)
            return {setupIntent: null, error: possibleError.error}
        }
        // const stripeData: stripe.ConfirmCardSetupData = {
        /*const stripeData: ConfirmSetupData = {
            payment_method_data: {
                card: this.currentElement.element
            }
        }
        if (
            data
            && !isEmpty(data.payment_method_data)
            && !isString(data.payment_method_data)
            && !isEmpty(data.payment_method_data.billing_details)
            && !isString(stripeData.payment_method_data)
        ) {
            stripeData.payment_method_data.billing_details = data.payment_method.billing_details
        }*/
        // FIXME need to add the element to confirmParams??
        // setupIntents.ConfirmCardSetupData
        return this.stripe.confirmSetup({elements, clientSecret, confirmParams, redirect: 'if_required'})
    }

    registerCollection(component: StripeComponent, collection: Collection) {
        this.collections[component.uid] = {uid: component.uid, component, collection}
    }

    async fetchCollections(uid?: string): Promise<void> {
        let uids: string[]
        if(
            isString(uid) &&
            uid.length > 0
        ) {
            uids = [uid]
        } else {
            uids = Object.keys(this.collections)
        }

        const uidList: (() => Promise<void>)[] = []
        uids.forEach((uidName) => {
            if (Object.prototype.hasOwnProperty.call(this.collections, uidName)) {
                uidList.push(
                    async () => {
                        await this.collections[uidName].collection.fetch()
                        this.emitManual(
                            'collectionUpdated',
                            uidName,
                            this.collections[uidName].component,
                            this.collections[uidName].collection
                        )
                    }
                )
            }
        })
        await Promise.all(uidList.map(fn => fn()))
        // console.log('collections all fetched')
    }

    // we can only have one instance of card at a time, creating from managing features for it
    async createElement(
        id: string,
        publishKey: string,
        clientSecret: string,
        // TODO stripe.elements.elementsType also includes "payment", but is not yet Typed
        // paymentMethodType: stripe.elements.elementsType,
        // options: stripe.elements.ElementsOptions,
        options: StripePaymentElementOptions,
        // options: StripeElementsOptionsMode,
        mountElement?: any
    ) {
        if (!isEmpty(this.currentElement)) {
            console.warn('StripeElement for', this.currentElement.id, 'already exists. Destroying existing (consider cleaning up first)')
            this.destroyElement()
        }
        // This will wait until Stripe API is inited before running
        const elementType = 'payment'
        const elements = await this.getElements(publishKey)
        // const stripeElements = elements({mode: elementType})
        const stripeElements = elements({clientSecret})
        const element = stripeElements.create(elementType, options)

        // const element = (await this.elements(publishKey)).create(paymentMethodType, options)
        this.currentElement = {
            id: safeUniqueId(id),
            // paymentMethodType,
            element,
            elements: stripeElements
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
            isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            return
        }
        this.currentElement.element.mount(mountElement)
    }

    unmountElement(id: string) {
        if (
            isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            return
        }
        this.currentElement.element.unmount()
    }

    elementAddEventListener(
        id: string,
        // event: stripe.elements.eventTypes,
        event: 'change' | 'ready' | 'focus' | 'blur' | 'escape' | 'loaderror' | 'loadstart',
        // handler: StripePaymentElementEvent
        handler: (event: StripePaymentElementEvent) => any
    ): StripePaymentElement | void {
        if (
            isEmpty(this.currentElement) ||
            this.currentElement.id !== id
        ) {
            const error = `The StripeElement for${id} no longer exists. Cannot attach listener`
            console.error(error)
            Toastify({
                text: error,
                duration: 3000,
                close: true,
                stopOnFocus: true,
                style: {
                    background: '#3C90D1',
                }
            }).showToast()
            return
        }
        // return this.currentElement.element.addEventListener(event, handler)
        // @ts-ignore
        return this.currentElement.element.on(event, handler)
    }

    destroyElement(id?: string) {
        if (
            !isEmpty(this.currentElement) &&
            (
                isNil(id) ||
                (isString(id) && this.currentElement.id === id)
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

    emit(
        emitterName: string,
        component: StripeComponent,
        ...variables: any
    ) {
        this.emitManual(emitterName, component.elementId, component, variables)
    }

    emitManual(
        emitterName: string,
        uid: string,
        component: StripeComponent,
        ...variables: any
    ) {
        if (
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters, uid) &&
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters[uid], emitterName)
        ) {
            Object.values(this.instanceOnEmitters[uid][emitterName]).forEach((emitter) => {
                try {
                    emitter(component, variables)
                } catch (e) {
                    console.error(e, 'issue sending back emitter on', uid, emitterName, emitter)
                }
            })
        }

        if (emitterName === 'init') {
            // Let's prep the requests for 'init' so they immediate call if this scope has already init
            this.instanceOnEmitters[uid] ??= {}
            this.instanceOnEmitters[uid][emitterName] ??= {}
        }
    }

    removeOnManual(
        emitterName: string,
        emitterId: string,
        onId: string,
    ) {
        if (
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters, emitterId) &&
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters[emitterId], emitterName) &&
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters[emitterId][emitterName], onId)
        ) {
            delete this.instanceOnEmitters[emitterId][emitterName][onId]
        }
    }

    on(
        uid: string,
        emitterName: string,
        callback: StripeEmitter
    ) {
        // console.log('a request has been made to watch for', uid, 'to emit', emitterName)
        // Let's check if an init request has already missed it's opportunity to init
        if (
            emitterName === 'init' &&
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters, uid) &&
            Object.prototype.hasOwnProperty.call(this.instanceOnEmitters[uid], emitterName) &&
            Object.prototype.hasOwnProperty.call(Stratus.Instances, uid)
        ) {
            // init has already happened.... so let's send back the emit of 'init' right now!
            // emit('init', Stratus.Instances[uid]) // wait, would this send the init a second time? maybe just send it to this callback
            callback(Stratus.Instances[uid])
            return
        }

        if (!Object.prototype.hasOwnProperty.call(this.instanceOnEmitters, uid)) {
            this.instanceOnEmitters[uid] = {}
        }
        if (!Object.prototype.hasOwnProperty.call(this.instanceOnEmitters[uid], emitterName)) {
            this.instanceOnEmitters[uid][emitterName] = {}
        }
        const onId = uniqueId() // TODO make a named connection to the requesting scope??
        this.instanceOnEmitters[uid][emitterName][onId] = callback
        return (): void => {this.removeOnManual(uid, emitterName, onId)}
    }
}
