//     Stratus.Components.themeSelector.js 1.0

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

// Stratus Theme Selector Component
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
            'stratus.services.model',
            'stratus.services.details',

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
    Stratus.Components.ThemeSelector = {
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
        controller: function ($scope, $mdPanel, $attrs, registry, details, model, $sce) {

            $scope.themeRawDesc = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }
            
            this.uid = _.uniqueId('theme_selector_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;

            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            $scope.showGallery = false;
            $scope.galleryClass = 'fa fa-plus';

            // Hydrate Settings
            $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false;

            // Asset Collection
            if ($attrs.type) {
                $scope.registry = new registry();
                var request = {
                    target: $attrs.type || 'Template',
                    id: null,
                    manifest: false,
                    decouple: true,
                    selectedid: $attrs.selectedid,
                    property: $attrs.property,
                    api: {
                        options: {},
                        limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 3
                    }
                };
                if ($scope.api && angular.isObject($scope.api)) {
                    request.api = _.extendDeep(request.api, $scope.api);
                }
                $scope.registry.fetch(request, $scope);

                //Get Details of selected template by attribute selectedid
                $scope.selectedDetails = new details();
                $scope.selectedDetails.fetch(request, $scope);
            }
            //console.log($scope);
            // Store Asset Property for Verification
            $scope.property = $attrs.property || null;

            // Store Toggle Options for Custom Actions
            $scope.toggleOptions = {
                multiple: _.isJSON($attrs.multiple) ? JSON.parse($attrs.multiple) : false
            };
            

            // Data Connectivity
            $scope.model = null;

            $scope.$watch('$ctrl.ngModel', function (data) {
                
                if (data instanceof model && data !== $scope.model) {
                    $scope.model = data;
                }
                
            });

            //Update the Selected Theme Details

            $scope.selectedName = null;
            $scope.selectedDesc = null;

            $scope.updateDetails = function(options){
                $scope.selectedName = options.name;
                $scope.selectedDesc = options.description;
            }

            // display expanded view if clicked on change button
            $scope.displayGallery = function () {
                $scope.showGallery = true;
                $scope.galleryClass = 'fa fa-minus';
            };
            $scope.zoomView = function (themeDetail) {
                $scope.themeDetail = themeDetail;
                var position = $mdPanel.newPanelPosition()
                    .absolute()
                    .center();
                var config = {
                    attachTo: angular.element(document.body),
                    scope: $scope,
                    controller: ZoomController,
                    templateUrl: 'themeDetail.html',
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
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };

}));