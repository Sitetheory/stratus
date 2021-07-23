// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core'
// import {ComponentPortal} from '@angular/cdk/portal'
import {DomSanitizer} from '@angular/platform-browser'

// Runtime
import _ from 'lodash'
import {keys} from 'ts-transformer-keys'

// Stratus Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {RootComponent} from '@stratusjs/angular/core/root.component'

import {cookie} from '@stratusjs/core/environment'
// import {StripePaymentMethodItemComponent} from '@stratusjs/stripe/payment-method-item.component'

// Services
import {StripeService} from '@stratusjs/stripe/stripe.service'
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {Model} from '@stratusjs/angularjs/services/model'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {Observable, ObservableInput, Subject, Subscriber, timer} from 'rxjs'
import {catchError, debounce} from 'rxjs/operators'
import {FormBuilder, FormControl, FormGroup} from '@angular/forms'
// import {EventBase} from '@stratusjs/core/events/eventBase'

// Local Setup
const min = !cookie('env') ? '.min' : ''
const packageName = 'stripe'
const componentName = 'payment-method-selector'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${packageName}-${componentName}`,
    templateUrl: `${localDir}${componentName}.component${min}.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StripePaymentMethodSelectorComponent extends RootComponent implements OnInit {

    // Basic Component Settings
    title = `${packageName}_${componentName}_component`
    uid: string
    @Input() elementId: string

    // States
    styled = false
    initialized = false

    // Registry Attributes
    @Input() target: string
    @Input() targetSuffix: string
    @Input() id: number
    @Input() manifest: boolean
    @Input() decouple: boolean
    @Input() direct: boolean
    @Input() api: object
    @Input() urlRoot: string

    // Component Attributes
    @Input() property: string
    @Input() detailedBillingInfo?: boolean
    fieldName = 'dataNumber'

    // Stratus Data Connectivity
    registry = new Registry()
    fetched: Promise<boolean|Collection|Model>
    model?: Model
    // Observable Connection
    dataSub: Observable<[]>
    // onChange = new Subject()
    subscriber: Subscriber<any>
    // Note: It may be better to LifeCycle::tick(), but this works for now
    form: FormGroup = this.fb.group({
        [this.fieldName]: new FormControl()
    })
    // dataChangeLog: string[] = []

    // Component data
    paymentCollection: Collection

    // paymentItemComponentPortal: ComponentPortal<StripePaymentMethodItemComponent>
    paymentMethodApiPath = 'PaymentMethod'

    constructor(
        private elementRef: ElementRef,
        private fb: FormBuilder,
        protected ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private Stripe: StripeService,
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
                this.refresh()
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = false
                this.refresh()
            })

        // TODO needs to make use of Observables
        this.paymentCollection = new Collection({
            autoSave: false,
            target: this.paymentMethodApiPath,
            watch: true
            // TODO remove pagination?
        })

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodSelectorComponent>())

        // FIXME the current saved payment doesn't get reselected. may need to use 'Responsive' functions (dettach)
        // Data Connections
        this.fetchData()
            .then(data => {
                if (!data || !(data instanceof EventManager)) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                console.log('fetchData ran', data)
                // Manually render upon model change
                // this.ref.detach();
                const onDataChange = () => {
                    if (!data.completed) {
                        return
                    }
                    console.log('onDataChange changing', data)
                    // this.onDataChange();
                    this.dataDefer(this.subscriber)
                    // Halt UI Logic when payment input is Open
                    // if (this.codeViewIsOpen) {return}
                    // TODO: Add a debounce so we don't attempt to update multiple times while the model is changing.
                    // this.refresh()
                    // FIXME: Somehow this doesn't completely work...  It gets data from the model
                    // when it is changed, but won't propagate it when the form event changes the data.
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // Declare Observable with Subscriber (Only Happens Once)
        // this doesnt seem to do anything
        this.dataSub = new Observable(subscriber => this.dataDefer(subscriber))
        this.dataSub.pipe(
            debounce(() => timer(500)),
            catchError(this.handleObservableError)
        ).subscribe(evt => {

            // dataControl.patchValue(evt)
            // this.selectedId = evt
            // const dataControl = this.form.get('dataNumber')
            const dataControl = this.form.get(this.fieldName)
            if (dataControl.value === evt) {
                // In the case of data being edited by the code view or something else,
                // we need to refresh the UI, as long as it has been initialized.
                // FIXME: This doesn't work
                if (this.initialized) {
                    this.refresh()
                }
                return
            }
            dataControl.patchValue(evt)
            // console.log('dataSub env', evt)
            this.refresh()
        })
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        // const dataControl = this.form.get('dataNumber')
        const dataControl = this.form.get(this.fieldName)
        console.log('form', this.form)

        dataControl.valueChanges.forEach(
            (value?: number) => {
                // Avoid saving until the Model is truly available
                /*if (!this.model.completed) {
                    return
                }*/

                // Save the qualified change!
                this.valueChanged(value)
                /*this.model.set(
                    this.property,
                    this.normalizeOut(innerHTML || value)
                )*/
            })

        await this.fetchPaymentMethods()
        // TODO grey out until loaded?
        this.Stripe.registerCollection(this.paymentCollection)
        this.initialized = true

        // TODO need a change watcher on the selector
        console.log('inited selector, this is model', this.model)
    }

    async fetchPaymentMethods() {
        await this.paymentCollection.fetch()
        this.refresh()
    }

    valueChanged(value: number) {
        if (
            !this.model ||
            !this.model.completed
        ) {
            // console.log('changed but no model for', this.selectedId)
            console.log('changed but no model for', value)
            return
        }
        // console.log('value changed to', this.selectedId)
        console.log('value changed to', value)

        // Save the qualified change!
        this.model.set(
            this.property,
            this.normalizeOut(value)
        )
    }

    normalizeOut(data?: number): number|null {
        if (!_.isSafeInteger(data)) {
            return null
        }
        return data
    }

    normalizeIn(data?: number): number|null {
        // Normalize non-int values to strings.
        if (!data || !_.isSafeInteger(data)) {
            return null
        }
        return data
    }

    // Data Connections
    fetchData() {
        if (this.fetched) {
            return this.fetched
        }
        return this.fetched = this.registry.fetch(
            Stratus.Select(this.elementRef.nativeElement),
            this
        )
        // return this.fetched = this.registry.fetch({
        //     target: this.target,
        //     targetSuffix: this.targetSuffix,
        //     id: this.id,
        //     manifest: this.manifest,
        //     decouple: this.decouple,
        //     direct: this.direct,
        //     api: this.api,
        //     urlRoot: this.urlRoot,
        // }, this)
    }

    // Ensures Data is populated before hitting the Subscriber
    dataDefer(subscriber: Subscriber<any>) {
        console.log('dataDefer running', subscriber)
        this.subscriber = this.subscriber || subscriber
        if (!this.subscriber) {
            return
        }
        // const prevString = this.dataString
        const dataNumber = this.dataRef()
        /*if (!dataNumber) {
            setTimeout(() => {
                this.dataDefer(subscriber)
            }, 500)
            return
        }*/
        /* if (!this.froalaConfig.useClasses) {
            if (prevString === this.dataString) {
                return
            }
            if (this.dev) {
                console.log('changed value pushed to subscriber:', prevString, this.dataString)
            }
        } */
        // console.log('will run subscriber next', dataNumber)
        this.subscriber.next(dataNumber)
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): number|null {
        if (!this.model) {
            console.log('dataRef cant read model')
            return null
        }
        // return this.dataString = this.normalizeIn(
        // const blah =  this.dataNumber = this.normalizeIn(
        return this.normalizeIn(
        // return this.dataNumber = this.normalizeIn(
            this.model.get(this.property)
        )
        // console.log('dataRef = ', blah, 'raw = ', this.model.get(this.property))
        // return blah
    }

    handleObservableError(err: ObservableInput<any>): ObservableInput<any> {
        console.error(err)
        return err
    }

}
