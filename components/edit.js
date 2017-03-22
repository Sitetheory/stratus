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
        define(['stratus', 'underscore', 'angular', 'angular-material'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to allow editing of various attributes depending on context.
    Stratus.Components.Edit = {
        transclude: {
            render: 'stratusRender'
        },
        bindings: {
            elementId: '@',
            ngModel: '='
        },
        controller: function ($scope, $element, $attrs) {
            // Initialize
            this.uid = _.uniqueId('edit_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;

            // Settings
            $scope.edit = false;

            // Data Connectivity
            $scope.model = null;
            $scope.$watch('$ctrl.ngModel', function (data) {
                if (!_.isEqual(data, $scope.model)) {
                    $scope.model = data;
                }
            });

            // Save Model
            $scope.accept = function () {
                $scope.$ctrl.ngModel = $scope.model;
                $scope.edit = false;
            };

            // Cancel Edit
            $scope.cancel = function () {
                $scope.model = $scope.$ctrl.ngModel;
                $scope.edit = false;
            };

            // Trigger on Enter
            $element.bind('keydown keypress', function (event) {
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
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/edit' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
