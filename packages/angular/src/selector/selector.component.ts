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
            selector_delete: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/delete.svg`,
            selector_status: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/visibility.svg`,
            selector_edit: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/edit.svg`
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

    goToUrl(model: any) {
        if (!model || !model.contentType) {
            console.error('unable to execute goToUrl() because a valid model content was not provided.')
            return
        }
        window.open(model.contentType.editUrl + '?id=' + model.id, '_blank')
    }

    toggleStatus(model: any) {
        // model is not directly a model, but just a sub entity of content.version.modules
        // so we have to create a special API call to update just this one model
        // 'Content/' + model.id
        let meta = {}
        if (!isUndefined(this.data)) {
            meta = get(this.data, 'meta.data.api')
        }
        const statusOriginal = model.status
        model.status = statusOriginal === 1 ? 0 : 1
        // Create a direct XHR
        const xhr = new XHR({
            method: 'PUT',
            url: '/Api/Content/' + model.id,
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
                    this.refresh().then()
                    return
                }
                // console.log('success[toggleStatus]:', response)
            })
            .catch((error: any) => {
                console.error('error[toggleStatus]:', error)
                model.status = statusOriginal
                this.refresh().then()
            })
        return
    }

    remove(model: any) {
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
