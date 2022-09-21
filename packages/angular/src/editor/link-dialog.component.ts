// Angular Core
import {
    // ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit
} from '@angular/core'
import {
    FormBuilder,
    FormGroup
} from '@angular/forms'
import {
    HttpResponse
} from '@angular/common/http'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {
    PageEvent
} from '@angular/material/paginator'
import {
    MatSnackBar
} from '@angular/material/snack-bar'

// RXJS
import {
    Observable, Subscriber
} from 'rxjs'
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
import {cookie} from '@stratusjs/core/environment'

// Services
import {
    BackendService
} from '@stratusjs/angular/backend.service'
import {
    LooseObject
} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'
import {TriggerInterface} from '@stratusjs/angular/core/trigger.interface'

// Extends
import {
    ResponsiveComponent
} from '@stratusjs/angular/core/responsive.component'
import {ContentEntity} from '@stratusjs/angular/data/content.interface'
import {IconOptions, MatIconRegistry} from '@angular/material/icon'
import {DomSanitizer} from '@angular/platform-browser'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'link-dialog'
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
export class LinkDialogComponent extends ResponsiveComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _ = _
    Stratus = Stratus

    // TODO: Move this to its own AutoComplete Component
    // AutoComplete Data
    apiBase = '/Api/Content'
    contentEntities: any[] = []
    dialogLinkForm: FormGroup
    isContentLoading = true
    lastContentQuery: string

    // Pagination Data
    meta: LooseObject
    pageEvent: PageEvent
    limit = 20

    // Model Settings
    model: Model
    property: string

    // Event Settings
    editor: TriggerInterface
    eventManager: TriggerInterface
    eventInsert = true

    // UI Settings
    selected: Array<number> = []

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    // UI Flags
    styled = false

    constructor(
        public dialogRef: MatDialogRef<LinkDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LinkDialogData,
        private fb: FormBuilder,
        private backend: BackendService,
        private snackBar: MatSnackBar,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef
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

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${parentModuleName}/${moduleName}.component${min}.css`)
            .then(() => {
                this.styled = true
                this.refresh()
            })
            .catch((err: any) => {
                console.warn('Issue detected in CSS Loader for Component:', this)
                console.error(err)
                this.styled = true
                this.refresh()
            })

        // SVG Icons
        _.forEach({
            selector_delete: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/delete.svg`,
            selector_edit: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/edit.svg`
        }, (value, key) => this.iconRegistry.addSvgIcon(key, this.sanitizer.bypassSecurityTrustResourceUrl(value)).getNamedSvgIcon(key))

        // Hoist Data
        this.model = this.data.model
        this.property = this.data.property
        this.editor = this.data.editor
        this.eventManager = this.data.eventManager
        if (_.isBoolean(this.data.eventInsert)) {
            this.eventInsert = this.data.eventInsert
        }

        // TODO: Move this to its own AutoComplete Component
        // AutoComplete Logic
        this.dialogLinkForm = this.fb.group({
            linkQueryInput: ''
        })
        this.dialogLinkForm
            .get('linkQueryInput')
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => {
                    // this.isContentLoading = true
                }),
                switchMap((value: any) => {
                        return this.getQuery(value)
                    }
                )
            )
            .subscribe((response: HttpResponse<any>) => this.processContent(response))

        // Initialize Link Query with starter data
        this.getQuery().subscribe(
            (response: HttpResponse<any>) => this.processContent(response)
        )

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        this.refresh()
    }

    onCancelClick(): void {
        this.dialogRef.close()
        this.refresh()
    }

    onPage(event: PageEvent): void {
        this.pageEvent = event
        this.getQuery(this.lastContentQuery).subscribe(
            (response: HttpResponse<any>) => this.processContent(response)
        )
    }

    getQueryUrl(query?: string): string {
        let limit = this.limit
        let paging = 1
        if (this.pageEvent) {
            limit = this.pageEvent.pageSize
            paging = this.pageEvent.pageIndex + 1
        }
        query = (_.isString(query) && !_.isEmpty(query)) ? `"${query}"` : ''
        return `${this.apiBase}?limit=${limit}&p=${paging}&q=${query}`
    }

    getQuery(query?: string): Observable<HttpResponse<any>> {
        this.lastContentQuery = query
        this.isContentLoading = true
        return this.backend.get(this.getQueryUrl(query))
            .pipe(
                finalize(() => this.isContentLoading = false),
            )
    }

    processContent(response: HttpResponse<any>): any[] {
        if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
            this.meta = {}
            this.contentEntities = []
            this.refresh()
            return this.contentEntities
        }
        this.meta = _.get(response.body, 'meta') || {}
        const payload = _.get(response.body, 'payload') || response.body
        if (_.isEmpty(payload) || !Array.isArray(payload)) {
            this.contentEntities = []
            this.isContentLoading = false
            this.refresh()
            return this.contentEntities
        }
        this.contentEntities = payload
        this.isContentLoading = false
        this.refresh()
        return this.contentEntities
    }

    select(content: ContentEntity) {
        if (_.isUndefined(content)) {
            return
        }
        const linkElement = this.createLink(content)
        if (!linkElement) {
            console.warn(`${moduleName}: unable to build link for Content ID: ${content.id}`)
            this.snackBar.open(`Unable to build link for Content ID: ${content.id}.`, 'dismiss', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom'
            })
            return
        }
        this.selected.push(content.id)
        // Add element to the end of the model property
        if (!this.eventInsert) {
            if (!(this.model instanceof Model)) {
                console.warn(`${moduleName}: event manager not available.`)
                return
            }
            if (! _.isString(this.property)) {
                console.warn(`${moduleName}: event manager not available.`)
                return
            }
            console.warn(`${moduleName}: disabling eventInsert is not recommended.`)
            this.model.set(
                this.property,
                this.model.get(this.property) + linkElement
            )
            return
        }
        if (!this.eventManager) {
            console.warn(`${moduleName}: event manager is not set.`)
            return
        }
        this.eventManager.trigger('insert', linkElement, this.editor)
        // close dialog after inserting link
        this.onCancelClick()
    }

    isSelected(content: ContentEntity) : boolean {
        if (_.isUndefined(content)) {
            return
        }
        return _.includes(this.selected, content.id)
    }

    createLink (content: ContentEntity): string|null {
        if (!content) {
            console.warn(`${moduleName}: unable to create link for empty content`)
            return null
        }
        if (!content.contentType || !content.contentType.name) {
            console.warn(`${moduleName}: unable to find content type for content id: ${content.id}`)
            return null
        }
        if (!content.routing || !content.routing.length || !content.routing[0]) {
            console.warn(`${moduleName}: unable to find routing for ${content.contentType.name} id: ${content.id}`)
            return null
        }
        // TODO: Create a UI to choose the desired route for Content that has multiple routes or force the main as default
        if (!content.routing[0].url) {
            console.warn(`${moduleName}: unable to find url for ${content.contentType.name} id: ${content.id}`)
            return null
        }
        if (!content.version) {
            console.warn(`${moduleName}: unable to find content version for ${content.contentType.name} id: ${content.id}`)
            return null
        }
        if (!content.version.title || !content.version.title.length) {
            console.warn(`${moduleName}: unable to find title for ${content.contentType.name} id: ${content.id}`)
            return null
        }

        return `<a href="/${content.routing[0].url}" aria-label="${content.version.title}">${content.version.title}</a>`
    }

    getSvg(url: string, options?: IconOptions): Observable<string> {
        const uid = this.addSvgIcon(url, options)
        return new Observable<string>((subscriber: Subscriber<string>) => {
            this.iconRegistry
                .getNamedSvgIcon(uid)
                .subscribe({
                    /* *
                     next(svg: SVGElement) {
                     console.log(`getSvg(${url}):`, svg)
                     },
                     /* */
                    error(err) {
                        console.error(`getSvg(${url}): ${err}`)
                    },
                    complete() {
                        // console.log(`getSvg(${url}): completed`)
                        subscriber.next(uid)
                    }
                })
        })
    }

    /**
     * This function marks a url safe with the DomSanitizer and returns a uid
     * https://material.angular.io/components/icon/overview#svg-icons
     */
    addSvgIcon(url: string, options?: IconOptions) : string {
        if (url in this.svgIcons) {
            return this.svgIcons[url]
        }
        if (!options) {
            options = {}
        }
        const uid = this.svgIcons[url] = _.uniqueId('selector_svg')
        this.iconRegistry.addSvgIcon(uid, this.sanitizer.bypassSecurityTrustResourceUrl(url), options)
        return uid
    }

    goToUrl(content: ContentEntity) {
        if (!content || !content.contentType) {
            console.error('unable to execute goToUrl() because a valid model content was not provided.')
            return
        }
        window.open(content.contentType.editUrl + '?id=' + content.id, '_blank')
    }
}

// Data Types
export interface LinkDialogData {
    editor: TriggerInterface
    eventManager: TriggerInterface
    eventInsert: boolean
    form: FormGroup,
    model: Model,
    property: string
}
