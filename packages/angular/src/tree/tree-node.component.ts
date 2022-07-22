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
    MatDialog,
    MatDialogRef
} from '@angular/material/dialog'

// Components
import {
    Node,
    TreeComponent
} from '@stratusjs/angular/tree/tree.component'
import {
    DialogData,
    TreeDialogComponent
} from '@stratusjs/angular/tree/tree-dialog.component'
import {
    ConfirmDialogComponent
} from '@stratusjs/angular/confirm-dialog/confirm-dialog.component'

// Services
import {
    Model
} from '@stratusjs/angularjs/services/model'

// External
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {cookie} from '@stratusjs/core/environment'
import {IconOptions} from '@angular/material/icon'
import {Observable} from 'rxjs'

// Extends
import {
    ResponsiveComponent
} from '@stratusjs/angular/core/responsive.component'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'tree-node'
const parentModuleName = 'tree'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Node for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeComponent extends ResponsiveComponent implements OnInit, OnDestroy {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Timing Flags
    isInitialized = false
    isDestroyed = false
    isStyled = false

    // Dependencies
    _ = _
    Stratus = Stratus

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
        protected ref: ChangeDetectorRef
    ) {
        // Chain constructor
        super()

        // Manually render upon data change
        // ref.detach()

        // TODO: Bring the Content Selector prioritization over
        // TODO: Add an ID map for expand / collapse and a button to collapse or expand all
    }

    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component${min}.css`)
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

        // Attach Component to Node Meta
        this.node.meta.component = this

        // Mark as complete
        this.isInitialized = true

        // Force UI Redraw
        this.refresh()

        // Handle Post-Persist
        this.onPostPersist()
    }

    ngOnDestroy() {
        this.node.meta.component = null
        this.isDestroyed = true
    }

    public refresh() {
        if (this.isDestroyed) {
            return new Promise<void>(resolve => resolve())
        }
        return super.refresh()
    }

    public onPostPersist() {
        if (!this.node) {
            return
        }
        if (!this.node.model) {
            return
        }
        if (!this.node.model.meta.get('postPersist')) {
            return
        }
        // console.log('onPostPersist:', this)
        this.node.model.meta.set('postPersist', false)
        this.openDialog()
    }

    public destroy(): MatDialogRef<ConfirmDialogComponent, any> {
        const dialog = this.dialog
            .open(ConfirmDialogComponent, {
                maxWidth: '400px',
                data: {
                    title: 'Delete MenuLink',
                    message: 'Are you sure you want to do this?'
                }
            })
        dialog
            .afterClosed()
            .subscribe((dialogResult: boolean) => {
                if (!dialogResult) {
                    return
                }
                if (!this.node || !this.node.model) {
                    return
                }
                this.node.model.destroy()
            })
        return dialog
    }

    public getName(): string {
        if (!this.node.model || !this.node.model.get || !this.node.model.get('name')) {
            return 'Untitled'
        }
        return this.node.model.get('name')
    }

    public getDragPreview(): string {
        return `name: ${this.getName()}<br>children: ${this.node.children ? this.node.children.length : 0}`
    }

    public toggleExpanded(): void {
        if (!this.node.meta) {
            console.error('node meta not found:', this.node)
            return
        }
        this.node.meta.expanded = !this.node.meta.expanded
        this.refresh()
    }

    public toggleExpandedClick(): void {
        this.isSingleClick = true
        setTimeout(() => {
            if (!this.isSingleClick) {
                return
            }
            this.toggleExpanded()
        }, this.tree.dblClickWait)
    }

    public toggleExpandedDblClick(): void {
        this.isSingleClick = false
        this.toggleExpanded()
    }

    // TODO: Move things like toggle to this TreeNodeComponent, so it can be used in the template as well as the Dialog
    public openDialog(): void {
        if (!this.node.model || !_.has(this.node.model, 'data')) {
            return
        }
        const dialogRef = this.dialog.open(TreeDialogComponent, {
            width: '400px',
            autoFocus: true,
            disableClose: true,
            restoreFocus: false,
            data: {
                tree: this.tree,
                treeNode: this,
                backend: this.tree.backend,
                iconRegistry: this.tree.iconRegistry,
                id: this.node.model.data.id || null,
                name: this.node.model.data.name || '',
                target: this.node.model.data.url ? 'url' : 'content',
                // level: this.node.model.data.nestParent === null ? 'top' : 'child',
                content: this.node.model.data.content || null,
                url: this.node.model.data.url || null,
                browserTarget: this.node.model.data.browserTarget || null,
                // priority: this.node.model.data.priority || 0,
                model: this.node.model || null,
                collection: this.tree.collection || null,
                parent: this.node.model.data.parent || null,
                nestParent: this.node.model.data.nestParent || null,
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
                'priority',
                'browserTarget'
            ]
            // Persist to Model
            attrs.forEach(attr => {
                if (!_.has(result, attr)) {
                    return
                }
                // Normalize Content
                if ('content' === attr) {
                    const value = _.get(result, attr)
                    this.node.model.set(attr, !value ? null : {id: _.get(value, 'id')})
                    return
                }
                this.node.model.set(attr, _.get(result, attr))
            })
            // Refresh Component
            that.refresh()
            // Refresh Parent Tree
            that.tree.refresh()
            // Start XHR
            this.node.model.save()
            // Enable Listeners
            this.tree.unsettled = false
        })
    }

    public openDialogClick(): void {
        this.isSingleClick = true
        setTimeout(() => {
            if (!this.isSingleClick) {
                return
            }
            this.openDialog()
        }, this.tree.dblClickWait)
    }

    public openDialogDblClick(): void {
        this.isSingleClick = false
        this.openDialog()
    }

    public getSvg(url: string, options?: IconOptions): Observable<string> {
        return this.tree.getSvg(url, options)
    }

    public toggleStatus(): void {
        if (!this.node || !this.node.model) {
            return
        }
        const model = this.node.model
        model.set('status', model.get('status') ? 0 : 1)
        model.save()
    }

    // TODO: Have this spawn off a new Tree Dialog with a new function addChild() on the TreeDialogComponent Class
    // TODO: Use the tree map to call node.openDialog after creating the new item
    public addChild(): void {
        let priority = _.max(
            this.tree.collection.models.filter(
                (model: Model) => {
                    const nestParent = model.get('nestParent')
                    if (!nestParent) {
                        return false
                    }
                    return nestParent.id === this.node.id
                }
            ).map((model: Model) => model.get('priority'))
        ) || -1
        priority++
        this.tree.collection.add({
            name:'Untitled Child',
            parent: this.node.model.data.parent,
            nestParent: {
                id: this.node.model.data.id
            },
            priority
        }, {
            save: true,
            trigger: true
        })
    }
}
