System.register(["@stratus/core/dom"], function (exports_1, context_1) {
    "use strict";
    var dom_1, Stratus;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (dom_1_1) {
                dom_1 = dom_1_1;
            }
        ],
        execute: function () {
            Stratus = class Stratus {
                constructor() {
                    this.DOM = new dom_1.DOM();
                    console.log('Stratus:', this);
                }
            };
            exports_1("Stratus", Stratus);
        }
    };
});
