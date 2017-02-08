//     Stratus.Components.mediaSelector.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of $scope information or reproduction of $scope
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Stratus Media Selector Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'angular', 'angular-file-upload', 'jquery-cookie'], factory);
    } else {
        factory(root.Stratus, root.$);
    }
}(this, function (Stratus, $) {
    // We need to ensure the ng-file-upload is registered
    Stratus.Modules.ngFileUpload = true;

    // This component intends to handle binding of an
    // item array into a particular attribute.
    Stratus.Components.MediaSelector = {
        bindings: {
            ngModel: '='
        },
        controller: function ($scope, $http, $attrs, $parse, $element, Upload) {
            Stratus.Instances[_.uniqueId('media_selector')] = $scope;
            $scope.model = $scope.$parent.model;
            $scope.log = '';

            // $scope.media = $parse($attrs.ngModel);
            // Methods
            $scope.mediaUpload = function () {
                alert('get all media');
            };
            $scope.uploadFiles = function (file) {
                console.log(file);

                //upload file to session api
                Upload.upload({
                    url: 'https://app.sitetheory.io:3000/?session=' + $.cookie('SITETHEORY'),
                    data: {
                        // username: 'test',
                        file: file
                    }
                }).then(function (resp) {
                    console.log(resp);
                });
            };

        },
        template: '<h2>Upload Images</h2>' +
        '<div style="background: gainsboro">' +
        '<div ngf-drop="uploadFiles($files)" ng-model="picFile" class="drop-box" ngf-drag-over-class="dragover">' +
        'Open library to select images, or drag and drop new images here' +
        '</div>' +
        '</div>' +
        '<div ngf-thumbnail="picFile" ngf-size="{width: 20, height: 20, quality: 0.9}"></div>' +
        '<md-button class="md-fab" aria-label="FAB" ng-click="mediaUpload()"></md-button>'
    };
}));
