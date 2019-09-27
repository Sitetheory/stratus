System.register(["lodash", "stratus", "stratus.services.model", "stratus.services.collection", "@stratus/core/conversion", "@stratus/core/misc"], function (exports_1, context_1) {
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
                        const options = conversion_1.sanitize(_.each(inputs, (value, key, list) => {
                            list[key] = $element.attr ? $element.attr(value) : $element[key];
                        }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWdCSSxXQUFXLEdBQUcsQ0FBQyxLQUFVLEVBQUUsa0JBQXVCLEVBQUUsY0FBbUIsRUFBRSxZQUFpQixFQUFFLEVBQUU7Z0JBTzlGLE9BQU8sQ0FBQyxJQUFZLEVBQUUsRUFBRTtvQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDbkQsQ0FBQyxDQUFBO1lBQ0wsQ0FBQyxDQUFBO1lBRUQsV0FBQSxNQUFhLFFBQVE7Z0JBQ2pCO29CQUVJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3RDLENBQUM7Z0JBTUQsS0FBSyxDQUFDLFFBQWEsRUFBRSxNQUFXO29CQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBWSxFQUFFLE1BQVcsRUFBRSxFQUFFO3dCQUM3QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTs0QkFDOUIsUUFBUSxHQUFHO2dDQUNQLE1BQU0sRUFBRSxRQUFROzZCQUNuQixDQUFBO3lCQUNKO3dCQUNELE1BQU0sTUFBTSxHQUFHOzRCQUNYLE1BQU0sRUFBRSxhQUFhOzRCQUNyQixZQUFZLEVBQUUsb0JBQW9COzRCQUNsQyxFQUFFLEVBQUUsU0FBUzs0QkFDYixRQUFRLEVBQUUsZUFBZTs0QkFDekIsUUFBUSxFQUFFLGVBQWU7NEJBQ3pCLE1BQU0sRUFBRSxhQUFhOzRCQUNyQixHQUFHLEVBQUUsVUFBVTs0QkFDZixPQUFPLEVBQUUsZUFBZTt5QkFDM0IsQ0FBQTt3QkFDRCxNQUFNLE9BQU8sR0FBRyxxQkFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEdBQVcsRUFBRSxJ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