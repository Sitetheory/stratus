System.register(["@angular/core", "@angular/forms", "@angular/cdk/tree", "@angular/material/dialog", "@angular/platform-browser", "@angular/material/icon", "rxjs", "rxjs/operators", "stratus", "lodash", "@stratus/angular/backend.service"], function (exports_1, context_1) {
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
    var core_1, forms_1, tree_1, dialog_1, platform_browser_1, icon_1, rxjs_1, operators_1, Stratus, _, backend_service_1, localDir, systemDir, moduleName, TreeDialogComponent, TreeComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
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
                    selector: 'sa-tree-dialog',
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.dialog.html`,
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
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
                    this.uid = _.uniqueId('sa_tree_component_');
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
                            priority: model.data.priority || 0,
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
                            if ('content' === attr) {
                                const value = _.get(result, attr);
                                model.set(attr, !value ? null : { id: _.get(value, 'id') });
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
                    selector: 'sa-tree',
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
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
