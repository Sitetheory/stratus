/* tslint:disable:no-inferrable-types */
// Angular Core
import {
    // AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core'
// import {ComponentPortal} from '@angular/cdk/portal'
import {DomSanitizer} from '@angular/platform-browser'

// Runtime
import {snakeCase, uniqueId} from 'lodash'
import {keys} from 'ts-transformer-keys'

// Stratus Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {RootComponent} from '../../angular/src/core/root.component'
import {Collection, CollectionOptions} from '@stratusjs/angularjs/services/collection'
import {cookie} from '@stratusjs/core/environment'
// import {StripePaymentMethodItemComponent} from '@stratusjs/stripe/payment-method-item.component'

// Services
import {StripeService} from './stripe.service'



// Local Setup
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
const componentName = 'payment-method-list'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${packageName}-${componentName}`,
    templateUrl: `${localDir}${componentName}.component${min}.html`,
})
export class StripePaymentMethodListComponent extends RootComponent implements OnInit { // AfterViewInit

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`
    uid: string
    @Input() elementId: string

    // States
    styled = false
    initialized = false

    // Registry Attributes
    @Input() urlRoot: string = '/Api'
    @Input() paymentMethodApiPath: string = 'PaymentMethod'

    // Component Attributes
    @Input() addCardButtonText: string = 'Add Payment Method'
    @Input() disabled: boolean | string = false // inputs are strings..
    @Input() property: string
    @Input() detailedBillingInfo?: boolean
    @Input() defaultBillingName?: string
    @Input() defaultBillingEmail?: string
    @Input() defaultBillingPhone?: string
    @Input() defaultBillingZip?: string
    @Input() defaultBillingState?: string
    @Input() defaultBillingCity?: string
    @Input() defaultBillingAddress1?: string
    @Input() defaultBillingAddress2?: string
    defaultBillingInfo: stripe.BillingDetails = {address: {}}

    // Component data
    paymentCollection: Collection

    constructor(
        private elementRef: ElementRef,
        protected ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private Stripe: StripeService,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = uniqueId(`sa_${snakeCase(this.title)}_`)
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
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodListComponent>())

        const apiOptions: CollectionOptions = {
            autoSave: false,
            target: this.paymentMethodApiPath,
            watch: true
            // TODO remove pagination?
        }
        if (this.urlRoot) {
            apiOptions.urlRoot = this.urlRoot
        }

        // TODO needs to make use of Observables
        this.paymentCollection = new Collection(apiOptions)

        if (this.defaultBillingName) {
            this.defaultBillingInfo.name = this.defaultBillingName
        }
        if (this.defaultBillingEmail) {
            this.defaultBillingInfo.email = this.defaultBillingEmail
        }
        if (this.defaultBillingPhone) {
            this.defaultBillingInfo.phone = this.defaultBillingPhone
        }
        if (this.defaultBillingZip) {
            this.defaultBillingInfo.address.postal_code = this.defaultBillingZip
        }
        if (this.defaultBillingState) {
            this.defaultBillingInfo.address.state = this.defaultBillingState
        }
        if (this.defaultBillingCity) {
            this.defaultBillingInfo.address.city = this.defaultBillingCity
        }
        if (this.defaultBillingAddress1) {
            this.defaultBillingInfo.address.line1 = this.defaultBillingAddress1
        }
        if (this.defaultBillingAddress2) {
            this.defaultBillingInfo.address.line2 = this.defaultBillingAddress2
        }
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        await this.fetchPaymentMethods()
        this.Stripe.registerCollection(this.paymentCollection)
        this.initialized = true

    }

    /*ngAfterViewInit() {
        // this.paymentItemComponentPortal = new ComponentPortal(StripePaymentMethodItemComponent)
    }*/

    async fetchPaymentMethods() {
        await this.paymentCollection.fetch()
        await this.refresh()
    }
}
