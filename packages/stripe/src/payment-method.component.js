System.register(["lodash", "@stratusjs/runtime/stratus", "angular-material", "@stratusjs/stripe/stripe", "@stratusjs/core/environment", "@stratusjs/core/misc"], function (exports_1, context_1) {
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
    var lodash_1, stratus_1, environment_1, misc_1, min, packageName, componentName, localDir;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            },
            function (_1) {
            },
            function (_2) {
            },
            function (environment_1_1) {
                environment_1 = environment_1_1;
            },
            function (misc_1_1) {
                misc_1 = misc_1_1;
            }
        ],
        execute: function () {
            min = !environment_1.cookie('env') ? '.min' : '';
            packageName = 'stripe';
            componentName = 'payment-method';
            localDir = `${stratus_1.Stratus.BaseUrl}${stratus_1.Stratus.DeploymentPath}@stratusjs/${packageName}/src/`;
            stratus_1.Stratus.Components.StripePaymentMethod = {
                bindings: {
                    elementId: '@',
                    clientSecret: '@',
                    detailedBillingInfo: '@',
                },
                controller($attrs, $element, $scope, Stripe) {
                    const $ctrl = this;
                    $ctrl.uid = lodash_1.default.uniqueId(lodash_1.default.camelCase(packageName) + '_' + lodash_1.default.camelCase(componentName) + '_');
                    stratus_1.Stratus.Instances[$ctrl.uid] = $scope;
                    $scope.elementId = $attrs.elementId || $ctrl.uid;
                    $scope.localDir = localDir;
                    stratus_1.Stratus.Internals.CssLoader(`${localDir}${componentName}.component${min}.css`);
                    const clientSecret = $attrs.clientSecret || null;
                    let card = null;
                    $scope.initialized = false;
                    $scope.cardComplete = false;
                    $scope.formPending = false;
                    $scope.detailedBillingInfo = $attrs.detailedBillingInfo && misc_1.isJSON($attrs.detailedBillingInfo) ?
                        JSON.parse($attrs.detailedBillingInfo) : false;
                    $scope.billingInfo = {
                        address: {}
                    };
                    $ctrl.$onInit = () => __awaiter(this, void 0, void 0, function* () {
                        const options = {
                            hidePostalCode: $scope.detailedBillingInfo
                        };
                        card = (yield Stripe.elements()).create('card', options);
                        console.log('loading', lodash_1.default.clone(options));
                        card.mount(`#${$scope.elementId}-mount`);
                        card.addEventListener('change', (event) => {
                            const displayError = document.getElementById(`${$scope.elementId}-errors`);
                            console.log('event', event);
                            if (Object.prototype.hasOwnProperty.call(event, 'complete') &&
                                $scope.cardComplete !== event.complete) {
                                $scope.$applyAsync(() => {
                                    $scope.cardComplete = event.complete;
                                });
                            }
                            if (event.error) {
                                displayError.textContent = event.error.message;
                            }
                            else {
                                displayError.textContent = '';
                            }
                        });
                        $scope.$applyAsync(() => {
                            $scope.initialized = true;
                        });
                    });
                    $scope.isEditable = () => {
                        return !$scope.formPending && $scope.initialized;
                    };
                    $scope.isBillingDetailsFilled = () => {
                        if (!lodash_1.default.isEmpty($scope.billingInfo.name) &&
                            !lodash_1.default.isEmpty($scope.billingInfo.email) &&
                            !lodash_1.default.isEmpty($scope.billingInfo.address.line1) &&
                            !lodash_1.default.isEmpty($scope.billingInfo.address.city) &&
                            !lodash_1.default.isEmpty($scope.billingInfo.address.state) &&
                            !lodash_1.default.isEmpty($scope.billingInfo.address.postal_code)) {
                        }
                        return !$scope.formPending && $scope.initialized;
                    };
                    $scope.isSubmittable = () => {
                        return $scope.cardComplete && $scope.isEditable() && $scope.isBillingDetailsFilled();
                    };
                    $scope.saveCard = () => __awaiter(this, void 0, void 0, function* () {
                        if (!$scope.isSubmittable()) {
                            return;
                        }
                        $scope.formPending = true;
                        const { setupIntent, error } = yield Stripe.confirmCardSetup(clientSecret, {
                            payment_method: {
                                card,
                                billing_details: $scope.billingInfo
                            }
                        });
                        if (error) {
                            console.error('error:', error, setupIntent);
                            $scope.$applyAsync(() => {
                                $scope.formPending = false;
                                const displayError = document.getElementById(`${$scope.elementId}-errors`);
                                let errorMessage = 'An Unknown Error has occurred';
                                if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                    errorMessage = error.message;
                                }
                                displayError.textContent = errorMessage;
                            });
                            return;
                        }
                        if (setupIntent.status === 'succeeded') {
                            console.log('success', setupIntent);
                        }
                        else {
                            $scope.$applyAsync(() => {
                                $scope.formPending = false;
                                console.error('something went wrong. no error, no success', setupIntent);
                                const displayError = document.getElementById(`${$scope.elementId}-errors`);
                                displayError.textContent = 'An unknown Error has occurred';
                            });
                        }
                    });
                    $scope.remove = () => {
                    };
                },
                templateUrl: () => `${localDir}${componentName}.component${min}.html`
            };
        }
    };
});

//# sourceMappingURL=payment-method.component.js.map
