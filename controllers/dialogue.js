//     Stratus.Controllers.Dialogue.js 1.0

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

// Angular Dialogue Controller
// --------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'stratus',
            'underscore',
            'angular'
        ], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This Controller handles simple dialogue display
    // with bindings for the associated model
    Stratus.Controllers.Dialogue = [
        '$scope',
        '$element',
        '$parse',
        '$mdDialog',
        function ($scope, $element, $parse, $mdDialog) {
            // Store Instance
            var uid = _.uniqueId('dialogue_');
            Stratus.Instances[uid] = $scope;

            // Digest Template
            $scope.template = $element.attr('template') || null;
            $scope.template = $scope.template ? document.querySelector($scope.template) : null;
            $scope.template = $scope.template ? $scope.template.innerHTML : null;

            // Digest Model Bindings
            $scope.model = null;
            $scope.$parent.$watch($element.attr('ng-model'), function (model) {
                if (model && typeof model === 'object') {
                    $scope.model = model;
                }
            });

            // Handle Dialogue
            $scope.show = function ($event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    template: $scope.template || 'Template Not Found!',
                    targetEvent: $event,
                    clickOutsideToClose: true,
                    locals: {
                        ngModel: $scope.model
                    },
                    controller: function ($scope, $mdDialog, ngModel) {
                        Stratus.Instances[uid + '_mdDialog'] = $scope;
                        $scope.model = ngModel;
                        $scope.close = function () {
                            $mdDialog.hide();
                        };
                    }
                });
            };
        }];

}));
