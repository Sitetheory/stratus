//     Stratus.Components.Publish.js 1.0

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

// TODO: this component has not been finished. It needs to do everything that the previous widgets/publish.js did and some of that code has been ported over, some hasn't, and some needs to be slightly changed based on how Angular works. We just need the overall functionality to allow you to
// - publish now (main button
// - click an arrow to the right side of the button and pull down a menu that lets you select a publish date.
// - unpublish if it's already published
// - show link to version history page
// - change colors based on whether or not it's unpublished, published in the past, or published in the future (pending).
-

// Stratus Publish Component
// -----------------------

// Define AMD, Require.js, or Contextual Scope
    (function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            define(['stratus', 'moment', 'zepto', 'angular', 'stratus.components.dateTime'], factory);
        } else {
            factory(root.Stratus, root.moment, root.$);
        }
    }(this, function (Stratus, moment, $) {
        // This component intends to allow publishing a versionable entity with additional advanced options
        // TODO: port over the extensive logic from the old widgets/publish.js (read all comments)
        Stratus.Components.Publish = {
            bindings: {
                ngModel: '=',
                elementId: '@',
                versionEntity: '@',
                action: '@',
                showDateTime: '@',
                showUnpublish: '@',
                showVersionHistory: '@',
                redirect: '@'
            },
            controller: function ($scope, $element, $parse, $attrs, $log) {
                var propertyTimePublish = 'timePublish';
                var uid = _.uniqueId('publish_');
                Stratus.Instances[uid] = $scope;
                $scope.model = $scope.$parent.model;
                $scope.versionEntity = $attrs.versionEntity || null;

                // FIXME: Temporarily Disable this Widget during repairs
                return true;

                $log.log('model:', $scope.model);

                // Allow publish to work on versionable entities or the actual version entity directly
                if ($scope.versionEntity && $scope.model.has($scope.versionEntity) && $scope.model.get($scope.versionEntity).has(propertyTimePublish)) {
                    $scope.version = $scope.model.get($scope.versionEntity);
                } else if ($scope.model.has(propertyTimePublish)) {
                    $scope.version = $scope.model;
                } else {
                    console.warn('This entity is either not versionable or a valid data-version-entity was not set');
                    return false;
                }

                $log.log('version', $scope.version);

                // Options
                $scope.elementId = $attrs.elementId || uid;
                $scope.action = $attrs.action == 'unpublish' ? 'unpublish' : 'publish';
                $scope.showDateTime = $attrs.showDateTime || false;
                $scope.showUnpublish = $attrs.showUnpublish || false;
                $scope.showVersionHistory = $attrs.showVersionHistory || false;
                $scope.showMore = ($scope.showDateTime || $scope.showUnpublish || $scope.showVersionHistory) ? true : false;
                $scope.timePublish = null;

                var $dateTimeComponent = null;
                if ($scope.showDateTime) {
                    $dateTimeComponent = $('#' + $scope.elementId + ' stratus-date-time');
                }

                if ($scope.action === 'unpublish') {
                    // TODO: Set the dateTime component date to current time (so when they open it again it's at today) and then clear
                    /*
                     if (this.dateTimePickerView && typeof this.dateTimePickerView.dateTimePicker === 'object') {
                     this.dateTimePickerView.dateTimePicker.date(moment());
                     this.dateTimePickerView.dateTimePicker.clear();
                     }
                     */
                } else {
                    // If expired (published in the past) treat as if it's unpublished (and publish the current time
                    // if none specified).
                    // Problem is... there is a date specified. So we need to clear the date somehow if it's expired.

                    // TODO: if timePublish is set, make sure the date picker uses the correct time

                    if ($dateTimeComponent && typeof $dateTimeComponent === 'object' && $dateTimeComponent.length) {

                        // If expired publish (published for past date and superceded by new version)
                        // and publish is clicked without changing the date (the dates are identical)
                        // then use the now date like they just want to publish at this moment.
                        if (this.isPublished === 3 && timePublish && timePublish.unix() === this.timePublish) {

                        } else {
                            // convert moment object to unix milliseconds
                            $scope.timePublish = $scope.version.get(propertyTimePublish);
                        }
                    }
                }

                // TODO: add a redirect if requested
                $scope.redirect = $attrs.redirect || false;

                // Methods
                $scope.setTimePublish = function (time) {
                    $log.log('set time publish', time, $scope.version);
                    if (!$scope.version) return false;
                    time = time || 'API::NOW';
                    $scope.version.timePublish = time;
                    $scope.model.save();
                };

                // Watchers
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
                        <stratus-date-time ng-if="showDateTime" \
                        ng-model="timePublish"\
                        data-usecurrent="false"\
                        data-defaultTimestamp="{{ timePublish || null }}" \
                        data-style="widget"></stratus-date-time>\
                        <div ng-if="showUnpublish">\
                            <md-button class="action btnUnpublish" ng-click="setUnpublish()">Unpublish this Version</md-button>\
                        </div>\
                        <a ng-if="showRevisionHistory && version" class="btnVersionHistory" href="/Content/Versions/Edit?id={{ model.data.id }}&versionId={{ version.id }}">Revision History</a>\
                    </md-menu-content>\
                </md-menu>\
            </div>'
        };
    }));
