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
            'stratus.services.registry'
        ], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This Controller handles simple element binding
    // for a single scope to an API Object Reference.
    Stratus.Controllers.Generic = ['StratusGeneric', function ($scope, $element, $mdToast, $log, $parse, registry) {
        // Registry
        $scope.registry = new registry();
        $scope.registry.fetch($element, $scope);

        // Wrappers
        $scope.Stratus = Stratus;
        $scope.setUrlParams = function (options) {
            if (angular.isObject(options)) {
                var substance = false;
                angular.forEach(options, function (value) {
                    if (angular.isDefined(value) && value !== null) {
                        if (!angular.isString(value)) {
                            substance = true;
                        } else if (value.length > 0) {
                            substance = true;
                        }
                    }
                });
                if (substance) {
                    window.location.replace(Stratus.Internals.SetUrlParams(options));
                }
            }
        };
        $scope.$log = $log;

        // Handle Selected
        if ($scope.collection) {
            var selected = $element.attr('data-selected');
            if (selected) {
                // $scope.selected = { data: { id: parseInt(selected) } };
                $scope.$watch('collection.models', function (models) {
                    if (!$scope.selected && !$scope.selectedInit) {
                        angular.forEach(models, function (model) {
                            if (selected == model.get('id')) {
                                $scope.selected = model;
                                $scope.selectedInit = true;
                            }
                        });
                    }
                });
            }
        }

        // Scaling Controller
        $scope.scale = 2;
        $scope.$watch('scale', function () {
            var scale = 'Medium';
            if ($scope.scale == 2) {
                scale = 'Large';
            } else if ($scope.scale == 0) {
                scale = 'Small';
            }
            document.querySelector('body').dataset.scale = scale;
        });

        // Settings
        /*
        $scope.froalaOptions = {
            toolbarButtons: ['bold', 'italic', 'underline', '|', 'align']
        };
        */

        // Notifications Service
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

        // Store Instance
        Stratus.Instances[_.uniqueId('controller_')] = $scope;
    }];

}));
