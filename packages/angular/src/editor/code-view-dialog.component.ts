// Angular Core
import {
    // ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    NgZone,
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
    MatDialogRef
} from '@angular/material/dialog'

// Angular CDK
import {
    CdkTextareaAutosize
} from '@angular/cdk/text-field'

// RXJS
import {
    take
} from 'rxjs/operators'

// External
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {cookie} from '@stratusjs/core/environment'

// Services
import {
    Model
} from '@stratusjs/angularjs/services/model'

// Extends
import {
    ResponsiveComponent
} from '@stratusjs/angular/core/responsive.component'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'code-view-dialog'
const parentModuleName = 'editor'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeViewDialogComponent extends ResponsiveComponent implements OnInit {

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
        protected ref: ChangeDetectorRef,
        private fb: FormBuilder,
        private ngZone: NgZone
    ) {
        // Chain constructor
        super()

        // Manually render upon data change
        // ref.detach()
    }

    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // Dependencies
        this._ = _

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component${min}.css`)

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

// Data Types
export interface CodeViewDialogData {
    form: FormGroup,
    model: Model,
    property: string
}
