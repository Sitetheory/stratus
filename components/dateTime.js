//     Stratus.Components.DateTime.js 1.0

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

// Stratus DateTime Component
// --------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'moment', 'angular'], factory);
    } else {
        factory(root.Stratus, root.moment);
    }
}(this, function (Stratus, moment) {
    // This component intends to handle binding of
    // Date and Time into a simple unix timestamp
    Stratus.Components.DateTime = {
        bindings: {
            ngModel: '=',
            elementId: '@',
            // A unix timestamp to default the picker
            defaultTimestamp: '@',
            // An ISO Date timestamp to default the picker
            defaultDate: '@'
        },
        controller: function ($scope, $parse, $attrs) {
            var uid = _.uniqueId('date_time_');
            Stratus.Instances[uid] = $scope;
            $scope.elementId = $attrs.elementId || uid;

            // Custom Functions for updating Model and DOM
            var updateModel = function(property) {
                // Watch for changes to the datetime string, and set the model
                return moment(property).unix();
            };
            var updateDOM = function(property, $attrs) {
                // Get the timestamp from the model and convert to a moment object
                var momentTime = property ? moment.unix(property) : moment();
                // Create Date Time String in ISOformat (without seconds though)
                return new Date(momentTime.year(), momentTime.month(), momentTime.date(), momentTime.hour(), momentTime.minute());
            };

            // TODO: make this into a service that works for every directive
            // Bind the current property specified by ng-model
            $scope.model = $parse($attrs.ngModel);
            $scope.property = $scope.model($scope.$parent);

            // Set Default Time on the DOM
            // TODO: are we concerned that this will automatically update the model even the user hasn't
            // personally set the time? Perhaps that is just controlled by the calling function that says it wants
            // a default date
            if(!$scope.property) {
                if($attrs.defaultTimestamp) {
                    $scope.property = parseInt($attrs.defaultTimestamp);
                } else if($attrs.defaultTimestamp) {
                    $scope.property = parseInt(moment($attrs.defaultTimestamp).unix());
                }
            }

            // Update Model and DOM with 2 way Binding
            $scope.$watch('property', function (property) {
                // if the property changes, update the model
                $scope.model.assign($scope.$parent, updateModel(property));
            }, true);
            $scope.$parent.$watch($attrs.ngModel, function (property) {
                // if the model changes, update the DOM
                $scope.property = updateDOM(property, $attrs);
            }, true);

        },
        template: '<input id="{{ elementId }}" type="datetime-local" ng-model="property"/>'
    };
}));
