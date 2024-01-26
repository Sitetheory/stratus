// NOTE: to register a component you need to add it to:
// 1. /packages/angular/src/boot.ts
//      - This is where we must register if a component will be used in html, e.g. sa-selector
//      - we are using a component as an Angular app, this allows us to have as many angular components on a page defined
//          dynamically.
// 2. /packages/angular/src/app.module.ts
//      - This is where we register every component that will be used or imported
//      - add an import to define where it is located, e.g. import { JsonComponent } from './json.component'
//      - add to declarations and entryComponents

// Angular Core
import {
    // ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit
} from '@angular/core'
import {
    DomSanitizer
} from '@angular/platform-browser'

// Angular Material
// import {MatIconRegistry} from '@angular/material/icon'

// External Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import _, { has } from 'lodash'
import {cookie} from '@stratusjs/core/environment'

// Stratus Angular Core
import {RootComponent} from '../core/root.component'

// Transformers
import {keys} from 'ts-transformer-keys'
import {Observable, ObservableInput, Subject, Subscriber, timer} from 'rxjs'
import {FormBuilder, FormControl, FormGroup} from '@angular/forms'
import {MatDialog} from '@angular/material/dialog'
import {EventManager} from '@stratusjs/core/events/eventManager'
import {catchError, debounce} from 'rxjs/operators'
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {Model} from '@stratusjs/angularjs/services/model'
import {EventBase} from '@stratusjs/core/events/eventBase'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'json'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

/**
 * @title Json Viewer
 */
@Component({
    selector: 'sa-json',
    // template: '<ng-content></ng-content>',
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // styleUrls: [`${localDir}/json/json.component${min}.css`],
    // viewProviders: [JsonComponent]
    // changeDetection: ChangeDetectionStrategy.OnPush
})
// @Injectable()
export class JsonComponent extends RootComponent implements OnInit {

    // Basic Component Settings
    title = `${moduleName}_component`
    uid: string
    dev = !!cookie('env')
    debug = !!cookie(`debug_${moduleName}`)

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
    @Input() type: string
    @Input() property: string
    @Input() endpoint: string

    // Dependencies
    _ = _
    has = has
    log = console.log
    Stratus = Stratus

    // Stratus Data Connectivity
    registry = new Registry()
    fetched: Promise<boolean|Collection|Model>
    data: any
    collection?: EventBase
    // @Output() model: any;
    model?: Model

    // Observable Connection
    dataSub: Observable<[]>
    onChange = new Subject()
    subscriber: Subscriber<any>
    // Note: It may be better to LifeCycle::tick(), but this works for now

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    // UI Flags
    initialized = false
    styled = false
    blurred = false
    focused = false
    codeViewIsOpen: boolean
    // disableRefresh = true

    // Forms
    form: FormGroup = this.fb.group({
        dataString: new FormControl(),
    })
    dataChangeLog: string[] = []
    incomingData = ''
    outgoingData = ''

    // Debounce Saving Controls
    debounceSave = true
    debounceTime = 5000

    // Model Saving Controls
    forceSave = false

    constructor(
        // private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef,
        private elementRef: ElementRef,
        private fb: FormBuilder,
        public dialog: MatDialog,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.LoadCss([
            `${localDir}${moduleName}/${moduleName}.component${min}.css`,
        ]).then(() => {
            this.styled = true
            this.refresh()
        }).catch((e: Error) => {
            console.error(e)
            console.warn('Issue detected in CSS Loader for Component:', this.uid)
            this.styled = true
            this.refresh()
        })

        // _.forEach(cssFiles, (file: string) => Stratus.Internals.CssLoader(file).catch((e) => console.error(e)))

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<JsonComponent>())

        // Data Connections
        // TODO: Spelunk through this code to determine why I am getting an empty component on occasion...
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
                    // TODO: Add a debounce so we don't attempt to update multiple times while the model is changing.
                    // this.refresh()
                    // FIXME: Somehow this doesn't completely work...  It gets data from the model
                    // when it is changed, but won't propagate it when the form event changes the data.
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // Declare Observable with Subscriber (Only Happens Once)
        // TODO: Test if the observable is necessary in any way...
        this.dataSub = new Observable(subscriber => {
            if (this.dev) {
                console.warn(`[observable] creating subscriber on ${this.uid}`, subscriber)
            }
            return this.dataDefer(subscriber)
        })
        this.dataSub.pipe(
            // debounceTime(250),
            debounce(() => timer(250)),
            catchError(this.handleError)
        ).subscribe(evt => {
            // While the editor is focused, we skip debounce updates to avoid cursor glitches
            if (this.focused) {
                if (this.dev) {
                    console.warn(`[subscriber] waiting on updates due to focus on ${this.uid}`)
                }
                return
            }
            // TODO: This may need to only work on blur and not focus, unless it is the initialization value
            const dataControl = this.form.get('dataString')
            if (dataControl.value === evt) {
                // In the case of data being edited by the code view or something else,
                // we need to refresh the UI, as long as it has been initialized.
                if (this.initialized) {
                    this.refresh()
                }
                return
            }
            dataControl.patchValue(evt)
            // Note: A refresh may be necessary if things become less responsive
            this.refresh()
        })

        // console.info('constructor!');
    }

    ngOnInit() {
        this.initialized = true
        // console.info(`${moduleName}.ngOnInit`)
        const dataControl = this.form.get('dataString')
        // This valueChanges field is an Event Emitter
        if (this.debounceSave) {
            // Pipe for Model Debounce
            dataControl.valueChanges.pipe(
                debounce(() => timer(this.debounceTime)),
                catchError(this.handleError)
            ).subscribe((evt: string) => this.modelSave(evt))
            // Pipe for changedExternal
            dataControl.valueChanges.pipe(
                debounce(() => timer(250)),
                catchError(this.handleError)
            ).subscribe((evt: string) => {
                if (this.model.changedExternal) {
                    return
                }
                this.model.changedExternal = true
                this.model.trigger('change')
            })
            // Pipe for outgoingData
            dataControl.valueChanges.forEach(
                (value: string) => this.outgoingData = value
            )
        } else {
            dataControl.valueChanges.forEach(
                (value: string) => this.modelSave(value)
            )
        }
    }

    // ngOnChanges() {
    //     // Display Inputs
    //     if (!this.dev) {
    //         return
    //     }
    //     console.log('inputs:', {
    //         target: this.target,
    //         targetSuffix: this.targetSuffix,
    //         id: this.id,
    //         manifest: this.manifest,
    //         decouple: this.decouple,
    //         direct: this.direct,
    //         api: this.api,
    //         urlRoot: this.urlRoot,
    //     })
    // }

    // ngDoCheck(): void {
    //     console.info('ngDoCheck:', this.dataSub);
    // }

    handleError(err: ObservableInput<any>): ObservableInput<any> {
        console.error(err)
        return err
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
            if (this.dev) {
                console.warn(`[defer] debouncing due to empty subscriber on ${this.uid}`)
            }
            setTimeout(() => {
                if (this.dev) {
                    console.warn(`[defer] debounced subscriber returned on ${this.uid}`)
                }
                this.dataDefer(subscriber)
            }, 250)
            return
        }
        const prevString = _.clone(this.incomingData)
        const dataString = this.dataRef()
        // ensure changes have occurred
        if (prevString === dataString) {
            return
        }
        if (!dataString && (!this.data || !this.data.completed)) {
            if (this.dev) {
                console.warn(`[defer] debouncing subscriber due to unavailable data on ${this.uid}`, this.data)
            }
            setTimeout(() => {
                if (this.dev) {
                    console.warn(`[defer] debounced subscriber returned on ${this.uid}`)
                }
                this.dataDefer(subscriber)
            }, 250)
            return
        }
        if (prevString === dataString) {
            return
        }
        if (this.dev) {
            console.warn(`[subscriber] new value submitted on ${this.uid}:`, dataString)
        }
        this.subscriber.next(dataString)
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): string {
        if (!this.model) {
            return ''
        }
        return this.incomingData = this.model.get(this.property)
    }

    onDataChange() {
        // FIXME: This is not in use due to contextual issues.
        this.dataDefer(this.subscriber)
        this.refresh()
    }

    modelSave(value: string) {
        // Avoid saving until the Model is truly available
        if (!this.model.completed) {
            return
        }

        // This avoids saving if it's the same
        // if (value === this.model.get(this.property)) {
        //     return
        // }

        // This keeps a change log of what's been typed.  I used this for testing purposes,
        // but something this simple could be used for simple UX purposes down the road.
        // this.dataChangeLog.push(value)

        // Save the qualified change!
        this.model.set(this.property, value)

        // Remove the changedExternal flag if using debounceSave
        if (this.debounceSave) {
            this.model.changedExternal = false
        }

        // If enabled, Force Save on Persisted Models
        if (this.forceSave && !_.isEmpty(this.model.getIdentifier())) {
            this.model.save()
        }
    }
}
