/* tslint:disable:no-inferrable-types */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core'
import {MatSelect} from '@angular/material/select'
// import {ComponentPortal} from '@angular/cdk/portal'
import {DomSanitizer} from '@angular/platform-browser'
import {isEmpty, snakeCase} from 'lodash'
import {keys} from 'ts-transformer-keys'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {cookie} from '@stratusjs/core/environment'
import {LooseObject, safeUniqueId} from '@stratusjs/core/misc'
import {StripeListComponent, StripeService} from './stripe.service'
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Collection, CollectionOptions} from '@stratusjs/angularjs/services/collection'
import {Model} from '@stratusjs/angularjs/services/model'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {Observable, ObservableInput, Subscriber, timer} from 'rxjs'
import {catchError, debounce} from 'rxjs/operators'
import {FormBuilder, FormControl, FormGroup} from '@angular/forms'
import Toastify from 'toastify-js'
import {PaymentMethodCreateParams} from '@stripe/stripe-js'

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
export class StripePaymentMethodSelectorComponent extends StripeListComponent implements OnInit {
    // Basic Component Settings
    title = `${packageName}_${componentName}_component`

    // Registry Attributes
    @Input() target: string
    @Input() targetSuffix: string
    @Input() id: number
    @Input() manifest: boolean
    @Input() decouple: boolean
    @Input() direct: boolean
    @Input() api: object
    @Input() urlRoot: string = '/Api'
    @Input() registryModel: boolean | string // inputs are strings.. // false will disable Registry
    @Input() paymentMethodApiPath: string = 'PaymentMethod'

    // Component Attributes
    @Input() addCardButtonText: string = 'Add Payment Method'
    @Input() selectCardButtonText: string = 'Select Default Payment Method'
    @Input() selectedTemplateStyle = 'default'
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
    defaultBillingInfo: PaymentMethodCreateParams.BillingDetails = {address: {}}
    fieldName = 'paymentSelection'
    fieldNameId = 'paymentSelectionId'

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
        [this.fieldName]: new FormControl(), // optionally disabled on init to avoid known issues
        [this.fieldNameId]: new FormControl({disabled: true})
    })
    @ViewChild('paymentSelect', {static: false}) paymentSelect: MatSelect

    // paymentItemComponentPortal: ComponentPortal<StripePaymentMethodItemComponent>

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
        this.uid = safeUniqueId('sa', snakeCase(this.title))
        Stratus.Instances[this.uid] = this
        this.elementId = this.elementId || this.uid

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${componentName}.component${min}.css`)
            .then(() => {
                this.styled = true
                this.refresh().then()
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = false
                this.refresh().then()
            })

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<StripePaymentMethodSelectorComponent>())

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

        if (this.registryModel !== false && this.registryModel !== 'false') {
            // FIXME the current saved payment doesn't get reselected. may need to use 'Responsive' functions (dettach)
            // Data Connections
            this.fetchData()
                .then(data => {
                    if (!data || !(data instanceof EventManager)) {
                        console.warn('Unable to bind data from Registry!')
                        return
                    }
                    // console.log('fetchData ran', data)
                    // Manually render upon model change
                    // this.ref.detach();
                    const onDataChange = () => {
                        if (!data.completed) {
                            return
                        }
                        // console.log('onDataChange changing', data)
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
                    // console.log('selector editted by code', evt)
                    if (this.initialized) {
                        this.refresh().then()
                    }
                    return
                }
                dataControl.patchValue(evt)
                // console.log('selector dataSub env', evt)
                this.refresh().then()
            })
        }
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        // const dataControl = this.form.get('dataNumber')
        const dataControl = this.form.get(this.fieldName)
        // console.log('form', this.form)

        if (this.disabled && this.disabled !== 'false') {
            dataControl.disable()
        }
        dataControl.valueChanges.forEach(
            // (value?: number) => {
            (value?: Model) => {
                // Avoid saving until the Model is truly available
                if (!value || !value.completed) {
                    // if (!this.model.completed) {
                    return
                }

                // Save the qualified change!
                this.valueChanged(value)
                /*this.model.set(
                    this.property,
                    this.normalizeOut(innerHTML || value)
                )*/
            }).then()

        // await this.fetchPaymentMethods() // we don't want to allow refreshing manually anymore. refer to Service
        /*await this.collection.fetch().then(() => {
            console.log('selector manually fetched collection (refreshed)', this.collection)
            this.refresh()
        })*/
        // TODO grey out until loaded?
        this.Stripe.registerCollection(this, this.collection)
        this.Stripe.fetchCollections(this.uid).then()
        this.initialized = true
        this.Stripe.emit('init', this) // Note this component is ready
        this.Stripe.on(this.uid, 'collectionUpdated', (_source, _collection: [Collection]) => {
            // console.log('selector collectionUpdated!!!!', _source, _collection)
            this.refresh()
            this.selectorListClose()
        })
        this.Stripe.on(
            'Stripe',
            'paymentMethodCreated',
            (_source, details: [PaymentMethodCreateParams.BillingDetails & {type:'card'|'ach'}]) =>
            {
                // The Stripe components are saying there is a new card added, lets find and select it!
                const newCardDetails = details[0]
                // console.log('selector sees the new payment method!!!!', clone(newCardDetails))
                if (
                    !isEmpty(newCardDetails.type) &&
                    !isEmpty(newCardDetails.name) &&
                    !isEmpty(newCardDetails.email)
                ) {
                    const newPM =  this.collection.models.slice(-1)[0] as Model
                    // console.log('checking last card in collection', newPM)
                    // Let's double check that these match up
                    if (
                        newPM.get('type') === newCardDetails.type &&
                        newPM.get('name') === newCardDetails.name &&
                        newPM.get('email') === newCardDetails.email
                    ) {
                        // console.log('new card seems to be!!!!', newPM)
                        this.valueChanged(newPM)
                    }
                }
        })

        // console.log('inited selector, this is model', this.model)
    }

    valueChanged(value: Model) {
        if (value) {
            // Update the field to allow external apps to read
            this.form.get(this.fieldNameId).setValue(value.get('id'))
        }
        if (
            !this.model ||
            !this.model.completed
        ) {
            // console.log('changed but no model for', this.selectedId)
            // console.log('changed but no model for', value)
            return
        }
        // console.log('value changed to', this.selectedId)
        // console.log('value changed to', value)

        // Save the qualified change!
        this.model.set(
            this.property,
            this.normalizeOut(value)
        )
    }

    // normalizeOut(data?: number): number|null {
    normalizeOut(model?: Model): LooseObject|null {
        // console.log('normalizeOut on', model)
        /*if (
            !model || !model.hasOwnProperty('id') ||
            // !isSafeInteger(model.data.id)
            !isSafeInteger(model.id)
        ) {
            return null
        }*/
        return model.data
    }

    // normalizeIn(data?: number): number|null {
    normalizeIn(data?: LooseObject): Model|null {
        // console.log('normalIn', data)
        if (!data) {
            return null
        }
        // console.log('running normalizeIn')
        return new Model({}, data)
        // return data
        // Normalize non-int values to strings.
        /*if (!data || !isSafeInteger(data)) {
            return null
        }
        return data*/
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

    /**
     * Used to compare the defaultPayment from the User/Site/Vendor and compare to which option to select
     */
    objectComparisonFunction(option: Model, value: Model ) : boolean {
        if (!option || !value) {
            // console.warn('option/value is null', option, value)
            return false
        }
        return option.data.id === value.data.id
    }

    // Ensures Data is populated before hitting the Subscriber
    dataDefer(subscriber: Subscriber<any>) {
        // this requires sitetheory to provide a populated PM and not just an id
        // FIXME There is an issuie right now when saving that the Api returns an id instead of an object

        // console.log('dataDefer running', subscriber)
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
        // console.log('will run subscriber next', dataNumber)
        this.subscriber.next(dataNumber)
        // ???: Add a returned Promise to ensure async/await can use this defer directly. (Observer can't use promise)
    }

    // dataRef(): number|null {
    dataRef(): LooseObject|null {
        if (!this.model) {
            // console.log('dataRef cant read model')
            return null
        }
        // console.log('running dataRef')
        return this.normalizeIn(
            this.model.get(this.property)
        )
    }

    handleObservableError(err: ObservableInput<any>): ObservableInput<any> {
        console.error(err)
        Toastify({
            text: err.toString(),
            duration: 3000,
            close: true,
            stopOnFocus: true,
            style: {
                background: '#E14D45',
            }
        }).showToast()
        return err
    }

    isPMExpired(paymentMethod: Model) {
        if (paymentMethod.pending) {return false}
        const d = new Date()
        const month = d.getMonth()+1
        const year = d.getFullYear()

        if (paymentMethod.data.exp_year < year) {return true}
        if (paymentMethod.data.exp_year > year) {return false}
        return paymentMethod.data.exp_month < month
    }

    selectorListClose(ev?: any) {
        if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
        }
        if (this.paymentSelect && this.paymentSelect.panelOpen) {
            // Let's close the selector if we've had updates so we can see that new data (or remove it completely)
            this.paymentSelect.close()
        }
    }

    selectorListOpen(ev?: any) {
        if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
        }
        if (this.paymentSelect && !this.paymentSelect.panelOpen) {
            // Let's close the selector if we've had updates so we can see that new data (or remove it completely)
            this.paymentSelect.open()
        }
    }

}
