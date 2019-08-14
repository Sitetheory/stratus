System.register(["@stratus/core/dom"], function (exports_1, context_1) {
    "use strict";
    var dom_1, initialTimeout, boot;
    var __moduleName = context_1 && context_1.id;
    function exponentialTimeout() {
        const currentTimeout = initialTimeout;
        initialTimeout = initialTimeout * 1.2;
        return currentTimeout;
    }
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
                angularBoot();
            }, exponentialTimeout());
            return;
        }
        boot = true;
        require('@stratus/angular/main');
    }
    return {
        setters: [
            function (dom_1_1) {
                dom_1 = dom_1_1;
            }
        ],
        execute: function () {
            initialTimeout = 1000;
            boot = false;
            dom_1.DOMComplete().then(() => angularBoot());
        }
    };
});
