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
    Stratus.Components.ThemeSelector = {
        bindings: {
            ngModel: '='
        },
        controller: function ($scope, $mdPanel, $attrs, registry) {

            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            $scope.zoomView = function () {

                console.log('zoomview');
                var position = $mdPanel.newPanelPosition()
                    .absolute()
                    .center();
                var config = {
                    attachTo: angular.element(document.body),
                    scope: $scope,
                    controller: ZoomController,
                    templateUrl: 'themeDetail.html',
                    hasBackdrop: true,
                    panelClass: 'theme-dialog',
                    position: position,
                    trapFocus: true,
                    zIndex: 150,
                    clickOutsideToClose: true,
                    escapeToClose: false,
                    focusOnOpen: true
                };

                $mdPanel.open(config);
            }

            function ZoomController(mdPanelRef) {

                $scope.closeDialog = function () {

                    mdPanelRef.close();
                };

            }
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/themeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };

}));
