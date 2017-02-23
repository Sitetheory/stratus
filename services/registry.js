//     Stratus.Services.Registry.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'stratus.services.collection', 'stratus.services.model'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // Angular Registry Service
    // ------------------------

    // This Collection Service handles data binding for multiple objects with the $http Service
    Stratus.Services.Registry = ['$provide', function ($provide) {
        $provide.factory('registry', function (collection, model, $parse, $interpolate) {
            return function () {
                // Maintain all models in Namespace
                // Inverse the parent and child objects the same way Doctrine does
                this.fetch = function ($element, $scope) {
                    if (angular.isString($element)) $element = { target: $element };
                    console.log('element:', $element);
                    var options = {
                        target: $element.attr ? $element.attr('data-target') : $element.target,
                        id: $element.attr ? $element.attr('data-id') : $element.id,
                        manifest: $element.attr ? $element.attr('data-manifest') : $element.manifest,
                        decouple: $element.attr ? $element.attr('data-decouple') : $element.decouple,
                        api: $element.attr ? $element.attr('data-api') : $element.api
                    };
                    var data;
                    _.each(options, function (element, key) {
                        if (element) options[key] = $interpolate(element)($scope);
                    });
                    if (options.target) {
                        options.target = _.ucfirst(options.target);

                        // Find or Create Reference
                        if (options.manifest || options.id) {
                            if (!Stratus.Catalog[options.target]) {
                                Stratus.Catalog[options.target] = {};
                            }
                            var id = options.id || 'manifest';
                            if (options.decouple || !Stratus.Catalog[options.target][id]) {
                                data = new model({
                                    target: options.target,
                                    manifest: options.manifest
                                }, {
                                    id: options.id
                                });
                                if (!options.decouple) {
                                    Stratus.Catalog[options.target][id] = data;
                                }
                            } else if (Stratus.Catalog[options.target][id]) {
                                data = Stratus.Catalog[options.target][id];
                            }
                        } else {
                            if (!Stratus.Catalog[options.target]) {
                                Stratus.Catalog[options.target] = {};
                            }
                            if (options.decouple || !Stratus.Catalog[options.target].collection) {
                                data = new collection({
                                    target: options.target
                                });
                                if (!options.decouple) {
                                    Stratus.Catalog[options.target].collection = data;
                                }
                            } else if (Stratus.Catalog[options.target].collection) {
                                data = Stratus.Catalog[options.target].collection;
                            }
                        }

                        // Filter if Necessary
                        if (options.api) {
                            data.meta.set('api', _.isJSON(options.api) ? JSON.parse(options.api) : options.api);
                        }
                    }

                    // Evaluate
                    if (angular.isObject(data)) {
                        if (typeof $scope !== 'undefined') {
                            $scope.data = data;
                            if (data instanceof model) {
                                $scope.model = data;
                            } else if (data instanceof collection) {
                                $scope.collection = data;
                            }
                        }
                        if (!data.pending && !data.completed) {
                            data.fetch();
                        }
                    }
                    return data;
                };
            };
        });
    }];

}));
