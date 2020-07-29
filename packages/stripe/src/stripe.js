System.register(["@stratusjs/runtime/stratus"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var stratus_1, angularJsService;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            }
        ],
        execute: function () {
            angularJsService = ($window) => {
                let publishKey = '';
                const Stripe = {};
                let initializing = false;
                let initialized = false;
                function initialize() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!initialized && !initializing) {
                            initializing = true;
                            try {
                                yield stratus_1.Stratus.Internals.JsLoader('https://js.stripe.com/v3/');
                                if (!Object.prototype.hasOwnProperty.call($window, 'Stripe')) {
                                    console.error('Stripe Api was not initialized, cannot continue');
                                    initializing = false;
                                    return;
                                }
                            }
                            catch (e) {
                                console.error('Stripe Api could not be fetched, cannot continue');
                                initializing = false;
                                return;
                            }
                            Stripe.stripe = $window.Stripe(publishKey);
                            Stripe.stripeElements = Stripe.stripe.elements();
                            initialized = true;
                            initializing = false;
                        }
                        else if (initializing) {
                            return yield waitForInitialization();
                        }
                    });
                }
                function waitForInitialization() {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield new Promise(() => {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                if (initializing) {
                                    return yield waitForInitialization();
                                }
                                else if (!initialized) {
                                    throw new Error('Unable to initialize');
                                }
                                else {
                                    return;
                                }
                            }), 1000);
                        });
                        return;
                    });
                }
                function elements(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        publishKey = key;
                        yield initialize();
                        return Stripe.stripeElements;
                    });
                }
                function confirmCardSetup(clientSecret, data, options) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return Stripe.stripe.confirmCardSetup(clientSecret, data, options);
                    });
                }
                return {
                    elements,
                    initialize,
                    confirmCardSetup
                };
            };
            stratus_1.Stratus.Services.Stripe = [
                '$provide',
                ($provide) => {
                    $provide.factory('Stripe', angularJsService);
                }
            ];
        }
    };
});

//# sourceMappingURL=stripe.js.map
