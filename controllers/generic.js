//     Stratus.Controllers.Generic.js 1.0

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
        define([
            'stratus',
            'underscore',
            'angular',
            'stratus.models.provider',
            'stratus.collections.provider'
        ], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // Angular View Provider
    // ---------------------

    // This View Service handles element binding for a single scope and element
    Stratus.Controllers.Generic = ['StratusController', function ($scope, $element, $mdToast, $http, collection, model) {
        // Data Binding
        if ($element.attr('data-manifest') || $element.attr('data-id')) {
            $scope.model = new model({
                entity: $element.attr('data-target'),
                manifest: $element.attr('data-manifest')
            }, {
                id: $element.attr('data-id')
            });
            $scope.model.fetch();
        } else {
            $scope.collection = new collection({
                entity: $element.attr('data-target')
            });
            var api = $element.attr('data-api') || null;
            if (api && _.isJSON(api)) {
                $scope.collection.meta.set('api', JSON.parse(api));
            }
            $scope.collection.fetch();
        }

        // Notifications
        $scope.showActionToast = function (message) {
            var toast = $mdToast.simple()
                .textContent(message)
                .action('UNDO')
                .highlightAction(true)
                .highlightClass('md-accent')
                .position('top right');
            $mdToast.show(toast).then(function (response) {
                if (response == 'ok') {
                    console('undo clicked.');
                }
            }, $scope.error);
        };
    }];

}));
