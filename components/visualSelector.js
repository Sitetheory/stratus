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
            'stratus.services.collection',

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
            ngModel: '=',
            layoutOption: '@',
            details: '<',
            search: '<',
            target: '@',
            limit: '@',
            multiple: '<'
        },
        controller: function ($scope, $mdPanel, $attrs, registry) {

            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/visualSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            $scope.showGallery = false;
            $scope.selectListArr = [];
            $scope.galleryClass = 'fa fa-plus';

            // fetch target collection and hydrate to $scope.collection
            $scope.registry = new registry();
            $scope.registry.fetch({
                target: $attrs.target || 'Layout',
                id: null,
                manifest: false,
                decouple: true,
                api: {
                    options: {},
                    limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 3
                }
            }, $scope);

            // display expanded view if clicked on change button
            $scope.displayGallery = function () {

                $scope.showGallery = true;

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
            $scope.chooseLayout = function (selectedData, $event) {

                // add class
                $scope.selected = selectedData;

                // add to selected list
                $scope.selectListArr = [];
                $scope.selectListArr.push(selectedData);

            };
            $scope.isSelected = function (item) {

                return $scope.selected === item;
            };
            $scope.toggleGallery = function () {
                if ($scope.showGallery === true) {
                    $scope.galleryClass = 'fa fa-plus';
                    $scope.showGallery = false;
                }else if ($scope.showGallery === false) {
                    $scope.galleryClass = 'fa fa-minus';
                    $scope.showGallery = true;
                }
            };
            $scope.removeSelected = function (selectedLayout) {
                var index = $scope.selectListArr.indexOf(selectedLayout);
                if (index >= 0) {
                    $scope.selectListArr.splice(index, 1);
                    $scope.selected = {};
                }
            };
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/visualSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };

}));
