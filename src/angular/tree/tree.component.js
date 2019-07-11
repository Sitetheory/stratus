System.register(["@angular/core", "@angular/forms", "@angular/cdk/drag-drop", "@angular/cdk/tree", "@angular/platform-browser", "@angular/material/icon", "rxjs", "stratus", "lodash"], function (exports_1, context_1) {
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
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var core_1, forms_1, drag_drop_1, tree_1, platform_browser_1, icon_1, rxjs_1, Stratus, _, localDir, systemDir, moduleName, TreeComponent;
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
                    this.ref = ref;
                    this.title = 'tree-dnd';
                    this.selectCtrl = new forms_1.FormControl();
                    this.registry = new Stratus.Data.Registry();
                    this.onChange = new rxjs_1.Subject();
                    this.treeControl = new tree_1.NestedTreeControl(node => this.getChildren(node));
                    this.hasChild = (_, node) => this.getChildren(node).length > 0;
                    this.uid = _.uniqueId('s2_tree_component_');
                    Stratus.Instances[this.uid] = this;
                    const that = this;
                    this._ = _;
                    this.sanitizer = sanitizer;
                    iconRegistry.addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg'));
                    Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`);
                    this.fetchData()
                        .then(function (data) {
                        if (!data.on) {
                            console.warn('Unable to bind data from Registry!');
                            return;
                        }
                        ref.detach();
                        data.on('change', function () {
                            that.dataDefer(that.subscriber);
                            ref.detectChanges();
                        });
                        that.dataDefer(that.subscriber);
                        ref.detectChanges();
                    });
                    this.dataSub = new rxjs_1.Observable((subscriber) => this.dataDefer(subscriber));
                }
                drop(event) {
                    const models = this.dataRef();
                    if (!models || !models.length) {
                        return;
                    }
                    drag_drop_1.moveItemInArray(models, event.previousIndex, event.currentIndex);
                    let priority = 0;
                    _.each(models, (model) => model.priority = priority++);
                    this.model.trigger('change');
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
                    const models = this.dataRef();
                    if (models && models.length) {
                        subscriber.next(models);
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
                    return models;
                }
                onDataChange(ref) {
                    this.dataDefer(this.subscriber);
                    ref.detectChanges();
                }
                getChildren(model) {
                    if (!model) {
                        return [];
                    }
                    return _.filter(this.dataRef(), function (child) {
                        const modelId = _.get(model, 'data.id');
                        const parentId = _.get(child, 'data.nestParent.id');
                        return modelId && parentId && modelId === parentId;
                    });
                }
            };
            TreeComponent = __decorate([
                core_1.Component({
                    selector: 's2-tree',
                    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
                }),
                __metadata("design:paramtypes", [icon_1.MatIconRegistry, platform_browser_1.DomSanitizer, core_1.ChangeDetectorRef])
            ], TreeComponent);
            exports_1("TreeComponent", TreeComponent);
        }
    };
});
