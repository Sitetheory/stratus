System.register(["@stratus/core/environment", "@stratus/core/dom", "@stratus/core/conversion"], function (exports_1, context_1) {
    "use strict";
    var environment_1, dom_1, conversion_1, Stratus;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (environment_1_1) {
                environment_1 = environment_1_1;
            },
            function (dom_1_1) {
                dom_1 = dom_1_1;
            },
            function (conversion_1_1) {
                conversion_1 = conversion_1_1;
            }
        ],
        execute: function () {
            Stratus = class Stratus {
                constructor() {
                    this.Conversion = new conversion_1.Conversion();
                    this.DOM = new dom_1.DOM();
                    this.Environment = new environment_1.Environment();
                    console.log('Stratus:', this);
                }
            };
            exports_1("Stratus", Stratus);
        }
    };
});
