/* tslint:disable:no-inferrable-types */
import {
    Component,
    ElementRef,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Optional
} from '@angular/core'
import {DomSanitizer} from '@angular/platform-browser'
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {assignIn, clone, includes, isEmpty, isNumber, isObject, isString, set, snakeCase} from 'lodash'
import {keys} from 'ts-transformer-keys'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {Model, ModelOptions} from '@stratusjs/angularjs/services/model'
import {cookie} from '@stratusjs/core/environment'
import {safeUniqueId} from '@stratusjs/core/misc'
import {StripeComponent, StripeService} from './stripe.service'
import {
    PaymentMethodCreateParams,
    StripePaymentElementOptions,
    StripePaymentElementChangeEvent,
    StripePaymentElement
} from '@stripe/stripe-js'
import {SetupIntent} from '@stripe/stripe-js/dist/api/setup-intents'

// Local Setup
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
const componentName = 'payment-method'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${packageName}-${componentName}`,
    // templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    templateUrl: `${localDir}${componentName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class StripePaymentMethodComponent extends StripeComponent implements OnDestroy, OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`

    // Registry Attributes
    @Input() urlRoot: string = '/Api'
    @Input() paymentMethodApiPath: string = 'PaymentMethod'

    // States
    cardComplete = false
    cardSaved = false
    @Input() pmNotVerified = false
    cardNextAction?: SetupIntent.NextAction = null
    formPending = false

    // The SetupIntent Secret. This allows altering the SetupIntent that was created such as changing card details
    @Input() clientSecret: string
    @Input() publishKey = ''
    @Input() formMessage = ''
    @Input() detailedBillingInfo?: boolean
    @Input() defaultBillingInfo?: PaymentMethodCreateParams.BillingDetails
    billingInfo: PaymentMethodCreateParams.BillingDetails = { // fixme should copy stripe.BillingDetails // PaymentBillingInfo
        address: {}
    }
    @Input() paymentMethodId: string
    verifyCode: string  = 'SM'

    // card: stripe.elements.Element
    private cardId?: string

    constructor(
        private elementRef: ElementRef,
        private sanitizer: DomSanitizer,
        private Stripe: StripeService,
        @Optional() private dialogRef: MatDialogRef<StripePaymentMethodComponent>, // TODO detect if we are a dialog
        @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: StripePaymentMethodDialogData,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = safeUniqueId('sa', snakeCase(this.title))
        Stratus.Instances[this.uid] = this
        this.elementId = this.elementId || this.uid

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${componentName}.component${min}.css`)
            .then(() => {
                this.styled = true
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = false
            })

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodComponent>())

        // Hydrate Dialog Data
        if (!isEmpty(this.dialogData)) {
            const keysPossible = keys<StripePaymentMethodDialogData>()
            Object.keys(this.dialogData).forEach((attr) => {
                if (!isEmpty(attr) && includes(keysPossible, attr)) {
                    set(this, attr, this.dialogData[attr as keyof StripePaymentMethodDialogData])
                }
            })
        }

        if (isObject(this.defaultBillingInfo)) {
            if (
                Object.hasOwn(this.defaultBillingInfo, 'phone') &&
                isNumber(this.defaultBillingInfo.phone) &&
                this.defaultBillingInfo.phone
            ) {
                this.defaultBillingInfo.phone = (this.defaultBillingInfo.phone as number).toString()
            }
            if (
                Object.hasOwn(this.defaultBillingInfo, 'address') &&
                Object.hasOwn(this.defaultBillingInfo.address, 'postal_code') &&
                isNumber(this.defaultBillingInfo.address.postal_code) &&
                this.defaultBillingInfo.address.postal_code
            ) {
                this.defaultBillingInfo.address.postal_code = (this.defaultBillingInfo.address.postal_code as number).toString()
            }
            // Adds any of this extra data to the payment model
            assignIn(this.billingInfo, this.defaultBillingInfo)
        }
    }

    async ngOnInit() {
        // noinspection RedundantConditionalExpressionJS - dont simplify detailedBillingInfo. needs to be converted to boolean
        const options: StripePaymentElementOptions = {
            // {} // style options
            defaultValues: {
                billingDetails: this.billingInfo
            },
            // All is auto by default. There is no 'always' option
            /*fields: {
                billingDetails: {
                    name: 'auto',
                    address: {
                        postal_code: 'never'
                    }
                }
            }*/
        }
        if (this.publishKey && this.clientSecret) {
            this.cardId = await this.Stripe.createElement(
                this.uid,
                this.publishKey,
                this.clientSecret,
                // 'card',
                options,
                `#${this.elementId}-mount`
            )
            this.Stripe.elementAddEventListener(this.cardId, 'ready', (event: StripePaymentElement) => {
                this.initialized = true
            })
            // console.log('PaymentMethod loading', options, this)
            // Render the Card
            // this.card.mount(`#${this.elementId}-mount`)
            // Provide possible Stripe errors
            // this.card.addEventListener('change', (event) => {
            this.Stripe.elementAddEventListener(this.cardId, 'change', (event: StripePaymentElementChangeEvent & { error: any }) => {
                const displayError = document.getElementById(`${this.elementId}-errors`)
                // console.log('event', event) // Can get postal code from here
                // need to track if button is able to save
                if (
                    Object.prototype.hasOwnProperty.call(event, 'complete') &&
                    this.cardComplete !== event.complete
                ) {
                    // this.$applyAsync(() => {
                    this.cardComplete = event.complete
                    // })
                }
                // Ensure we display any errors
                if (event.error) {
                    displayError.textContent = event.error.message
                } else {
                    displayError.textContent = ''
                }
            })
            // this.initialized = true
        } else if (this.paymentMethodId) {
            this.initialized = true
        } else {
            console.warn('PaymentMethodComponent is missing required fields')
        }

        // $scope.$applyAsync(() => {
        // this.initialized = true
        // })

    }

    isEditable() {
        // console.log('isEditable = ', !this.formPending && this.initialized)
        return !this.formPending && this.initialized
    }

    /**
     * If all text fields are filled out (other than card details)
     */
    /*isBillingDetailsFilled() {
        if (
            !isEmpty(this.billingInfo.name) &&
            !isEmpty(this.billingInfo.email) &&
            !isEmpty(this.billingInfo.address.line1) &&
            !isEmpty(this.billingInfo.address.city) &&
            !isEmpty(this.billingInfo.address.state) &&
            !isEmpty(this.billingInfo.address.postal_code)
        ) {
            // TODO not checking this yet
        }
        return this.isEditable()
    }*/

    isSubmittable() {
        return this.cardComplete && this.isEditable() //  && this.isBillingDetailsFilled() // TODO not sure how to check Stripe items filled
    }

    /**
     * Check and template fields and submit to Stripe to attempt a Confirm Card Setup
     */
    async saveCard(ev?: any) {
        if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
        }
        if (!this.isSubmittable()) {
            // prevent trying to submit when not needed
            return
        }

        // TODO need to freeze all input fields as this could take a moment and changes will do nothing
        // TODO add loading bar to show something is being worked on
        this.formPending = true
        /*const {setupIntent, error} = await this.Stripe.confirmCardSetup( // FIXME needs to un confirmSetup( instead)
            this.cardId,
            this.clientSecret,
            {
                payment_method: {
                    billing_details: this.billingInfo
                    //    name: 'Test'
                    // }
                }
            }
        )*/
        const {setupIntent, error} = await this.Stripe.confirmSetup(
            this.cardId,
            this.clientSecret,
            {
                return_url: '', // FIXME we dont redirect
                // payment_method_data now supplied completely by the form,
                /*payment_method_data: {
                    billing_details: this.billingInfo
                    //    name: 'Test'
                    // }
                }*/
            }
        )

        if (error) {
            // Display error.message in your UI.
            console.error('error:', error, setupIntent) // only run this in dev mode

            // $scope.$applyAsync(() => {
            this.formPending = false
            const displaySaveError = document.getElementById(`${this.elementId}-errors`)
            let errorMessage = 'An Unknown Error has occurred'
            if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                errorMessage = error.message
            }
            displaySaveError.textContent = errorMessage
            // })
            return
        }

        if (
            setupIntent.status === 'succeeded'
            && isString(setupIntent.payment_method)
        ) {
            // The setup has succeeded.

            const apiOptions: ModelOptions = {
                target: this.paymentMethodApiPath
            }
            if (this.urlRoot) {
                apiOptions.urlRoot = this.urlRoot
            }

            // Send setupIntent.payment_method to your server to save the card to a Customer as default
            const model = new Model(apiOptions)
            model.data = {
                payment_method: setupIntent.payment_method
            }
            await model.save()
            // hide form and Display a success message
            this.cardSaved = true
            this.formPending = false // no more form
            // Reload any collections listing PMs
            await this.Stripe.fetchCollections()
            // emit this new card to auto-select it
            const cardDetails = {
                type: 'card',
                name: this.billingInfo.name,
                email: this.billingInfo.email
            }
            // console.log('noting a new card', cardDetails)
            this.Stripe.emitManual('paymentMethodCreated', 'Stripe', this, cardDetails)
            return
        }

        if (
            setupIntent.status === 'requires_action'
            && isString(setupIntent.payment_method) // Only if we made a paymentMethod
            && setupIntent.next_action != null
            && [
                'redirect_to_url',
                'verify_with_microdeposits'
            ].includes(setupIntent.next_action.type)
        ) {
            // We still need to save this payment Method, but as not status 1
            const apiOptions: ModelOptions = {
                target: this.paymentMethodApiPath
            }
            if (this.urlRoot) {
                apiOptions.urlRoot = this.urlRoot
            }

            const model = new Model(apiOptions)
            model.data = {
                status: 0, // this is not enabled yet
                next_action: setupIntent.next_action,
                payment_method: setupIntent.payment_method,
                setup_intent: setupIntent.id,
            }
            this.paymentMethodId = setupIntent.payment_method
            // Submit what we have so far
            await model.save()
            // hide form and Display a success message
            this.cardSaved = true
            this.pmNotVerified = true // Note that there are more actions to take/await
            this.formPending = false // no more form
            this.cardNextAction = clone(setupIntent.next_action)
            // Reload any collections listing PMs
            await this.Stripe.fetchCollections()
            // emit this new card to auto-select it
            const cardDetails = {
                type: 'us_bank_account', // TODO figure out the type of PM
                name: this.billingInfo.name,
                email: this.billingInfo.email
            }
            // console.log('noting a new card', cardDetails)
            this.Stripe.emitManual('paymentMethodCreated', 'Stripe', this, cardDetails)
            return
        }

        // handle everything else
        this.formPending = false
        console.error('something went wrong. no error, no success', setupIntent)
        const displayError = document.getElementById(`${this.elementId}-errors`)
        displayError.textContent = 'An unknown Error has occurred'
    }

    async verifyPM(ev?: any) {
        if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
        }
        // if (!this.isSubmittable()) {
        if (
            this.formPending ||
            !this.paymentMethodId ||
            this.verifyCode.length !== 6
        ) {
            // prevent trying to submit when not needed
            return
        }
        // TODO need to freeze all input fields as this could take a moment and changes will do nothing
        // TODO add loading bar to show something is being worked on
        this.formPending = true

        const apiOptions: ModelOptions = {
            target: this.paymentMethodApiPath
        }
        if (this.urlRoot) {
            apiOptions.urlRoot = this.urlRoot
        }

        // Send setupIntent.payment_method to your server to save the card to a Customer as default
        const model = new Model(apiOptions)
        model.data = {
            payment_method: this.paymentMethodId,
            verify_value: this.verifyCode
        }
        await model.save()
        // hide form and Display a success message
        this.cardSaved = true
        this.formPending = false // no more form
        // Reload any collections listing PMs
        await this.Stripe.fetchCollections()
    }

    dialogClose(): void {
        if (this.dialogRef) {
            this.dialogRef.close()
        }
    }

    ngOnDestroy() {
        // console.warn('local destroying stratus', this.uid)
        if (this.cardId) {
            this.Stripe.destroyElement(this.cardId)
        }
        super.ngOnDestroy()
        // delete Stratus.Instances[this.uid]
    }

}

export interface StripePaymentMethodDialogData {
    clientSecret?: string
    publishKey?: string
    formMessage?: string
    urlRoot?: string,
    paymentMethodApiPath?: string,
    detailedBillingInfo?: boolean
    defaultBillingInfo?: PaymentMethodCreateParams.BillingDetails
    pmNotVerified?: boolean
    paymentMethodId?: string
}
