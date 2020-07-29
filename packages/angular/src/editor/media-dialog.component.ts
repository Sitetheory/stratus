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
import {Stratus} from '@stratusjs/runtime/stratus'

// Services
import {BackendService} from '@stratusjs/angular/backend.service'
import {LooseObject} from '@stratusjs/core/misc'

// Data Types
export interface MediaDialogData extends LooseObject {
    foo: string
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
const moduleName = 'media-dialog'
const parentModuleName = 'editor'

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaDialogComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    // TODO: Move this to its own AutoComplete Component
    // AutoComplete Data
    mediaEntities: any[]
    dialogMediaForm: FormGroup
    isContentLoading = false
    lastMediaQuery: string

    // filteredParentOptions: any[]
    // dialogParentForm: FormGroup
    // isParentLoading = false
    // lastParentSelectorQuery: string

    constructor(
        public dialogRef: MatDialogRef<MediaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MediaDialogData,
        private fb: FormBuilder,
        private backend: BackendService,
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

        // TODO: Move this to its own AutoComplete Component
        // AutoComplete Logic
        this.dialogMediaForm = this.fb.group({
            mediaQueryInput: ''
        })
        this.dialogMediaForm
            .get('mediaQueryInput')
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => this.isContentLoading = true),
                switchMap((value: any) => {
                        if (_.isString(value)) {
                            this.lastMediaQuery = `/Api/Media?q=${value}`
                        } else {
                            this.data.content = value
                            this.data.url = null
                        }
                        return this.backend.get(this.lastMediaQuery)
                            .pipe(
                                finalize(() => this.isContentLoading = false),
                            )
                    }
                )
            )
            .subscribe((response: any) => {
                if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
                    this.mediaEntities = []
                    // FIXME: We have to go in this roundabout way to force changes to be detected since the
                    // Dialog Sub-Components don't seem to have the right timing for ngOnInit
                    this.refresh()
                    return this.mediaEntities
                }
                const payload = _.get(response.body, 'payload') || response.body
                if (_.isEmpty(payload) || !Array.isArray(payload)) {
                    this.mediaEntities = []
                    // FIXME: We have to go in this roundabout way to force changes to be detected since the
                    // Dialog Sub-Components don't seem to have the right timing for ngOnInit
                    this.refresh()
                    return this.mediaEntities
                }
                this.mediaEntities = payload
                // FIXME: We have to go in this roundabout way to force changes to be detected since the
                // Dialog Sub-Components don't seem to have the right timing for ngOnInit
                this.refresh()
                return this.mediaEntities
            })

        // TODO: Initialize MediaQuery with Empty Input

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
