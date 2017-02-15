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
        define(['stratus', 'jquery', 'angular', 'jquery-cookie', 'angular-file-upload'], factory);
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

            //load component css
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaSelector.css');
            $scope.model = $scope.$parent.model;
           // var count = 0;
            // set media library to false
            $scope.showLibrary = false;
            $scope.showDragDropLibrary = false;
            $scope.dragDrop = false;
            $scope.browseDiv = true;

            //initialise library class to plus
            $scope.showLibraryClass = 'fa fa-plus-square-o';
            $scope.dragDropClass = 'fa fa-plus';

            // Methods
            $scope.mediaUpload = function () {
                alert('get all media');
            };
            $scope.uploadFiles = function (file) {
                console.log(file);

                // show drag & drop div
                $scope.dragDrop = true;
                // hide browse click div
                $scope.browseDiv = false;
                // hide if media library is opened on click
                $scope.showLibrary = false;
                // show media library on drag & drop
                $scope.showDragDropLibrary = true;

                //check if media library already opened, then load media library
               if ($scope.dragDropClass === 'fa fa-minus') {
                   // $scope.dragDropClass = 'fa fa-minus';
                   this.uploadDragDropLibrary();
                }

                // dynamic content to media library
                    this.saveMedia(file);

            };

            //common function to save media
            $scope.saveMedia = function(file) {
                //upload file to session api
                Upload.upload({
                    url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                    data: {
                        // username: 'test',
                        file: file
                    }
                }).then(function (resp) {

                    $scope.draggedFiles = resp.data.result;
                    console.log(resp);

                });

            }



            $scope.openLibrary = function () {
                // show library media
                if ($scope.showLibraryClass === 'fa fa-plus-square-o') {
                    $scope.showLibraryClass = 'fa fa-minus-square-o';
                    $scope.showLibrary = true;
                    $scope.showDragDropLibrary = false;
                    $scope.dragDropClass = 'fa fa-plus';
                    if ($scope.dragDropClass === 'fa fa-plus') {
                        $scope.dragDropClass = 'fa fa-minus';
                    }
                    else{
                        $scope.dragDropClass = 'fa fa-plus';
                    }

                    $http.get('/Api/Media').then(function (resp) {
                        console.log(resp.data.payload);
                        if(resp) {

                            var html1 = '<div class="gallery-box"> ';
                                html1 += '<div class="gl-content"> ';
                                html1 +='<div class="search-bar">';
                                html1 +='<div class="gal-search"><h4>SEARCH</h4> <input type="text" class="search-gl-txt" placeholder="Travel" /> ';
                                html1 +='<button class="search--btn"><i class="fa fa-search" aria-hidden="true"></i></button> ';
                                html1 +='</div>';
                                html1 +='<p>To upload more images to library, drag and drop here or <a href="#"> Click Here </a></p>';
                                html1 +='</div><!-- Search Bar Ends -->';
                                html1 +='<ul> ';
                                angular.forEach(resp.data.payload, function(value, key) {

                                    html1 += '<li>';
                                    html1 +='<div class="gl-img-container">';
                                    html1 +='<a href="#"><img src="'+value.url+'"></a>';
                                    html1 +='</div><!-- Gallery Image Container Ends --> ';
                                    html1 +='<div class="image-info-outer">';
                                    html1 +='<div class="img-info"> ';
                                    html1 +='<div class="img-info-left"> ';
                                    html1 +='<div class="format-size">';
                                    html1 += '<span class="fm-tag">'+value.extension+'</span> <span class="size">'+value.bytesHuman+'</span>';
                                    html1 +='</div>';
                                    html1 +='<p>Loren ipsum is dummy text</p> ';
                                    html1 +='</div><!-- Image Left Info Ends --> ';
                                    html1 +='<div class="img-info-right"> ';
                                    html1 +='<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ';
                                    html1 +='<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ';
                                    html1 +='</div><!-- Image Info Right Ends --> ';
                                    html1 +='</div><!-- Image Info Ends --> ';
                                    html1 += '</div><!-- Image Outer Ends --> ';
                                    html1 +='</li> ';
                                });
                                html1 +='</ul>';
                                html1 +='</div>';
                                html1 +='</div>';

                                var myEl = angular.element(document.querySelector('#openLibrary'));
                                myEl.html('');
                                myEl.prepend(html1);
                            }

                    });

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

                    //load media library
                   this.uploadDragDropLibrary()
                }else if ($scope.dragDropClass === 'fa fa-minus') {
                    $scope.dragDropClass = 'fa fa-plus';
                    $scope.showDragDropLibrary = false;
                }
            };
            //common function to load media library into html when drag and dropped
            $scope.uploadDragDropLibrary = function(){
                $http.get('/Api/Media').then(function (resp) {
                    var html1 = '<div class="gallery-box"> ';
                    html1 += '<div class="gl-content"> ';
                    html1 +='<div class="search-bar">';
                    html1 +='<div class="gal-search"><h4>SEARCH</h4> <input type="text" class="search-gl-txt" placeholder="Travel" /> ';
                    html1 +='<button class="search--btn"><i class="fa fa-search" aria-hidden="true"></i></button> ';
                    html1 +='</div>';
                    html1 +='<p>To upload more images to library, drag and drop here or <a href="#"> Click Here </a></p>';
                    html1 +='</div><!-- Search Bar Ends -->';
                    html1 +='<ul> ';
                    angular.forEach(resp.data.payload, function(value, key) {

                        html1 += '<li>';
                        html1 +='<div class="gl-img-container">';
                        html1 +='<a href="#"><img src="'+value.url+'"></a>';
                        html1 +='</div><!-- Gallery Image Container Ends --> ';
                        html1 +='<div class="image-info-outer">';
                        html1 +='<div class="img-info"> ';
                        html1 +='<div class="img-info-left"> ';
                        html1 +='<div class="format-size">';
                        html1 += '<span class="fm-tag">'+value.extension+'</span> <span class="size">'+value.bytesHuman+'</span>';
                        html1 +='</div>';
                        html1 +='<p>Loren ipsum is dummy text</p> ';
                        html1 +='</div><!-- Image Left Info Ends --> ';
                        html1 +='<div class="img-info-right"> ';
                        html1 +='<a href="#" class="info-ico"><i class="fa fa-info" aria-hidden="true"></i></a> ';
                        html1 +='<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i></a> ';
                        html1 +='</div><!-- Image Info Right Ends --> ';
                        html1 +='</div><!-- Image Info Ends --> ';
                        html1 += '</div><!-- Image Outer Ends --> ';
                        html1 +='</li> ';
                    });
                    html1 +='</ul>';
                    html1 +='</div>';
                    html1 +='</div>';

                    var myEl = angular.element(document.querySelector('#openDragDropLibrary'));
                    myEl.html('');
                    myEl.prepend(html1);
                });
            }

        },

        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/mediaSelector.html'

    };
}));
