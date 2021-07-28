// Angular Core
import {
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core'
import {DomSanitizer} from '@angular/platform-browser'

// Runtime
import _ from 'lodash'
import {keys} from 'ts-transformer-keys'

// Stratus Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {RootComponent} from '@stratusjs/angular/core/root.component'
import {Model} from '@stratusjs/angularjs/services/model'
import {cookie} from '@stratusjs/core/environment'

// Services
// import {StripeService} from '@stratusjs/stripe/stripe.service'


// Local Setup
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
const componentName = 'payment-method-item'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${packageName}-${componentName}`,
    templateUrl: `${localDir}${componentName}.component${min}.html`,
})
export class StripePaymentMethodItemComponent extends RootComponent implements OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`
    uid: string
    @Input() elementId: string
    @Input() model: Model

    // States
    @Input() editable = false
    styled = false
    initialized = false

    paymentMethodApiPath = 'PaymentMethod'

    constructor(
        private elementRef: ElementRef,
        private sanitizer: DomSanitizer,
        // private Stripe: StripeService,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(this.title)}_`)
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
        /*this.collection = new Collection({
            autoSave: false,
            target: this.paymentMethodApiPath,
            watch: true
            // TODO remove pagination?
        })*/

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodItemComponent>())
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        /*await this.fetchPaymentMethods()
        this.Stripe.registerCollection(this.collection)*/
        this.initialized = true

    }

    /*ngAfterViewInit() {
        this.paymentItemComponentPortal = new ComponentPortal(StripePaymentMethodItem)
    }*/

    /*async fetchPaymentMethods() {
        await this.collection.fetch()
    }*/

}
