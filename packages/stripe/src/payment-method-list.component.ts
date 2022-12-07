// Angular Core
import {
    AfterViewInit,
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
import {Collection} from '@stratusjs/angularjs/services/collection'
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
export class StripePaymentMethodListComponent extends RootComponent implements AfterViewInit, OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`
    uid: string
    @Input() elementId: string

    // States
    styled = false
    initialized = false

    // paymentItemComponentPortal: ComponentPortal<StripePaymentMethodItemComponent>
    collection: Collection
    @Input() detailedBillingInfo?: boolean
    paymentMethodApiPath = 'PaymentMethod'

    constructor(
        private elementRef: ElementRef,
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

        // TODO needs to make use of Observables
        this.collection = new Collection({
            autoSave: false,
            target: this.paymentMethodApiPath,
            watch: true
            // TODO remove pagination?
        })

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodListComponent>())
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        await this.fetchPaymentMethods()
        this.Stripe.registerCollection(this.collection)
        this.initialized = true

    }

    ngAfterViewInit() {
        // this.paymentItemComponentPortal = new ComponentPortal(StripePaymentMethodItemComponent)
    }

    async fetchPaymentMethods() {
        await this.collection.fetch()
    }

}
