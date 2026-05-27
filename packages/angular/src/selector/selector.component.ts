// Angular Core
import {
    // ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    // OnChanges,
    // OnInit,
    // Output,
    // SecurityContext
} from '@angular/core'
import {FormControl} from '@angular/forms'

// CDK
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop'

// External
import {
    Observable,
    Subject,
    Subscriber
} from 'rxjs'
// import {map, startWith} from 'rxjs/operators'

// SVG Icons
import {DomSanitizer} from '@angular/platform-browser'
import {IconOptions, MatIconRegistry} from '@angular/material/icon'

// External Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    forEach,
    get,
    has,
    head,
    isArray,
    isEmpty,
    isObject,
    isString,
    isUndefined,
    snakeCase,
    uniqueId
} from 'lodash'
import {keys} from 'ts-transformer-keys'
import {cookie} from '@stratusjs/core/environment'

// Components
import {RootComponent} from '../core/root.component'

// Services
import {Registry} from '@stratusjs/angularjs/services/registry'

// Core Classes
import {EventManager} from '@stratusjs/core/events/eventManager'
import {EventBase} from '@stratusjs/core/events/eventBase'

// AngularJS Classes
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'

import {XHR} from '@stratusjs/core/datastore/xhr'
import {LooseObject} from '@stratusjs/core/misc'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'selector'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

// Utility Functions
const hasNotEmpty = (object: object, path: string) => has(object, path) && !isEmpty(get(object, path))

// export interface Model {
//     completed: boolean;
//     data: object;
// }

/**
 * @title AutoComplete Selector with Drag&Drop Sorting
 */
@Component({
    // selector: 'sa-selector-component',
    selector: `sa-internal-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component${min}.css`
    // ],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectorComponent extends RootComponent { // implements OnInit, OnChanges {

    // Basic Component Settings
    title = moduleName + '_component'

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
    @Input() ignorePriority: boolean

    // Dependencies
    get = get
    has = hasNotEmpty
    log = console.log
    Stratus = Stratus

    // Forms
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

    // API Connectivity for Selector
    // filteredModels: Observable<[]>;
    // filteredModels: any;

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    // UI Flags
    styled = false
    empty = false
    syndicationHydration: {
        [key: string]: Promise<any>
    } = {}
    staleModelIds: {
        [key: string]: boolean
    } = {}
    selectedModelDisplayData: {
        [key: string]: LooseObject
    } = {}

    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = uniqueId(`sa_${snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // Declare Observable with Subscriber (Only Happens Once)
        this.dataSub = new Observable(subscriber => this.dataDefer(subscriber))

        // SVG Icons
        forEach({
            selector_delete: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/minus.svg`,
            selector_status: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/visibility.svg`,
            selector_duplicate: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/duplicate.svg`,
            selector_edit: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/edit.svg`,
            selector_refresh: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/refresh.svg`,
            selector_publish: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/publish.svg`,
            selector_permanent_delete: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/delete.svg`
        }, (value, key) => iconRegistry.addSvgIcon(key, sanitizer.bypassSecurityTrustResourceUrl(value)).getNamedSvgIcon(key))

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${moduleName}/${moduleName}.component${min}.css`)
            .then(() => {
                this.styled = true
                this.refresh().then()
            })
            .catch((err: any) => {
                console.warn('Issue detected in CSS Loader for Component:', this)
                console.error(err)
                this.styled = true
                this.refresh().then()
            })

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<SelectorComponent>())

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
                    this.refresh().then()
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // AutoComplete Binding
        // this.filteredModels = this.selectCtrl.valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(value => this._filterModels(value))
        //     );

        // console.info('constructor!');
    }

    // ngOnInit() {
    //     console.info('selector.ngOnInit')
    // }

    // ngOnChanges() {
    //     // Display Inputs
    //     if (!cookie('env')) {
    //         return
    //     }
    //     console.log('inputs:', {
    //         target: this.target,
    //         targetSuffix: this.targetSuffix,
    //         id: this.id,
    //         manifest: this.manifest,
    //         decouple: this.decouple,
    //         direct: this.direct,
    //         api: this.api,
    //         urlRoot: this.urlRoot,
    //     })
    // }

    // ngDoCheck(): void {
    //     console.info('ngDoCheck:', this.dataSub);
    // }

    drop(event: CdkDragDrop<string[]>) {
        const models = this.dataRef()
        if (!models || !models.length) {
            return
        }
        moveItemInArray(models, event.previousIndex, event.currentIndex)
        if (!this.ignorePriority) {
            let priority = 0
            forEach(models, (model: any) => model.priority = priority++)
        }
        this.model.trigger('change')
    }

    hasKnownSyndicatedStatus(model: any): boolean {
        const syndicated = get(model, 'syndicated')
        return !isUndefined(syndicated) && syndicated !== null && syndicated !== ''
    }

    goToUrl(model: any, syndicatedStatus?: any) {
        if (!model || !model.contentType) {
            console.error('unable to execute goToUrl() because a valid model content was not provided.')
            return
        }
        if (!isUndefined(syndicatedStatus) && syndicatedStatus !== null && syndicatedStatus !== '') {
            model.syndicated = Number(syndicatedStatus || 0)
        }
        if (!this.hasKnownSyndicatedStatus(model)) {
            this.setPending(model, true)
            this.fetchSyndication(model)
                .then(() => {
                    this.setPending(model, false)
                    if (this.requiresLocalCopyBeforeEdit(model)) {
                        this.customizeSyndicatedForEdit(model)
                        return
                    }
                    this.openEditWindow(model)
                })
                .catch((error: any) => {
                    console.error('error[goToUrl]: unable to determine syndicated status before editing.', error)
                    this.setPending(model, false)
                    this.refresh().then()
                })
            return
        }
        if (this.requiresLocalCopyBeforeEdit(model)) {
            this.customizeSyndicatedForEdit(model)
            return
        }
        this.openEditWindow(model)
    }

    openEditWindow(model: any) {
        if (!model || !model.contentType || !model.id) {
            console.error('unable to open edit window because a valid model content was not provided.', model)
            return
        }
        this.markStale(model)
        this.emitDataChange()
        window.open(model.contentType.editUrl + '?id=' + model.id, '_blank')
    }

    getContentApiUrl(model: any): string {
        const controller = this.getString(model, 'contentType.controller')
        const target = controller
            ? controller.replace(/\\/g, '/')
            : 'Content'
        return `/Api/${target}/${model.id}`
    }

    getSelectionIndex(model: any): number {
        const models = this.dataRef()
        if (!models || !models.length || !model || !model.id) {
            return -1
        }

        let index: number = models.indexOf(model)
        if (index === -1) {
            const mirrorModels = models
                .map((m: any) => model.id === m.id ? m : null)
                .filter((m: any) => m)
            if (isArray(mirrorModels) && mirrorModels.length) {
                index = models.indexOf(
                    head(mirrorModels)
                )
            }
        }
        return index
    }

    requiresLocalCopyBeforeEdit(model: any): boolean {
        return !!model && Number(get(model, 'syndicated')) === 1
    }

    trackBySelectedModel(index: number, model: any): any {
        return get(model, 'id') || get(model, 'uid') || index
    }

    isStale(model: any): boolean {
        return !!model && (
            !!get(model, '_selectorStale')
            || !!this.staleModelIds[String(get(model, 'id'))]
        )
    }

    markStale(model: any) {
        const id = get(model, 'id')
        if (!isUndefined(id) && id !== null) {
            this.staleModelIds[String(id)] = true
        }
        model._selectorStale = true
    }

    clearStale(model: any) {
        const id = get(model, 'id')
        if (!isUndefined(id) && id !== null) {
            delete this.staleModelIds[String(id)]
        }
        model._selectorStale = false
    }

    cacheSelectedModelDisplayData(model: any) {
        const id = get(model, 'id')
        if (!model || isUndefined(id) || id === null) {
            return
        }
        const key = String(id)
        const cache = this.selectedModelDisplayData[key] || {}
        ;[
            'contentType',
            'description',
            'iconResourcePath',
            'name',
            'overwriteId',
            'routing',
            'siteId',
            'syndicated',
            'type',
            'version'
        ].forEach((field) => {
            const value = get(model, field)
            if (!isUndefined(value) && value !== null) {
                cache[field] = value
            }
        })
        this.selectedModelDisplayData[key] = cache
    }

    hydrateSelectedDisplayData(models: Array<any>) {
        if (!models || !models.length) {
            return
        }
        models.forEach((model: any) => {
            const id = get(model, 'id')
            if (!model || isUndefined(id) || id === null) {
                return
            }
            const cache = this.selectedModelDisplayData[String(id)]
            if (cache) {
                Object.keys(cache).forEach((field) => {
                    const value = get(model, field)
                    if (isUndefined(value) || value === null) {
                        model[field] = cache[field]
                    }
                })
            }
            this.cacheSelectedModelDisplayData(model)
        })
    }

    emitDataChange() {
        this.dataDefer(this.subscriber)
        this.refresh().then()
    }

    applySelectedModelData(model: any, incoming: any, options: LooseObject = {}) {
        if (!model || !isObject(incoming)) {
            return
        }
        const priority = get(model, 'priority')
        const stale = !!get(options, 'stale')
        this.cacheSelectedModelDisplayData(model)
        delete (incoming as any)._selectorPending
        Object.keys(model).forEach((key) => delete model[key])
        Object.assign(model, incoming)
        if (!isUndefined(priority)) {
            model.priority = priority
        }
        model._selectorPending = false
        if (stale) {
            this.markStale(model)
        } else {
            this.clearStale(model)
        }
        this.hydrateSelectedDisplayData([model])
    }

    refreshSelectedModel(model: any) {
        if (!model || !model.id || this.isPending(model)) {
            return
        }
        this.setPending(model, true)
        const xhr = new XHR({
            method: 'GET',
            url: `${this.getContentApiUrl(model)}?forceContext=context&showEditUrl=true&showLayout=true&showRouting=true&showSentinels=true`,
            type: 'application/json'
        })
        xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    console.error('error[refreshSelectedModel]:', response)
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }
                this.applySelectedModelData(model, get(response, 'payload') || response)
                this.emitDataChange()
            })
            .catch((error: any) => {
                console.error('error[refreshSelectedModel]:', error)
                this.setPending(model, false)
                this.refresh().then()
            })
    }

    getSyndicatedStatus(model: any): number {
        this.hydrateSyndication(model)
        return Number(get(model, 'syndicated') || 0)
    }

    hydrateSelectedSyndication(models: Array<any>) {
        if (!models || !models.length) {
            return
        }
        models.forEach((model: any) => this.hydrateSyndication(model))
    }

    hydrateSyndication(model: any) {
        if (!model || !model.id || !model.contentType || this.hasKnownSyndicatedStatus(model)) {
            return
        }
        this.fetchSyndication(model)
            .then(() => this.refresh())
            .catch((error: any) => console.error('error[hydrateSyndication]:', error))
    }

    fetchSyndication(model: any): Promise<any> {
        if (!model || !model.id) {
            return Promise.reject('Invalid model for syndication lookup.')
        }
        const key = String(model.id)
        if (this.syndicationHydration[key]) {
            return this.syndicationHydration[key]
        }
        const xhr = new XHR({
            method: 'GET',
            url: `${this.getContentApiUrl(model)}?forceContext=context&showEditUrl=true&showLayout=true&showRouting=true&showSentinels=true`,
            type: 'application/json'
        })
        this.syndicationHydration[key] = xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    delete this.syndicationHydration[key]
                    return Promise.reject(response)
                }
                const hydrated: any = get(response, 'payload') || response
                const originalId = Number(get(model, 'id'))
                const hydratedId = Number(get(hydrated, 'id'))
                const originalPriority = get(model, 'priority')
                const overwriteId = get(hydrated, 'overwriteId')
                const isLocalOverwrite = hydratedId
                    && hydratedId !== originalId
                    && (
                        Number(get(hydrated, 'syndicated')) === 2
                        || (!isUndefined(overwriteId) && Number(overwriteId) === originalId)
                    )
                if (isLocalOverwrite) {
                    Object.assign(model, hydrated)
                    if (!isUndefined(originalPriority)) {
                        model.priority = originalPriority
                    }
                }
                model.syndicated = Number(get(model, 'syndicated') || get(hydrated, 'syndicated') || 0)
                if (!isUndefined(get(hydrated, 'siteId'))) {
                    model.siteId = get(hydrated, 'siteId')
                }
                return isLocalOverwrite ? model : hydrated
            })
            .catch((error: any) => {
                delete this.syndicationHydration[key]
                return Promise.reject(error)
            })
        return this.syndicationHydration[key]
    }

    customizeSyndicatedForEdit(
        model: any,
        payloadPatch: LooseObject = {},
        options: LooseObject = {}
    ) {
        if (this.isPending(model)) {
            return
        }
        const openEditWindow = isUndefined(options.openEditWindow) ? true : !!options.openEditWindow
        const models = this.dataRef()
        const index = this.getSelectionIndex(model)
        if (!models || !models.length || !model || !model.id || index === -1) {
            console.error('unable to customize syndicated model from selection:', model, models)
            if (typeof options.onFailure === 'function') {
                options.onFailure()
            }
            this.refresh().then()
            return
        }

        let meta: LooseObject = {}
        if (!isUndefined(this.data)) {
            meta = Object.assign({}, get(this.data, 'meta.data.api') || {})
        }
        delete meta.apiSpecialAction
        meta.forceContext = meta.forceContext || 'context'
        meta.showAssociatedContent = true
        meta.showEditUrl = true
        meta.showLayout = true
        meta.showRouting = true
        meta.showSentinels = true
        this.setPending(model, true)

        const originalId = Number(model.id)
        const payload = Object.assign({}, model, payloadPatch || {})
        delete payload._selectorPending

        const xhr = new XHR({
            method: 'PUT',
            url: this.getContentApiUrl(model),
            data: {
                route: {},
                meta,
                payload
            },
            type: 'application/json'
        })
        xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    console.error('error[customizeSyndicatedForEdit]:', response)
                    if (typeof options.onFailure === 'function') {
                        options.onFailure()
                    }
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }

                const customized: any = get(response, 'payload') || response
                const customizedId = Number(get(customized, 'id'))
                const overwriteId = get(customized, 'overwriteId')
                const overwritesOriginal = !isUndefined(overwriteId)
                    ? Number(overwriteId) === originalId
                    : Number(get(customized, 'syndicated')) === 2
                if (!isObject(customized) || !customizedId || customizedId === originalId || !overwritesOriginal) {
                    console.error('error[customizeSyndicatedForEdit]: syndication save did not return a local overwrite record.', response)
                    if (typeof options.onFailure === 'function') {
                        options.onFailure()
                    }
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }

                ;(customized as any).priority = get(model, 'priority')
                this.applySelectedModelData(model, customized, {stale: openEditWindow})
                if (models[index] !== model) {
                    models.splice(index, 1, model)
                }
                this.prioritize()
                this.model.trigger('change')
                this.emitDataChange()
                if (openEditWindow) {
                    this.openEditWindow(model)
                }
            })
            .catch((error: any) => {
                console.error('error[customizeSyndicatedForEdit]:', error)
                if (typeof options.onFailure === 'function') {
                    options.onFailure()
                }
                this.setPending(model, false)
                this.refresh().then()
            })
    }

    toggleStatus(model: any) {
        if (this.isPending(model)) {
            return
        }
        if (!this.hasKnownSyndicatedStatus(model)) {
            this.setPending(model, true)
            this.fetchSyndication(model)
                .then(() => {
                    this.setPending(model, false)
                    this.toggleStatus(model)
                })
                .catch((error: any) => {
                    console.error('error[toggleStatus]: unable to determine syndicated status before toggling status.', error)
                    this.setPending(model, false)
                    this.refresh().then()
                })
            return
        }
        // model is not directly a model, but just a sub entity of content.version.modules
        // so we have to create a special API call to update just this one model
        // 'Content/' + model.id
        let meta = {}
        if (!isUndefined(this.data)) {
            meta = get(this.data, 'meta.data.api')
        }
        const statusOriginal = model.status
        const statusTarget = statusOriginal === 1 ? 0 : 1
        if (this.requiresLocalCopyBeforeEdit(model)) {
            this.customizeSyndicatedForEdit(
                model,
                {status: statusTarget},
                {
                    openEditWindow: false,
                    onFailure: () => model.status = statusOriginal
                }
            )
            return
        }
        model.status = statusOriginal === 1 ? 0 : 1
        this.setPending(model, true)
        // Create a direct XHR
        const xhr = new XHR({
            method: 'PUT',
            url: this.getContentApiUrl(model),
            data: {
                route: {},
                meta,
                payload: {
                    status: model.status
                }
            },
            type: 'application/json'
        })
        xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    console.error('error[toggleStatus]:', response)
                    model.status = statusOriginal
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }
                // console.log('success[toggleStatus]:', response)
                this.setPending(model, false)
                this.emitDataChange()
            })
            .catch((error: any) => {
                console.error('error[toggleStatus]:', error)
                model.status = statusOriginal
                this.setPending(model, false)
                this.refresh().then()
            })
        return
    }

    duplicate(model: any) {
        if (this.isPending(model)) {
            return
        }
        const models = this.dataRef()
        if (!models || !models.length || !model || !model.id) {
            console.error('unable to duplicate model from selection:', model, models)
            this.refresh().then()
            return
        }

        let index: number = models.indexOf(model)
        if (index === -1) {
            const mirrorModels = models
                .map((m: any) => model.id === m.id ? m : null)
                .filter((m: any) => m)
            if (isArray(mirrorModels) && mirrorModels.length) {
                index = models.indexOf(
                    head(mirrorModels)
                )
            }
        }

        if (index === -1) {
            console.error('unable to find model:', model, 'in selection:', models)
            return
        }

        let meta: LooseObject = {}
        if (!isUndefined(this.data)) {
            meta = Object.assign({}, get(this.data, 'meta.data.api') || {})
        }
        meta.apiSpecialAction = 'duplicate'
        this.setPending(model, true)

        const xhr = new XHR({
            method: 'PUT',
            url: this.getContentApiUrl(model),
            data: {
                route: {},
                meta,
                payload: model
            },
            type: 'application/json'
        })
        xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    console.error('error[duplicate]:', response)
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }

                const duplicated = get(response, 'payload') || response
                if (!isObject(duplicated) || !get(duplicated, 'id') || get(duplicated, 'id') === model.id) {
                    console.error('error[duplicate]: duplicate response did not include a new content id.', response)
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }

                models.splice(index + 1, 0, duplicated)
                this.prioritize()
                this.setPending(model, false)
                this.model.trigger('change')
                this.refresh().then()
            })
            .catch((error: any) => {
                console.error('error[duplicate]:', error)
                this.setPending(model, false)
                this.refresh().then()
            })
        return
    }

    publish(model: any) {
        if (this.isPending(model) || this.isPublished(model)) {
            return
        }

        const publishedOriginal = get(model, 'version.published')
        this.setPending(model, true)

        const xhr = new XHR({
            method: 'PUT',
            url: this.getContentApiUrl(model),
            data: {
                route: {},
                meta: {
                    forceContext: 'context',
                    showMeta: true,
                    showRouting: true
                },
                payload: {
                    id: model.id,
                    version: {
                        id: get(model, 'version.id'),
                        timePublish: 'API::NOW'
                    }
                }
            },
            type: 'application/json'
        })
        xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    console.error('error[publish]:', response)
                    if (model.version) {
                        model.version.published = publishedOriginal
                    }
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }
                const publishedModel = get(response, 'payload')
                if (isObject(publishedModel) && model.version) {
                    model.version.published = get(publishedModel, 'version.published', 1)
                    model.version.timePublish = get(publishedModel, 'version.timePublish', model.version.timePublish)
                } else if (model.version) {
                    model.version.published = 1
                }
                this.setPending(model, false)
                this.refresh().then()
            })
            .catch((error: any) => {
                console.error('error[publish]:', error)
                if (model.version) {
                    model.version.published = publishedOriginal
                }
                this.setPending(model, false)
                this.refresh().then()
            })
    }

    deleteContent(model: any) {
        if (this.isPending(model)) {
            return
        }
        if (this.requiresLocalCopyBeforeEdit(model)) {
            return
        }
        if (!window.confirm(`Delete this ${this.contentTypeName(model)} from the entire site?`)) {
            return
        }

        const statusOriginal = model.status
        let meta = {}
        if (!isUndefined(this.data)) {
            meta = get(this.data, 'meta.data.api') || {}
        }
        this.setPending(model, true)
        model.status = -1

        const xhr = new XHR({
            method: 'PUT',
            url: this.getContentApiUrl(model),
            data: {
                route: {},
                meta,
                payload: {
                    id: model.id,
                    status: -1
                }
            },
            type: 'application/json'
        })
        xhr.send()
            .then((response: LooseObject | Array<LooseObject> | string) => {
                if (!isObject(response) || get(response, 'meta.status[0].code') !== 'SUCCESS') {
                    console.error('error[deleteContent]:', response)
                    model.status = statusOriginal
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }
                this.setPending(model, false)
                this.remove(model)
                this.refresh().then()
            })
            .catch((error: any) => {
                console.error('error[deleteContent]:', error)
                model.status = statusOriginal
                this.setPending(model, false)
                this.refresh().then()
            })
    }

    remove(model: any) {
        if (this.isPending(model)) {
            return
        }
        const models = this.dataRef()
        if (!models || !models.length) {
            console.error('unable to remove model from selection:', models)
            // Still refresh if empty
            this.refresh().then()
            return
        }
        let index: number = models.indexOf(model)
        // attempt fallback procedure
        if (index === -1) {
            const mirrorModels = models
                .map((m: any) => model.id === m.id ? m : null)
                .filter((m: any) => m)
            if (isArray(mirrorModels) && mirrorModels.length) {
                index = models.indexOf(
                    head(mirrorModels)
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
        this.hydrateSelectedDisplayData(models)
        this.subscriber.next(models)
        /* *
        // FIXME: This gets called twice per cycle...
        if (cookie('env')) {
            console.log('pushed models to subscriber:', models)
        }
        /* */
        this.refresh().then()
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): Array<any> {
        if (!this.model) {
            return []
        }
        const models = this.model.get(this.property)
        if (!models || !isArray(models)) {
            return []
        }
        return models
    }

    getString(object: unknown, property: string): string|null {
        if (!isObject(object)) {
            return null
        }
        const variable = get(object, property)
        if (!isString(variable)) {
            return null
        }
        return variable
    }

    contentTypeName(model: any): string {
        return this.getString(model, 'contentType.name')
            || this.getString(model, 'name')
            || 'content'
    }

    contentTypeDisplay(model: any): string {
        const contentType = this.contentTypeName(model)
        const subtype = this.getString(model, 'type')
        return subtype && subtype !== contentType ? `${contentType}: ${subtype}` : contentType
    }

    selectedImageUrl(model: any): string|null {
        return this.getString(model, 'version.bestImage._thumbnailUrl')
            || this.getString(model, 'version.images[0]._thumbnailUrl')
            || this.getString(model, 'version.images[0].src')
            || this.getString(model, 'version.shellImages[0]._thumbnailUrl')
            || this.getString(model, 'version.shellImages[0].src')
            || this.getString(model, 'version.videos[0].bestImage._thumbnailUrl')
            || this.getString(model, 'version.videos[0]._thumbnailUrl')
            || this.getString(model, 'version.videos[0].src')
    }

    isPublished(model: any): boolean {
        return Number(get(model, 'version.published')) === 1
    }

    isActive(model: any): boolean {
        return Number(get(model, 'status')) === 1
    }

    isPending(model: any): boolean {
        return !!get(model, '_selectorPending')
    }

    setPending(model: any, pending: boolean) {
        if (!model) {
            return
        }
        model._selectorPending = pending
        this.refresh().then()
    }

    // selectedModel (observer: any) : any {
    //     if (!this.data) {
    //         this.fetchData().then(function (data: any) {
    //             observer.next(data)
    //         });
    //     }
    //     // data.on('change', () => observer.next(that.dataRef()));
    //     observer.next()
    // }

    // async selectedModelFetch(observer: any): Promise<[]> {
    //     const that = this;
    //     return new Promise<any>(function (resolve, reject) {
    //         if (that.model) {
    //             resolve(that.dataRef());
    //             return;
    //         }
    //         that.fetchData()
    //             .then(function (data: any) {
    //                 if (!data.completed) {
    //                     console.error('still waiting on XHR!');
    //                     // return;
    //                 }
    //                 resolve(that.dataRef());
    //             })
    //             .catch(function (err: any) {
    //                 console.error("unable to fetch model:", err);
    //                 reject(err)
    //             });
    //     });
    // }

    // private _filterModels(value: string): any {
    //     // return await this.collection.filterAsync(value);
    //     // return await [];
    //     return [];
    // }

    onDataChange() {
        // FIXME: This is not in use due to contextual issues.
        this.prioritize()
        this.dataDefer(this.subscriber)
        this.refresh().then()
    }

    prioritize() {
        const models = this.dataRef()
        if (!models || !models.length) {
            return
        }
        if (!this.ignorePriority) {
            let priority = 0
            forEach(models, (model) => model.priority = priority++)
        }
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
        const uid = this.svgIcons[url] = uniqueId('selector_svg')
        this.iconRegistry.addSvgIcon(uid, this.sanitizer.bypassSecurityTrustResourceUrl(url), options)
        return uid
    }

    // findImage(model: any): string {
    //     const mime = get(model, 'version.images[0].mime');
    //     if (mime === undefined) {
    //         return '';
    //     }
    //     if (mime.indexOf('image') !== -1) {
    //         return get(model, 'version.images[0].src') || get(model, 'version.shellImages[0].src') || '';
    //     } else if (mime.indexOf('video') !== -1) {
    //         return get(model, 'version.images[0].meta.thumbnail_small') || '';
    //     }
    //     return '';
    // }
}
