//     Stratus.Components.Edit.js 1.0

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

// Stratus Edit Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'angular-material', 'stratus.services.model'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to allow editing of various attributes depending on context.
    Stratus.Components.Edit = {
        transclude: {
            view: '?stratusEditView',
            input: '?stratusEditInput'
        },
        bindings: {
            elementId: '@',
            ngModel: '=',
            property: '@',
            autoSave: '@' // A bool/string to define if the model will auto save on focus out or Enter presses. Defaults to true
        },
        controller: function ($scope, $element, $attrs, $timeout, model) {

            // Initialize
            this.uid = _.uniqueId('edit_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;
            $scope.edit_input_container = $element[0].getElementsByClassName('stratus_edit_input_container')[0];

            // TODO make a option to select the livEditStatus option

            // Settings
            $scope.edit = false;
            $scope.property = $attrs.property || null;
            $scope.autoSave = $attrs.autoSave || null;

            // Data Connectivity
            $scope.model = null;
            $scope.value = null;

            if (!model || !$scope.property) {
                console.warn($scope.uid + ' has no model or property!');
                return;
            }

            // METHODS

            $scope.setEdit = function (bool) {
                // Only allow Edit mode if liveedit is enabled.
                if (Stratus.Environment.data.liveEdit && bool) {
                    $scope.edit = bool;
                    $scope.focusOnEditable();
                } else {
                    $scope.edit = false;
                }
            };

            $scope.focusOnEditable = function () {
                $timeout(function () {
                    if ($scope.edit_input_container.getElementsByTagName('input').length > 0) {
                        // Focus on the input field
                        $scope.edit_input_container.getElementsByTagName('input')[0].focus();
                    } else if ($($scope.edit_input_container).find('[contenteditable]').length > 0) {
                        // Focus on any contenteditable (including froala)
                        $($scope.edit_input_container).find('[contenteditable]').focus();
                    } else {
                        // No known edit location, so try to focus on the entire container
                        $scope.edit_input_container.focus();
                    }
                }, 0);
            };

            $scope.accept = function () {
                if ($scope.model instanceof model && $scope.property) {
                    $scope.model.set($scope.property, $scope.value);
                    $scope.model.save();
                }
            };

            $scope.cancel = function () {
                if ($scope.model instanceof model && $scope.property) {
                    $scope.value = $scope.model.get($scope.property);
                }
                $scope.setEdit(false);
            };

            // WATCHERS

            $scope.$watch('$ctrl.ngModel', function (data) {
                if (data instanceof model && !_.isEqual(data, $scope.model)) {
                    $scope.model = data;
                }
            });
            $scope.$watch('model.data.' + $scope.property, function (data) {
                $scope.value = data;
            });

            // TRIGGERS

            // Save / Cancel value on key press
            // FIXME saving with key press with cause two saves (due to focus out). We need a save throttle to prevent errors
            $($scope.edit_input_container).on('keypress', function (event) {
                console.log(event);
                switch (event.which) {
                    case Stratus.Key.Enter:
                        if ($scope.autoSave !== false && $scope.autoSave !== 'false') {
                            $scope.$apply($scope.accept);
                        }
                        $scope.setEdit(false);
                        break;
                    case Stratus.Key.Escape:
                        $scope.$apply($scope.cancel);
                        break;
                }
            });

            // FIXME save of focus out does not work on the media selector correctly
            // Update value on change, save value on blur
            $($scope.edit_input_container).on('focusout', function () {
                if ($scope.autoSave !== false && $scope.autoSave !== 'false') {
                    $scope.$apply($scope.accept);
                }
                $scope.setEdit(false);
            });
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/edit' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
