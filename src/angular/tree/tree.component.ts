// Angular Core
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injectable, OnInit, Output} from '@angular/core'
import {HttpResponse} from '@angular/common/http'
import {FormBuilder, FormControl, FormGroup} from '@angular/forms'

// CDK
import {ArrayDataSource} from '@angular/cdk/collections'
import {CdkDragDrop, CdkDragEnter, CdkDragExit, moveItemInArray} from '@angular/cdk/drag-drop'
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree'

// Material
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog'

// SVG Icons
import {DomSanitizer, ɵDomSanitizerImpl} from '@angular/platform-browser'
import {MatIconRegistry} from '@angular/material/icon'

// RXJS
import {Observable, Subject, Subscriber} from 'rxjs'
import {map, switchMap, startWith, scan, debounceTime, tap, finalize} from 'rxjs/operators'
import {SubjectSubscriber} from 'rxjs/internal/Subject'

// External
import * as Stratus from 'stratus'
import * as _ from 'lodash'

// Child Components
import {DialogData, TreeDialogComponent} from '@stratus/angular/tree/tree-dialog.component'

// Local Setup
const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular'
const systemDir = '@stratus/angular'
const moduleName = 'tree'

// Data Types
export interface Node {
    id: number
    model: any
    children: Node[]
}
export interface NodeMap {
    [key: number]: Node
}
export interface KeyMap {
    [key: string]: boolean
}
export interface ElementMap {
    [key: string]: HTMLElement
}
// export interface Model {
//     completed: boolean;
//     data: object;
// }

/**
 * @title Tree with Nested Drag&Drop
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
    // templateUrl: `${systemDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component.css`
    // ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TreeComponent {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    // Forms
    selectCtrl = new FormControl()

    // Stratus Data Connectivity
    registry = new Stratus.Data.Registry()
    fetched: any
    data: any
    collection: any
    model: any

    // Observable Connection
    dataSub: Observable<[]>
    onChange = new Subject()
    subscriber: Subscriber<any>

    // Drag & Drop
    dropLists: string[] = []
    // dropLists: HTMLElement[] = []
    dropListIdMap: KeyMap = {}
    dropListMap: ElementMap = {}
    expandedNodeSet = new Set<string>()
    dragging = false
    expandTimeout: any
    expandDelay = 1000

    // Tree Specific
    tree: Node[]
    treeMap: NodeMap
    dataSource: ArrayDataSource<Node>
    // treeControl = new NestedTreeControl <any> (node => this.getChildren(node))
    treeControl = new NestedTreeControl<any>((node: Node) => node.children || [])

    // Methods
    // hasChild = (index: number, node: any) => this.getChildren(node).length > 0;
    hasChild = (index: number, node: any) => node.children && node.children.length > 0

    constructor(
        public iconRegistry: MatIconRegistry,
        public sanitizer: DomSanitizer,
        public dialog: MatDialog,
        private ref: ChangeDetectorRef
    ) {

        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // Dependencies
        this._ = _

        // SVG Icons
        iconRegistry.addSvgIcon(
            'delete',
            sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        )

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`)

        // Hoist Context
        const that = this

        // Data Connections
        this.fetchData()
            .then((data: any) => {
                if (!data.on) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                // Manually render upon data change
                // ref.detach();
                const onDataChange = () => {
                    if (!data.completed) {
                        return
                    }
                    that.dataDefer(that.subscriber)
                    ref.detectChanges()
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // Handling Pipes with Promises
        this.dataSub = new Observable((subscriber: Subscriber<any>) => this.dataDefer(subscriber))

        // Initialize Drop List Map
        this.dropListIdMap[`${this.uid}_parent_drop_list`] = true
        this.trackDropLists()
    }

    public remove(model: any) {
        const models = this.dataRef()
        if (!models || !models.length) {
            return
        }
        // TODO: Handle Multi-Level Targeting
        const index: number = models.indexOf(model)
        if (index === -1) {
            return
        }
        models.splice(index, 1)
        this.model.trigger('change')
    }

    // Data Connections
    public async fetchData(): Promise<any> {
        if (!this.fetched) {
            this.fetched = this.registry.fetch(Stratus.Select('#content-menu-primary'), this)
        }
        return this.fetched
    }

    private dataDefer(subscriber: Subscriber<any>) {
        this.subscriber = subscriber
        const tree = this.dataRef()
        if (tree && tree.length) {
            subscriber.next(tree)
            return
        }
        setTimeout(() => this.dataDefer(subscriber), 200)
    }

    private dataRef(force: boolean = false): Node[] {
        if (!this.collection) {
            return []
        }
        // TODO: Break away from the registry here...  It's not responsive enough.
        const models = this.collection.models
        if (!models || !_.isArray(models)) {
            return []
        }
        if (!force && this.tree && this.tree.length > 0) {
            return this.tree
        }
        // Convert Collection Models to Nested Tree to optimize references
        this.treeMap = {}
        this.tree = []
        _.each(models, (model: any) => {
            const modelId = _.get(model, 'data.id')
            const parentId = _.get(model, 'data.nestParent.id')
            this.dropListIdMap[`${this.uid}_node_${modelId}_drop_list`] = true
            if (!_.has(this.treeMap, modelId)) {
                this.treeMap[modelId] = {
                    id: modelId,
                    model: null,
                    children: []
                }
            }
            this.treeMap[modelId].model = model
            if (!parentId) {
                this.tree.push(
                    this.treeMap[modelId]
                )
            } else {
                if (!_.has(this.treeMap, parentId)) {
                    this.treeMap[parentId] = {
                        id: parentId,
                        model: null,
                        children: []
                    }
                }
                this.treeMap[parentId].children.push(
                    this.treeMap[modelId]
                )
            }
        })
        this.trackDropLists()
        return this.tree
    }

    private trackDropLists() {
        this.dropLists = []
        _.each(this.dropListIdMap, (value, key) => {
            if (!value) {
                return
            }
            const cached = key in this.dropListMap
            const element = cached ? this.dropListMap[key] : document.getElementById(key)
            if (!element) {
                return
            }
            this.dropLists.push(key)
            // this.dropLists.push(element)
            if (cached) {
                return
            }
            this.dropListMap[key] = element
        })
    }

    /**
     * Experimental - opening tree nodes as you drag over them
     */
    public onDragStart() {
        this.dragging = true
    }

    public onDragEnd() {
        this.dragging = false
    }

    public onDragHover(node: Node) {
        if (this.dragging) {
            clearTimeout(this.expandTimeout)
            this.expandTimeout = setTimeout(() => {
                this.treeControl.expand(node)
            }, this.expandDelay)
        }
    }

    public onDragHoverEnd() {
        if (this.dragging) {
            clearTimeout(this.expandTimeout)
        }
    }

    // public get connectedDropListsIds(): string[] {
    //     // We reverse ids here to respect items nesting hierarchy
    //     return this.getIdsRecursive(this.parentItem).reverse()
    // }

    public onDragDrop(event: CdkDragDrop<any>) {
        // ignore drops outside of the tree
        if (!event.isPointerOverContainer) {
            return
        }
        // if (!this.dataSource) {
        //     return
        // }

        const tree = this.dataRef()
        if (!tree || !tree.length) {
            return
        }

        // console.log('container.data:', event.container.data)
        // event.container.element.nativeElement.classList.remove('active')
        // if (this.canBeDropped(event)) {
        //     const movingItem: any = event.item.data
        //     event.container.data.children.push(movingItem)
        //     event.previousContainer.data.children =
        //         event.previousContainer.data.children.filter(
        //             (child: Node) => child.id !== movingItem.id
        //         )
        // } else {
        //     moveItemInArray(
        //         (event.container.data ? event.container.data.children : []) || [],
        //         event.previousIndex,
        //         event.currentIndex
        //     )
        // }

        const movingNode: Node = event.item.data
        console.log(`model drop: ${movingNode.model.get('name')}`,
            `list shift: ${event.container.element.nativeElement.id} -> ${event.previousContainer.element.nativeElement.id}`,
            `index change: ${event.previousIndex} -> ${event.currentIndex}`,
            `priority: ${movingNode.model.get('priority')}`,
            'container:', event.container.data
        )
        // console.log('event:', event)

        // TODO: Allow Multi-Level Priorities
        // moveItemInArray(tree, event.previousIndex, event.currentIndex)
        // let priority = 0
        // _.each(tree, (node) => {
        //     if (!node.model || !node.model.set) {
        //         return
        //     }
        //     const newPosition = priority++
        //     // if (node.model.get('priority') === newPosition) {
        //     //     return
        //     // }
        //     node.model.set('priority', newPosition)
        //     // node.model.save()
        // })
        // console.log(`new priority: ${movingNode.model.get('priority')}`)
        // movingNode.model.save()
        //
        // // update pipe
        // this.subscriber.next(tree)
        // this.ref.detectChanges()

        // propagate change
        // this.collection.throttleTrigger('change')
    }

    private canBeDropped(event: CdkDragDrop<any, any>): boolean {
        const movingNode: any = event.item.data

        return event.previousContainer.id !== event.container.id
            && this.isNotSelfDrop(event)
            && !this.hasChild(movingNode, event.item.data)
    }

    private isNotSelfDrop(event: CdkDragDrop<any> | CdkDragEnter<any> | CdkDragExit<any>): boolean {
        console.log('isNotSelfDrop:', event.item.data, event.item.data)
        return !_.isEqual(event.item.data, event.item.data)
    }

    // getChildren(model: any): any[] {
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

    public openDialog(model: any): void {
        if (!model || !_.has(model, 'data')) {
            return
        }
        const dialogRef = this.dialog.open(TreeDialogComponent, {
            width: '250px',
            data: {
                id: model.data.id || null,
                name: model.data.name || '',
                target: model.data.url ? 'url' : 'content',
                level: model.data.nestParent === null ? 'top' : 'child',
                content: model.data.content || null,
                url: model.data.url || null,
                priority: model.data.priority || 0,
                model: model || null,
                collection: this.collection || null,
                parent: model.data.parent || null,
                nestParent: model.data.nestParent || null,
            }
        })
        this.ref.detectChanges()

        dialogRef.afterClosed().subscribe((result: DialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            if (result.level && result.level === 'top') {
                result.nestParent = null
            }
            [
                'name',
                'content',
                'url',
                'priority',
                'nestParent'
            ].forEach(attr => {
                if (!_.has(result, attr)) {
                    return
                }
                // Normalize Content
                if ('content' === attr) {
                    const value = _.get(result, attr)
                    model.set(attr, !value ? null : {id: _.get(value, 'id')})
                    return
                }
                model.set(attr, _.get(result, attr))
            })
            model.save()
            // this.ref.detectChanges()
        })
    }
}
