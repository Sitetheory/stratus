//     Stratus.Components.Upload.js 1.0

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

// Stratus Upload Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([

            // Libraries
            'stratus',
            'underscore',
            'jquery',
            'dropzone',
            'angular',

            // Modules
            'angular-material'
        ], factory);
    } else {
        factory(root.Stratus, root._, root.$, root.Dropzone);
    }
}(this, function (Stratus, _, $, Dropzone) {
    // This component is for simple upload to the Stratus S3 service.
    Stratus.Components.Upload = {
        transclude: true,
        bindings: {
            elementId: '@',
            mediaId: '<'
        },
        controller: function ($scope, $element, $attrs, $window) {
            // Scope Settings
            this.uid = _.uniqueId('upload_');
            Stratus.Instances[this.uid] = $scope;

            // Element Settings
            $scope.elementId = $attrs.elementId || this.uid;
            $scope.mediaId = $attrs.mediaId || null;

            // Listen for Media ID changes
            $scope.$watch('$ctrl.mediaId', function (data) {
                if (typeof data === 'number') {
                    $scope.mediaId = data;
                }
            });

            // DropZone Builder
            $scope.dropzone = null;
            $scope.interval = $window.setInterval(function () {
                var $target = $('#' + $scope.elementId);
                if ($target.length && !$scope.dropzone && (!$scope.mediaId || typeof $scope.mediaId === 'number')) {
                    $scope.dropzone = new Dropzone($target[0], {
                        url: 'https://app002.sitetheory.io:3000/?session=' + _.cookie('SITETHEORY') + (
                            $scope.mediaId ? ('&id=' + $scope.mediaId) : ''
                        ),
                        method: 'POST',
                        parallelUploads: $scope.mediaId ? 1 : 5,
                        clickable: true,
                        maxFiles: $scope.mediaId ? 1 : null
                    });
                    $target.addClass('dropzone');
                    $window.clearInterval($scope.interval);
                }
            }, 500);
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/upload' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
