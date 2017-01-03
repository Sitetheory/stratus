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
            versionEntity: '@',
            showDateTimePicker: '=',
            showUnpublish: '=',
            showVersionHistory: '=',
            redirect: '@'
        },
        controller: function ($scope, $element, $parse, $attr) {
            Stratus.Instances[_.uniqueId('publish_')] = $scope;
            $scope.model = $parse($attrs.ngModel);
            $scope.elementId = ($scope.elementId) ? $scope.elementId : 'publish';
            $scope.showDataTimePicker = $scope.showDataTimePicker || false;
            $scope.showUnpublish = $scope.showUnpublish || false;
            $scope.showVersionHistory = $scope.showVersionHistory || false;
            $scope.showMore = ($scope.showDateTimePicker || $scope.showUnpublish || $scope.showVersionHistory) ? true : false;
            // TODO: add a redirect if requested
            $scope.redirect = $scope.redirect || false;
            // TODO: disable/hide if this model doesn't have a versionEntity and/or timePublish
        },
        template: '<div class="customFontPrimary btn-group">\
    <md-button aria-label="Publish" id="{{ elementId }}" class="btn btnPublish btnPublishNow"\
        ng-click="$ctrl.model.data[versionEntity].timePublish = \'API::NOW\'; $ctrl.model.save()"\
        ng-class="{published: $ctrl.model.data[versionEntity].isPublished == 1, unpublished: $ctrl.model.data[versionEntity].isPublished != 1}">\
        <div class="btnGradientLight"></div>\
        <md-icon class="publishIcon" md-svg-src="/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/publish.svg"></md-icon>\
        <span class="publishText">Publish</span>\
    </md-button>\
    <md-menu ng-if="$ctrl.showMore">\
        <div id="dropdownBtn-{{ elementId }}" class="btn btnPublish btnPublishMore">\
            <div class="btnGradientLight"></div>\
            <span class="caret"></span>\
        </div>\
        <md-menu-content class="btnPublishDropdown" aria-labelledby="dropdownBtn-{{ elementId }}">\
            <!-- TODO: after converting to dateTime component make sure these options are not needed anymore-->\
            <stratus-date-time ng-if="$ctrl.showDateTimePicker" \
            ng-model="$ctrl.model.data[entityVersion].timePublish"\
            data-inline="true" \
            data-collapse="true" \
            data-usecurrent="false" \
            data-customvalue="{{ $ctrl.model.data[versionEntity] ? $ctrl.model.data[versionEntity].timePublish : 0 }}" \
            data-style="widget"></stratus-date-time>\
            <div ng-if="$ctrl.showUnpublish">\
                <md-button class="action btnUnpublish" data-action="unpublish">Unpublish this Version</md-button>\
            </div>\
            <a ng-if="$ctrl.showRevisionHistory && $ctrl.model.data[versionEntity]" class="btnVersionHistory" href="/Content/Versions/Edit?id={{ $ctrl.model.data.id }}&versionId={{ $ctrl.model.data[versionEntity].id }}">Revision History</a>\
        </md-menu-content>\
    </md-menu>\
</div>'
    };
}));
