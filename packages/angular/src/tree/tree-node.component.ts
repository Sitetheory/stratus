// Angular Core
import {
    // ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core'

// Material
import {
    MatDialog
} from '@angular/material/dialog'

// Tree Imports
import {
    Node,
    TreeComponent
} from '@stratusjs/angular/tree/tree.component'
import {
    DialogData,
    TreeDialogComponent
} from '@stratusjs/angular/tree/tree-dialog.component'

// External
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'tree-node'
const parentModuleName = 'tree'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Node for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeComponent implements OnInit, OnDestroy {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Timing Flags
    isInitialized = false
    isDestroyed = false
    isStyled = false

    // Dependencies
    _: any

    // Inputs
    @Input() tree: TreeComponent
    @Input() parent: Node
    @Input() node: Node

    // Click Handling
    isSingleClick: boolean

    // Methods
    hasChild = (node: Node) => node.children && node.children.length > 0
    isExpanded = (node: Node) => node.meta ? node.meta.expanded : true

    constructor(
        public dialog: MatDialog,
        private ref: ChangeDetectorRef
    ) {
        // Manually render upon data change
        // ref.detach()

        // TODO: Bring the Content Selector prioritization over
        // TODO: Add an ID map for expand / collapse and a button to collapse or expand all
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
            .then(() => {
                this.isStyled = true
                this.refresh()
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.isStyled = true
                this.refresh()
            })

        // Attach Component to Node Meta
        this.node.meta.component = this

        // Mark as complete
        this.isInitialized = true

        // Force UI Redraw
        this.refresh()
    }

    ngOnDestroy() {
        this.node.meta.component = null
        this.isDestroyed = true
    }

    public refresh() {
        if (this.isDestroyed) {
            return
        }
        if (!this.ref) {
            console.error('ref not available:', this)
            return
        }
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

    public getName(node: Node): string {
        if (!node.model || !node.model.get || !node.model.get('name')) {
            return 'Untitled'
        }
        return node.model.get('name')
    }

    public getDragPreview(node: Node): string {
        return `name: ${this.getName(node)}<br>children: ${node.children ? node.children.length : 0}`
    }

    public toggleExpanded(node: Node): void {
        if (!node.meta) {
            console.error('node meta not found:', node)
            return
        }
        node.meta.expanded = !node.meta.expanded
        this.refresh()
    }

    public toggleExpandedClick(node: Node): void {
        this.isSingleClick = true
        setTimeout(() => {
            if (!this.isSingleClick) {
                return
            }
            this.toggleExpanded(node)
        }, this.tree.dblClickWait)
    }

    public toggleExpandedDblClick(node: Node): void {
        this.isSingleClick = false
        this.toggleExpanded(node)
    }

    public openDialog(node: Node): void {
        if (!node.model || !_.has(node.model, 'data')) {
            return
        }
        const dialogRef = this.dialog.open(TreeDialogComponent, {
            width: '400px',
            autoFocus: true,
            restoreFocus: false,
            data: {
                tree: this.tree,
                backend: this.tree.backend,
                iconRegistry: this.tree.iconRegistry,
                id: node.model.data.id || null,
                name: node.model.data.name || '',
                target: node.model.data.url ? 'url' : 'content',
                // level: node.model.data.nestParent === null ? 'top' : 'child',
                content: node.model.data.content || null,
                url: node.model.data.url || null,
                priority: node.model.data.priority || 0,
                model: node.model || null,
                collection: this.tree.collection || null,
                parent: node.model.data.parent || null,
                nestParent: node.model.data.nestParent || null,
            }
        })
        this.refresh()

        const that = this
        dialogRef.afterClosed().subscribe((result: DialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            // Disable Listeners
            this.tree.unsettled = true
            // Define Attributes
            const attrs = [
                'name',
                'content',
                'url',
                'priority'
            ]
            // Persist to Model
            attrs.forEach(attr => {
                if (!_.has(result, attr)) {
                    return
                }
                // Normalize Content
                if ('content' === attr) {
                    const value = _.get(result, attr)
                    node.model.set(attr, !value ? null : {id: _.get(value, 'id')})
                    return
                }
                node.model.set(attr, _.get(result, attr))
            })
            // Refresh Component
            that.refresh()
            // Refresh Parent Tree
            that.tree.refresh()
            // Start XHR
            node.model.save()
            // Enable Listeners
            this.tree.unsettled = false
        })
    }

    public openDialogClick(node: Node): void {
        this.isSingleClick = true
        setTimeout(() => {
            if (!this.isSingleClick) {
                return
            }
            this.openDialog(node)
        }, this.tree.dblClickWait)
    }

    public openDialogDblClick(node: Node): void {
        this.isSingleClick = false
        this.openDialog(node)
    }
}
