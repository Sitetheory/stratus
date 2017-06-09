//     Stratus.Directives.Edit.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
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

// Stratus Edit Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'stratus.services.model'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This directive intends to handle binding of a dynamic variable to
    Stratus.Directives.Edit = function ($parse, $log, model) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                ngModel: '=',
                property: '@',
                emptyValue: '@', // A value to display if it is currently empty
                prefix: '@', // A value to prepend to the front of the value
                stratusEdit: '=', // A value to define if the element can currently be editable
                alwaysEdit: '@', // A bool/string to define if the element will always be in editable mode
                autoSave: '@' // A bool/string to define if the model will auto save on focus out or Enter presses. Defaults to true
            },
            link: function ($scope, $element, $attrs, ngModel) {
                // Initialize
                $scope.uid = this.uid = _.uniqueId('edit_');
                Stratus.Instances[this.uid] = $scope;

                // Data Connectivity
                $scope.model = null;
                $scope.value = null;

                if (!ngModel || !$scope.property) {
                    console.warn($scope.uid + ' has no model or property!');
                    return;
                }

                // METHODS

                ngModel.$render = function () {
                    $element.html(($scope.prefix || '') + ($scope.value || $scope.emptyValue || ''));
                };

                $scope.liveEditStatus = function () {
                    if ($scope.stratusEdit !== undefined) {
                        return $scope.stratusEdit;
                    } else if (Stratus.Environment.data.liveEdit !== undefined) {
                        return Stratus.Environment.data.liveEdit;
                    }
                    console.warn($scope.uid + ' has no variable to track edit toggle! ($scope.stratusEdit)');
                    return false;
                };

                $scope.read = function () {
                    $scope.value = $element.html();
                    if ($scope.prefix) {
                        $scope.value = $scope.value.replace($scope.prefix, '');
                    }
                };

                $scope.accept = function () {
                    if ($scope.model instanceof model && $scope.property) {
                        // FIXME when the property is an array ( route[0].url ), model.set isn't treating route[0] as an array, but rather a whole new section.
                        $scope.model.set($scope.property, $scope.value);
                        $scope.model.save();
                    }
                };
                $scope.cancel = function () {
                    if ($scope.model instanceof model && $scope.property) {
                        $scope.value = $scope.model.get($scope.property);
                    }
                };

                // WATCHERS

                if ($scope.alwaysEdit !== true && $scope.alwaysEdit !== 'true') {
                    $scope.$watch($scope.liveEditStatus, function (liveEdit) {
                        $element.attr('contenteditable', liveEdit);
                        if (liveEdit) {
                            $element.addClass('liveEdit');
                        } else {
                            $element.removeClass('liveEdit');
                        }
                    });
                } else {
                    $element.attr('contenteditable', true);
                }

                $scope.$watch('ngModel', function (data) {
                    if (data instanceof model && !_.isEqual(data, $scope.model)) {
                        $scope.model = data;
                    }
                });
                $scope.$watch('model.data.' + $scope.property, function (data) {
                    $scope.value = data;
                    ngModel.$render(); // if the value changes, show the new change (since rendering doesn't always happen)
                });

                // TRIGGERS

                // Update value on change, save value on blur
                $element.on('focusout keyup change', function () {
                    $scope.$apply($scope.read);
                    if ($scope.autoSave !== false && $scope.autoSave !== 'false') {
                        switch (event.type) {
                            case 'focusout':
                            case 'blur':
                                $scope.$apply($scope.accept);
                                break;
                        }
                    }
                });

                // Save / Cancel value on key press
                $element.on('keydown keypress', function (event) {
                    switch (event.which) {
                        case Stratus.Key.Enter:
                            event.preventDefault(); // Prevent Line breaks
                            if ($scope.autoSave !== false && $scope.autoSave !== 'false') { // Placed here because we still want to prevent Line breaks
                                $scope.$apply($scope.accept);
                            }
                            break;
                        case Stratus.Key.Escape:
                            $scope.$apply($scope.cancel);
                            break;
                    }
                });
            }
        };
    };
}));
