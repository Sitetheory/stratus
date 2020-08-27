// Angular Core
import {
    ChangeDetectionStrategy,
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
    BackendService
} from '@stratusjs/angular/backend.service'
import {
    LooseObject
} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'media-dialog'
const parentModuleName = 'editor'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

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
    isMediaLoading = true
    lastMediaQuery: string

    // Model Settings
    model: Model
    property: string

    // UI Settings
    selected: Array<number> = []

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

        // Hoist Data
        this.model = this.data.model
        this.property = this.data.property

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
                tap(() => {
                    // this.isMediaLoading = true
                }),
                switchMap((value: any) => {
                        if (_.isString(value)) {
                            this.lastMediaQuery = `/Api/Media?q=${value}`
                        }
                        this.isMediaLoading = true
                        return this.backend.get(this.lastMediaQuery)
                            .pipe(
                                finalize(() => this.isMediaLoading = false),
                            )
                    }
                )
            )
            .subscribe((response: HttpResponse<any>) => this.processMedia(response))

        // Initialize Media Query with starter data
        this.lastMediaQuery = `/Api/Media?q=`
        this.backend.get(this.lastMediaQuery)
            .pipe(
                finalize(() => this.isMediaLoading = false),
            )
            .subscribe(
                (response: HttpResponse<any>) => this.processMedia(response)
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
        this.refresh()
    }

    processMedia(response: HttpResponse<any>): any[] {
        if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
            this.mediaEntities = []
            this.refresh()
            return this.mediaEntities
        }
        const payload = _.get(response.body, 'payload') || response.body
        if (_.isEmpty(payload) || !Array.isArray(payload)) {
            this.mediaEntities = []
            this.isMediaLoading = false
            this.refresh()
            return this.mediaEntities
        }
        this.mediaEntities = payload
        this.isMediaLoading = false
        this.refresh()
        return this.mediaEntities
    }

    select(media: Media) {
        if (_.isUndefined(media)) {
            return
        }
        const imageElement = `<img data-stratus-src src="${media.thumbSrc}" alt="${media.name || media.filename}">`
        this.selected.push(media.id)
        this.model.set(
            this.property,
            this.model.get(this.property) + imageElement
        )
    }

    isSelected(media: Media) : boolean {
        if (_.isUndefined(media)) {
            return
        }
        return _.includes(this.selected, media.id)
    }
}

// Data Types
export interface MediaDialogData {
    form: FormGroup,
    model: Model,
    property: string
}
export interface Media extends LooseObject {
    tags?: Array<any>
    images?: Array<any>
    media?: Array<any>
    storageService?: any
    priority?: number
    storageServiceId?: number
    duplicateId?: number
    name: string
    description?: string
    abstract?: any
    embed?: string
    hash: string
    prefix: string
    url?: string
    file: string
    filename: string
    extension: string
    mime: string
    bytes: number
    bytesHuman: string
    ratio: string
    ratioPercent: string
    bestRatio: string
    bestRatioWord: string
    dimensions: string
    service?: any
    serviceMediaId?: number
    meta?: Array<any>
    src: string
    thumbSrc: string
    bestImage?: any
    duration?: any
    autoPlay: boolean
    vr: boolean
    timeCustom?: number
    author?: any
    modules?: Array<any>
    id: number
    siteId?: number
    vendorId?: number
    time: number
    timeEdit: number
    timeStatus?: number
    status: number
    importId?: number
    vendor?: any
    syndicated: number
    isPseudoPriority: boolean
}
