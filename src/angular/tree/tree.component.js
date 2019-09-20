System.register(["@angular/core", "@angular/cdk/drag-drop", "@angular/cdk/tree", "@angular/platform-browser", "@angular/material/icon", "rxjs", "stratus", "lodash"], function (exports_1, context_1) {
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
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var core_1, drag_drop_1, tree_1, platform_browser_1, icon_1, rxjs_1, Stratus, _, localDir, systemDir, moduleName, TreeComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
            },
            function (tree_1_1) {
                tree_1 = tree_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (icon_1_1) {
                icon_1 = icon_1_1;
            },
            function (rxjs_1_1) {
                rxjs_1 = rxjs_1_1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_1) {
                _ = _1;
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
            systemDir = '@stratus/angular';
            moduleName = 'tree';
            TreeComponent = class TreeComponent {
                constructor(iconRegistry, sanitizer, ref) {
                    this.iconRegistry = iconRegistry;
                    this.sanitizer = sanitizer;
                    this.ref = ref;
                    this.title = moduleName + '_component';
                    this.registry = new Stratus.Data.Registry();
                    this.onChange = new rxjs_1.Subject();
                    this.unsettled = false;
                    this.dropLists = [];
                    this.dropListIdMap = {};
                    this.dropListMap = {};
                    this.expandedNodeSet = new Set();
                    this.dragging = false;
                    this.expandDelay = 1000;
                    this.treeControl = new tree_1.NestedTreeControl((node) => node.children || []);
                    this.uid = _.uniqueId(`sa_${moduleName}_component_`);
                    Stratus.Instances[this.uid] = this;
                    this._ = _;
                    iconRegistry.addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg'));
                    Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`);
                    const that = this;
                    this.fetchData()
                        .then((data) => {
                        if (!data.on) {
                            console.warn('Unable to bind data from Registry!');
                            return;
                        }
                        const onDataChange = () => {
                            if (that.unsettled || !data.completed) {
                                return;
                            }
                            that.dataDefer(that.subscriber);
                            ref.detectChanges();
                        };
                        data.on('change', onDataChange);
                        onDataChange();
                    });
                    this.dataSub = new rxjs_1.Observable((subscriber) => this.dataDefer(subscriber));
                    this.dropListIdMap[`${this.uid}_parent_drop_list`] = true;
                    this.trackDropLists();
                }
                remove(model) {
                }
                removeNode(list, node) {
                    const index = list.indexOf(node);
                    if (index === -1) {
                        return false;
                    }
                    list.splice(index, 1);
                    return true;
                }
                nodeIsEqual(node, other) {
                    if (!node || !other) {
                        return node === other;
                    }
                    return node.id === other.id;
                }
                fetchData() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!this.fetched) {
                            this.fetched = this.registry.fetch(Stratus.Select('#content-menu-primary'), this);
                        }
                        return this.fetched;
                    });
                }
                dataDefer(subscriber) {
                    this.subscriber = subscriber;
                    const tree = this.dataRef(true);
                    if (tree && tree.length) {
                        subscriber.next(tree);
                        return;
                    }
                    setTimeout(() => this.dataDefer(subscriber), 200);
                }
                dataRef(force = false) {
                    if (!this.collection) {
                        return [];
                    }
                    if (!force && this.tree && this.tree.length > 0) {
                        return this.tree;
                    }
                    let models = this.collection.models;
                    if (!models || !_.isArray(models)) {
                        return [];
                    }
                    models = _.sortBy(models, ['data.priority']);
                    this.treeMap = {};
                    this.tree = [];
                    _.each(models, (model) => {
                        const modelId = _.get(model, 'data.id');
                        const parentId = _.get(model, 'data.nestParent.id');
                        this.dropListIdMap[`${this.uid}_node_${modelId}_drop_list`] = true;
                        if (!_.has(this.treeMap, modelId)) {
                            this.treeMap[modelId] = {
                                id: modelId,
                                model: null,
                                children: [],
                                expanded: true
                            };
                        }
                        this.treeMap[modelId].model = model;
                        if (!parentId) {
                            this.tree.push(this.treeMap[modelId]);
                        }
                        else {
                            if (!_.has(this.treeMap, parentId)) {
                                this.treeMap[parentId] = {
                                    id: parentId,
                                    model: null,
                                    children: [],
                                    expanded: true
                                };
                            }
                            this.treeMap[parentId].children.push(this.treeMap[modelId]);
                        }
                    });
                    this.trackDropLists();
                    return this.tree;
                }
                trackDropLists() {
                    this.dropLists = [];
                    _.each(this.dropListIdMap, (value, key) => {
                        if (!value) {
                            return;
                        }
                        const cached = key in this.dropListMap;
                        const element = cached ? this.dropListMap[key] : document.getElementById(key);
                        if (!element) {
                            return;
                        }
                        this.dropLists.push(key);
                        if (cached) {
                            return;
                        }
                        this.dropListMap[key] = element;
                    });
                }
                onDragDrop(event) {
                    if (!event.isPointerOverContainer) {
                        return;
                    }
                    const targetNode = event.item.data;
                    if (!targetNode) {
                        return;
                    }
                    const parentNode = event.container.data;
                    const pastParentNode = event.previousContainer.data;
                    const tree = parentNode ? parentNode.children : this.dataRef();
                    if (!tree) {
                        return;
                    }
                    this.unsettled = true;
                    if (!this.nodeIsEqual(parentNode, pastParentNode)) {
                        if (parentNode) {
                            parentNode.children.push(targetNode);
                        }
                        if (pastParentNode) {
                            this.removeNode(pastParentNode.children, targetNode);
                        }
                        const parentPatch = {};
                        if (parentNode) {
                            [
                                'id',
                                'name'
                            ].forEach((key) => {
                                const value = _.get(parentNode, `model.data.${key}`);
                                if (!value) {
                                    return;
                                }
                                _.set(parentPatch, key, value);
                            });
                        }
                        targetNode.model.set('nestParent', !parentNode ? parentNode : parentPatch);
                    }
                    drag_drop_1.moveItemInArray(tree, event.previousIndex, event.currentIndex);
                    let priority = 0;
                    _.each(tree, (node) => {
                        if (!node.model || !node.model.set) {
                            return;
                        }
                        node.model.set('priority', ++priority);
                    });
                    targetNode.model.save();
                    this.unsettled = false;
                }
            };
            TreeComponent = __decorate([
                core_1.Component({
                    selector: `sa-${moduleName}`,
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
                }),
                __metadata("design:paramtypes", [icon_1.MatIconRegistry, platform_browser_1.DomSanitizer, core_1.ChangeDetectorRef])
            ], TreeComponent);
            exports_1("TreeComponent", TreeComponent);
        }
    };
});
