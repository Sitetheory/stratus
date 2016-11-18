//     Stratus.Directives.DateTime.js 1.0

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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'moment', 'angular'], factory);
    } else {
        factory(root.Stratus, root.moment);
    }
}(this, function (Stratus, moment) {
    // TODO: Convert to Tether-Tooltip
    angular.module('stratus-date-time', [])
        .directive('stratusDateTime', function ($compile) {
            return {
                restrict: 'AE',
                scope: {
                    ngModel: '='
                },
                link: function ($scope) {
                    $scope.timestamp = $scope.ngModel ? moment.unix($scope.ngModel).format() : moment().endOf('week');
                    $scope.date = new Date($scope.timestamp.toISOString());
                },
                template: '<input type="datetime-local" name="input" ng-model="date" placeholder="yyyy-MM-ddTHH:mm"/>'
            };
        });

}));
