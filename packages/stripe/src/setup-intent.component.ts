// Angular Core
import {
    // ChangeDetectionStrategy,
    // ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core'
import {DomSanitizer} from '@angular/platform-browser'
import {
    MatDialog
} from '@angular/material/dialog'

// Runtime
import _ from 'lodash'
import {keys} from 'ts-transformer-keys'

// Stratus Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {RootComponent} from '@stratusjs/angular/core/root.component'
import {Model} from '@stratusjs/angularjs/services/model'
// import {cookie} from '@stratusjs/core/environment'
import {
    StripePaymentMethodComponent,
    StripePaymentMethodDialogData
} from '@stratusjs/stripe/payment-method.component'

// Local Setup
// const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
const componentName = 'setup-intent'
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

@Component({
    selector: `sa-${packageName}-${componentName}`,
    // templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    template: '<button mat-raised-button (click)="addPaymentMethod($event)" [disabled]="newPaymentMethodPending || newPaymentMethodPrompt">Add Payment Method</button>',
})
export class StripeSetupIntentComponent extends RootComponent implements OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`
    uid: string
    @Input() elementId: string

    // States
    styled = false
    initialized = false
    newPaymentMethodPrompt = false
    newPaymentMethodPending = false

    @Input() detailedBillingInfo?: boolean
    paymentMethodApiPath = 'PaymentMethod'

    constructor(
        private elementRef: ElementRef,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(this.title)}_`)
        Stratus.Instances[this.uid] = this
        this.elementId = this.elementId || this.uid

        // Load Component CSS until System.js can import CSS properly.
        /*Stratus.Internals.CssLoader(`${localDir}${componentName}.component${min}.css`)
            .then(() => {
                this.styled = true
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = false
            })*/

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripeSetupIntentComponent>())
    }

    ngOnInit() {
        this.initialized = true
    }


    async addPaymentMethod(ev?: any) {
        if (!this.newPaymentMethodPending && !this.newPaymentMethodPrompt) {
            console.log('running addPaymentMethod')
            let clientSecret = ''
            let publishKey = ''
            this.newPaymentMethodPending = true

            const model = new Model({
                target: this.paymentMethodApiPath
            })
            await model.save()
            console.log('model', model)
            if (
                Object.prototype.hasOwnProperty.call(model, 'meta') &&
                Object.prototype.hasOwnProperty.call(model.meta, 'data') &&
                Object.prototype.hasOwnProperty.call(model.meta.data, 'clientSecret') &&
                Object.prototype.hasOwnProperty.call(model.meta.data, 'publishKey') &&
                !_.isEmpty(model.meta.data.clientSecret) &&
                !_.isEmpty(model.meta.data.publishKey)
            ) {
                clientSecret = model.meta.data.clientSecret
                publishKey = model.meta.data.publishKey
            }
            // TODO check status

            if (
                !_.isEmpty(clientSecret) &&
                !_.isEmpty(publishKey)
            ) {
                console.log('got client and publish, will make an input')
                this.newPaymentMethodPrompt = true
                this.inputPaymentMethod(clientSecret, publishKey, ev)
            }

            this.newPaymentMethodPending = false
        }
    }

    inputPaymentMethod(clientSecret: string, publishKey: string, ev?: any) {
        if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
        }

        this.newPaymentMethodPrompt = true
        // testing opening a dialog
        const dialogRef = this.dialog.open(StripePaymentMethodComponent, {
            width: '1000px',
            data: {
                clientSecret,
                publishKey,
                detailedBillingInfo: this.detailedBillingInfo
            } as StripePaymentMethodDialogData
        })

        dialogRef.afterClosed().subscribe((result: StripePaymentMethodDialogData) => {
            this.newPaymentMethodPrompt = false
            if (!result || _.isEmpty(result)) {
                return
            }

            // Display output if one exists
            if (
                // this.dev &&
                result
            ) {
                console.log('payment dialog result:', result)
            }
        })
    }

}
