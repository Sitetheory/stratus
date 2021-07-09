// Angular Core
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input
} from '@angular/core'
import {FormControl} from '@angular/forms'

// CDK
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop'

// RXJS
import {
    Observable,
    Subject,
    Subscriber
} from 'rxjs'
// import {map, startWith} from 'rxjs/operators'

// SVG Icons
import {DomSanitizer} from '@angular/platform-browser'
import {MatIconRegistry} from '@angular/material/icon'
import {IconOptions} from '@angular/material/icon/icon-registry'

// External Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import _ from 'lodash'
import {keys} from 'ts-transformer-keys'

// Components
import {RootComponent} from '@stratusjs/angular/core/root.component'

// Services
import {Registry} from '@stratusjs/angularjs/services/registry'

// Core Classes
import {EventManager} from '@stratusjs/core/events/eventManager'
import {EventBase} from '@stratusjs/core/events/eventBase'
// import {cookie} from '@stratusjs/core/environment'

// AngularJS Classes
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'media-selector'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

// Utility Functions
const has = (object: object, path: string) => _.has(object, path) && !_.isEmpty(_.get(object, path))

/**
 * @title Media Selector with Drag & Drop Uploads and Sorting
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component.css`
    // ],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaSelectorComponent extends RootComponent { // implements OnInit, OnChanges {

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
    @Input() type: string
    @Input() property: string
    @Input() endpoint: string

    // Dependencies
    _ = _
    has = has
    log = console.log
    selectCtrl = new FormControl()

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

    // Multi-Framework Event Connectivity
    eventID: string

    // API Connectivity for Media Selector
    // filteredModels: Observable<[]>;
    // filteredModels: any;

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    // UI Flags
    styled = false
    empty = false
    libraryDisplay = false
    isSelector = true

    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // Declare Observable with Subscriber (Only Happens Once)
        this.dataSub = new Observable(subscriber => this.dataDefer(subscriber))

        // SVG Icons
        _.forEach({
            // action buttons
            media_selector_add: '/assets/1/0/bundles/sitetheorycore/images/icons/actionButtons/add.svg',
            media_selector_clear: '/assets/1/0/bundles/sitetheorycore/images/icons/actionButtons/clear.svg',
            media_selector_delete: '/assets/1/0/bundles/sitetheorycore/images/icons/actionButtons/delete.svg',
            media_selector_edit: '/assets/1/0/bundles/sitetheorycore/images/icons/actionButtons/edit.svg',
            media_selector_info: '/assets/1/0/bundles/sitetheorycore/images/icons/actionButtons/info.svg',
            // type icons
            media_selector_image: '/assets/1/0/bundles/sitetheorymedia/images/mediaTypeIcons/media-icon-image.svg',
            media_selector_video: '/assets/1/0/bundles/sitetheorymedia/images/mediaTypeIcons/media-icon-video.svg',
            media_selector_audio: '/assets/1/0/bundles/sitetheorymedia/images/mediaTypeIcons/media-icon-audio.svg',
            media_selector_document: '/assets/1/0/bundles/sitetheorymedia/images/mediaTypeIcons/media-icon-document.svg'
        }, (value, key) => iconRegistry.addSvgIcon(key, sanitizer.bypassSecurityTrustResourceUrl(value)).getNamedSvgIcon(key))

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${moduleName}/${moduleName}.component.css`)
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

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<MediaSelectorComponent>())

        // Declare Event ID (based on data from hydrated elementRefs above)
        this.eventID = `${this.target}:${this.id}:${this.property}`

        // Outside of production, print events for this component
        // if (cookie('env')) {
        //     const events: string[] = [
        //         this.eventID,
        //         `${this.eventID}:toggleLibrary`
        //     ]
        //     events.forEach(
        //         el => Stratus.Environment.on(el, (ev: EventBase, data: any) => console.log(el, '->', data))
        //     )
        // }

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
                    this.prioritize()
                    this.refresh()
                }
                data.on('change', onDataChange)
                onDataChange()
            })
    }

    drop(event: CdkDragDrop<string[]>) {
        const models = this.dataRef()
        if (!models || !models.length) {
            return
        }
        moveItemInArray(models, event.previousIndex, event.currentIndex)
        let priority = 0
        _.forEach(models, (model: any) => model.priority = priority++)
        this.model.trigger('change')
    }

    goToUrl(model: any) {
        if (!model || !model.contentType) {
            console.error('unable to execute goToUrl() because a valid model content was not provided.')
            return
        }
        window.open(model.contentType.editUrl + '?id=' + model.id, '_blank')
    }

    remove(model: any) {
        const models = this.dataRef()
        if (!models || !models.length) {
            console.error('unable to remove model from selection:', models)
            // Still refresh if empty
            this.refresh()
            return
        }
        let index: number = models.indexOf(model)
        // attempt fallback procedure
        if (index === -1) {
            const mirrorModels = models
                .map((m: any) => model.id === m.id ? m : null)
                .filter((m: any) => m)
            if (_.isArray(mirrorModels) && mirrorModels.length) {
                index = models.indexOf(
                    _.first(mirrorModels)
                )
            }
        }
        // ensure index is available
        if (index === -1) {
            console.error('unable to find model:', model, 'in selection:', models)
            return
        }
        models.splice(index, 1)
        // this.prioritize();
        this.model.trigger('change')
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
        if (!this.subscriber || !this.model || !this.model.completed) {
            setTimeout(() => {
                this.dataDefer(subscriber)
            }, 500)
            return
        }
        const models = this.dataRef()
        this.empty = !models.length
        this.subscriber.next(models)
        /* *
        // FIXME: This gets called twice per cycle...
        if (cookie('env')) {
            console.log('pushed models to subscriber:', models)
        }
        /* */
        this.refresh()
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): Array<any> {
        if (!this.model) {
            return []
        }
        const models = this.model.get(this.property)
        if (!models || !_.isArray(models)) {
            return []
        }
        return models
    }

    onDataChange() {
        // FIXME: This is not in use due to contextual issues.
        this.prioritize()
        this.dataDefer(this.subscriber)
        this.refresh()
    }

    prioritize() {
        const models = this.dataRef()
        if (!models || !models.length) {
            return
        }
        let priority = 0
        _.forEach(models, (model) => model.priority = priority++)
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
        const uid = this.svgIcons[url] = _.uniqueId('media_selector_svg')
        this.iconRegistry.addSvgIcon(uid, this.sanitizer.bypassSecurityTrustResourceUrl(url), options)
        return uid
    }

    toggleLibrary() {
        this.libraryDisplay = !this.libraryDisplay
        Stratus.Environment.trigger(this.eventID, 'toggleLibrary')
        Stratus.Environment.trigger(`${this.eventID}:toggleLibrary`, this.libraryDisplay)
    }

    showDetails(model: any) {
        Stratus.Environment.trigger(this.eventID, 'showDetails')
        Stratus.Environment.trigger(`${this.eventID}:showDetails`, model)
    }

    deleteMedia(model: any) {
        Stratus.Environment.trigger(this.eventID, 'deleteMedia')
        Stratus.Environment.trigger(`${this.eventID}:deleteMedia`, model)
    }

    removeFromSelected(model: any) {
        Stratus.Environment.trigger(this.eventID, 'removeFromSelected')
        Stratus.Environment.trigger(`${this.eventID}:removeFromSelected`, model)
    }
}
