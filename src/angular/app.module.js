System.register(["@angular/common/http", "@angular/core", "@angular/forms", "@angular/material", "@angular/platform-browser", "@angular/platform-browser/animations", "@stratus/modules/material", "@stratus/angular/app.component", "@stratus/components/base", "@stratus/components/aetherial", "lodash", "stratus"], function (exports_1, context_1) {
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
    var http_1, core_1, forms_1, material_1, platform_browser_1, animations_1, material_2, app_component_1, base_1, aetherial_1, _, Stratus, AppModule;
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
            function (app_component_1_1) {
                app_component_1 = app_component_1_1;
            },
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (aetherial_1_1) {
                aetherial_1 = aetherial_1_1;
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
                    Stratus.Instances[_.uniqueId('s2_app_module_')] = this;
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
                    ],
                    entryComponents: [
                        base_1.BaseComponent,
                        aetherial_1.AetherialComponent
                    ],
                    declarations: [
                        app_component_1.AppComponent,
                        base_1.BaseComponent,
                        aetherial_1.AetherialComponent
                    ],
                    bootstrap: [
                        app_component_1.AppComponent
                    ],
                    providers: []
                }),
                __metadata("design:paramtypes", [])
            ], AppModule);
            exports_1("AppModule", AppModule);
        }
    };
});
//# sourceMappingURL=app.module.js.map