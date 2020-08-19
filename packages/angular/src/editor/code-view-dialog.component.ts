// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    NgZone,
    OnChanges,
    OnInit,
    ViewChild
} from '@angular/core'
import {
    FormBuilder, FormControl,
    FormGroup
} from '@angular/forms'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef
} from '@angular/material/dialog'

// Angular CDK
import {
    CdkTextareaAutosize
} from '@angular/cdk/text-field'

// RXJS
import {
    debounceTime,
    finalize,
    switchMap,
    take,
    tap
} from 'rxjs/operators'

// External
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'

// Services
import {
    LooseObject
} from '@stratusjs/core/misc'
import {
    Model
} from '@stratusjs/angularjs/services/model'

// Data Types
export interface CodeViewDialogData {
    form: FormGroup,
    model: Model,
    property: string
}

// Local Setup
const localDir = `/assets/1/0/bundles/${boot.configuration.paths['@stratusjs/angular/*'].replace(/[^/]*$/, '')}`
const systemDir = '@stratusjs/angular'
const moduleName = 'code-view-dialog'
const parentModuleName = 'editor'

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeViewDialogComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    // Forms
    form: FormGroup = this.fb.group({
        dataString: new FormControl(),
    })

    // Model Settings
    model: Model
    property: string

    // External Component Options
    monacoOptions = {
        theme: 'vs-dark',
        language: 'html'
    }

    // View Children
    @ViewChild('autosize') autosize: CdkTextareaAutosize
    // @ViewChild('codeEditor') codeEditor: ElementRef

    constructor(
        public dialogRef: MatDialogRef<CodeViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CodeViewDialogData,
        private ref: ChangeDetectorRef,
        private fb: FormBuilder,
        private ngZone: NgZone
    ) {
        // Manually render upon data change
        // ref.detach()
    }

    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // Dependencies
        this._ = _

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component.css`)

        // Hoist Data
        this.model = this.data.model
        this.property = this.data.property

        // Initialize Form Data
        const dataControl = this.form.get('dataString')
        dataControl.patchValue(this.model.get(this.property))

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

                // Normalize null values to empty strings to maintain consistent typing.
                if (value === null) {
                    value = ''
                }

                // TODO: Debounce this logic!

                // Save the qualified change!
                this.model.set(this.property, value)
            }
        )

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        this.refresh()
    }

    public refresh() {
        if (!this.ref) {
            console.error('ref not available:', this)
            return
        }
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

    onCancelClick(): void {
        this.dialogRef.close()
        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        this.refresh()
    }

    triggerResize() {
        // Wait for changes to be applied, then trigger textarea resize.
        this.ngZone.onStable.pipe(take(1))
            .subscribe(() => this.autosize.resizeToFitContent(true))
    }
}
