System.register(["@angular/common/http", "@angular/core", "@angular/forms", "@angular/material", "@angular/platform-browser", "@angular/platform-browser/animations", "@stratus/angular/material", "@stratus/angular/base/base.component", "@stratus/angular/selector/selector.component", "@stratus/angular/tree/tree.component", "@stratus/angular/tree/tree-dialog.component", "@stratus/angular/tree/tree-node.component", "ngx-quill", "lodash", "stratus"], function (exports_1, context_1) {
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
    var http_1, core_1, forms_1, material_1, platform_browser_1, animations_1, material_2, base_component_1, selector_component_1, tree_component_1, tree_dialog_component_1, tree_node_component_1, ngx_quill_1, _, Stratus, AppModule;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (material_1_1) {
                material_1 = material_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (animations_1_1) {
                animations_1 = animations_1_1;
            },
            function (material_2_1) {
                material_2 = material_2_1;
            },
            function (base_component_1_1) {
                base_component_1 = base_component_1_1;
            },
            function (selector_component_1_1) {
                selector_component_1 = selector_component_1_1;
            },
            function (tree_component_1_1) {
                tree_component_1 = tree_component_1_1;
            },
            function (tree_dialog_component_1_1) {
                tree_dialog_component_1 = tree_dialog_component_1_1;
            },
            function (tree_node_component_1_1) {
                tree_node_component_1 = tree_node_component_1_1;
            },
            function (ngx_quill_1_1) {
                ngx_quill_1 = ngx_quill_1_1;
            },
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            }
        ],
        execute: function () {
            AppModule = class AppModule {
                constructor() {
                    this.initialTimeout = 1000;
                    this.instances = {};
                    this.modules = {
                        'sa-selector': selector_component_1.SelectorComponent,
                        'sa-tree': tree_component_1.TreeComponent
                    };
                    Stratus.Instances[_.uniqueId('sa_app_module_')] = this;
                }
                ngDoBootstrap(appRef) {
                    this.detectBoot(appRef);
                }
                exponentialTimeout() {
                    const currentTimeout = this.initialTimeout;
                    this.initialTimeout = this.initialTimeout * 1.01;
                    return currentTimeout;
                }
                detectBoot(appRef) {
                    _.each(this.modules, (module, selector) => {
                        const elements = document.getElementsByTagName(selector);
                        if (!elements || !elements.length) {
                            return;
                        }
                        _.each(elements, (node) => {
                            if (node.hasAttribute('ng-version')) {
                                return;
                            }
                            appRef.bootstrap(module, node);
                        });
                    });
                    setTimeout(() => {
                        this.detectBoot(appRef);
                    }, this.exponentialTimeout());
                }
            };
            AppModule = __decorate([
                core_1.NgModule({
                    imports: [
                        platform_browser_1.BrowserModule,
                        animations_1.BrowserAnimationsModule,
                        forms_1.FormsModule,
                        http_1.HttpClientModule,
                        material_2.MaterialModules,
                        material_1.MatNativeDateModule,
                        forms_1.ReactiveFormsModule,
                        ngx_quill_1.QuillModule.forRoot({
                            modules: {
                                toolbar: [
                                    ['bold', 'italic', 'underline', 'strike'],
                                    ['blockquote', 'code-block'],
                                    [{ header: 1 }, { header: 2 }],
                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                    [{ script: 'sub' }, { script: 'super' }],
                                    [{ indent: '-1' }, { indent: '+1' }],
                                    [{ direction: 'rtl' }],
                                    [{ size: ['small', false, 'large', 'huge'] }],
                                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                    [{ color: [] }, { background: [] }],
                                    [{ font: [] }],
                                    [{ align: [] }],
                                    ['clean'],
                                    ['link', 'image', 'video']
                                ]
                            }
                        })
                    ],
                    entryComponents: [
                        base_component_1.BaseComponent,
                        selector_component_1.SelectorComponent,
                        tree_component_1.TreeComponent,
                        tree_dialog_component_1.TreeDialogComponent,
                        tree_node_component_1.TreeNodeComponent,
                    ],
                    declarations: [
                        base_component_1.BaseComponent,
                        selector_component_1.SelectorComponent,
                        tree_component_1.TreeComponent,
                        tree_dialog_component_1.TreeDialogComponent,
                        tree_node_component_1.TreeNodeComponent,
                    ],
                    providers: []
                }),
                __metadata("design:paramtypes", [])
            ], AppModule);
            exports_1("AppModule", AppModule);
        }
    };
});
