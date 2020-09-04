// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
} from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup
} from '@angular/forms'

// Angular Material
import {
    MatDialog
} from '@angular/material/dialog'

// External
import {
    Observable,
    ObservableInput,
    Subject,
    Subscriber,
    timer
} from 'rxjs'
import {
    catchError,
    debounce
} from 'rxjs/operators'

// SVG Icons
import {
    DomSanitizer
} from '@angular/platform-browser'
// import {
//     MatIconRegistry
// } from '@angular/material/icon'

// External Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import _ from 'lodash'

// Quill Dependencies
import Quill from 'quill'
import {
    EditorChangeContent,
    EditorChangeSelection
} from 'ngx-quill'

// Components
import {
    RootComponent
} from '@stratusjs/angular/core/root.component'
import {
    MediaDialogComponent,
    MediaDialogData
} from '@stratusjs/angular/editor/media-dialog.component'

// Services
import {Registry} from '@stratusjs/angularjs/services/registry'
import {cookie} from '@stratusjs/core/environment'

// Core Classes
import {
    EventManager
} from '@stratusjs/core/events/eventManager'
import {
    EventBase
} from '@stratusjs/core/events/eventBase'

// Core Interfaces
import {
    TriggerInterface
} from '@stratusjs/angular/core/trigger.interface'

// AngularJS Classes
import {
    Model
} from '@stratusjs/angularjs/services/model'
import {
    Collection
} from '@stratusjs/angularjs/services/collection'
import {
    CodeViewDialogComponent,
    CodeViewDialogData
} from '@stratusjs/angular/editor/code-view-dialog.component'

// Transformers
import {
    keys
} from 'ts-transformer-keys'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'editor'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

// Utility Functions
const has = (object: object, path: string) => _.has(object, path) && !_.isEmpty(_.get(object, path))

// export interface Model {
//     completed: boolean;
//     data: object;
// }

/**
 * @title AutoComplete Selector with Drag&Drop Sorting
 */
@Component({
    // selector: 'sa-selector-component',
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component.css`
    // ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditorComponent extends RootComponent implements OnInit, TriggerInterface { // implements OnInit, OnChanges

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

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

    // Dependencies
    _ = _
    has = has
    log = console.log

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

    // Forms
    form: FormGroup = this.fb.group({
        dataString: new FormControl(),
    })
    dataChangeLog: string[] = []

    // Child Components
    quill: Quill

    constructor(
        // private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private ref: ChangeDetectorRef,
        private elementRef: ElementRef,
        private fb: FormBuilder,
        public dialog: MatDialog,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // SVG Icons
        // iconRegistry.addSvgIcon(
        //     'selector:delete',
        //     sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        // )

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${moduleName}/${moduleName}.component.css`)
            .then(() => {
                this.styled = true
                this.refresh()
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = true
                this.refresh()
            })

        // TODO: Allow more CSS files to get pulled and mark this.styled appropriately
        if (_.has(boot.configuration.paths, 'quill')) {
            const quillDir = `/assets/1/0/bundles/${boot.configuration.paths.quill.replace(/[^/]*$/, '')}`
            Stratus.Internals.CssLoader(`${quillDir}quill.core.css`)
            // Stratus.Internals.CssLoader(`${quillDir}quill.bubble.css`)
            Stratus.Internals.CssLoader(`${quillDir}quill.snow.css`)
        }

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<EditorComponent>())

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
                    // Halt UI Logic when Code View is Open
                    if (this.codeViewIsOpen) {
                        return
                    }
                    // Refresh Quill
                    // if (this.quill) {
                    //     this.quill.update('user')
                    // }
                    // TODO: Add a debounce so we don't attempt to update multiple times while the model is changing.
                    // this.refresh()
                    // FIXME: Somehow this doesn't completely work...  It gets data from the model
                    // when it is changed, but won't propagate it when the form event changes the data.
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // Declare Observable with Subscriber (Only Happens Once)
        this.dataSub = new Observable(subscriber => this.dataDefer(subscriber))
        this.dataSub.pipe(
            debounce(() => timer(500)),
            catchError(this.handleError)
        ).subscribe(evt => {
            // While the editor is focused, we skip the debounce updates to avoid cursor glitches
            if (this.focused) {
                return
            }
            // TODO: This may need to only work on blur and not focus, unless it is the initialization value
            const dataControl = this.form.get('dataString')
            if (dataControl.value === evt) {
                // In the case of data being edited by the code view or something else,
                // we need to refresh the UI, as long as it has been initialized.
                // FIXME: This doesn't work
                // if (this.initialized) {
                //     this.refresh()
                // }
                return
            }
            dataControl.patchValue(evt)
            // Note: A refresh may be necessary if things become less responsive
            // this.refresh()
        })

        // console.info('constructor!');
    }

    ngOnInit() {
        this.initialized = true
        // console.info(`${moduleName}.ngOnInit`)
        const dataControl = this.form.get('dataString')
        // This valueChanges field is an Event Emitter
        dataControl.valueChanges.forEach(
            (value: string) => {
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

                // Normalize null values to empty strings to maintain consistent typing.
                if (value === null) {
                    value = ''
                }

                // Save the qualified change!
                this.model.set(this.property, value)
            }
        )
    }

    // ngOnChanges() {
    //     // Display Inputs
    //     if (!cookie('env')) {
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

    public refresh() {
        if (!this.ref) {
            console.error('ref not available:', this)
            return
        }
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

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
            return
        }
        const dataString = this.dataRef()
        if (!dataString) {
            setTimeout(() => {
                this.dataDefer(subscriber)
            }, 500)
            return
        }
        // console.log('pushed value to subscriber.')
        this.subscriber.next(dataString)
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): string {
        if (!this.model) {
            return ''
        }
        const data = this.model.get(this.property)
        if (!data) {
            return ''
        }
        if (!_.isString(data)) {
            return ''
        }
        return data
    }

    // selectedModel (observer: any) : any {
    //     if (!this.data) {
    //         this.fetchData().then(function (data: any) {
    //             observer.next(data)
    //         });
    //     }
    //     // data.on('change', () => observer.next(that.dataRef()));
    //     observer.next()
    // }

    onDataChange() {
        // FIXME: This is not in use due to contextual issues.
        this.dataDefer(this.subscriber)
        this.refresh()
    }

    created(quill: Quill) {
        this.quill = quill
        /* *
        quill.on('text-change', (delta, oldDelta, source) => {
            if (source === 'api') {
                console.log('An API call triggered this change.')
            } else if (source === 'user') {
                console.log('A user action triggered this change.')
            }
        })
        /* */
    }

    changedEditor(event: EditorChangeContent | EditorChangeSelection) {
        console.log('editor-change:', event)
    }

    focus($event: any) {
        // console.log('focus', $event)
        this.focused = true
        this.blurred = false
    }

    blur($event: any) {
        // console.log('blur', $event)
        this.focused = false
        this.blurred = true
    }

    bypassHTML(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html)
    }

    trigger(name: string, data: any, callee: TriggerInterface) {
        console.log('editor.trigger:', name, callee)
        if (name === 'media-library') {
            this.openMediaDialog()
        } else if (name === 'code-view') {
            this.openCodeViewDialog()
        }
        // callee.trigger('editor', null, this)
    }

    public openMediaDialog(): void {
        const dialogRef = this.dialog.open(MediaDialogComponent, {
            width: '1000px',
            data: {
                form: this.form,
                model: this.model,
                property: this.property
            }
        })
        this.refresh()

        const that = this
        dialogRef.afterClosed().subscribe((result: MediaDialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            // Refresh Component
            that.refresh()
            // Display output if one exists
            if (cookie('env') && result) {
                console.log('media dialog result:', result)
            }
        })
    }

    public openCodeViewDialog(): void {
        this.codeViewIsOpen = true
        const dialogRef = this.dialog.open(CodeViewDialogComponent, {
            width: '1000px',
            data: {
                form: this.form,
                model: this.model,
                property: this.property
            }
        })
        this.refresh()

        dialogRef.afterClosed().subscribe((result: CodeViewDialogData) => {
            this.codeViewIsOpen = false
            // If result is present, handle it appropriately
            if (!result || _.isEmpty(result)) {
                return
            }
            // FIXME: Even with these triggers and updates, Quill still desyncs from the Code Editor
            // this.model.trigger('change')
            // if (this.quill) {
            //     this.quill.update('user')
            // }
            this.refresh()
            // Display output if one exists
            if (cookie('env') && result) {
                console.log('code view dialog result:', result)
            }
        })
    }
}
