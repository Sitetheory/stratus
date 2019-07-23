System.register(["@angular/core", "@angular/forms", "@angular/cdk/drag-drop", "@angular/cdk/tree", "@angular/material/dialog", "@angular/platform-browser", "@angular/material/icon", "rxjs", "rxjs/operators", "stratus", "lodash", "@stratus/angular/backend.service"], function (exports_1, context_1) {
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
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var core_1, forms_1, drag_drop_1, tree_1, dialog_1, platform_browser_1, icon_1, rxjs_1, operators_1, Stratus, _, backend_service_1, localDir, systemDir, moduleName, TreeDialogComponent, TreeComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
            },
            function (tree_1_1) {
                tree_1 = tree_1_1;
            },
            function (dialog_1_1) {
                dialog_1 = dialog_1_1;
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
            function (operators_1_1) {
                operators_1 = operators_1_1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_1) {
                _ = _1;
            },
            function (backend_service_1_1) {
                backend_service_1 = backend_service_1_1;
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
            systemDir = '@stratus/angular';
            moduleName = 'tree';
            TreeDialogComponent = class TreeDialogComponent {
                constructor(dialogRef, data, fb, backend) {
                    this.dialogRef = dialogRef;
                    this.data = data;
                    this.fb = fb;
                    this.backend = backend;
                    this.isLoading = false;
                }
                ngOnInit() {
                    this.dialogForm = this.fb.group({
                        selectorInput: this.data.content
                    });
                    this.dialogForm
                        .get('selectorInput')
                        .valueChanges
                        .pipe(operators_1.debounceTime(300), operators_1.tap(() => this.isLoading = true), operators_1.switchMap(value => {
                        if (_.isString(value)) {
                            this.lastSelectorQuery = `/Api/Content?q=${value}`;
                        }
                        else {
                            this.data.content = value;
                            this.data.url = null;
                        }
                        return this.backend.get(this.lastSelectorQuery)
                            .pipe(operators_1.finalize(() => this.isLoading = false));
                    }))
                        .subscribe(response => {
                        if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
                            return this.filteredOptions = [];
                        }
                        const payload = _.get(response.body, 'payload') || response.body;
                        if (_.isEmpty(payload) || !Array.isArray(payload)) {
                            return this.filteredOptions = [];
                        }
                        return this.filteredOptions = payload;
                    });
                }
                onCancelClick() {
                    this.dialogRef.close();
                }
                displayOption(option) {
                    if (option) {
                        return _.get(option, 'version.title');
                    }
                }
            };
            TreeDialogComponent = __decorate([
                core_1.Component({
                    selector: 's2-tree-dialog',
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.dialog.html`,
                }),
                __param(1, core_1.Inject(dialog_1.MAT_DIALOG_DATA)),
                __metadata("design:paramtypes", [dialog_1.MatDialogRef, Object, forms_1.FormBuilder,
                    backend_service_1.BackendService])
            ], TreeDialogComponent);
            exports_1("TreeDialogComponent", TreeDialogComponent);
            TreeComponent = class TreeComponent {
                constructor(iconRegistry, sanitizer, dialog, ref) {
                    this.iconRegistry = iconRegistry;
                    this.sanitizer = sanitizer;
                    this.dialog = dialog;
                    this.ref = ref;
                    this.title = 'tree-dnd';
                    this.selectCtrl = new forms_1.FormControl();
                    this.registry = new Stratus.Data.Registry();
                    this.onChange = new rxjs_1.Subject();
                    this.treeControl = new tree_1.NestedTreeControl(node => node.child || []);
                    this.hasChild = (index, node) => node.child && node.child.length > 0;
                    this.uid = _.uniqueId('s2_tree_component_');
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
                        data.on('change', () => {
                            if (!data.completed) {
                                return;
                            }
                            ref.detectChanges();
                        });
                        ref.detectChanges();
                    });
                    this.dataSub = new rxjs_1.Observable((subscriber) => this.dataDefer(subscriber));
                }
                drop(event) {
                    const tree = this.dataRef();
                    if (!tree || !tree.length) {
                        return;
                    }
                    console.log('tree drop:', event);
                    drag_drop_1.moveItemInArray(tree, event.previousIndex, event.currentIndex);
                    let priority = 0;
                    _.each(tree, (node) => {
                        if (!node.model || !node.model.set) {
                            return;
                        }
                        const newPosition = priority++;
                        if (node.model.get('priority') === newPosition) {
                            return;
                        }
                        node.model.set('priority', newPosition);
                        node.model.save();
                    });
                    this.subscriber.next(tree);
                    this.ref.detectChanges();
                    this.collection.throttleTrigger('change');
                }
                remove(model) {
                    const models = this.dataRef();
                    if (!models || !models.length) {
                        return;
                    }
                    const index = models.indexOf(model);
                    if (index === -1) {
                        return;
                    }
                    models.splice(index, 1);
                    this.model.trigger('change');
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
                    const tree = this.dataRef();
                    if (tree && tree.length) {
                        subscriber.next(tree);
                        return;
                    }
                    setTimeout(() => this.dataDefer(subscriber), 500);
                }
                dataRef() {
                    if (!this.collection) {
                        return [];
                    }
                    const models = this.collection.models;
                    if (!models || !_.isArray(models)) {
                        return [];
                    }
                    this.treeMap = {};
                    const that = this;
                    const tree = [];
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
                            tree.push(that.treeMap[modelId]);
                        }
                        else {
                            if (!_.has(that.treeMap, parentId)) {
                                that.treeMap[parentId] = {
                                    model: null,
                                    child: []
                                };
                            }
                            that.treeMap[parentId].child.push(that.treeMap[modelId]);
                        }
                    });
                    return tree;
                }
                onDataChange(ref) {
                    this.dataDefer(this.subscriber);
                    ref.detectChanges();
                }
                openDialog(model) {
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
                            priority: model.data.priority || null,
                            model: model || null,
                            collection: this.collection || null,
                            parent: model.data.parent || null,
                            nestParent: model.data.nestParent || null,
                        }
                    });
                    this.ref.detectChanges();
                    dialogRef.afterClosed().subscribe(result => {
                        if (!result || _.isEmpty(result)) {
                            return;
                        }
                        [
                            'name',
                            'content',
                            'url',
                            'priority'
                        ].forEach(attr => {
                            if (!_.has(result, attr)) {
                                return;
                            }
                            model.set(attr, _.get(result, attr));
                        });
                        model.save();
                    });
                }
            };
            TreeComponent = __decorate([
                core_1.Component({
                    selector: 's2-tree',
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
                }),
                __metadata("design:paramtypes", [icon_1.MatIconRegistry,
                    platform_browser_1.DomSanitizer,
                    dialog_1.MatDialog,
                    core_1.ChangeDetectorRef])
            ], TreeComponent);
            exports_1("TreeComponent", TreeComponent);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmVlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBOEJNLFFBQVEsR0FBRywyREFBMkQsQ0FBQztZQUN2RSxTQUFTLEdBQUcsa0JBQWtCLENBQUM7WUFDL0IsVUFBVSxHQUFHLE1BQU0sQ0FBQztZQWdDYixtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7Z0JBTzVCLFlBQ1csU0FBNEMsRUFDbkIsSUFBZ0IsRUFDeEMsRUFBZSxFQUNmLE9BQXVCO29CQUh4QixjQUFTLEdBQVQsU0FBUyxDQUFtQztvQkFDbkIsU0FBSSxHQUFKLElBQUksQ0FBWTtvQkFDeEMsT0FBRSxHQUFGLEVBQUUsQ0FBYTtvQkFDZixZQUFPLEdBQVAsT0FBTyxDQUFnQjtvQkFQbkMsY0FBUyxHQUFHLEtBQUssQ0FBQztnQkFRZixDQUFDO2dCQUVKLFFBQVE7b0JBQ0osSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzt3QkFDNUIsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztxQkFDbkMsQ0FBQyxDQUFDO29CQUVILElBQUksQ0FBQyxVQUFVO3lCQUNaLEdBQUcsQ0FBQyxlQUFlLENBQUM7eUJBQ3BCLFlBQVk7eUJBQ1osSUFBSSxDQUNILHdCQUFZLENBQUMsR0FBRyxDQUFDLEVBQ2pCLGVBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxFQUNoQyxxQkFBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUNaLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDbkIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGtCQUFrQixLQUFLLEVBQUUsQ0FBQzt5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