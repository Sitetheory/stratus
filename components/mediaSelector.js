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
        define(['stratus', 'jquery', 'angular', 'jquery-cookie', 'angular-file-upload', 'stratus.services.registry', 'angular-material'], factory);
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
        controller: function ($scope, $http, $attrs, $parse, $element, Upload, $compile, registry, $mdPanel) {
            Stratus.Instances[_.uniqueId('media_selector')] = $scope;

            // load component css
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            // use stratus collection locally
            $scope.registry = new registry();

            // fetch media collection and hydrate to $scope.collection
            $scope.registry.fetch('Media', $scope);

            // set media library to false
            $scope.showLibrary = false;
            $scope.showDragDropLibrary = false;
            $scope.dragDrop = false;
            $scope.browseDiv = true;
            $scope.draggedFiles = [];

            // switch to ng-model and Stratus Collection
            /**
            $scope.mediaLib = {};
            $scope.mediaLibrary2 = {};
            /**/

            // this._mdPanel = $mdPanel;
            var panelRef = $scope._mdPanelRef;

            // initialise library class to plus
            $scope.showLibraryClass = 'fa fa-plus-square-o';
            $scope.dragDropClass = 'fa fa-plus';

            // Methods
            $scope.mediaUpload = function () {
                alert('get all media');
            };

            $scope.zoomView = function (event) {
                console.log(event);
                console.log(Stratus);
                $scope.mediaDetail = event;
                var position = $mdPanel.newPanelPosition()
                    .absolute()
                    .center();

                var config = {
                    attachTo: angular.element(document.body),

                    // controller: 'mediaZoomView',
                    // controllerAs: 'ctrl',
                    scope: $scope,
                    disableParentScroll: this.disableParentScroll,
                    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaDetail' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',

                    // hasBackdrop: true,
                    panelClass: 'media-dialog',
                    position: position,
                    trapFocus: true,
                    zIndex: 150,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    focusOnOpen: true
                };

                $mdPanel.open(config);

            };

            $scope.closeDialog = function () {

                console.log(panelRef);
                panelRef.close();
            };

            /* $scope.beforeChange = function(files) {
                 alert('before change');
                 console.log(files);
             }*/

            $scope.uploadFiles = function (files) {
                console.log(files);

                // alert('upload');
                return false;

                // show drag & drop div
                $scope.dragDrop = true;

                // hide browse click div
                $scope.browseDiv = false;

                // hide if media library is opened on click
                $scope.showLibrary = false;

                // show media library on drag & drop
                // $scope.showDragDropLibrary = true;

                // check if media library already opened, then load media library
                if ($scope.dragDropClass === 'fa fa-minus') {
                    // $scope.dragDropClass = 'fa fa-minus';
                    $scope.showDragDropLibrary = true;
                    $scope.uploadDragDropLibrary();
                }

                // dynamic content to media library
                angular.forEach(files, function (file) {
                    $scope.saveMedia(file);
                });
            };

            // upload directly to media library
            $scope.uploadToLibrary = function (files) {
                angular.forEach(files, function (file) {
                    Upload.upload({
                        // This is the correct
                        url: 'https://app.sitetheory.io:3000/?session=' + $.cookie('SITETHEORY'),

                        // url: 'https://angular-file-upload-cors-srv.appspot.com',
                        data: {
                            file: file
                        }
                    }).then(function (resp) {
                        // will be changed once templating is done
                        $scope.mediaLib.push(resp.data);

                        // $scope.mediaLibrary2.push(resp.data);
                    });
                });
            };

            // common function to save media
            $scope.saveMedia = function (file) {
                // upload file to session api
                console.log(file);

                Upload.upload({
                    // This is the correct
                    url: 'https://app.sitetheory.io:3000/?session=' + $.cookie('SITETHEORY'),

                    // url: 'https://angular-file-upload-cors-srv.appspot.com',
                    data: {
                        file: file
                    }
                }).then(function (resp) {
                    $scope.draggedFiles.push(resp.data);

                });
            };

            $scope.openLibrary = function () {
                // show library media
                if ($scope.showLibraryClass === 'fa fa-plus-square-o') {
                    $scope.showLibraryClass = 'fa fa-minus-square-o';
                    $scope.showLibrary = true;
                    $scope.showDragDropLibrary = false;
                    $scope.dragDropClass = 'fa fa-plus';
                    if ($scope.dragDropClass === 'fa fa-plus') {
                        $scope.dragDropClass = 'fa fa-minus';
                    } else {
                        $scope.dragDropClass = 'fa fa-plus';
                    }

                    // switch to registry controls
                    $scope.collection.fetch();

                    /**
                    $http.get('/Api/Media').then(function (resp) {
                        if (resp) {
                            $scope.mediaLib = resp.data.payload;

                            // template: _.template('<div>Filter Template Here!</div>');
                            // var myEl = angular.element(document.querySelector('#openLibrary'));
                            // myEl.html('');
                            // myEl.prepend( _.template('<div>Filter Template Here!</div>'));

                        }
                    });
                    /**/

                } else if ($scope.showLibraryClass === 'fa fa-minus-square-o') {
                    $scope.showLibraryClass = 'fa fa-plus-square-o';
                    $scope.showLibrary = false;
                }

            };

            $scope.mediaLibrary = function () {
                if ($scope.dragDropClass === 'fa fa-plus') {
                    $scope.dragDropClass = 'fa fa-minus';

                    // $scope.showLibraryClass = 'fa fa-plus-square-o';
                    // hide if library opened above
                    $scope.showLibrary = false;

                    // show media library div
                    $scope.showDragDropLibrary = true;

                    // load media library
                    $scope.uploadDragDropLibrary();

                } else if ($scope.dragDropClass === 'fa fa-minus') {
                    $scope.dragDropClass = 'fa fa-plus';
                    $scope.showDragDropLibrary = false;
                }
            };

            // common function to load media library into html when drag and dropped
            $scope.uploadDragDropLibrary = function () {
                // switch to registry controls
                $scope.collection.fetch();

                /**
                $http.get('/Api/Media').then(function (resp) {
                    $scope.mediaLibrary2 = resp.data.payload;
                });
                /**/
            };

        },

        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'

    };
}));
