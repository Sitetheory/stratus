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
            property: '@'
        },
        controller: function ($scope, $element, $attrs, model) {
            // Initialize
            this.uid = _.uniqueId('edit_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;
            $scope.edit_input_container = $element[0].getElementsByClassName('stratus_edit_input_container')[0];

            // Settings
            $scope.edit = false;
            $scope.property = $attrs.property || null;

            // Data Connectivity
            $scope.model = null;
            $scope.value = null;
            if ($scope.property) {
                $scope.$watch('$ctrl.ngModel', function (data) {
                    if (data instanceof model && !_.isEqual(data, $scope.model)) {
                        $scope.model = data;
                    }
                });
                $scope.$watch('model.data.' + $scope.property, function (data) {
                    $scope.value = data;
                });
            }
            $scope.setEdit = function (bool) {
                // Only allow Edit mode if liveedit is enabled.
                // TODO: provide an option to use this functionality
                if (Stratus.Environment.data.liveEdit && bool) {
                    $scope.edit = bool;
                    if (bool) {
                        setTimeout(function () {
                            if ($scope.edit_input_container.getElementsByTagName('input').length > 0) {
                                // Focus on the input field
                                $scope.edit_input_container.getElementsByTagName('input')[0].focus();
                            } else if ($scope.edit_input_container.getElementsByClassName('fr-view').length > 0) {
                                // Focus on the froala editable field
                                $scope.edit_input_container.getElementsByClassName('fr-view')[0].focus();
                            }
                        }, 0);
                    }
                } else {
                    $scope.edit = false;
                }
            };
            $scope.accept = function () {
                if ($scope.model instanceof model && $scope.property) {
                    $scope.model.set($scope.property, $scope.value);
                    $scope.model.save();
                }
                $scope.edit = false;
            };
            $scope.cancel = function () {
                if ($scope.model instanceof model && $scope.property) {
                    $scope.value = $scope.model.get($scope.property);
                }
                $scope.edit = false;
            };

            // Key Triggers
            $element.on('keydown keypress', function (event) {
                switch (event.which) {
                    case Stratus.Key.Enter:
                        $scope.$apply(function () {
                            $scope.accept();
                        });
                        break;
                    case Stratus.Key.Escape:
                        $scope.$apply(function () {
                            $scope.cancel();
                        });
                        break;
                }
            });

            setTimeout(function () {
                /*var $editContainer;
                if ($scope.edit_input_container.getElementsByTagName('input').length > 0) {
                    // and input container
                    $editContainer = $($scope.edit_input_container.getElementsByTagName('input')[0]);
                } else if ($scope.edit_input_container.getElementsByClassName('fr-box').length > 0) {
                    // froala element container
                    $editContainer = $($scope.edit_input_container.getElementsByClassName('fr-box')[0]);
                }
                if ($editContainer) {
                    $editContainer.on('focusout', function (event) {
                        switch (event.type) {
                            case 'focusout':
                                $scope.$apply(function () {
                                    $scope.accept();
                                });
                                console.log('Focusing out');
                                break;
                        }
                    });

                    // $editContainer.notClicked(function () {console.log('test!');});
                }*/

                // Save on Focus out
                if ($scope.edit_input_container) {
                    // FIXME this does not work for non-form type element (e.g. Media selector)
                    $($scope.edit_input_container).on('focusout', function (event) {
                        switch (event.type) {
                            case 'focusout':
                                $scope.$apply(function () {
                                    $scope.accept();
                                });
                                console.log('Focusing out');
                                break;
                        }
                    });

                    $(document).on('click', function (event) {
                        // console.log($($scope.edit_input_container).notClicked(event));
                        /*console.log(event);
                        if ((!event.target.closest('*').length && !$($scope.edit_input_container).parents('*').length)) {
                            console.log('Element was not clicked');
                        } else {
                            console.log('it was clicked?');
                        }*/

                        /*if (
                            $($scope.edit_input_container).parents('*').length
                        ) {
                            console.log($($scope.edit_input_container).parents('*'));
                        }*/
                    });
                }
            }, 0);
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/edit' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
