// Angular Core
import {ChangeDetectorRef, Component, Inject, Output} from '@angular/core';
import {FormControl} from '@angular/forms';

// CDK
import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NestedTreeControl} from '@angular/cdk/tree';

// Material
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

// SVG Icons
import {DomSanitizer, ɵDomSanitizerImpl} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

// RXJS
import {Observable, Subject, Subscriber} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {SubjectSubscriber} from 'rxjs/internal/Subject';

// External
import * as Stratus from 'stratus';
import * as _ from 'lodash';

// Local Setup
const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
const systemDir = '@stratus/angular';
const moduleName = 'tree';

export interface Node {
    model: object;
    child: Node[];
}

export interface NodeMap {
    [key: number]: Node;
}

// export interface Model {
//     completed: boolean;
//     data: object;
// }

export interface DialogData {
    id: number;
    name: string;
    target: string;
    content: any;
    url: string;
    collection: any;
    parent: any;
    nestParent: any;
}

@Component({
    selector: 's2-tree-dialog',
    templateUrl: `${localDir}/${moduleName}/${moduleName}.dialog.html`,
})
export class TreeDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<TreeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onCancelClick(): void {
        this.dialogRef.close();
    }
}

/**
 * @title Tree with Nested Drag&Drop
 */
@Component({
    selector: 's2-tree',
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
    // templateUrl: `${systemDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
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
    // sanitizer: DomSanitizer;
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
    treeMap: NodeMap;
    // treeControl = new NestedTreeControl <any> (node => this.getChild(node));
    treeControl = new NestedTreeControl <any> (node => node.child || []);
    // hasChild = (index: number, node: any) => this.getChild(node).length > 0;
    hasChild = (index: number, node: any) => node.child && node.child.length > 0;

    constructor(
        public iconRegistry: MatIconRegistry,
        public sanitizer: DomSanitizer,
        public dialog: MatDialog,
        private ref: ChangeDetectorRef
    ) {

        // Initialization
        this.uid = _.uniqueId('s2_tree_component_');
        Stratus.Instances[this.uid] = this;

        // Hoist Context
        const that = this;

        // Dependencies
        this._ = _;

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
            .then((data: any) => {
                if (!data.on) {
                    console.warn('Unable to bind data from Registry!');
                    return;
                }
                // Manually render upon data change
                // ref.detach();
                data.on('change', () => {
                    if (!data.completed) {
                        return;
                    }
                    console.log('Tree collection changed!');
                    // that.onDataChange(ref);
                    // that.dataDefer(that.subscriber);
                    // ref.detectChanges();
                });
                // that.onDataChange(ref);
                // that.dataDefer(that.subscriber);
                // ref.detectChanges();
            });

        // Handling Pipes with Promises
        this.dataSub = new Observable((subscriber) => this.dataDefer(subscriber));
    }

    drop(event: CdkDragDrop<string[]>) {
        const models = this.dataRef();
        if (!models || !models.length) {
            return;
        }
        // TODO: Allow Multi-Level Priorities
        moveItemInArray(models, event.previousIndex, event.currentIndex);
        let priority = 0;
        _.each(models, (model) => model.priority = priority++);
        this.model.trigger('change');
    }

    remove(model: any) {
        const models = this.dataRef();
        if (!models || !models.length) {
            return;
        }
        // TODO: Handle Multi-Level Targeting
        const index: number = models.indexOf(model);
        if (index === -1) {
            return;
        }
        models.splice(index, 1);
        this.model.trigger('change');
    }

    // Data Connections
    async fetchData(): Promise<any> {
        if (!this.fetched) {
            this.fetched = this.registry.fetch(Stratus.Select('#content-menu-primary'), this);
        }
        return this.fetched;
    }

    dataDefer(subscriber: Subscriber<any>) {
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
        // Convert Collection Models to Nested Tree to optimize references
        this.treeMap = {};
        const that = this;
        const tree: Array<Node> = [];
        _.each(models, model => {
            const modelId = _.get(model, 'data.id');
            const parentId = _.get(model, 'data.nestParent.id');
            if (!_.has(that.treeMap, modelId)) {
                that.treeMap[modelId] = {
                    model: null,
                    child: []
                };
            }
            that.treeMap[modelId].model = model;
            if (!parentId) {
                tree.push(
                    that.treeMap[modelId]
                );
            } else {
                if (!_.has(that.treeMap, parentId)) {
                    that.treeMap[parentId] = {
                        model: null,
                        child: []
                    };
                }
                that.treeMap[parentId].child.push(
                    that.treeMap[modelId]
                );
            }
        });
        return tree;
    }

    onDataChange(ref: ChangeDetectorRef) {
        // that.prioritize();
        this.dataDefer(this.subscriber);
        ref.detectChanges();
    }

    // getChild(model: any): any[] {
    //     if (!model) {
    //         return [];
    //     }
    //     // TODO: Instead of a filter, like this, it would be better to search the tree
    //     return _.filter(this.dataRef(), function (child) {
    //         const modelId = _.get(model, 'data.id');
    //         const parentId = _.get(child, 'data.nestParent.id');
    //         return modelId && parentId && modelId === parentId;
    //     })
    // }

    openDialog(model: any): void {
        if (!model || !_.has(model, 'data')) {
            return;
        }
        const dialogRef = this.dialog.open(TreeDialogComponent, {
            width: '250px',
            data: {
                id: model.data.id || null,
                name: model.data.name || '',
                target: model.data.url ? 'url' : 'content',
                content: model.data.content || null,
                url: model.data.url || null,
                collection: this.collection || null,
                parent: model.data.parent || null,
                nestParent: model.data.nestParent || null,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            model.set({
                name: result.name,
                content: result.content,
                url: result.url,
            });
            model.save();
        });
    }
}
