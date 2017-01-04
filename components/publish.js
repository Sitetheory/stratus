//     Stratus.Components.OptionValue.js 1.0

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

// Stratus Publish Component
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
    Stratus.Components.Publish = {
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
            Stratus.Instances[_.uniqueId('publish_')] = $scope;
            $scope.model = $scope.$parent.model;
            $scope.versionEntity = $attrs.versionEntity || NULL;
            //console.log('setup publish controller', $scope.model, $scope.versionEntity);
            $scope.version = null;
            if ($scope.versionEntity && !$scope.model.has(versionEntity)) {
                $scope.version = $scope.model.get(versionEntity);
                console.log('version', $scope.version);
            }

            // Options
            $scope.elementId = $attrs.elementId || 'publish';
            $scope.showDataTimePicker = $attrs.versionEntity || null;
            $scope.showUnpublish = $attrs.showUnpublish || false;
            $scope.showVersionHistory = $attrs.showVersionHistory || false;
            $scope.showMore = ($scope.showDateTimePicker || $scope.showUnpublish || $scope.showVersionHistory) ? true : false;
            // TODO: add a redirect if requested
            $scope.redirect = $attrs.redirect || false;

            // Methods
            $scope.setTimePublish = function(time) {
                console.log('set time publish', time, $scope.version);
                if(!$scope.version) return false;
                time = time || 'API::NOW';
                $scope.version.timePublish = time;
                $scope.model.save()
            };
            $scope.unpublish = function() {
                // TODO: pass in an action='unpublish' to the API
            };

            // Watchers
            $scope.timePublish = '';
            $scope.$watch('timePublish', $scope.setTimePublish(value));
        },
        template: '<div ng-if="model.has(versionEntity)" class="customFontPrimary btn-group">\
    <md-button aria-label="Publish" id="{{ elementId }}" class="btn btnPublish btnPublishNow"\
        ng-click="setTimePublish()"\
        ng-class="{published: version.isPublished == 1, unpublished: version.isPublished != 1}">\
        <div class="btnGradientLight"></div>\
        <md-icon class="publishIcon" md-svg-src="/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/publish.svg"></md-icon>\
        <span class="publishText">Publish</span>\
    </md-button>\
    <md-menu ng-if="showMore">\
        <div id="dropdownBtn-{{ elementId }}" class="btn btnPublish btnPublishMore">\
            <div class="btnGradientLight"></div>\
            <span class="caret"></span>\
        </div>\
        <md-menu-content class="btnPublishDropdown" aria-labelledby="dropdownBtn-{{ elementId }}">\
            <!-- TODO: after converting to dateTime component make sure these options are not needed anymore-->\
            <stratus-date-time ng-if="showDateTimePicker" \
            ng-model="timePublish"\
            data-inline="true" \
            data-collapse="true" \
            data-usecurrent="false" \
            data-customvalue="{{ timePublish || 0 }}" \
            data-style="widget"></stratus-date-time>\
            <div ng-if="showUnpublish">\
                <md-button class="action btnUnpublish" ng-click="unpublish()">Unpublish this Version</md-button>\
            </div>\
            <a ng-if="showRevisionHistory && version" class="btnVersionHistory" href="/Content/Versions/Edit?id={{ model.data.id }}&versionId={{ version.id }}">Revision History</a>\
        </md-menu-content>\
    </md-menu>\
</div>'
    };
}));
