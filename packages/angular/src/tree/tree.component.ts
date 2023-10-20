// Angular Core
import {
    // ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Inject,
} from '@angular/core'

// CDK
import {
    ArrayDataSource
} from '@angular/cdk/collections'
import {
    CdkDragDrop,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop'
import {
    NestedTreeControl
} from '@angular/cdk/tree'

// SVG Icons
import {DomSanitizer} from '@angular/platform-browser'
import {IconOptions, MatIconRegistry} from '@angular/material/icon'

// RXJS
import {
    Observable,
    Subject,
    Subscriber
} from 'rxjs'

// External
import {Stratus} from '@stratusjs/runtime/stratus'
import _ from 'lodash'
import {keys} from 'ts-transformer-keys'
import {debounce} from '@agentepsilon/decko'

// Components
import {RootComponent} from '../core/root.component'

// Interfaces
import {RefreshInterface} from '../core/refresh.interface'

// Services
import {BackendService} from '../backend.service'
import {Registry} from '@stratusjs/angularjs/services/registry'

// Core Classes
import {EventManager} from '@stratusjs/core/events/eventManager'
import {EventBase} from '@stratusjs/core/events/eventBase'
import {cookie} from '@stratusjs/core/environment'
import {isJSON} from '@stratusjs/core/misc'

// AngularJS Classes
import {
    Collection
} from '@stratusjs/angularjs/services/collection'
import {
    Model
} from '@stratusjs/angularjs/services/model'

import { DOCUMENT } from '@angular/common'
// import {TreeNodeComponent} from './tree-node.component'

// Data Types
export interface NodeMeta {
    id: number
    expanded: boolean
    component?: RefreshInterface
}

export interface NodeMetaMap {
    [key: number]: NodeMeta
}

export interface Node {
    id: number
    model: Model
    children: Node[]
    meta: NodeMeta
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

export interface DropData {
    targetId: string
    action?: string
}

export interface NodePatch {
    id?: number
    name?: string
}

// export interface Model {
//     completed: boolean
//     data: object
// }

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'tree'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

/**
 * @title Tree with Nested Drag & Drop
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // templateUrl: `${systemDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component${min}.css`
    // ],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class TreeComponent extends RootComponent implements OnInit, OnDestroy {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Timing Flags
    isInitialized = false
    isDestroyed = false
    isStyled = false

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

    // Dependencies
    _ = _
    Stratus = Stratus

    // Stratus Data Connectivity
    registry = new Registry()
    fetched: Promise<boolean|Collection|Model>
    data: Collection|Model
    collection: Collection
    model: Model

    // Observable Connection
    dataSub: Observable<[]>
    onChange = new Subject()
    subscriber: Subscriber<any>
    unsettled = false

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    // Click Handling
    isSingleClick: boolean
    dblClickWait = 500

    // Drag & Drop
    dropLists: string[] = []
    // dropLists: HTMLElement[] = []
    dropListIdMap: KeyMap = {}
    dropListMap: ElementMap = {}
    expandedNodeSet = new Set<string>()
    dragging = false
    expandTimeout: any
    expandDelay = 1000
    dropData: DropData = null
    cdkDropListSortingDisabled = true

    // Tree Specific
    tree: Node[]
    treeMap: NodeMap
    metaMap: NodeMetaMap
    dataSource: ArrayDataSource<Node>
    // treeControl = new NestedTreeControl <any> (node => this.getChildren(node))
    treeControl = new NestedTreeControl<Node>((node: Node) => node.children || [])

    // Methods
    // hasChild = (index: number, node: any) => this.getChildren(node).length > 0
    // hasChild = (index: number, node: any) => node.children && node.children.length > 0

    // User Settings
    isBorder = false
    isDebug = false

    constructor(
        public iconRegistry: MatIconRegistry,
        public sanitizer: DomSanitizer,
        public backend: BackendService,
        protected ref: ChangeDetectorRef,
        private elementRef: ElementRef,
        @Inject(DOCUMENT) private document: Document
    ) {
        // Chain constructor
        super()
    }

    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<TreeComponent>())

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component${min}.css`)
            .then(() => {
                this.isStyled = true
                this.refresh()
            })
            .catch((err: any) => {
                console.warn('Issue detected in CSS Loader for Component:', this)
                console.error(err)
                this.isStyled = true
                this.refresh()
            })

        // SVG Icons
        // TODO: Make this into a single service
        _.forEach({
            tree_check: `${Stratus.BaseUrl}sitetheorycore/images/icons/check.svg`,
            tree_add: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/add.svg`,
            tree_delete: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/delete.svg`,
            tree_edit: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/edit.svg`,
            tree_visibility: `${Stratus.BaseUrl}sitetheorycore/images/icons/actionButtons/visibility.svg`,
        }, (value, key) => this.iconRegistry.addSvgIcon(key, this.sanitizer.bypassSecurityTrustResourceUrl(value)).getNamedSvgIcon(key))

        // Data Connections
        this.fetchData()
            .then(data => {
                if (!data || !(data instanceof EventManager)) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                // Manually render upon data change
                // this.ref.detach()
                const onDataChange = () => {
                    if (this.unsettled || !data.completed) {
                        return
                    }
                    this.dataDefer(this.subscriber)
                    this.refresh()
                }
                data.on('change', onDataChange)
                onDataChange()
                // Handle Additions to Collection
                data.on('add', (event: EventBase, model: Model) => {
                    // TODO: This should hook into the collection, so that every collection.add results in a Dialog Opening.
                    let modelCompleted = false
                    const onModelChange = () => {
                        // FIXME: This is always true, even if the XHR hasn't completed.
                        if (!model.completed) {
                            return
                        }
                        // Force singleton
                        if (modelCompleted) {
                            return
                        }
                        modelCompleted = true
                        // console.log('model completed:', model)
                        // console.log('model node:', this.treeMap[model.getIdentifier()])
                        // Handle Post-Persist Options
                        if (!(model.getIdentifier() in this.treeMap)) {
                            // Hook to be handled by TreeNodeComponent
                            // console.log('postPersist:', model)
                            model.meta.set('postPersist', true)
                            return
                        }
                        const node = this.treeMap[model.getIdentifier()]
                        // FIXME: If we include the TreeNodeComponent, this creates a circular reference,
                        // since it includes TreeComponent (this), so it's commented out for now.
                        // if (!node.meta.component || !(node.meta.component instanceof TreeNodeComponent)) {
                        if (!node.meta.component || !('openDialog' in node.meta.component)) {
                            // Hook to be handled by TreeNodeComponent
                            // console.log('postPersist:', model)
                            model.meta.set('postPersist', true)
                            return
                        }
                        // Since the Node is available, create the dialog
                        // console.log('direct dialog:', model)
                        // FIXME: This is set to ignore because it previously checked if `instanceof TreeNodeComponent`, which caused a circular reference.
                        // @ts-ignore
                        node.meta.component.openDialog()
                    }
                    model.on('change', onModelChange)
                    onModelChange()
                })
            })

        // Handling Pipes with Promises
        this.dataSub = new Observable((subscriber: Subscriber<any>) => this.dataDefer(subscriber))

        // Initialize Drop List Map
        this.dropListIdMap[`${this.uid}_parent_drop_list`] = true
        this.trackDropLists()

        // Initialize User Settings
        const isBorder = cookie('tree-node-border')
        if (isBorder && isJSON(isBorder)) {
            this.isBorder = JSON.parse(isBorder)
        }
        const isDebug = cookie('tree-debug')
        if (isDebug && isJSON(isDebug)) {
            this.isDebug = JSON.parse(isDebug)
        }

        // Mark as complete
        this.isInitialized = true

        // Force UI Redraw
        this.refresh()
    }

    // async ngOnInit() {
    //     console.info('tree.ngOnInit')
    // }

    ngOnDestroy() {
        this.isDestroyed = true
    }

    public refresh() {
        if (this.isDestroyed) {
            return new Promise<void>(resolve => resolve())
        }
        // TODO: Refresh treeNodeComponents through a map
        _.forEach(this.metaMap, (meta: NodeMeta) => {
            if (!meta.component || !('refresh' in meta.component)) {
                return
            }
            // console.log('refreshing meta:', meta.component)
            meta.component.refresh()
        })
        return super.refresh()
    }

    public remove(model: any) {
        // const models = this.dataRef()
        // if (!models || !models.length) {
        //     return
        // }
        // // TODO: Handle Multi-Level Targeting
        // const index: number = models.indexOf(model)
        // if (index === -1) {
        //     return
        // }
        // models.splice(index, 1)
        // this.model.trigger('change')
    }

    public removeNode(list: Node[], node: Node): boolean {
        const index: number = list.indexOf(node)
        if (index === -1) {
            return false
        }
        list.splice(index, 1)
        return true
    }

    public nodeIsEqual(node: Node | null, other: Node | null): boolean {
        if (!node || !other) {
            return node === other
        }
        return node.id === other.id
    }

    // Data Connections
    public async fetchData() {
        if (this.fetched) {
            return this.fetched
        }
        return this.fetched = this.registry.fetch(
            Stratus.Select(this.elementRef.nativeElement),
            this
        )
    }

    private dataDefer(subscriber: Subscriber<any>) {
        this.subscriber = this.subscriber || subscriber
        if (!this.subscriber || !this.collection || !this.collection.completed) {
            setTimeout(() => {
                this.dataDefer(subscriber)
            }, 500)
            return
        }
        const tree = this.dataRef(true)
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
        if (!force && this.tree && this.tree.length > 0) {
            return this.tree
        }
        // TODO: Break away from the registry here...  It's not responsive enough.
        let models = this.collection.models
        if (!models || !_.isArray(models) || !models.length) {
            return []
        }
        models = _.sortBy(models, ['data.priority'])
        // Convert Collection Models to Nested Tree to optimize references
        this.metaMap = this.metaMap || {}
        this.treeMap = {}
        this.tree = []
        _.forEach(models, (model: any) => {
            const modelId = _.get(model, 'data.id')
            const parentId = _.get(model, 'data.nestParent.id')
            this.dropListIdMap[`${this.uid}_node_${modelId}_drop_list`] = true
            if (!_.has(this.metaMap, modelId)) {
                this.metaMap[modelId] = {
                    id: modelId,
                    // TODO: This is the default setting for the UI and should be a component setting
                    expanded: true
                }
            }
            if (!_.has(this.treeMap, modelId)) {
                this.treeMap[modelId] = {
                    id: modelId,
                    model,
                    children: [],
                    meta: this.metaMap[modelId]
                }
            }
            this.treeMap[modelId].model = model
            this.treeMap[modelId].meta = this.metaMap[modelId]
            if (parentId) {
                if (!_.has(this.treeMap, parentId)) {
                    this.treeMap[parentId] = {
                        id: parentId,
                        model: null,
                        children: [],
                        meta: null
                    }
                }
                this.treeMap[parentId].children.push(
                    this.treeMap[modelId]
                )
            } else {
                this.tree.push(
                    this.treeMap[modelId]
                )
            }
        })
        this.trackDropLists()
        return this.tree
    }

    private trackDropLists() {
        this.dropLists = []
        _.forEach(this.dropListIdMap, (value: boolean, key: string) => {
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

    private setExpanded(expanded: boolean): void {
        if (!this.metaMap || !_.size(this.metaMap)) {
            return
        }
        _.forEach(this.metaMap, (nodeMeta: NodeMeta) => {
            nodeMeta.expanded = expanded
        })
        this.refresh()
    }

    public setExpandedClick(expanded: boolean): void {
        this.isSingleClick = true
        setTimeout(() => {
            if (!this.isSingleClick) {
                return
            }
            this.setExpanded(expanded)
        }, this.dblClickWait)
    }

    public setExpandedDblClick(expanded: boolean): void {
        this.isSingleClick = false
        this.setExpanded(expanded)
    }

    /**
     * Experimental - opening tree nodes as you drag over them
     */
    // public onDragStart() {
    //     this.dragging = true
    // }
    //
    // public onDragEnd() {
    //     this.dragging = false
    // }
    //
    // public onDragHover(node: Node) {
    //     if (this.dragging) {
    //         clearTimeout(this.expandTimeout)
    //         this.expandTimeout = setTimeout(() => {
    //             this.treeControl.expand(node)
    //         }, this.expandDelay)
    //     }
    // }
    //
    // public onDragHoverEnd() {
    //     if (this.dragging) {
    //         clearTimeout(this.expandTimeout)
    //     }
    // }

    // public get connectedDropListsIds(): string[] {
    //     // We reverse ids here to respect items nesting hierarchy
    //     return this.getIdsRecursive(this.parentItem).reverse()
    // }

    public async onDragDrop(event: CdkDragDrop<any>) {
        // ignore drops outside of the tree
        if (!event.isPointerOverContainer) {
            return
        }
        // if (!this.dataSource) {
        //     return
        // }

        // console.log('onDragDrop:', event)

        // Gather Target (Dropped) Node
        const targetNode: Node | null = event.item.data
        if (!targetNode) {
            return
        }

        // Determine Parents
        let parentNode: Node | null = event.container.data
        const pastParentNode: Node | null = event.previousContainer.data

        // Determine Placement
        const tree: Node[] | null = parentNode ? parentNode.children : this.dataRef()
        if (!tree) {
            return
        }

        // Disable Listeners
        this.unsettled = true

        // Find Drop Node (For Comparisons)
        const targetDropNode =
            (this.dropData.targetId && this.dropData.targetId in this.treeMap) ?
            this.treeMap[_.toNumber(this.dropData.targetId)] : null

        // Debug Data
        if (cookie('env') && this.isDebug) {
            console.group('onDragDrop()')
            _.forEach(
                [
                    `model drop: ${targetNode.model.get('name')}`,
                    `list shift: ${event.container.element.nativeElement.id} -> ${event.previousContainer.element.nativeElement.id}`,
                    `index change (event): ${event.previousIndex} -> ${event.currentIndex}`,
                    `current priority: ${targetNode.model.get('priority')}`,
                    `target drop action: ${this.dropData.action}`,
                ],
                (message) => console.log(message)
            )
        }

        // Handle Drop Node Correction
        // ---------------------------
        // Sometimes the Drop List gets an incorrect parent to associated
        // with the drop location and this attempts to correct it in these
        // specific edge cases
        if (targetDropNode && !this.nodeIsEqual(parentNode, targetDropNode)) {
            if (cookie('env') && this.isDebug) {
                console.log(`target drop node differs: ${targetDropNode.id} -> ${targetDropNode.model.get('name')}`)
                console.log('target drop node is the same as target node:', targetNode.id === targetDropNode.id)
            }
            if (targetNode.id !== targetDropNode.id) {
                switch (this.dropData.action) {
                    case 'before':
                    case 'after':
                        const nestParentId = targetDropNode.model.get('nestParent.id')
                        const nestParent = (nestParentId && nestParentId in this.treeMap) ? this.treeMap[nestParentId] : null
                        parentNode = nestParent
                        break
                    case 'inside':
                        parentNode = targetDropNode
                        break
                }
            }
            if (cookie('env') && this.isDebug) {
                console.log('target drop node selected:', parentNode ? `${parentNode.id} -> ${parentNode.model.get('name')}` : 'none')
            }
        }

        // Handle Parent Change
        if (!this.nodeIsEqual(parentNode, pastParentNode)) {
            if (parentNode) {
                switch (this.dropData.action) {
                    case 'before':
                    case 'after':
                        let targetIndex = parentNode.children.findIndex((n: Node) => n.id === targetNode.id)
                        if (this.dropData.action === 'after') {
                            targetIndex++
                        }
                        parentNode.children.splice(targetIndex, 0, targetNode)
                        break
                    case 'inside':
                        parentNode.children.push(targetNode)
                        break
                }
                parentNode.meta.expanded = true
            }
            if (pastParentNode) {
                this.removeNode(pastParentNode.children, targetNode)
            }
            targetNode.model.set('nestParent', this.buildNodePatch(parentNode))

            // Display debug data
            if (cookie('env') && this.isDebug) {
                console.log(`new parent: ${targetNode.model.get('nestParent.name') || null}`)
            }
        }

        // Define tree branch
        const branch = parentNode ? parentNode.children : tree

        // Initial Target Index
        let targetDropIndex = event.currentIndex
        if (this.cdkDropListSortingDisabled) {
            // If sorting is disabled, calculate index via dropAction
            targetDropIndex = null
            switch (this.dropData.action) {
                case 'before':
                case 'after':
                    targetDropIndex = branch.findIndex((n: Node) => n.id === targetDropNode.id)
                    if (this.dropData.action === 'after') {
                        targetDropIndex++
                    }
                    if (cookie('env') && this.isDebug) {
                        console.log('index change (drop node):', `${event.previousIndex} -> ${targetDropIndex}`)
                    }
                    break
            }
        }

        // Handle new cell placement
        if (_.isNumber(targetDropIndex)) {
            // Move cell in array
            moveItemInArray(branch, event.previousIndex, targetDropIndex)
            // Generate new priority
            let priority = 0
            _.forEach(branch, (node: Node) => {
                if (!node.model || !node.model.set) {
                    return
                }
                node.model.set('priority', priority++)
            })
            // Display debug data
            if (cookie('env') && this.isDebug) {
                console.log('new priority:', targetNode.model.get('priority'))
            }
        }

        // Close Debug Group
        if (cookie('env') && this.isDebug) {
            console.groupEnd()
        }

        // Handle Propagation
        // let settledModel = false
        // targetNode.model.on('complete', () => {
        //     if (settledModel) {
        //         return
        //     }
        //     settledModel = true
        //
        //     // update pipe
        //     // this.subscriber.next(tree)
        //     // this.ref.detectChanges()
        //
        //     // propagate change
        //     // this.collection.throttleTrigger('change')
        // })

        // Start XHR
        await targetNode.model.save()

        // Enable Listeners
        this.unsettled = false

        // Refresh UI
        // await this.refresh()

        // update pipe
        // this.subscriber.next(this.dataRef())
        // this.ref.detectChanges()

        // propagate change
        this.collection.throttleTrigger('change')
    }

    // private canBeDropped(event: CdkDragDrop<any, any>): boolean {
    //     const movingNode: any = event.item.data
    //
    //     return event.previousContainer.id !== event.container.id
    //         && this.isNotSelfDrop(event)
    //         && !this.hasChild(movingNode)
    // }

    // private isNotSelfDrop(event: CdkDragDrop<any> | CdkDragEnter<any> | CdkDragExit<any>): boolean {
    //     console.log('isNotSelfDrop:', event.item.data, event.item.data)
    //     return !_.isEqual(event.item.data, event.item.data)
    // }

    @debounce(50)
    onDragMove(event: CdkDragMove) {
        const e = this.document.elementFromPoint(event.pointerPosition.x,event.pointerPosition.y)
        if (!e) {
            this.clearDragData()
            return
        }
        const containerClass = 'tree-node-content'
        const container = e.classList.contains(containerClass) ? e : e.closest(`.${containerClass}`)
        if (!container) {
            this.clearDragData()
            return
        }
        this.dropData = {
            targetId: container.getAttribute('data-id')
        }
        const targetRect = container.getBoundingClientRect()
        const oneThird = targetRect.height / 3

        if (event.pointerPosition.y - targetRect.top < oneThird) {
            this.dropData.action = 'before'
        } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
            this.dropData.action = 'after'
        } else {
            this.dropData.action = 'inside'
        }
        this.showDragData()
    }

    showDragData() {
        this.clearDragData()
        if (!this.dropData) {
            return
        }
        this.document.getElementById(`node-${this.dropData.targetId}`).classList.add(`drop-${this.dropData.action}`)
    }

    clearDragData(dropped = false) {
        if (dropped) {
            this.dropData = null
        }
        this.document
            .querySelectorAll('.drop-before')
            .forEach(element =>
                element.classList.remove('drop-before')
            )
        this.document
            .querySelectorAll('.drop-after')
            .forEach(element =>
                element.classList.remove('drop-after')
            )
        this.document
            .querySelectorAll('.drop-inside')
            .forEach(element =>
                element.classList.remove('drop-inside')
            )
    }

    buildNodePatch(node: Node = null): NodePatch | null {
        if (!node || !node.model) {
            return null
        }
        const nodePatch = {}
        _.forEach([
            'id',
            'name'
        ], (key: string) => {
            const value = node.model.get(key)
            if (!value) {
                return
            }
            _.set(nodePatch, key, value)
        })
        return nodePatch
    }

    // getChildren(model: any): any[] {
    //     if (!model) {
    //         return []
    //     }
    //     // TODO: Instead of a filter, like this, it would be better to search the tree
    //     return _.filter(this.dataRef(), function (child) {
    //         const modelId = _.get(model, 'data.id')
    //         const parentId = _.get(child, 'data.nestParent.id')
    //         return modelId && parentId && modelId === parentId
    //     })
    // }

    public getSvg(url: string, options?: IconOptions): Observable<string> {
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
    public addSvgIcon(url: string, options?: IconOptions) : string {
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
}
