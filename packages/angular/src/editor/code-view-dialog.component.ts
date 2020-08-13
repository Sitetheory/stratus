// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    OnChanges
} from '@angular/core'
import {
    FormBuilder,
    FormGroup
} from '@angular/forms'
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef
} from '@angular/material/dialog'

// RXJS
import {
    debounceTime,
    finalize,
    switchMap,
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
export interface CodeViewDialogData extends LooseObject {
    form: FormGroup,
    model: Model,
    property: string
}
export interface Content extends LooseObject {
    id?: number
    route?: string
    version?: {
        title?: string
    }
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

    // Form Data
    dialogCodeViewForm: FormGroup

    // filteredParentOptions: any[]
    // dialogParentForm: FormGroup
    // isParentLoading = false
    // lastParentSelectorQuery: string

    constructor(
        public dialogRef: MatDialogRef<CodeViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CodeViewDialogData,
        private ref: ChangeDetectorRef
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
}
