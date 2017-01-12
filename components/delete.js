//     Stratus.Components.Delete.js 1.0

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

// TODO: this component needs to be finished

// Stratus Delete Component
// -----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'moment', 'angular'], factory);
    } else {
        factory(root.Stratus, root.moment);
    }
}(this, function (Stratus, moment) {
    // This component intends to allow publishing a versionable entity with additional advanced options
    Stratus.Components.Delete = {
        bindings: {
            ngModel: '=',
            elementId: '@',
            versionEntity: '@',
            showDateTimePicker: '@',
            showUnpublish: '@',
            showVersionHistory: '@',
            redirect: '@'
        },
        controller: function ($scope, $element, $parse, $attrs) {
            Stratus.Instances[_.uniqueId('delete_')] = $scope;
            $scope.model = $scope.$parent.model;
            $scope.versionEntity = $attrs.versionEntity || NULL;

            //console.log('setup publish controller', $scope.model, $scope.versionEntity);
            $scope.version = null;
            if ($scope.versionEntity && !$scope.model.has(versionEntity)) {
                $scope.version = $scope.model.get(versionEntity);
                console.log('version', $scope.version);
            }

            // Options
            $scope.elementId = $attrs.elementId || 'delete';
            $scope.showDataTimePicker = $attrs.versionEntity || null;
            $scope.showUnpublish = $attrs.showUnpublish || false;
            $scope.showVersionHistory = $attrs.showVersionHistory || false;
            $scope.showMore = ($scope.showDateTimePicker || $scope.showUnpublish || $scope.showVersionHistory) ? true : false;

            // TODO: add a redirect if requested
            $scope.redirect = $attrs.redirect || false;

            // Methods
            $scope.setDelete = function (time) {
                $scope.model.set('status', -1);
                $scope.model.save();
            };

            // Watchers
            $scope.timePublish = '';
            $scope.$watch('timePublish', $scope.setTimePublish(value));
        },
        template: '<md-button ng-if="model.id" aria-label="Delete" id="{{ elementId }}" class="btn btnDelete" ng-click="setDelete()">\
            <div class="btnGradientLight"></div>\
            <md-icon class="deleteIcon" md-svg-src="/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg"></md-icon>\
            <span class="deleteText">Delete</span>\
        </md-button>'
    };
}));
