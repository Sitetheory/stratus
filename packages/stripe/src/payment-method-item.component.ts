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
import {ConfirmDialogComponent} from '../../angular/src/confirm-dialog/confirm-dialog.component'
import {Model} from '@stratusjs/angularjs/services/model'
import {cookie} from '@stratusjs/core/environment'
import {safeUniqueId} from '@stratusjs/core/misc'
import {
    MatDialog,
    MatDialogRef
} from '@angular/material/dialog'
import {StripeComponent, StripeService} from './stripe.service'

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
export class StripePaymentMethodItemComponent extends StripeComponent implements OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`
    @Input() model: Model
    @Input() editable = false
    @Input() templateStyle = 'default'

    // Registry Attributes
    @Input() urlRoot = '/Api'

    constructor(
        private dialog: MatDialog,
        private elementRef: ElementRef,
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
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodItemComponent>())
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        this.initialized = true
        if (this.urlRoot) {
            this.model.urlRoot = `${this.urlRoot}${this.model.target ? '/' + this.model.target : ''}`
        }
    }

    getCardLogoUrl(brand: string) {
        return `${localDir}/images/card/${brand}.png`
    }

    isExpired() {
        if (this.model.pending) {return false}
        if (this.model.data.type !== 'card') {return false} // only cards expire
        const d = new Date()
        const month = d.getMonth()+1
        const year = d.getFullYear()

        if (this.model.data.exp_year < year) {return true}
        if (this.model.data.exp_year > year) {return false}
        return this.model.data.exp_month < month
    }

    isExpiring() {
        if (this.model.pending) {return false}
        if (this.model.data.type !== 'card') {return false} // only cards expire
        const d = new Date()
        const month = d.getMonth()+1
        const year = d.getFullYear()

        if (this.model.data.exp_year < year) {return true}
        if (this.model.data.exp_year > year) {return false}
        return this.model.data.exp_month <= month
    }

    isUnverified() {
        if (this.model.pending) {return false}
        if (this.model.data.type !== 'us_bank_account') {return false} // only banks are unverified
        return this.model.data.status === 0
    }

    /*ngAfterViewInit() {
        this.paymentItemComponentPortal = new ComponentPortal(StripePaymentMethodItem)
    }*/

    deletePM(event?: Event) {
        if(event) {
            event.stopPropagation()
        }
        // Event will be empty
        this.deletePMConfirmation()
        return false
    }

    public deletePMConfirmation(): MatDialogRef<ConfirmDialogComponent, any> {
        const dialog = this.dialog
            .open(ConfirmDialogComponent, {
                maxWidth: '400px',
                data: {
                    title: 'Delete Payment Method',
                    message: 'Are you sure you wish to remove this payment method from your personal account?'
                }
            })
        dialog
            .afterClosed()
            .subscribe(async (dialogResult: boolean) => {
                if (!dialogResult) {
                    return
                }
                await this.model.destroy()
                this.Stripe.fetchCollections() // re-fetch ALL stripe collections just in case (will close the select box too)
            })
        return dialog
    }
}
