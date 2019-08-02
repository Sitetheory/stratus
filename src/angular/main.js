System.register(["@stratus/angular/polyfills", "@stratus/core/dom", "@angular/core", "@angular/platform-browser-dynamic", "@stratus/environments/environment", "@stratus/angular/app.module"], function (exports_1, context_1) {
    "use strict";
    var dom_1, core_1, platform_browser_dynamic_1, environment_1, app_module_1, boot;
    var __moduleName = context_1 && context_1.id;
    function angularBoot() {
        if (boot) {
            console.log('stopped angular boot attempt after successful boot.');
            return;
        }
        const sa = [
            'sa-selector',
            'sa-tree',
            'quill-editor'
        ];
        let detected = false;
        sa.forEach(component => {
            if (detected) {
                return;
            }
            const elements = document.getElementsByTagName(component);
            if (!elements || !elements.length) {
                return;
            }
            detected = true;
        });
        if (!detected) {
            setTimeout(() => {
                console.log('reattempt angular boot cycle.');
                angularBoot();
            }, 3000);
            return;
        }
        boot = true;
        platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
            .then(module => {
            console.log('@stratus/angular initialized successfully!');
        })
            .catch(err => console.error('@stratus/angular failed to initialize!', err));
    }
    return {
        setters: [
            function (_1) {
            },
            function (dom_1_1) {
                dom_1 = dom_1_1;
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
            boot = false;
            dom_1.DOMComplete().then(() => angularBoot());
        }
    };
});
