System.register(["@angular/core", "@angular/material/dialog", "@stratus/angular/tree/tree.component", "@stratus/angular/tree/tree-dialog.component", "lodash", "stratus"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, dialog_1, tree_component_1, tree_dialog_component_1, _, Stratus, localDir, systemDir, moduleName, parentModuleName, TreeNodeComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (dialog_1_1) {
                dialog_1 = dialog_1_1;
            },
            function (tree_component_1_1) {
                tree_component_1 = tree_component_1_1;
            },
            function (tree_dialog_component_1_1) {
                tree_dialog_component_1 = tree_dialog_component_1_1;
            },
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
            systemDir = '@stratus/angular';
            moduleName = 'tree-node';
            parentModuleName = 'tree';
            TreeNodeComponent = class TreeNodeComponent {
                constructor(dialog, ref) {
                    this.dialog = dialog;
                    this.ref = ref;
                    this.title = moduleName + '_component';
                    this.hasChild = (node) => node.children && node.children.length > 0;
                    this.isExpanded = (node) => node.expanded;
                }
                ngOnInit() {
                    this.uid = _.uniqueId(`sa_${moduleName}_component_`);
                    Stratus.Instances[this.uid] = this;
                    this._ = _;
                    Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component.css`);
                }
                getName(node) {
                    if (!node.model || !node.model.get || !node.model.get('name')) {
                        return 'Untitled';
                    }
                    return node.model.get('name');
                }
                getDragPreview(node) {
                    return `name: ${this.getName(node)}<br>children: ${node.children ? node.children.length : 0}`;
                }
                openDialog(node) {
                    if (!node.model || !_.has(node.model, 'data')) {
                        return;
                    }
                    const dialogRef = this.dialog.open(tree_dialog_component_1.TreeDialogComponent, {
                        width: '250px',
                        data: {
                            id: node.model.data.id || null,
                            name: node.model.data.name || '',
                            target: node.model.data.url ? 'url' : 'content',
                            content: node.model.data.content || null,
                            url: node.model.data.url || null,
                            model: node.model || null,
                            collection: this.tree.collection || null,
                            parent: node.model.data.parent || null,
                            nestParent: node.model.data.nestParent || null,
                        }
                    });
                    dialogRef.afterClosed().subscribe((result) => {
                        if (!result || _.isEmpty(result)) {
                            return;
                        }
                        [
                            'name',
                            'content',
                            'url'
                        ].forEach(attr => {
                            if (!_.has(result, attr)) {
                                return;
                            }
                            if ('content' === attr) {
                                const value = _.get(result, attr);
                                node.model.set(attr, !value ? null : { id: _.get(value, 'id') });
                                return;
                            }
                            node.model.set(attr, _.get(result, attr));
                        });
                        node.model.save();
                    });
                }
            };
            __decorate([
                core_1.Input(),
                __metadata("design:type", tree_component_1.TreeComponent)
            ], TreeNodeComponent.prototype, "tree", void 0);
            __decorate([
                core_1.Input(),
                __metadata("design:type", Object)
            ], TreeNodeComponent.prototype, "parent", void 0);
            __decorate([
                core_1.Input(),
                __metadata("design:type", Object)
            ], TreeNodeComponent.prototype, "node", void 0);
            TreeNodeComponent = __decorate([
                core_1.Component({
                    selector: `sa-${moduleName}`,
                    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
                }),
                __metadata("design:paramtypes", [dialog_1.MatDialog, core_1.ChangeDetectorRef])
            ], TreeNodeComponent);
            exports_1("TreeNodeComponent", TreeNodeComponent);
        }
    };
});
