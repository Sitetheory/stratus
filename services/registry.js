System.register(["lodash", "stratus", "stratus.services.model", "stratus.services.collection", "@stratusjs/core/conversion", "@stratusjs/core/misc"], function (exports_1, context_1) {
    "use strict";
    var _, Stratus, stratus_services_model_1, stratus_services_collection_1, conversion_1, misc_1, interpolate, Registry;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (stratus_services_model_1_1) {
                stratus_services_model_1 = stratus_services_model_1_1;
            },
            function (stratus_services_collection_1_1) {
                stratus_services_collection_1 = stratus_services_collection_1_1;
            },
            function (conversion_1_1) {
                conversion_1 = conversion_1_1;
            },
            function (misc_1_1) {
                misc_1 = misc_1_1;
            }
        ],
        execute: function () {
            interpolate = (value, mustHaveExpression, trustedContext, allOrNothing) => {
                return (data) => {
                    console.error('$interpolate not loaded:', data);
                };
            };
            Registry = class Registry {
                constructor() {
                    this.fetch = this.fetch.bind(this);
                }
                fetch($element, $scope) {
                    return new Promise((resolve, reject) => {
                        if (typeof $element === 'string') {
                            $element = {
                                target: $element
                            };
                        }
                        const inputs = {
                            target: 'data-target',
                            targetSuffix: 'data-target-suffix',
                            id: 'data-id',
                            manifest: 'data-manifest',
                            decouple: 'data-decouple',
                            direct: 'data-direct',
                            api: 'data-api',
                            urlRoot: 'data-url-root'
                        };
                        const options = _.each(inputs, (value, key, list) => {
                            list[key] = $element.attr ? $element.attr(value) : $element[key];
                            if (!misc_1.isJSON(list[key])) {
                                return;
                            }
                            list[key] = JSON.parse(list[key]);
                        });
                        options.api = conversion_1.sanitize(options.api);
                        let completed = 0;
                        const verify = () => {
                            if (!_.isNumber(completed) || completed !== _.size(options)) {
                                return;
                            }
                            resolve(this.build(options, $scope));
                        };
                        _.each(options, (element, key) => {
                            if (!element || typeof element !== 'string') {
                                completed++;
                                verify();
                                return;
                            }
                            const interpreter = interpolate(element, false, null, true);
                            const initial = interpreter($scope.$parent);
                            if (typeof initial !== 'undefined') {
                                options[key] = initial;
                                completed++;
                                verify();
                                return;
                            }
                            if (!Stratus.Environment.get('production')) {
                                console.log('poll attribute:', key);
                            }
                            misc_1.poll(() => interpreter($scope.$parent), 7500, 250)
                                .then((value) => {
                                if (!Stratus.Environment.get('production')) {
                                    console.log('interpreted:', value);
                                }
                                if (typeof value === 'undefined') {
                                    return;
                                }
                                options[key] = value;
                                completed++;
                                verify();
                            })
                                .catch((message) => {
                                console.error(message);
                            });
                        });
                    });
                }
                build(options, $scope) {
                    let data;
                    if (options.target) {
                        options.target = misc_1.ucfirst(options.target);
                        if (options.manifest || options.id) {
                            if (!Stratus.Catalog[options.target]) {
                                Stratus.Catalog[options.target] = {};
                            }
                            const id = options.id || 'manifest';
                            if (options.decouple || !Stratus.Catalog[options.target][id]) {
                                const modelOptions = {
                                    target: options.target,
                                    manifest: options.manifest,
                                    stagger: true
                                };
                                if (options.urlRoot) {
                                    modelOptions.urlRoot = options.urlRoot;
                                }
                                if (options.targetSuffix) {
                                    modelOptions.targetSuffix = options.targetSuffix;
                                }
                                data = new stratus_services_model_1.Model(modelOptions, {
                                    id: options.id
                                });
                                if (!options.decouple) {
                                    Stratus.Catalog[options.target][id] = data;
                                }
                            }
                            else if (Stratus.Catalog[options.target][id]) {
                                data = Stratus.Catalog[options.target][id];
                            }
                        }
                        else {
                            const registry = !options.direct ? 'Catalog' : 'Compendium';
                            if (!Stratus[registry][options.target]) {
                                Stratus[registry][options.target] = {};
                            }
                            if (options.decouple ||
                                !Stratus[registry][options.target].collection) {
                                const collectionOptions = {
                                    target: options.target,
                                    direct: !!options.direct
                                };
                                if (options.urlRoot) {
                                    collectionOptions.urlRoot = options.urlRoot;
                                }
                                if (options.targetSuffix) {
                                    collectionOptions.targetSuffix = options.targetSuffix;
                                }
                                data = new stratus_services_collection_1.Collection(collectionOptions);
                                if (!options.decouple) {
                                    Stratus[registry][options.target].collection = data;
                                }
                            }
                            else if (Stratus[registry][options.target].collection) {
                                data = Stratus[registry][options.target].collection;
                            }
                        }
                        if (options.api) {
                            data.meta.set('api', misc_1.isJSON(options.api)
                                ? JSON.parse(options.api)
                                : options.api);
                        }
                        if (data.stagger && typeof data.initialize === 'function') {
                            data.initialize();
                        }
                    }
                    if (typeof data === 'object' && data !== null) {
                        if (typeof $scope !== 'undefined') {
                            $scope.data = data;
                            if (data instanceof stratus_services_model_1.Model) {
                                $scope.model = data;
                                if (typeof $scope.$applyAsync === 'function') {
                                    $scope.model.on('change', () => {
                                        $scope.$applyAsync();
                                    });
                                }
                            }
                            else if (data instanceof stratus_services_collection_1.Collection) {
                                $scope.collection = data;
                            }
                        }
                        if (!data.pending && !data.completed) {
                            data.fetch();
                        }
                    }
                    return data;
                }
            };
            exports_1("Registry", Registry);
            Stratus.Services.Registry = [
                '$provide',
                ($provide) => {
                    $provide.factory('Registry', [
                        '$interpolate',
                        'Collection',
                        'Model',
                        ($interpolate, collection, model) => {
                            interpolate = $interpolate;
                            return new Registry();
                        }
                    ]);
                }
            ];
            Stratus.Data.Registry = Registry;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWdCSSxXQUFXLEdBQUcsQ0FBQyxLQUFVLEVBQUUsa0JBQXVCLEVBQUUsY0FBbUIsRUFBRSxZQUFpQixFQUFFLEVBQUU7Z0JBTzlGLE9BQU8sQ0FBQyxJQUFZLEVBQUUsRUFBRTtvQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDbkQsQ0FBQyxDQUFBO1lBQ0wsQ0FBQyxDQUFBO1lBRUQsV0FBQSxNQUFhLFFBQVE7Z0JBQ2pCO29CQUVJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3RDLENBQUM7Z0JBTUQsS0FBSyxDQUFDLFFBQWEsRUFBRSxNQUFXO29CQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBWSxFQUFFLE1BQVcsRUFBRSxFQUFFO3dCQUM3QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTs0QkFDOUIsUUFBUSxHQUFHO2dDQUNQLE1BQU0sRUFBRSxRQUFROzZCQUNuQixDQUFBO3lCQUNKO3dCQUNELE1BQU0sTUFBTSxHQUFHOzRCQUNYLE1BQU0sRUFBRSxhQUFhOzRCQUNyQixZQUFZLEVBQUUsb0JBQW9COzRCQUNsQyxFQUFFLEVBQUUsU0FBUzs0QkFDYixRQUFRLEVBQUUsZUFBZTs0QkFDekIsUUFBUSxFQUFFLGVBQWU7NEJBQ3pCLE1BQU0sRUFBRSxhQUFhOzRCQUNyQixHQUFHLEVBQUUsVUFBVTs0QkFDZixPQUFPLEVBQUUsZUFBZTt5QkFDM0IsQ0FBQTt3QkFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQWEsRUFBRSxHQUFXLEVBQUUsSUFBUyxFQUFFLEVB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