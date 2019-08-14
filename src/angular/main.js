System.register(["@stratus/angular/polyfills", "@angular/core", "@angular/platform-browser-dynamic", "@stratus/angular/app.module", "@stratus/core/environment"], function (exports_1, context_1) {
    "use strict";
    var core_1, platform_browser_dynamic_1, app_module_1, environment_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_dynamic_1_1) {
                platform_browser_dynamic_1 = platform_browser_dynamic_1_1;
            },
            function (app_module_1_1) {
                app_module_1 = app_module_1_1;
            },
            function (environment_1_1) {
                environment_1 = environment_1_1;
            }
        ],
        execute: function () {
            if (null === environment_1.cookie('env')) {
                core_1.enableProdMode();
            }
            platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
                .then(module => {
                console.log('@stratus/angular initialized successfully!');
            })
                .catch(err => console.error('@stratus/angular failed to initialize!', err));
        }
    };
});
