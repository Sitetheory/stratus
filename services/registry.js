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
        $provide.factory('registry', function (collection, model) {
            return function () {
                // Maintain all models in Namespace
                // Inverse the parent and child objects the same way Doctrine does
                this.fetch = function ($element) {
                    // Find or Create Reference
                    var data;
                    if ($element.attr('data-manifest') || $element.attr('data-id')) {
                        data = new model({
                            entity: $element.attr('data-target'),
                            manifest: $element.attr('data-manifest')
                        }, {
                            id: $element.attr('data-id')
                        });
                    } else {
                        data = new collection({
                            entity: $element.attr('data-target')
                        });
                    }

                    // Filter if Necessary
                    var api = $element.attr('data-api') || null;
                    if (api && _.isJSON(api)) {
                        data.meta.set('api', JSON.parse(api));
                    }

                    // Fetch Data
                    data.fetch();
                    return data;
                };
            };
        });
    }];

}));
