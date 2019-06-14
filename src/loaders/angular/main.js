System.register(["@stratus/loaders/angular/polyfills", "@angular/core", "@angular/platform-browser", "@angular/platform-browser-dynamic", "@stratus/components/aetherial"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var core_1, platform_browser_1, platform_browser_dynamic_1, aetherial_1, AppModule;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (platform_browser_dynamic_1_1) {
                platform_browser_dynamic_1 = platform_browser_dynamic_1_1;
            },
            function (aetherial_1_1) {
                aetherial_1 = aetherial_1_1;
            }
        ],
        execute: function () {
            AppModule = class AppModule {
            };
            AppModule = __decorate([
                core_1.NgModule({
                    imports: [
                        platform_browser_1.BrowserModule,
                    ],
                    entryComponents: [aetherial_1.AetherialComponent],
                    declarations: [aetherial_1.AetherialComponent],
                    bootstrap: [aetherial_1.AetherialComponent],
                    providers: []
                })
            ], AppModule);
            exports_1("AppModule", AppModule);
            platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(AppModule)
                .then(function () {
                console.log('@stratus/loaders/angular/main', arguments);
            })
                .catch(function () {
                console.error('@stratus/loaders/angular/main', arguments);
            });
        }
    };
});
