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

// Angular Generic Controller
// --------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'stratus',
            'underscore',
            'angular',
            'stratus.services.model',
            'stratus.services.collection'
        ], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This Controller handles simple element binding
    // for a single scope to an API Object Reference.
    Stratus.Controllers.Generic = {
        alias: 'StratusController',
        initialize: function ($scope, $element, $mdToast, $http, collection, model) {
            // Data Binding
            if ($element.attr('data-manifest') || $element.attr('data-id')) {
                $scope.model = new model({
                    entity: $element.attr('data-target'),
                    manifest: $element.attr('data-manifest')
                }, {
                    id: $element.attr('data-id')
                });
                $scope.data = $scope.model;
            } else {
                $scope.collection = new collection({
                    entity: $element.attr('data-target')
                });
                $scope.data = $scope.collection;
            }

            // Filter and Fetch
            var api = $element.attr('data-api') || null;
            if (api && _.isJSON(api)) {
                $scope.data.meta.set('api', JSON.parse(api));
            }
            $scope.data.fetch();

            // Scaling
            $scope.scale = 100;
            $scope.$watch('scale', function() {
                var scale = "Medium";
                if ($scope.scale > 70) {
                    scale = "Large";
                } else if ($scope.scale < 30) {
                    scale = "Small";
                }
                document.querySelector('body').dataset.scale = scale;
            });

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
        }
    };

}));
