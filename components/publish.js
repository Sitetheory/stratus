//     Stratus.Components.Publish 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
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
            define(['stratus', 'moment', 'zepto', 'underscore', 'angular', 'stratus.services.model', 'stratus.components.dateTime'], factory);
        } else {
            factory(root.Stratus, root.moment, root.$, root._);
        }
    }(this, function (Stratus, moment, $, _) {

        // This component intends to allow publishing a versionable entity with additional advanced options
        // TODO: port over the extensive logic from the old widgets/publish.js (read all comments)
        Stratus.Components.Publish = {
            bindings: {
                ngModel: '=',
                elementId: '@',
                full: '@',
                action: '@',
                showDateTime: '@',
                showUnpublish: '@',
                showVersionHistory: '@',
                redirect: '@'
            },
            controller: function ($scope, $element, $parse, $attrs, $log, model) {
                var uid = _.uniqueId('publish_');
                Stratus.Instances[uid] = $scope;
                Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/publish' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

                // Configuration
                $scope.elementId = $attrs.elementId || uid;
                $scope.property = 'version';
                $scope.full = $attrs.full || true;
                if (_.isString($scope.full)) {
                    $scope.full = _.hydrate($scope.full);
                }
                $scope.action = $attrs.action === 'unpublish' ? 'unpublish' : 'publish';
                $scope.showDateTime = $attrs.showDateTime || false;
                $scope.showUnpublish = $attrs.showUnpublish || false;
                $scope.showVersionHistory = $attrs.showVersionHistory || false;
                $scope.redirect = $attrs.redirect || false;

                // Settings
                $scope.propertyTimePublish = $scope.property ? $scope.property + '.timePublish' : null;
                $scope.showMore = !!($scope.showDateTime || $scope.showUnpublish || $scope.showVersionHistory);
                $scope.timePublish = null;

                // Model Handling
                $scope.model = null;
                $scope.$watch('$ctrl.ngModel', function (data) {
                    if (data instanceof model && data !== $scope.model) {
                        $scope.model = data;
                    }
                });

                // Methods
                $scope.setTimePublish = function (time) {
                    // $log.log('timePublish:', time, $scope.model);
                    if (!$scope.model || !$scope.model.get($scope.propertyTimePublish)) return false;
                    /* *
                    $scope.model.set($scope.propertyTimePublish, time || 'API::NOW');
                    $scope.model.save();
                    /* */
                };

                // Watchers
                $scope.$watch('timePublish', function (data) {
                    /* $scope.setTimePublish(data); */
                });

                return true;

                var $dateTimeComponent = null;
                if ($scope.showDateTime) {
                    $dateTimeComponent = $('#' + $scope.elementId + ' stratus-date-time');
                }

                if ($scope.action === 'unpublish') {
                    // TODO: Set the dateTime component date to current time (so when they open it again it's at today) and then clear
                    /* *
                    if (this.dateTimePickerView && typeof this.dateTimePickerView.dateTimePicker === 'object') {
                        this.dateTimePickerView.dateTimePicker.date(moment());
                        this.dateTimePickerView.dateTimePicker.clear();
                    }
                    /* */
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
            },
            templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/publish' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
        };
    }));
