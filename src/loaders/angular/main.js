var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "@angular/core", "@angular/platform-browser", "@angular/platform-browser-dynamic", "@stratus/components/aetherial", "@stratus/loaders/angular/polyfills"], function (require, exports, core_1, platform_browser_1, platform_browser_dynamic_1, aetherial_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let AppModule = class AppModule {
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
    exports.AppModule = AppModule;
    platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(AppModule)
        .then(function () {
        console.log('@stratus/loaders/angular/main', arguments);
    })
        .catch(function () {
        console.error('@stratus/loaders/angular/main', arguments);
    });
});
