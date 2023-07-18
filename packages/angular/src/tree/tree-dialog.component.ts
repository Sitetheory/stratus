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

// Angular CDK
import {moveItemInArray} from '@angular/cdk/drag-drop'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {
    IconOptions,
    MatIconRegistry
} from '@angular/material/icon'

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
import {cookie} from '@stratusjs/core/environment'

// Angular 1 Services
import {Model} from '@stratusjs/angularjs/services/model'

// Services
import {HttpResponse} from '@angular/common/http'
import {BackendService} from '../backend.service'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Interfaces
import {Convoy} from '../data/convoy.interface'
import {ContentEntity} from '../data/content.interface'

// Components
import {
    TreeComponent
} from './tree.component'
import {
    TreeNodeComponent
} from './tree-node.component'

// Extends
import {
    ResponsiveComponent
} from '../core/responsive.component'

// Data Types
export interface DialogData {
    tree: TreeComponent
    treeNode: TreeNodeComponent
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
const systemDir = '@stratusjs/angular'
const moduleName = 'tree-dialog'
const parentModuleName = 'tree'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeDialogComponent extends ResponsiveComponent implements OnInit, OnDestroy {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Timing Flags
    isInitialized = false
    isDestroyed = false
    isStyled = false

    // Dependencies
    _ = _
    Stratus = Stratus

    // Root Component
    tree: TreeComponent
    treeNode: TreeNodeComponent

    // Services
    backend: BackendService
    iconRegistry: MatIconRegistry

    // View Elements
    // @ViewChild('nameInput') nameField: ElementRef

    // TODO: Move this to its own AutoComplete Component
    // AutoComplete Data
    filteredContent: Array<ContentEntity>
    dialogContentForm: FormGroup

    // API Data
    apiBase = '/Api/Content'
    isSingleContentLoading = false
    limit = 20
    isContentLoading = false
    isContentLoaded = false
    lastContentSelectorQuery: string
    basicContentQueryAttributes = 'options[isContent]=null&options[isCollection]=null&options[showRoutable]=true&options[showRouting]=true'
    contentEntity: ContentEntity

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
        // private dialog: MatDialog,
        protected ref: ChangeDetectorRef
    ) {
        // Chain constructor
        super()

        // Manually render upon data change
        // ref.detach()
    }

    // TODO: Consider making the Custom Link field the default
    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        // FIXME: This needs to work the same way the selector and editor do, which wait for the CSS until it is marked as "styled"
        Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component${min}.css`)
            .then(() => {
                this.isStyled = true
                // this.refresh()
            })
            .catch((err: any) => {
                console.warn('Issue detected in CSS Loader for Component:', this)
                console.error(err)
                this.isStyled = true
                // this.refresh()
            })

        // Hoist Components
        this.tree = this.data.tree
        this.treeNode = this.data.treeNode

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
                            this.lastContentSelectorQuery = this.getQueryUrl(value)
                        } else {
                            // console.log('switchMap value is not a string:', value)
                            this.data.content = value
                            this.data.url = null
                        }
                        return this.backend.get(this.lastContentSelectorQuery || this.getQueryUrl())
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
            .get(this.getQueryUrl())
            .pipe(
                finalize(() => this.isContentLoading = false),
            )
            .subscribe((response: HttpResponse<Convoy<ContentEntity>>) => this.handleContent(response))

        // Hydrate Selected Content
        if (this.data.content && this.data.content.id) {
            this.isSingleContentLoading = true
            this.backend
                .get(
                    this.getQueryUrl(
                        null,
                        this.data.content.id
                    )
                )
                .pipe(
                    finalize(() => this.isSingleContentLoading = false),
                )
                .subscribe((response: HttpResponse<Convoy<ContentEntity>>) => {
                    if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
                        return null
                    }
                    const payload = _.get(response.body, 'payload') || response.body
                    if (_.isEmpty(payload) || Array.isArray(payload) || !_.isObject(payload)) {
                        return null
                    }
                    // @ts-ignore
                    this.contentEntity = payload
                    this.isSingleContentLoading = false
                    this.dialogContentForm
                        .get('contentSelectorInput')
                        .patchValue(this.contentEntity)
                    this.refresh()
                    return this.contentEntity
                })
        }

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
            return new Promise<void>(resolve => resolve())
        }
        return super.refresh()
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
        // this.filteredContent = this.selectedOnTop(payload, this.data.content)
        this.filteredContent = payload
        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        // this.refresh()
        return this.filteredContent
    }

    public destroy(): void {
        this.treeNode.destroy()
            .afterClosed()
            .subscribe((dialogResult: boolean) => {
                if (!dialogResult) {
                    return
                }
                this.onCancelClick()
            })
    }

    public toggleStatus(): void {
        this.treeNode.toggleStatus()
    }

    public addChild(): void {
        this.treeNode.addChild()
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

    getQueryUrl(query?: string, id?: string|number): string {
        query = (!_.isString(query) || _.isEmpty(query)) ? '' : query
        id = !_.isString(id) && !_.isNumber(id) ? '' : `/${id}`
        return `${this.apiBase}${id}?limit=${this.limit}&${this.basicContentQueryAttributes}&q=${query}`
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
