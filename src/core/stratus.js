System.register(["lodash", "jquery", "bowser"], function (exports_1, context_1) {
    "use strict";
    var _, jQuery, bowser, Stratus;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
                _ = _1;
            },
            function (jQuery_1) {
                jQuery = jQuery_1;
            },
            function (bowser_1) {
                bowser = bowser_1;
            }
        ],
        execute: function () {
            Stratus = class Stratus {
                constructor() {
                    console.log('Stratus:', this, _, jQuery, bowser);
                }
            };
            exports_1("Stratus", Stratus);
        }
    };
});
