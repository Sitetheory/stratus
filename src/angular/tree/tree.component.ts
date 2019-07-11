// Angular Core
import {ChangeDetectorRef, Component, Output} from "@angular/core";
import {FormControl} from '@angular/forms';

// CDK
import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {NestedTreeControl} from '@angular/cdk/tree';

// SVG Icons
import {DomSanitizer, ɵDomSanitizerImpl} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

// RXJS
import {Observable, Subject, Subscriber} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {SubjectSubscriber} from "rxjs/internal/Subject";

// External
import * as Stratus from "stratus";
import * as _ from "lodash";

// Local Setup
const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
const systemDir = '@stratus/angular';
const moduleName = 'tree';

// export interface Model {
//     completed: boolean;
//     data: object;
// }

/**
 * @title Tree with Nested Drag&Drop
 */
@Component({
    // selector: 's2-tree-component',
    selector: 's2-tree',
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
    // templateUrl: `${systemDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component.css`
    // ],
})

export class TreeComponent {

    // Basic Component Settings
    title = 'tree-dnd';
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
    model: any;

    // Observable Connection
    dataSub: Observable<[]>;
    onChange = new Subject();
    subscriber: Subscriber<any>;

    // Tree Specific
    treeControl = new NestedTreeControl <any> (node => this.getChildren(node));
    hasChild = (_: number, node: any) => this.getChildren(node).length > 0;

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private ref: ChangeDetectorRef) {

        // Initialization
        this.uid = _.uniqueId('s2_tree_component_');
        Stratus.Instances[this.uid] = this;

        // Hoist Context
        const that = this;

        // Dependencies
        this._ = _;
        this.sanitizer = sanitizer;

        // SVG Icons
        iconRegistry.addSvgIcon(
            'delete',
            sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        );

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`);

        // Data Connections
        this.fetchData()
            .then(function (data: any) {
                if (!data.on) {
                    console.warn('Unable to bind data from Registry!');
                    return
                }
                // Manually render upon model change
                ref.detach();
                data.on('change', function () {
                    that.onDataChange(ref);
                });
                that.onDataChange(ref);
            });

        // Handling Pipes with Promises
        this.dataSub = new Observable((subscriber) => this.dataDefer(subscriber));
    }

    /**
     * @param event
     */
    drop(event: CdkDragDrop<string[]>) {
        const models = this.dataRef();
        if (!models || !models.length) {
            return
        }
        moveItemInArray(models, event.previousIndex, event.currentIndex);
        let priority = 0;
        _.each(models, (model) => model.priority = priority++);
        this.model.trigger('change')
    }

    /**
     * @param model
     */
    remove(model: any) {
        const models = this.dataRef();
        if (!models || !models.length) {
            return
        }
        const index: number = models.indexOf(model);
        if (index === -1) {
            return
        }
        models.splice(index, 1);
        this.model.trigger('change')
    }

    // Data Connections
    async fetchData(): Promise<any> {
        if (!this.fetched) {
            this.fetched = this.registry.fetch(Stratus.Select('#content-menu-primary'), this)
        }
        return this.fetched;
    }

    /**
     * @param subscriber
     */
    dataDefer (subscriber: Subscriber<any>) {
        this.subscriber = subscriber;
        const models = this.dataRef();
        if (models && models.length) {
            subscriber.next(models);
            return;
        }
        setTimeout(() => this.dataDefer(subscriber), 500);
    }

    dataRef(): any {
        if (!this.collection) {
            return [];
        }
        const models = this.collection.models;
        if (!models || !_.isArray(models)) {
            return [];
        }
        return models;
    }

    /**
     * @param ref
     */
    onDataChange (ref: ChangeDetectorRef) {
        // that.prioritize();
        this.dataDefer(this.subscriber);
        ref.detectChanges();
    }

    /**
     * @param model
     */
    getChildren(model: any): any[] {
        if (!model) {
            return [];
        }
        // TODO: Instead of a filter, like this, it would
        return _.filter(this.dataRef(), function (child) {
            const modelId = _.get(model, 'data.id');
            const parentId = _.get(child, 'data.nestParent.id');
            return modelId && parentId && modelId === parentId;
        })
    }
}
