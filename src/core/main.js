System.register([], function (exports_1, context_1) {
    "use strict";
    var Stratus;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Stratus = class Stratus {
                constructor() {
                    console.log('Stratus:', this);
                }
            };
            exports_1("Stratus", Stratus);
        }
    };
});
