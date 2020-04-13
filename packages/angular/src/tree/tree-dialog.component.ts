// Angular Core
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, OnChanges} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog'

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
export interface DialogData {
    id: number
    name: string
    target: string
    level: string
    content: any
    url: string
    model: any
    collection: any
    parent: any
    nestParent: any
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
const moduleName = 'tree-dialog'
const parentModuleName = 'tree'

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeDialogComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    // TODO: Move this to its own AutoComplete Component
    // AutoComplete Data
    filteredContentOptions: any[]
    dialogContentForm: FormGroup
    isContentLoading = false
    lastContentSelectorQuery: string

    // filteredParentOptions: any[]
    // dialogParentForm: FormGroup
    // isParentLoading = false
    // lastParentSelectorQuery: string

    constructor(
        public dialogRef: MatDialogRef<TreeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
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
        this.dialogContentForm = this.fb.group({
            contentSelectorInput: this.data.content
        })
        this.dialogContentForm
            .get('contentSelectorInput')
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => this.isContentLoading = true),
                switchMap((value: any) => {
                        if (_.isString(value)) {
                            this.lastContentSelectorQuery = `/Api/Content?options[showCollection]=null&q=${value}`
                        } else {
                            this.data.content = value
                            this.data.url = null
                        }
                        return this.backend.get(this.lastContentSelectorQuery)
                            .pipe(
                                finalize(() => this.isContentLoading = false),
                            )
                    }
                )
            )
            .subscribe((response: any) => {
                if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
                    this.filteredContentOptions = []
                    // FIXME: We have to go in this roundabout way to force changes to be detected since the
                    // Dialog Sub-Components don't seem to have the write timing for ngOnInit
                    this.ref.detach()
                    this.ref.detectChanges()
                    this.ref.reattach()
                    return this.filteredContentOptions
                }
                const payload = _.get(response.body, 'payload') || response.body
                if (_.isEmpty(payload) || !Array.isArray(payload)) {
                    this.filteredContentOptions = []
                    // FIXME: We have to go in this roundabout way to force changes to be detected since the
                    // Dialog Sub-Components don't seem to have the write timing for ngOnInit
                    this.ref.detach()
                    this.ref.detectChanges()
                    this.ref.reattach()
                    return this.filteredContentOptions
                }
                this.filteredContentOptions = payload
                // FIXME: We have to go in this roundabout way to force changes to be detected since the
                // Dialog Sub-Components don't seem to have the write timing for ngOnInit
                this.ref.detach()
                this.ref.detectChanges()
                this.ref.reattach()
                return this.filteredContentOptions
            })

        // this.dialogParentForm = this.fb.group({
        //     parentSelectorInput: this.data.nestParent
        // })
        //
        // this.dialogParentForm
        //     .get('parentSelectorInput')
        //     .valueChanges
        //     .pipe(
        //         debounceTime(300),
        //         tap(() => this.isParentLoading = true),
        //         switchMap(value => {
        //                 if (_.isString(value)) {
        //                     this.lastParentSelectorQuery = `/Api/MenuLink?q=${value}`
        //                 } else {
        //                     this.data.nestParent = value
        //                 }
        //                 return this.backend.get(this.lastParentSelectorQuery)
        //                     .pipe(
        //                         finalize(() => this.isParentLoading = false),
        //                     )
        //             }
        //         )
        //     )
        //     .subscribe(response => {
        //         if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
        //             return this.filteredParentOptions = []
        //         }
        //         const payload = _.get(response.body, 'payload') || response.body
        //         if (_.isEmpty(payload) || !Array.isArray(payload)) {
        //             return this.filteredParentOptions = []
        //         }
        //         return this.filteredParentOptions = payload
        //     })

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the write timing for ngOnInit
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

    onCancelClick(): void {
        this.dialogRef.close()
        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the write timing for ngOnInit
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

    displayContentText(content: Content) {
        // Ensure Content is Selected before Display Text
        if (!content) {
            return
        }
        // Routing Fallback
        const routing = _.get(content, 'routing[0].url')
        const routingText = routing ? `/${routing}` : null
        // ContentId Fallback
        const contentId = _.get(content, 'id')
        const contentIdText = contentId ? `Content: ${contentId}` : null
        // Return Version Title or Fallback Text
        return _.get(content, 'version.title') || routingText || contentIdText
    }

    // displayName(option: any) {
    //     if (option) {
    //         return _.get(option, 'name')
    //     }
    // }
}
