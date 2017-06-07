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
        define([

            // Libraries
            'stratus',
            'jquery',
            'underscore',
            'angular',

            // Modules
            'angular-material',

            // Services
            'stratus.services.registry',
            'stratus.services.collection',
            'stratus.services.modelwithdetails',

            // Components
            'stratus.components.search',
            'stratus.components.pagination'
            ], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // This component intends to handle binding of an
    // item array into a particular attribute.
    // code layout-option{'collapsed','expanded'}
    Stratus.Components.VisualSelector = {
        bindings: {
            // Basic
            elementId: '@',
            ngModel: '=',
            property: '@',

            // Selector
            type: '@',
            limit: '@',
            multiple: '<',

            // Custom
            layoutOption: '@',
            details: '<',
            search: '<'
        },
        controller: function ($scope, $mdPanel, $attrs, registry, modelwithdetails, $http, $sce) {
            // Initialize
            
            this.uid = _.uniqueId('visual_selector_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;
            //alert("yess");
            // CSS
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/visualSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            // Settings
            $scope.showGallery = false;
            $scope.galleryClass = 'fa fa-plus';

            // Hydrate Settings
            $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false;

            // Asset Collection
            if ($attrs.type) {
                $scope.registry = new registry();
                var request = {
                    target: $attrs.type || 'Layout',
                    id: null,
                    manifest: false,
                    decouple: true,
                    api: {
                        options: {},
                        limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 3
                    }
                };
                if ($scope.api && angular.isObject($scope.api)) {
                    request.api = _.extendDeep(request.api, $scope.api);
                }
                $scope.registry.fetch(request, $scope);

                //console.log(model);

                /*$scope.registry1 = new registry();
                var request1 = {
                    target: $attrs.type || 'Layout',
                    id: 23,
                    manifest: false,
                    decouple: true,
                    
                };
                if ($scope.api && angular.isObject($scope.api)) {
                    request.api = _.extendDeep(request1.api, $scope.api);
                }
                $scope.registry1.fetch(request, $scope);*/
            }
            
            // Store Asset Property for Verification
            $scope.property = $attrs.property || null;

            // Store Toggle Options for Custom Actions
            $scope.toggleOptions = {
                multiple: _.isJSON($attrs.multiple) ? JSON.parse($attrs.multiple) : false
            };
            /*$scope.toggleOptions = {
                multiple: false
            };*/

            $scope.layoutRawDesc = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }

            // Data Connectivity
            $scope.modelwithdetails = null;

            $scope.$watch('$ctrl.ngModel', function (data) {
                //alert("Heree");
                console.log(['data', data]);
                if (data) {
                    $scope.modelwithdetails = data;
                    console.log(['modelwithdetails', modelwithdetails]);
                    //$scope.dataDetails(data);
                }
                
            });
            console.log(['scopemodel',$scope.modelwithdetails]);
            
            $scope.getDetails = function (property) {
                //alert($scope.property);
                
                action =  'GET';
                var prototype1 = {
                    method: action,
                    url: "https://admin.sitetheory.net/Api/ContentType/2/Layout/23",
                    headers: {}
                };
                $http(prototype1).then(function (response) {
                    if (response.status === 200 && angular.isObject(response.data)) {
                        var convoyDetails =  response.data.payload || response.data;
                        $scope.name = convoyDetails.name;
                        $scope.description = convoyDetails.name;
                              
                    } 
                });
                
            };


            //model.getDetails();

            // display expanded view if clicked on change button
            $scope.displayGallery = function () {
                $scope.showGallery = true;
                $scope.galleryClass = 'fa fa-minus';
            };

            // zoom view for chosen  layout
            $scope.zoomView = function (layoutDetail) {
                $scope.layoutDetail = layoutDetail;
                var position = $mdPanel.newPanelPosition()
                .absolute()
                .center();
                var config = {
                    attachTo: angular.element(document.body),
                    scope: $scope,
                    controller: ZoomController,
                    templateUrl: 'layoutDetail.html',
                    hasBackdrop: true,
                    panelClass: 'media-dialog',
                    position: position,
                    trapFocus: true,
                    zIndex: 150,
                    clickOutsideToClose: true,
                    escapeToClose: false,
                    focusOnOpen: true
                };

                $mdPanel.open(config);
            };

            function ZoomController(mdPanelRef) {
                $scope.closeDialog = function () {
                    mdPanelRef.close();
                };
            }

            $scope.toggleGallery = function () {
                if ($scope.showGallery === true) {
                    $scope.galleryClass = 'fa fa-plus';
                    $scope.showGallery = false;
                } else if ($scope.showGallery === false) {
                    $scope.galleryClass = 'fa fa-minus';
                    $scope.showGallery = true;
                }
            };
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/visualSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };

}));
