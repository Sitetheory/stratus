// Angular Core
import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit
} from '@angular/core'
import {
    FormBuilder,
    FormGroup
} from '@angular/forms'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef
} from '@angular/material/dialog'
import {
    MatIconRegistry
} from '@angular/material/icon'
import {
    IconOptions
} from '@angular/material/icon/icon-registry'

// RXJS
import {
    Observable
} from 'rxjs'
import {
    debounceTime,
    finalize,
    switchMap,
    tap
} from 'rxjs/operators'

// External
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'

// Angular 1 Services
import {Model} from '@stratusjs/angularjs/services/model'

// Services
import {HttpResponse} from '@angular/common/http'
import {BackendService} from '@stratusjs/angular/backend.service'

// Interfaces
import {Convoy} from '@stratusjs/angular/data/convoy.interface'
import {ContentEntity} from '@stratusjs/angular/data/content.interface'

// Components
import {
    TreeComponent
} from '@stratusjs/angular/tree/tree.component'
import {
    ConfirmDialogComponent
} from '@stratusjs/angular/confirm-dialog/confirm-dialog.component'
import { moveItemInArray } from '@angular/cdk/drag-drop'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Data Types
export interface DialogData {
    tree: TreeComponent
    backend: BackendService
    iconRegistry: MatIconRegistry
    id: number
    name: string
    target: string
    level: string
    content: any
    url: string
    model: Model
    collection: Collection
    parent: any
    nestParent: any
    browserTarget: string // '_blank' or null
}

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'tree-dialog'
const parentModuleName = 'tree'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeDialogComponent implements OnInit, OnDestroy {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Timing Flags
    isInitialized = false
    isDestroyed = false
    isStyled = false

    // Dependencies
    _: any

    // Root Component
    tree: TreeComponent

    // Services
    backend: BackendService
    iconRegistry: MatIconRegistry

    // View Elements
    // @ViewChild('nameInput') nameField: ElementRef

    // TODO: Move this to its own AutoComplete Component
    // AutoComplete Data
    filteredContent: Array<ContentEntity>
    dialogContentForm: FormGroup
    isContentLoading = false
    isContentLoaded = false
    lastContentSelectorQuery: string
    basicContentSelectorQuery = '/Api/Content?options[isContent]=null&options[isCollection]=null&options[showRoutable]=true&options[showRouting]=true&q='

    // Normalized Data
    browserTarget: boolean

    // filteredParentOptions: any[]
    // dialogParentForm: FormGroup
    // isParentLoading = false
    // lastParentSelectorQuery: string

    constructor(
        public dialogRef: MatDialogRef<TreeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: FormBuilder,
        private dialog: MatDialog,
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
        // FIXME: This needs to work the same way the selector and editor do, which wait for the CSS until it is marked as "styled"
        Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component.css`)
            .then(() => {
                this.isStyled = true
                // this.refresh()
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.isStyled = true
                // this.refresh()
            })

        // Hoist Components
        this.tree = this.data.tree

        // Hoist Services
        this.backend = this.data.backend
        this.iconRegistry = this.data.iconRegistry

        // Element Focus
        /* *
        if (this.nameField) {
            this.nameField.nativeElement.focus()
        } else {
            console.log('nameField:', this.nameField)
        }
        /* */

        // TODO: Move this to its own AutoComplete Component
        // AutoComplete Logic
        this.dialogContentForm = this.fb.group({
            contentSelectorInput: this.data.content || null
        })
        this.dialogContentForm
            .get('contentSelectorInput')
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => this.isContentLoading = true),
                switchMap((value: any) => {
                        if (_.isString(value)) {
                            this.lastContentSelectorQuery = `${this.basicContentSelectorQuery}${value}`
                        } else {
                            this.data.content = value
                            this.data.url = null
                        }
                        return this.backend.get(this.lastContentSelectorQuery)
                            .pipe(
                                finalize(() => {
                                    this.isContentLoading = false
                                    this.isContentLoaded = true
                                }),
                            )
                    }
                )
            )
            .subscribe((response: HttpResponse<Convoy<ContentEntity>>) => this.handleContent(response))

        // Initialize ContentSelector with Empty Input
        // this.dialogContentForm
        //     .get('contentSelectorInput')
        //     .setValue('')

        // Initial Call for Content
        this.backend
            .get(this.basicContentSelectorQuery)
            .pipe(
                finalize(() => this.isContentLoading = false),
            )
            .subscribe((response: HttpResponse<Convoy<ContentEntity>>) => this.handleContent(response))

        // Handle Parent Selector
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

        // Mark as complete
        this.isInitialized = true

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        // this.refresh()
    }

    ngOnDestroy() {
        this.isDestroyed = true
    }

    public refresh() {
        if (this.isDestroyed) {
            return
        }
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
        // this.refresh()
    }

    onBrowserTargetChange($event: any): void {
        this.data.browserTarget = this.browserTarget ? '_blank' : null
    }

    displayContentText(content: ContentEntity) {
        // Ensure Content is Selected before Display Text
        if (!content) {
            return
        }
        // Routing Display
        const routing = _.get(content, 'routing[0].url')
        const routingText = !_.isUndefined(routing) ? ` (/${routing})` : ' (No route!)'
        // ContentId Fallback
        const contentId = _.get(content, 'id')
        const contentIdText = !_.isUndefined(contentId) ? `Content: ${contentId}` : null
        // Return Version Title or Fallback Text
        return (_.get(content, 'version.title') || contentIdText) + routingText
    }

    // displayName(option: any) {
    //     if (option) {
    //         return _.get(option, 'name')
    //     }
    // }

    private handleContent(response:HttpResponse<Convoy<ContentEntity>>) {
        if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
            this.filteredContent = []
            // FIXME: We have to go in this roundabout way to force changes to be detected since the
            // Dialog Sub-Components don't seem to have the right timing for ngOnInit
            // this.refresh()
            return this.filteredContent
        }
        const payload = _.get(response.body, 'payload') || response.body
        if (_.isEmpty(payload) || !Array.isArray(payload)) {
            this.filteredContent = []
            // FIXME: We have to go in this roundabout way to force changes to be detected since the
            // Dialog Sub-Components don't seem to have the right timing for ngOnInit
            // this.refresh()
            return this.filteredContent
        }
        this.filteredContent = this.selectedOnTop(payload, this.data.content)
        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        // this.refresh()
        return this.filteredContent
    }

    public destroy() {
        this.dialog
            .open(ConfirmDialogComponent, {
                maxWidth: '400px',
                data: {
                    title: 'Delete MenuLink',
                    message: 'Are you sure you want to do this?'
                }
            })
            .afterClosed().subscribe((dialogResult: boolean) => {
                if (!dialogResult) {
                    return
                }
                if (!this.data || !this.data.model) {
                    return
                }
                this.data.model.destroy()
                this.onCancelClick()
            })
    }

    public toggleStatus() {
        if (!this.data || !this.data.model) {
            return
        }
        const model = this.data.model
        model.set('status', model.get('status') ? 0 : 1)
        model.save()
    }

    public isSelected(content: ContentEntity) {
        if (!this.data.content) {
            return false
        }
        return this.data.content.id === content.id
    }

    public getSvg(url: string, options?: IconOptions): Observable<string> {
        return this.tree.getSvg(url, options)
    }

    selectedOnTop(list?: Array<ContentEntity>, selected?: ContentEntity): Array<ContentEntity> {
        if (!list || !list.length) {
            return list
        }
        if (!selected || !selected.id) {
            return list
        }
        const orderedList = _.clone(list)
        const index = list.findIndex((v) => v.id === selected.id)
        if (index === -1) {
            // If Selected is not present, inject as first element
            orderedList.unshift(selected)
            return orderedList
        }
        moveItemInArray(orderedList, index, 0)
        return orderedList
    }
}
