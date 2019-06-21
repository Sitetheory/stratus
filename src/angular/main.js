System.register(["@stratus/angular/polyfills", "stratus", "@angular/core", "@angular/platform-browser-dynamic", "@stratus/environments/environment", "@stratus/angular/app.module"], function (exports_1, context_1) {
    "use strict";
    var Stratus, core_1, platform_browser_dynamic_1, environment_1, app_module_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_dynamic_1_1) {
                platform_browser_dynamic_1 = platform_browser_dynamic_1_1;
            },
            function (environment_1_1) {
                environment_1 = environment_1_1;
            },
            function (app_module_1_1) {
                app_module_1 = app_module_1_1;
            }
        ],
        execute: function () {
            if (environment_1.environment.production) {
                core_1.enableProdMode();
            }
            Stratus.DOM.complete(function () {
                platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
                    .then(function (module) {
                    console.log('@stratus/angular initialized!');
                })
                    .catch(err => console.error('@stratus/angular did not initialize properly!'));
            });
        }
    };
});
//# sourceMappingURL=main.js.map