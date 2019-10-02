// Angular Core
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core'

// Material
import {MatDialog} from '@angular/material/dialog'

// Tree Imports
import {Node, TreeComponent} from '@stratusjs/angular/tree/tree.component'
import {DialogData, TreeDialogComponent} from '@stratusjs/angular/tree/tree-dialog.component'

// External
import * as _ from 'lodash'
import * as Stratus from 'stratus'

// Local Setup
const localDir = `/assets/1/0/bundles/${boot.configuration.paths['@stratusjs/angular/*'].replace(/[^/]*$/, '')}`
const systemDir = '@stratusjs/angular'
const moduleName = 'tree-node'
const parentModuleName = 'tree'

/**
 * @title Node for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    // Inputs
    @Input() tree: TreeComponent
    @Input() parent: Node
    @Input() node: Node

    // Methods
    hasChild = (node: Node) => node.children && node.children.length > 0
    isExpanded = (node: Node) => node.expanded

    constructor(public dialog: MatDialog, private ref: ChangeDetectorRef) {
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

    public openDialog(node: Node): void {
        if (!node.model || !_.has(node.model, 'data')) {
            return
        }
        const dialogRef = this.dialog.open(TreeDialogComponent, {
            width: '250px',
            data: {
                id: node.model.data.id || null,
                name: node.model.data.name || '',
                target: node.model.data.url ? 'url' : 'content',
                // level: node.model.data.nestParent === null ? 'top' : 'child',
                content: node.model.data.content || null,
                url: node.model.data.url || null,
                // priority: node.model.data.priority || 0,
                model: node.model || null,
                collection: this.tree.collection || null,
                parent: node.model.data.parent || null,
                nestParent: node.model.data.nestParent || null,
            }
        })
        // this.ref.detectChanges()

        dialogRef.afterClosed().subscribe((result: DialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            [
                'name',
                'content',
                'url'
            ].forEach(attr => {
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
            node.model.save()
            // this.ref.detectChanges()
        })
    }
}
