/* tslint:disable:no-inferrable-types */
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
import {snakeCase} from 'lodash'
import {keys} from 'ts-transformer-keys'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {Collection, CollectionOptions} from '@stratusjs/angularjs/services/collection'
import {cookie} from '@stratusjs/core/environment'
import {safeUniqueId} from '@stratusjs/core/misc'
import {StripeListComponent, StripeService} from './stripe.service'
import {PaymentMethodCreateParams} from '@stripe/stripe-js'



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
export class StripePaymentMethodListComponent extends StripeListComponent implements OnInit { // AfterViewInit

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`

    // Registry Attributes
    @Input() urlRoot: string = '/Api'
    // @Input() registryModel: boolean | string // inputs are strings.. // false will disable Registry
    @Input() paymentMethodApiPath: string = 'PaymentMethod'

    // Component Attributes
    @Input() addCardButtonText: string = 'Add Payment Method'
    @Input() addCardDisabled: boolean = false
    @Input() disabled: boolean | string = false // TODO this is not used?
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
    defaultBillingInfo: PaymentMethodCreateParams.BillingDetails = {address: {}}

    // Stratus Data Connectivity
    // registry = new Registry()
    // fetched: Promise<boolean|Collection>
    // Observable Connection
    // dataSub: Observable<[]>
    // onChange = new Subject()
    // subscriber: Subscriber<any>

    constructor(
        private elementRef: ElementRef,
        protected ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private Stripe: StripeService,
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
        this.collection = new Collection(apiOptions)

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
        this.Stripe.registerCollection(this, this.collection)
        this.Stripe.fetchCollections(this.uid).then()
        this.initialized = true
        this.Stripe.emit('init', this) // Note this component is ready
        this.Stripe.on(this.uid, 'collectionUpdated', (_source, _collection: [Collection]) => {
            this.refresh()
        })
    }
}
