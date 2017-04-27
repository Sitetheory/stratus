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
    Stratus.Controllers.Generic = [
        '$scope',
        '$element',
        '$mdToast',
        '$log',
        '$parse',
        'registry',
        function ($scope, $element, $mdToast, $log, $parse, registry) {
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

            // Type Checks
            $scope.isArray = angular.isArray;
            $scope.isDate = angular.isDate;
            $scope.isDefined = angular.isDefined;
            $scope.isElement = angular.isElement;
            $scope.isFunction = angular.isFunction;
            $scope.isNumber = angular.isNumber;
            $scope.isObject = angular.isObject;
            $scope.isString = angular.isString;
            $scope.isUndefined = angular.isUndefined;

            // Handle Selected
            if ($scope.collection) {
                var selected = {
                    id: $element.attr('data-selected'),
                    raw: $element.attr('data-raw')
                };
                if (selected.id) {
                    if (angular.isString(selected.id)) {
                        if (_.isJSON(selected.id)) {
                            selected.id = JSON.parse(selected.id);
                            $scope.$watch('collection.models', function (models) {
                                if (!$scope.selected && !$scope.selectedInit) {
                                    angular.forEach(models, function (model) {
                                        if (selected.id === model.get('id')) {
                                            $scope.selected = selected.raw ? model.data : model;
                                            $scope.selectedInit = true;
                                        }
                                    });
                                }
                            });
                        } else {
                            selected.model = $parse(selected.id);
                            selected.value = selected.model($scope.$parent);
                            if (angular.isArray(selected.value)) {
                                selected.value = selected.value.filter(function (n) {
                                    return n;
                                });
                                if (selected.value.length) {
                                    $scope.selected = _.first(selected.value);
                                }
                            }
                        }
                    }
                }
            }

            // Scaling Controller
            /* *
            $scope.scale = 2;
            $scope.$watch('scale', function () {
                var scale = 'Medium';
                if ($scope.scale === 2) {
                    scale = 'Large';
                } else if ($scope.scale === 0) {
                    scale = 'Small';
                }
                document.querySelector('body').dataset.scale = scale;
            });
            /* */

            // Notifications Service
            /* *
            $scope.showActionToast = function (message) {
                var toast = $mdToast.simple()
                    .textContent(message)
                    .action('UNDO')
                    .highlightAction(true)
                    .highlightClass('md-accent')
                    .position('top right');
                $mdToast.show(toast).then(function (response) {
                    if (response === 'ok') {
                        console('undo clicked.');
                    }
                }, $scope.error);
            };
            /* */

            // Store Instance
            Stratus.Instances[_.uniqueId('controller_')] = $scope;
        }];

}));
