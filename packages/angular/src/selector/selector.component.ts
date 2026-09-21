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
    cloneDeep,
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
    set,
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
const hasNumericPriority = (value: any): boolean => {
    if (isUndefined(value) || value === null || value === '') {
        return false
    }
    return Number.isFinite(Number(value))
}
const selectorLocalOnlyFields = [
    '_selectorImageUrl',
    '_selectorPending',
    '_selectorStale'
]

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
    @Input() liveEditContext: string

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
    inactiveSelectedModelCache: {
        [key: string]: LooseObject
    } = {}
    removedSelectedModelIds: {
        [key: string]: boolean
    } = {}
    liveEditSourceModels: {
        [key: string]: Array<any>
    } = {}
    selectedModelDisplayData: {
        [key: string]: LooseObject
    } = {}
    removeDeleteDialogModel: any = null
    removeDeleteDialogMode: 'remove'|'delete' = 'remove'

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
            selector_cancel: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/clear.svg`,
            selector_remove_context: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/removeCircle.svg`,
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
        this.bindLiveEditSourceEvents()

        // Data Connections
        this.fetchData()
            .then(data => {
                if (!data || !(data instanceof EventManager)) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                this.ignoreSelectorLocalOnlyFields()
                // Manually render upon model change
                // this.ref.detach();
                const onDataChange = () => {
                    if (!data.completed) {
                        return
                    }
                    // this.onDataChange();
                    this.dataDefer(this.subscriber)
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
        this.prioritize()
        this.model.trigger('change')
        this.emitSelectorCollectionChange('reorder', models)
    }

    isLiveEditSelector(): boolean {
        return this.liveEditContext === 'live-edit'
    }

    isLiveEditModuleSelector(): boolean {
        return this.isLiveEditSelector() && this.property === 'version.modules'
    }

    cacheInactiveSelectedModel(model: any) {
        if (!this.isLiveEditModuleSelector() || !model || !get(model, 'id')) {
            return
        }
        this.forgetRemovedSelectedModel(model)
        if (Number(get(model, 'status')) < 1) {
            this.inactiveSelectedModelCache[String(get(model, 'id'))] = cloneDeep(model)
        }
    }

    syncInactiveSelectedModelCache(model: any) {
        this.forgetRemovedSelectedModel(model)
        if (Number(get(model, 'status')) < 1) {
            this.cacheInactiveSelectedModel(model)
            return
        }
        this.removeInactiveSelectedModelCache(model)
    }

    removeInactiveSelectedModelCache(model: any) {
        const id = get(model, 'id')
        if (!isUndefined(id) && id !== null) {
            delete this.inactiveSelectedModelCache[String(id)]
        }
    }

    removeMissingInactiveSelectedModelCache(models: Array<any>) {
        if (!models) {
            return
        }
        Object.keys(this.inactiveSelectedModelCache).forEach((id: string) => {
            if (!models.some((model: any) => String(get(model, 'id')) === id)) {
                delete this.inactiveSelectedModelCache[id]
            }
        })
    }

    preserveInactiveSelectedModels(models: Array<any>) {
        if (!this.isLiveEditModuleSelector() || !models) {
            return
        }

        models.forEach((model: any) => this.cacheInactiveSelectedModel(model))
        Object.keys(this.inactiveSelectedModelCache).forEach((id: string) => {
            if (models.some((model: any) => String(get(model, 'id')) === id)) {
                return
            }
            if (this.removedSelectedModelIds[id]) {
                return
            }

            const cachedModel = cloneDeep(this.inactiveSelectedModelCache[id])
            this.insertSelectedModelByPriority(models, cachedModel)
            this.syncSelectedModelBaseline(cachedModel, Object.keys(cachedModel).filter((key: string) => key.indexOf('_selector') !== 0))
        })
    }

    selectedModelId(model: any): number {
        return Number(get(model, 'id') || 0)
    }

    markRemovedSelectedModel(model: any) {
        const id = this.selectedModelId(model)
        if (id) {
            this.removedSelectedModelIds[String(id)] = true
        }
        this.removeInactiveSelectedModelCache(model)
    }

    forgetRemovedSelectedModel(model: any) {
        const id = this.selectedModelId(model)
        if (id) {
            delete this.removedSelectedModelIds[String(id)]
        }
    }

    insertSelectedModelByPriority(models: Array<any>, selectedModel: any) {
        const priority = Number(get(selectedModel, 'priority'))
        if (!Number.isFinite(priority)) {
            models.push(selectedModel)
            return
        }
        const insertIndex = models.findIndex((model: any) => {
            const modelPriority = Number(get(model, 'priority'))
            return Number.isFinite(modelPriority) && modelPriority > priority
        })
        models.splice(insertIndex === -1 ? models.length : insertIndex, 0, selectedModel)
    }

    contentPayload(source: any): any {
        if (!source) {
            return null
        }
        const data = source instanceof Model
            ? source.data
            : get(source, 'data') || source
        const payload = get(data, 'payload')
        return isObject(payload) ? payload : data
    }

    parentContentId(): number {
        return Number(
            this.id
            || get(this.contentPayload(this.model), 'id')
            || 0
        )
    }

    liveEditSourceKey(): string {
        return `${this.parentContentId()}:${this.property || ''}`
    }

    bindLiveEditSourceEvents() {
        document.addEventListener('stratus-content-selector-source', this.handleLiveEditSourceChange as EventListener)
    }

    handleLiveEditSourceChange = (event: Event): void => {
        if (!this.isLiveEditModuleSelector()) {
            return
        }
        const detail = (event as CustomEvent)?.detail || {}
        if (
            Number(get(detail, 'parentId') || 0) !== this.parentContentId()
            || get(detail, 'property') !== this.property
            || !isArray(get(detail, 'models'))
        ) {
            return
        }
        this.liveEditSourceModels[this.liveEditSourceKey()] = get(detail, 'models')
        this.emitDataChange()
    }

    liveEditSelectedModulesFromSource(source: any): Array<any>|null {
        const payload = this.contentPayload(source)
        if (!payload || Number(get(payload, 'id') || 0) !== this.parentContentId()) {
            return null
        }
        const modules = get(payload, this.property)
        return isArray(modules) ? modules : null
    }

    collectLiveEditModuleSources(): Array<any> {
        if (!this.isLiveEditModuleSelector()) {
            return []
        }
        const sources: Array<any> = []
        const addSource = (source: any) => {
            const modules = this.liveEditSelectedModulesFromSource(source)
            if (!modules) {
                return
            }
            if (sources.some((existing: any) => this.contentPayload(existing) === this.contentPayload(source))) {
                return
            }
            sources.push(source)
        }

        const angularRef = get(window, 'angular')
        let scope: any = null
        if (angularRef && typeof angularRef.element === 'function') {
            const element = angularRef.element(this.elementRef.nativeElement)
            if (element && typeof element.scope === 'function') {
                scope = element.scope()
            }
        }

        while (scope) {
            addSource(get(scope, 'model'))
            addSource(get(scope, 'liveEdit.model'))
            addSource(get(scope, '$root.liveEdit.model'))
            scope = get(scope, '$parent')
        }

        const sourceModels = this.liveEditSourceModels[this.liveEditSourceKey()]
        if (isArray(sourceModels)) {
            addSource({
                id: this.parentContentId(),
                version: {
                    modules: sourceModels
                }
            })
        }

        forEach(Stratus.Instances, (instance: any) => {
            const liveEditParentId = Number(get(instance, 'liveEditParentId') || get(instance, '$ctrl.liveEditParentId') || 0)
            const liveEditProperty = get(instance, 'liveEditProperty') || get(instance, '$ctrl.liveEditProperty')
            const liveEditNgModel = get(instance, '$ctrl.ngModel') || get(instance, 'ngModel')
            if (
                liveEditParentId !== this.parentContentId()
                || liveEditProperty !== this.property
                || !isArray(liveEditNgModel)
            ) {
                return
            }
            addSource({
                id: liveEditParentId,
                version: {
                    modules: liveEditNgModel
                }
            })
        })

        return sources
    }

    ngOnDestroy() {
        document.removeEventListener('stratus-content-selector-source', this.handleLiveEditSourceChange as EventListener)
        delete Stratus.Instances[this.uid]
    }

    mergeLiveEditSelectedModels(models: Array<any>) {
        if (!this.isLiveEditModuleSelector() || !models) {
            return
        }

        const currentModelsById: {[key: string]: any} = {}
        models.forEach((model: any) => {
            const id = this.selectedModelId(model)
            if (id) {
                currentModelsById[String(id)] = model
            }
        })

        this.collectLiveEditModuleSources().forEach((source: any) => {
            const sourceModels = this.liveEditSelectedModulesFromSource(source)
            if (!sourceModels) {
                return
            }
            sourceModels.forEach((sourceModel: any) => {
                const id = this.selectedModelId(sourceModel)
                if (!id || this.removedSelectedModelIds[String(id)]) {
                    return
                }
                const currentModel = currentModelsById[String(id)]
                if (currentModel) {
                    if (has(sourceModel, 'status')) {
                        currentModel.status = cloneDeep(get(sourceModel, 'status'))
                    }
                    if (has(sourceModel, 'priority')) {
                        currentModel.priority = cloneDeep(get(sourceModel, 'priority'))
                    }
                    this.syncInactiveSelectedModelCache(currentModel)
                    return
                }

                const selectedModel = cloneDeep(sourceModel)
                this.insertSelectedModelByPriority(models, selectedModel)
                currentModelsById[String(id)] = selectedModel
                this.syncInactiveSelectedModelCache(selectedModel)
                this.syncSelectedModelBaseline(selectedModel, Object.keys(selectedModel).filter((key: string) => key.indexOf('_selector') !== 0))
            })
        })
    }

    emitSelectorCollectionChange(action = 'change', models = this.dataRef()) {
        if (this.isLiveEditModuleSelector()) {
            if (action.indexOf('remove') === 0 || action.indexOf('delete') === 0) {
                this.removeMissingInactiveSelectedModelCache(models)
            } else {
                this.mergeLiveEditSelectedModels(models)
                this.preserveInactiveSelectedModels(models)
            }
        }
        this.elementRef.nativeElement.dispatchEvent(new CustomEvent('stratus-selector-reordered', {
            bubbles: true,
            composed: true,
            detail: {
                action,
                model: this.model,
                models,
                property: this.property
            }
        }))
    }

    emitSelectorLiveEditAction(action: string, model: any, additionalDetail: LooseObject = {}): boolean {
        const event = new CustomEvent('stratus-selector-live-edit-action', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                action,
                model,
                parentModel: this.model,
                models: this.dataRef(),
                property: this.property,
                ...additionalDetail
            }
        })
        this.elementRef.nativeElement.dispatchEvent(event)
        return event.defaultPrevented
    }

    emitSelectorItemChange(action: string, model: any, data: any = model) {
        this.elementRef.nativeElement.dispatchEvent(new CustomEvent('stratus-selector-item-changed', {
            bubbles: true,
            composed: true,
            detail: {
                action,
                model,
                data,
                parentModel: this.model,
                models: this.dataRef(),
                property: this.property
            }
        }))
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
        if (this.isLiveEditSelector()) {
            if (!this.emitSelectorLiveEditAction('edit', model)) {
                console.warn('Unable to open selector content in live edit drawer because no live edit handler accepted the action.', model)
            }
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
        const previousVersion = isObject(cache.version) ? cloneDeep(cache.version) : null
        const imageUrl = this.selectedImageUrlFromSource(model)
        if (imageUrl) {
            cache._selectorImageUrl = imageUrl
        }
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
                cache[field] = cloneDeep(value)
            }
        })
        if (previousVersion && isObject(cache.version)) {
            this.preserveSelectedVersionMedia(cache.version, previousVersion)
        }
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
                        model[field] = cloneDeep(cache[field])
                    }
                })
                if (isObject(model.version) && isObject(cache.version)) {
                    this.preserveSelectedVersionMedia(model.version, cache.version)
                }
            }
            this.cacheSelectedModelDisplayData(model)
        })
    }

    preserveSelectedVersionMedia(targetVersion: any, cachedVersion: any) {
        ;[
            'bestImage',
            'images',
            'shellImages',
            'videos'
        ].forEach((field) => {
            const current = get(targetVersion, field)
            const cached = get(cachedVersion, field)
            if (
                (isUndefined(current) || current === null || (isArray(current) && !current.length) || (isObject(current) && isEmpty(current)))
                && !isUndefined(cached)
                && cached !== null
                && (!isArray(cached) || cached.length)
                && (!isObject(cached) || !isEmpty(cached))
            ) {
                set(targetVersion, field, cloneDeep(cached))
            }
        })
    }

    emitDataChange() {
        this.dataDefer(this.subscriber)
        this.refresh().then()
    }

    ignoreSelectorLocalOnlyFields() {
        const parentModel: any = this.model
        if (!parentModel || !isArray(parentModel.ignoreKeys)) {
            return
        }
        selectorLocalOnlyFields.forEach((key: string) => {
            if (parentModel.ignoreKeys.indexOf(key) === -1) {
                parentModel.ignoreKeys.push(key)
            }
        })
    }

    syncSelectedModelBaseline(model: any, fields: Array<string>) {
        const parentModel: any = this.model
        const id = Number(get(model, 'id') || 0)
        if (!parentModel || !id || !fields.length) {
            return
        }
        const insertByPriority = (models: Array<any>, baselineModel: any): void => {
            const priority = Number(get(baselineModel, 'priority'))
            if (!Number.isFinite(priority)) {
                models.push(baselineModel)
                return
            }
            const index = models.findIndex((item: any) => {
                const itemPriority = Number(get(item, 'priority'))
                return Number.isFinite(itemPriority) && itemPriority > priority
            })
            models.splice(index === -1 ? models.length : index, 0, baselineModel)
        }
        ;['recv', 'sent'].forEach((baselineKey: string) => {
            const baseline = get(parentModel, baselineKey)
            let models = get(baseline, this.property)
            if (!isArray(models)) {
                set(baseline, this.property, [])
                models = get(baseline, this.property)
            }
            let baselineModel = models.find((item: any) => Number(get(item, 'id') || 0) === id)
            if (!baselineModel) {
                baselineModel = cloneDeep(model)
                insertByPriority(models, baselineModel)
            }
            fields.forEach((field: string) => {
                if (has(model, field)) {
                    set(baselineModel, field, cloneDeep(get(model, field)))
                }
            })
        })
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
        const emitDataChange = isUndefined(options.emitDataChange) ? true : !!options.emitDataChange
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
                if (emitDataChange) {
                    this.emitDataChange()
                }
                if (this.isLiveEditSelector()) {
                    this.emitSelectorCollectionChange(options.liveEditAction || 'customize', models)
                    this.emitSelectorItemChange(options.liveEditAction || 'customize', model, model)
                }
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
        // model is not directly a model, but just a sub entity of content.version.modules
        // so we have to create a special API call to update just this one model
        // 'Content/' + model.id
        let meta: LooseObject = {}
        if (!isUndefined(this.data)) {
            meta = Object.assign({}, get(this.data, 'meta.data.api') || {})
        }
        delete meta.apiSpecialAction
        meta.forceContext = meta.forceContext || 'context'
        meta.minStatus = 0
        meta.showAssociatedContent = true
        meta.showEditUrl = true
        meta.showLayout = true
        meta.showRouting = true
        meta.showSentinels = true
        const statusOriginal = model.status
        const statusTarget = statusOriginal === 1 ? 0 : 1
        if (this.requiresLocalCopyBeforeEdit(model)) {
            model.status = statusTarget
            this.syncInactiveSelectedModelCache(model)
            this.syncSelectedModelBaseline(model, ['status'])
            this.emitSelectorItemChange('status', model, model)
            this.customizeSyndicatedForEdit(
                model,
                {status: statusTarget},
                {
                    emitDataChange: false,
                    liveEditAction: 'status',
                    openEditWindow: false,
                    onFailure: () => {
                        model.status = statusOriginal
                        this.syncInactiveSelectedModelCache(model)
                        this.syncSelectedModelBaseline(model, ['status'])
                        this.emitSelectorItemChange('status', model, model)
                    }
                }
            )
            return
        }
        model.status = statusOriginal === 1 ? 0 : 1
        this.syncInactiveSelectedModelCache(model)
        this.syncSelectedModelBaseline(model, ['status'])
        this.emitSelectorItemChange('status', model, model)
        this.setPending(model, true)
        // Create a direct XHR
        const xhr = new XHR({
            method: 'PUT',
            url: this.getContentApiUrl(model),
            data: {
                route: {},
                meta,
                payload: {
                    id: model.id,
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
                    this.syncInactiveSelectedModelCache(model)
                    this.syncSelectedModelBaseline(model, ['status'])
                    this.emitSelectorItemChange('status', model, model)
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }
                // console.log('success[toggleStatus]:', response)
                const payload = get(response, 'payload') || response
                model.status = Number(get(payload, 'status', model.status))
                ;[
                    'id',
                    'overwriteId',
                    'siteId',
                    'syndicated'
                ].forEach((field) => {
                    const value = get(payload, field)
                    if (!isUndefined(value) && value !== null) {
                        model[field] = value
                    }
                })
                this.syncInactiveSelectedModelCache(model)
                this.syncSelectedModelBaseline(model, ['status'])
                this.setPending(model, false)
                this.emitSelectorItemChange('status', model, model)
            })
            .catch((error: any) => {
                console.error('error[toggleStatus]:', error)
                model.status = statusOriginal
                this.syncInactiveSelectedModelCache(model)
                this.syncSelectedModelBaseline(model, ['status'])
                this.emitSelectorItemChange('status', model, model)
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
                this.emitSelectorCollectionChange('duplicate', models)
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

    openRemoveDeleteDialog(model: any) {
        if (!model || this.isPending(model)) {
            return
        }
        if (this.isLiveEditSelector()) {
            const handled = this.emitSelectorLiveEditAction('remove-delete', model, {
                identity: this.contentIdentity(model),
                contextLabel: this.removeContextLabel(),
                canDelete: this.canDeleteFromSite(model),
                deleteDisabledReason: this.deleteFromSiteDisabledReason(model),
                complete: (action: 'remove'|'delete') => {
                    if (action === 'remove') {
                        this.remove(model)
                    } else if (action === 'delete') {
                        this.deleteContent(model, true)
                    }
                }
            })
            if (handled) {
                return
            }
        }
        this.removeDeleteDialogModel = model
        this.removeDeleteDialogMode = 'remove'
        this.refresh().then()
    }

    closeRemoveDeleteDialog() {
        this.removeDeleteDialogModel = null
        this.removeDeleteDialogMode = 'remove'
        this.refresh().then()
    }

    showRemoveDeleteDialogRemove() {
        this.removeDeleteDialogMode = 'remove'
        this.refresh().then()
    }

    showRemoveDeleteDialogDelete() {
        if (!this.canDeleteFromSite(this.removeDeleteDialogModel)) {
            return
        }
        this.removeDeleteDialogMode = 'delete'
        this.refresh().then()
    }

    trapRemoveDeleteDialogFocus(event: KeyboardEvent) {
        if (!this.removeDeleteDialogModel) {
            return
        }
        if (event.key === 'Escape') {
            event.preventDefault()
            if (this.removeDeleteDialogMode === 'delete') {
                this.showRemoveDeleteDialogRemove()
                return
            }
            this.closeRemoveDeleteDialog()
            return
        }
        if (event.key !== 'Tab') {
            return
        }

        const target = event.currentTarget as HTMLElement|null
        const panel = target?.querySelector(
            this.removeDeleteDialogMode === 'delete'
                ? '.selector-remove-delete-dialog__panel-delete'
                : '.selector-remove-delete-dialog__panel-remove'
        ) as HTMLElement|null
        if (!panel) {
            return
        }

        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((element) => !!(
            element.offsetWidth
            || element.offsetHeight
            || element.getClientRects().length
        ))

        if (!focusable.length) {
            event.preventDefault()
            return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement|null
        if (event.shiftKey && active === first) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && active === last) {
            event.preventDefault()
            first.focus()
        }
    }

    confirmRemoveDeleteDialogRemove() {
        const model = this.removeDeleteDialogModel
        this.closeRemoveDeleteDialog()
        this.remove(model)
    }

    confirmRemoveDeleteDialogDelete() {
        const model = this.removeDeleteDialogModel
        this.closeRemoveDeleteDialog()
        this.deleteContent(model, true)
    }

    canDeleteFromSite(model: any): boolean {
        return !!model && !this.requiresLocalCopyBeforeEdit(model)
    }

    deleteFromSiteDisabledReason(model: any): string {
        return this.canDeleteFromSite(model)
            ? ''
            : 'Syndicated content cannot be deleted, instead you can disable the status to hide it.'
    }

    removeContextLabel(): 'Page'|'Collection' {
        const routing = this.model && typeof this.model.get === 'function'
            ? this.model.get('routing')
            : get(this.model, 'data.routing')
        return isArray(routing) && routing.length ? 'Page' : 'Collection'
    }

    contentDisplayName(model: any): string {
        return this.getString(model, 'version.bestIdentifier')
            || this.getString(model, 'version.title')
            || this.getString(model, 'name')
            || this.getString(model, 'version.internalIdentifier')
            || `Untitled ${this.contentTypeName(model)}`
    }

    contentIdentity(model: any): string {
        const id = get(model, 'id')
        return `"${this.contentDisplayName(model)}"${id ? ` (#${id})` : ''}`
    }

    deleteContent(model: any, confirmed = false) {
        if (this.isPending(model)) {
            return
        }
        if (this.requiresLocalCopyBeforeEdit(model)) {
            return
        }
        if (!confirmed) {
            this.openRemoveDeleteDialog(model)
            this.showRemoveDeleteDialogDelete()
            return
        }

        const statusOriginal = model.status
        const models = this.dataRef()
        const index = this.getSelectionIndex(model)
        const removedFromSelection = index !== -1
        let meta = {}
        if (!isUndefined(this.data)) {
            meta = get(this.data, 'meta.data.api') || {}
        }
        this.setPending(model, true)
        model.status = -1
        this.markRemovedSelectedModel(model)
        if (removedFromSelection) {
            models.splice(index, 1)
            this.model.trigger('change')
            this.emitSelectorCollectionChange('delete', models)
        }

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
                    this.syncInactiveSelectedModelCache(model)
                    if (removedFromSelection) {
                        models.splice(index, 0, model)
                        this.model.trigger('change')
                        this.emitSelectorCollectionChange('delete-rollback', models)
                    }
                    this.setPending(model, false)
                    this.refresh().then()
                    return
                }
                this.setPending(model, false)
            })
            .catch((error: any) => {
                console.error('error[deleteContent]:', error)
                model.status = statusOriginal
                this.syncInactiveSelectedModelCache(model)
                if (removedFromSelection) {
                    models.splice(index, 0, model)
                    this.model.trigger('change')
                    this.emitSelectorCollectionChange('delete-rollback', models)
                }
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
        this.markRemovedSelectedModel(model)
        models.splice(index, 1)
        // this.prioritize();
        this.model.trigger('change')
        this.emitSelectorCollectionChange('remove', models)
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
        this.mergeLiveEditSelectedModels(models)
        this.preserveInactiveSelectedModels(models)
        this.sortByPriority(models)
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
        const modelImageUrl = this.selectedImageUrlFromSource(model)
        if (modelImageUrl) {
            return modelImageUrl
        }
        const id = get(model, 'id')
        const cache = !isUndefined(id) && id !== null
            ? this.selectedModelDisplayData[String(id)]
            : null
        return this.selectedImageUrlFromSource(cache)
            || this.getString(cache, '_selectorImageUrl')
    }

    selectedImageUrlFromSource(model: any): string|null {
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
        this.dataDefer(this.subscriber)
        this.refresh().then()
    }

    prioritize() {
        const models = this.dataRef()
        if (!models || !models.length) {
            return
        }
        if (!this.ignorePriority) {
            forEach(models, (model, index) => model.priority = index)
        }
    }

    sortByPriority(models = this.dataRef()) {
        if (!models || !models.length || this.ignorePriority) {
            return
        }
        models.sort((current: any, next: any): number => {
            const currentPriority = get(current, 'priority')
            const nextPriority = get(next, 'priority')
            const currentHasPriority = hasNumericPriority(currentPriority)
            const nextHasPriority = hasNumericPriority(nextPriority)

            if (currentHasPriority && nextHasPriority && Number(currentPriority) !== Number(nextPriority)) {
                return Number(currentPriority) - Number(nextPriority)
            }
            if (currentHasPriority !== nextHasPriority) {
                return currentHasPriority ? -1 : 1
            }

            return Number(get(current, 'id') || 0) - Number(get(next, 'id') || 0)
        })
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
