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
        define(['stratus', 'jquery', 'angular', 'jquery-cookie', 'ng-file-upload'], factory);
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
            console.log(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaSelector.css');

            //load component css
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaSelector.css');
            $scope.model = $scope.$parent.model;

            // set media library to false
            $scope.showLibrary = false;
            $scope.showDragDropLibrary = false;

            //initialise library class to plus
            $scope.showLibraryClass = 'fa fa-plus-square-o';
            $scope.dragDropClass = 'fa fa-plus';

            // $scope.media = $parse($attrs.ngModel);
            // Methods
            $scope.mediaUpload = function () {
                alert('get all media');
            };
            $scope.uploadFiles = function (file) {
                console.log(file[0]);

                //upload file to session api
                Upload.upload({
                    url: 'https://app.sitetheory.io:3000/?session=' + $.cookie('SITETHEORY'),
                    data: {
                        // username: 'test',
                        file: file[0]
                    }
                }).then(function (resp) {
                    // console.log(resp);
                });
            };

            var html =  '<div class="gallery-box"> ' +
                /*'<div class="gl-header"> ' +
                 '<h3>Header <span><i class="fa fa-question" aria-hidden="true"></i></span></h3> ' +
                 '</div><!-- Gallery header Ends --> ' +*/
                '<div class="gl-content"> ' +
                '<div class="search-bar">' +
                '<div class="gal-search"><h4>SEARCH</h4> <input type="text" class="search-gl-txt" placeholder="Travel" /> ' +
                '<button class="search--btn"><i class="fa fa-search" aria-hidden="true"></i></button> ' +
                '</div>' +
                '<p>To upload more images to library, drag and drop here or <a href="#"> Click Here </a></p>' +
                '</div><!-- Search Bar Ends -->' +
                '<ul> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '<li>' +
                '<div class="gl-img-container dummy-image">' +
                '<a href="#"></a>' +
                '</div><!-- Gallery Image Container Ends --> ' +
                '<div class="image-info-outer">' +
                '<div class="img-info"> ' +
                '<div class="img-info-left"> ' +
                '<div class="format-size">' +
                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                '</div>' +
                '<p>Loren ipsum is dummy text</p> ' +
                '</div><!-- Image Left Info Ends --> ' +
                '<div class="img-info-right"> ' +
                '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                '</div><!-- Image Info Right Ends --> ' +
                '</div><!-- Image Info Ends --> ' +
                '</div><!-- Image Outer Ends --> ' +
                '</li> ' +
                '</ul> ' +
                '</div><!-- Gl Content Ends --> ' +
                '</div><!-- Gallery Box Ends --> ';

            $scope.openLibrary = function () {
                // show library media
                if ($scope.showLibraryClass === 'fa fa-plus-square-o') {
                    $scope.showLibraryClass = 'fa fa-minus-square-o';
                    $scope.showLibrary = true;
                    $scope.showDragDropLibrary = false;
                    $scope.dragDropClass = 'fa fa-plus';
                    var myEl = angular.element(document.querySelector('#openLibrary'));
                    myEl.html('');
                    myEl.prepend(html);

                    $http.get('https://admin.sitetheory.io/Api/Media').then(function (resp) {
                        console.log(Stratus.BaseUrl);
                    });

                } else if ($scope.showLibraryClass === 'fa fa-minus-square-o') {
                    $scope.showLibraryClass = 'fa fa-plus-square-o';
                    $scope.showLibrary = false;
                }
            };

            $scope.mediaLibrary = function () {
                if ($scope.dragDropClass === 'fa fa-plus') {
                    $scope.dragDropClass = 'fa fa-minus';
                    $scope.showLibraryClass = 'fa fa-plus-square-o';
                    $scope.showLibrary = false;
                    $scope.showDragDropLibrary = true;

                    var myEl = angular.element(document.querySelector('#openDragDropLibrary'));
                    myEl.html('');
                    myEl.prepend(html);
                    $http.get('https://admin.sitetheory.io/Api/Media').then(function (resp) {
                         console.log(Stratus.BaseUrl);
                     });

                }else if ($scope.dragDropClass === 'fa fa-minus') {
                    $scope.dragDropClass = 'fa fa-plus';
                    $scope.showDragDropLibrary = false;
                }
            };

        },

        template: '<div class="container">' +
                    '<div class="gallery-box"> ' +
                        '<div class="gl-header"> ' +
                            '<h3>MEDIA <span><i class="fa fa-question" aria-hidden="true"></i></span></h3> ' +
                        '</div><!-- Gallery header Ends --> ' +
                        '<div class="gl-content upload-image" ngf-drop="uploadFiles($files)" ngf-drag-over-class="dragover"> ' +
                            '<a href="#" ng-click="openLibrary()"><i ng-class="showLibraryClass" aria-hidden="true"></i> Open library to select images or drag, drop new images here</a> ' +
                        '</div><!-- Gl Content Ends --> ' +
                    '</div><!-- Gallery Box Ends --> ' +
                    '<div id="openLibrary" ng-show="showLibrary"></div>' +
                    '<div class="gallery-box"> ' +
                        '<div class="gl-header"> ' +
                            '<h3>DRAG & DROP <span><i class="fa fa-question" aria-hidden="true"></i></span></h3> ' +
                        '</div><!-- Gallery header Ends --> ' +
                        '<div class="gl-content"> ' +
                        '<ul> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                 '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li>' +
                                '<div class="gl-img-container dummy-image">' +
                                    '<a href="#"></a>' +
                                '</div><!-- Gallery Image Container Ends --> ' +
                                '<div class="image-info-outer">' +
                                    '<div class="img-info"> ' +
                                        '<div class="img-info-left"> ' +
                                            '<div class="format-size">' +
                                                '<span class="fm-tag">JPG</span> <span class="size">89 KB</span>' +
                                            '</div>' +
                                            '<p>Loren ipsum is dummy text</p> ' +
                                        '</div><!-- Image Left Info Ends --> ' +
                                        '<div class="img-info-right"> ' +
                                            '<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ' +
                                            '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ' +
                                        '</div><!-- Image Info Right Ends --> ' +
                                    '</div><!-- Image Info Ends --> ' +
                                '</div><!-- Image Outer Ends --> ' +
                            '</li> ' +
                            '<li class="action-btn"><a href="#" ng-click="mediaLibrary()" class="add-del">' +
                                '<i ng-class="dragDropClass" aria-hidden="true"></i></a>' +
                            '</li> ' +
                            /*'<li class="action-btn">' +
                                '<a href="#" class="add-del"><i class="fa fa-minus" aria-hidden="true"></i></a>' +
                            '</li> ' +*/
                        '</ul> ' +
                '</div><!-- Gl Content Ends --> ' +
            '</div><!-- Gallery Box Ends --> ' +
            '<div id="openDragDropLibrary" ng-show="showDragDropLibrary"></div>' +
        '</div>'
    };
}));
