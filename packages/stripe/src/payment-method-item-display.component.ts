import {
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core'
import {DomSanitizer} from '@angular/platform-browser'
import {snakeCase} from 'lodash'
import {keys} from 'ts-transformer-keys'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {Model} from '@stratusjs/angularjs/services/model'
import {cookie} from '@stratusjs/core/environment'
import {safeUniqueId} from '@stratusjs/core/misc'
import {StripeComponent} from './stripe.service'

// Local Setup
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
const componentName = 'payment-method-item-display'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${packageName}-${componentName}`,
    template: '<sa-stripe-payment-method-item *ngIf="initialized" [(model)]="model" [editable]="false" [templateStyle]="templateStyle"></sa-stripe-payment-method-item>',
})
export class StripePaymentMethodItemDisplayComponent extends StripeComponent implements OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`

    model: Model
    @Input() name?: string
    @Input() brand?: string
    @Input() last4?: string
    @Input() expMonth?: number
    @Input() expYear?: number
    @Input() bankName?: string
    @Input() status?: number

    @Input() templateStyle = 'default'

    constructor(
        private elementRef: ElementRef,
        private sanitizer: DomSanitizer,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = safeUniqueId('sa', snakeCase(this.title))
        Stratus.Instances[this.uid] = this
        this.elementId = this.elementId || this.uid

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodItemDisplayComponent>())
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        if (
            this.name &&
            this.last4 &&
            this.status
        ) {
            this.model = new Model()
            this.model.data.name = this.name
            this.model.data.last4 = this.last4
            this.model.data.status = this.status
            if (this.brand) {
                this.model.data.brand = this.brand
            }
            if (this.expMonth) {
                this.model.data.exp_month = this.expMonth
            }
            if (this.expYear) {
                this.model.data.exp_year = this.expYear
            }
            if (this.bankName) {
                this.model.data.bank_name = this.bankName
            }

            this.model.changed = false
            this.model.pending = false
            this.model.completed = true
            this.initialized = true
        } else {
            console.warn(`${this.uid} was missing data. not initializing`)
            if (!this.name) {
                console.warn(`${this.uid} was missing "name". Add with data-name="My Name"`)
            }
            if (!this.last4) {
                console.warn(`${this.uid} was missing "last4". Add with data-last-4="1234"`)
            }
        }
    }
}
