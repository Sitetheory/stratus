// Angular Core
import {Component, Output} from "@angular/core";
import {FormControl} from '@angular/forms';

// CDK
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

// External
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

// SVG Icons
import {DomSanitizer, ɵDomSanitizerImpl} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

import * as Stratus from "stratus";
import * as _ from "lodash";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';

// export interface Model {
//     completed: boolean;
//     data: object;
// }

/**
 * @title AutoComplete Selector with Drag&Drop Sorting
 */
@Component({
    selector: 's2-selector',
    templateUrl: `${localDir}/selector/selector.component.html`,
    styleUrls: [
        `${localDir}/selector/selector.component.css`
    ],
})

export class SelectorComponent {

    // Basic Component Settings
    title = 'selector-dnd';
    uid: string;

    // Dependencies
    _: any;
    sanitizer: DomSanitizer;
    selectCtrl = new FormControl();

    // Stratus Data Connectivity
    registry = new Stratus.Data.Registry();
    fetched: any;
    data: any;
    collection: any;
    // @Output() model: any;
    model: any;

    // Observable Connection
    selectedModels: Observable<[]>;

    // API Endpoint for Selector
    // TODO: Avoid hard-coding this...
    url = '/Api/Content?q=value&options["showRouting"]';
    target = 'Content';

    // API Connectivity for Selector
    // filteredModels: Observable<[]>;
    // filteredModels: any;

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {

        // Initialization
        this.uid = _.uniqueId('s2_selector_component_');
        Stratus.Instances[this.uid] = this;

        // Dependencies
        this._ = _;
        this.sanitizer = sanitizer;

        // SVG Icons
        iconRegistry.addSvgIcon(
            'delete',
            sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        );

        // Data Connections
        this.fetchModel();
            // .then(function (data: any) {
            //     console.log('S2 Selector Model:', data)
            // });

        // Handling Pipes with Promises
        this.selectedModels = new Observable((observer) => this.selectedModelDefer(observer));

        // AutoComplete Binding
        // this.filteredModels = this.selectCtrl.valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(value => this._filterModels(value))
        //     );

        // console.info('constructor!');
    }

    // ngOnInit(): void {
    //     console.info('ngOnInit!');
    // }

    // ngDoCheck(): void {
    //     console.info('ngDoCheck:', this.selectedModels);
    // }

    /**
     * @param event
     */
    drop(event: CdkDragDrop<string[]>) {
        const models = this.selectedModelRef();
        if (!models || !models.length) {
            return
        }
        moveItemInArray(models, event.previousIndex, event.currentIndex);
        let priority = 0;
        _.each(models, (model) => model.priority = priority++);
        // this.model.set('version.modules', models);
    }

    /**
     * @param model
     */
    remove(model: any) {
        // console.log('remove:', model, 'from:', this.collection ? this.collection.models : [])
    }

    // Data Connections
    async fetchModel(): Promise<any> {
        if (!this.fetched) {
            this.fetched = this.registry.fetch(Stratus.Select('#widget-edit-entity'), this)
        }
        return this.fetched;
    }

    selectedModelDefer (observer: any) {
        const models = this.selectedModelRef();
        if (models && models.length) {
            observer.next(models);
            return;
        }
        setTimeout(() => this.selectedModelDefer(observer), 500);
    }

    selectedModelRef(): any {
        if (!this.model) {
            return []
        }
        const models = this.model.get("version.modules");
        if (!models || !_.isArray(models)) {
            return []
        }
        return models;
    }

    // selectedModel (observer: any) : any {
    //     if (!this.data) {
    //         this.fetchModel().then(function (data: any) {
    //             observer.next(data)
    //         });
    //     }
    //     // data.on('change', () => observer.next(that.selectedModelRef()));
    //     observer.next()
    // }

    // async selectedModelFetch(observer: any): Promise<[]> {
    //     const that = this;
    //     return new Promise(function (resolve, reject) {
    //         if (that.model) {
    //             resolve(that.selectedModelRef());
    //             return;
    //         }
    //         that.fetchModel()
    //             .then(function (data: any) {
    //                 if (!data.completed) {
    //                     console.error('still waiting on XHR!');
    //                     // return;
    //                 }
    //                 resolve(that.selectedModelRef());
    //             })
    //             .catch(function (err: any) {
    //                 console.error("unable to fetch model:", err);
    //                 reject(err)
    //             });
    //     });
    // }

    /**
     * @param value
     * @private
     */
    // private _filterModels(value: string): any {
    //     // return await this.collection.filterAsync(value);
    //     // return await [];
    //     return [];
    // }

    findImage(model: any) {
        const mime = _.get(model, 'version.images[0].mime');
        if (mime === undefined) {
            return ''
        }
        if (mime.indexOf('image') !== -1) {
            return _.get(model, 'version.images[0].src');
        } else if (mime.indexOf('video') !== -1) {
            return _.get(model, 'version.images[0].meta.thumbnail_small');
        }
        return ''
    }
}
