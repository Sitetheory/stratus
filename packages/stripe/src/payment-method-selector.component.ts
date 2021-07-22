// Angular Core
import {
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
import {Observable, Subject, Subscriber} from 'rxjs'
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

    // Stratus Data Connectivity
    registry = new Registry()
    fetched: Promise<boolean|Collection|Model>
    model?: Model
    // Observable Connection
    dataSub: Observable<[]>
    onChange = new Subject()
    subscriber: Subscriber<any>
    // Note: It may be better to LifeCycle::tick(), but this works for now
    dataChangeLog: string[] = []
    // dataString = ''
    dataNumber?: number

    // Component data
    paymentCollection: Collection
    selectedId?: number|undefined

    // paymentItemComponentPortal: ComponentPortal<StripePaymentMethodItemComponent>
    paymentMethodApiPath = 'PaymentMethod'

    constructor(
        private elementRef: ElementRef,
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
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = false
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

        // Data Connections
        this.fetchData()
            .then(data => {
                if (!data || !(data instanceof EventManager)) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                // Manually render upon model change
                // this.ref.detach();
                const onDataChange = () => {
                    if (!data.completed) {
                        return
                    }
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
    }

    /**
     * On load, attempt to prepare and render the Card element
     */
    async ngOnInit() {
        await this.fetchPaymentMethods()
        this.Stripe.registerCollection(this.paymentCollection)
        this.initialized = true

        // TODO need a change watcher on the selector
        console.log('initied selector, this is model', this.model)
    }

    async fetchPaymentMethods() {
        await this.paymentCollection.fetch()
    }

    valueChanged() {
        if (
            !this.model ||
            !this.model.completed
        ) {
            console.log('changed but no model for', this.selectedId)
            return
        }
        console.log('value changed to', this.selectedId)

        // Save the qualified change!
        this.model.set(
            this.property,
            this.normalizeOut(this.selectedId)
        )
    }

    normalizeOut(data?: number): number|null {
        if (
            data === null ||
            !_.isSafeInteger(data)
        ) {
            return null
        }
        return data
    }

    normalizeIn(data?: number): number|null {
        // Normalize non-int values to strings.
        if (!data || !_.isSafeInteger(data)) {
            return null
        }
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
        this.subscriber = this.subscriber || subscriber
        if (!this.subscriber) {
            return
        }
        // const prevString = this.dataString
        const dataString = this.dataRef()
        if (!dataString) {
            setTimeout(() => {
                this.dataDefer(subscriber)
            }, 500)
            return
        }
        /* if (!this.froalaConfig.useClasses) {
            if (prevString === this.dataString) {
                return
            }
            if (this.dev) {
                console.log('changed value pushed to subscriber:', prevString, this.dataString)
            }
        } */
        this.subscriber.next(dataString)
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): number|null {
        if (!this.model) {
            return null
        }
        // return this.dataString = this.normalizeIn(
        return this.dataNumber = this.normalizeIn(
            this.model.get(this.property)
        )
    }

}
