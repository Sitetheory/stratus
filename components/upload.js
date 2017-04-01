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
            elementId: '@'
        },
        controller: function ($scope, $element, $attrs, $window) {
            this.uid = _.uniqueId('upload_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;
            $scope.dropzone = null;
            $scope.interval = $window.setInterval(function () {
                var $target = $('#' + $scope.elementId);
                if ($target.length && !$scope.dropzone) {
                    $scope.dropzone = new Dropzone($target[0], {
                        url: 'https://app.sitetheory.io:3000/?session=' + Stratus.Cookies.retrieve('SITETHEORY'),
                        method: 'POST',
                        parallelUploads: 5,
                        clickable: true,
                        maxFiles: null
                    });
                    $target.addClass('dropzone');
                    $window.clearInterval($scope.interval);
                }
            }, 1000);
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/upload' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
