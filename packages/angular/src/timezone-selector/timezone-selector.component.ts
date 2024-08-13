// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit
} from '@angular/core'
import {DomSanitizer} from '@angular/platform-browser'
import {FormControl} from '@angular/forms'
import {
    Observable,
    ObservableInput,
    Subject,
    Subscriber,
    timer
} from 'rxjs'
import {catchError, debounce, map, startWith} from 'rxjs/operators'
import Toastify from 'toastify-js'
import {keys} from 'ts-transformer-keys'
import {safeUniqueId} from '@stratusjs/core/misc'
import {Stratus} from '@stratusjs/runtime/stratus'
import {cookie} from '@stratusjs/core/environment'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {RootComponent} from '../core/root.component'
import {isEmpty} from 'lodash'

// AngularJS Classes
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'timezone-selector'
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`


/**
 * @title Media Selector with Drag & Drop Uploads and Sorting
 */
@Component({
    selector: `sa-internal-${moduleName}`,
    // TODO: Add the ability to change the templateUrl to others, based on a cookie.
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component${min}.css`
    // ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TimezoneSelectorComponent extends RootComponent implements OnInit { // implements OnInit, OnChanges {

    // Basic Component Settings
    title = moduleName + '_component'

    // Registry Attributes
    @Input() target: string
    @Input() targetSuffix: string
    @Input() id: number
    @Input() manifest: boolean
    @Input() decouple: boolean
    @Input() direct: boolean
    @Input() api: object
    @Input() urlRoot: string
    // @Input() registryModel: boolean | string // inputs are strings.. // false will disable Registry

    // Component Attributes
    @Input() type: string
    @Input() property: string
    @Input() endpoint: string

    // Dependencies
    Stratus = Stratus
    /*fieldName = 'timezoneSelector'
    fieldNameId = 'timezoneSelectorId'
    form: FormGroup = this.fb.group({
        [this.fieldName]: new FormControl(), // optionally disabled on init to avoid known issues
        [this.fieldNameId]: new FormControl({disabled: true})
    })*/

    // Stratus Data Connectivity
    registry = new Registry()
    fetched: Promise<boolean|Collection|Model>
    data: any
    // collection?: EventBase
    // @Output() model: any
    model?: Model

    // Observable Connection
    dataSub: Observable<[]>
    onChange = new Subject()
    subscriber: Subscriber<any>
    // Note: It may be better to LifeCycle::tick(), but this works for now

    // Multi-Framework Event Connectivity
    label = 'Select Timezone'
    timezone: string
    currentTimezone: string
    inputTimezone = new FormControl('')
    timezoneList: string[] = []
    filteredTimezones: Observable<string[]>

    // UI Flags
    initialized = false

    // Construct
    constructor(
        private elementRef: ElementRef,
        protected ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = safeUniqueId('sa', moduleName, 'component')
        Stratus.Instances[this.uid] = this

        // Prepare all possible timezones
        this.timezoneList = (Intl as any).supportedValuesOf('timeZone')

        // Get our own timezone
        this.currentTimezone = (Intl as any).DateTimeFormat().resolvedOptions().timeZone

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<TimezoneSelectorComponent>())

        this.filteredTimezones = this.inputTimezone.valueChanges.pipe(
            startWith(''),
            // tap(value => console.log(`filteredTimezones piping {value}`)),
            map(value => this._filter(value || '')),
        )

        /** Data Connections with Stratus model initiated */
        this.fetchData()
            .then(data => {
                if (!data || !(data instanceof EventManager)) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                // Manually render upon model change
                const onDataChange = () => {
                    if (!data.completed) {
                        return
                    }
                    this.dataDefer(this.subscriber)
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // Declare Observable with Subscriber (Only Happens Once)
        this.dataSub = new Observable(subscriber => {
            return this.dataDefer(subscriber)
        })
        // When the model updates, this will update the input field
        this.dataSub.pipe(
            debounce(() => timer(500)),
            catchError(this.handleObservableError)
        ).subscribe(evt => {
            if (this.inputTimezone.value === evt) {
                if (this.initialized) {
                    this.refresh().then()
                }
                return
            }
            this.timezone = evt
            this.updateLabel()
            this.inputTimezone.setValue(this.timezone)
            this.refresh().then()
        })
    }
    async ngOnInit() {
        // Watch for input box changes
        this.inputTimezone.valueChanges.forEach((value?: string) => this.valueChanged(value)).then()
        this.updateLabel()
        this.initialized = true
    }

    private updateLabel() {
        if (isEmpty(this.timezone) || this.timezone === 'local') {
            this.label = `(local - Currently displayed in ${this.currentTimezone})`
        } else {
            this.label = 'Select Timezone'
        }
    }

    /** Filter the inout box and output similar possible options */
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase()
        return this.timezoneList.filter(timezone => timezone.toLowerCase().includes(filterValue))
    }

    /** Connect to Stratus Model and sync */
    fetchData() {
        if (this.fetched) {
            return this.fetched
        }
        return this.fetched = this.registry.fetch(
            Stratus.Select(this.elementRef.nativeElement),
            this
        )
    }

    /** Ensures Data is populated before hitting the Subscriber */
    dataDefer(subscriber: Subscriber<any>) {
        this.subscriber = this.subscriber || subscriber
        if (!this.subscriber) {
            return
        }
        const dataString = this.dataRef()
        this.subscriber.next(dataString)
    }

    /** Return the value on the Stratus model */
    dataRef(): string {
        if (!this.model) {
            return ''
        }
        return this.model.get(this.property)
    }

    /** Any time the value of the input box is changed */
    valueChanged(value: string) {
        if (!value) {
            return
        }
        // Update the field to allow external apps to read
        this.timezone = value
        this.updateLabel()
        this.inputTimezone.setValue(this.timezone)
        if (!this.model || !this.model.completed) {
            return
        }

        // Save the qualified change to the model directly!
        this.model.set(
            this.property,
            this.timezone // value
        )
    }

    /** Toastify Errors */
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

    /** When a timezone option is clicked, process it by manually noting that it changed */
    timezoneSelected(value?: string) {
        if(!value) {
            return
        }
        this.valueChanged(value)
    }
}
