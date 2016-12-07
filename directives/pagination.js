//     Stratus.Directives.Pagination.js 1.0

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

// Stratus Pagination Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'angular-material'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This directive intends to handle binding and
    // full pagination for the scope's collection.
    angular.module('stratus-pagination', [])
        .directive('stratusPagination', function ($compile) {
            return {
                restrict: 'AE',
                link: function ($scope) {
                    $scope.pages = [];
                    $scope.startPage = 0;
                    $scope.endPage = 0;
                    $scope.$watch('collection.meta.attributes.pageCurrent', function (newValue) {
                        if ($scope.collection.meta.get('pageTotal') <= 10) {
                            // less than 10 total pages so show all
                            $scope.startPage = 1;
                            $scope.endPage = $scope.collection.meta.get('pageTotal');
                        } else {
                            // more than 10 total pages so calculate start and end pages
                            if ($scope.collection.meta.get('pageCurrent') <= 6) {
                                $scope.startPage = 1;
                                $scope.endPage = 10;
                            } else if ($scope.collection.meta.get('pageCurrent') + 4 >= $scope.collection.meta.get('pageTotal')) {
                                $scope.startPage = $scope.collection.meta.get('pageTotal') - 9;
                                $scope.endPage = $scope.collection.meta.get('pageTotal');
                            } else {
                                $scope.startPage = $scope.collection.meta.get('pageCurrent') - 5;
                                $scope.endPage = $scope.collection.meta.get('pageCurrent') + 4;
                            }
                        }
                        if (!isNaN($scope.startPage) && !isNaN($scope.endPage)) {
                            $scope.pages = _.range($scope.startPage, $scope.endPage + 1);
                        }
                    });
                },
                template: '<ul ng-if="collection.meta.attributes.pageTotal > 1" class="pagination">\
                    <li ng-show="startPage > 1" ng-class="{disabled:collection.meta.attributes.pageCurrent == 1}">\
                        <a ng-click="collection.meta.attributes.pageCurrent == 1 || collection.page(1)">First</a>\
                    </li>\
                    <li ng-class="{disabled:collection.meta.attributes.pageCurrent == 1}">\
                        <a ng-click="collection.meta.attributes.pageCurrent == 1 || collection.page(collection.meta.attributes.pageCurrent - 1)">Previous</a>\
                    </li>\
                    <li ng-repeat="page in pages" ng-class="{active:collection.meta.attributes.pageCurrent == page}">\
                        <a ng-click="collection.page(page)">{{ page }}</a>\
                    </li>\
                    <li ng-class="{disabled:collection.meta.attributes.pageCurrent == collection.meta.attributes.pageTotal}">\
                        <a ng-click="collection.meta.attributes.pageCurrent == collection.meta.attributes.pageTotal || collection.page(collection.meta.attributes.pageCurrent + 1)">Next</a>\
                    </li>\
                    <li ng-show="endPage < collection.meta.attributes.pageTotal" ng-class="{disabled:collection.meta.attributes.pageCurrent == collection.meta.attributes.pageTotal}">\
                        <a ng-click="collection.meta.attributes.pageCurrent == collection.meta.attributes.pageTotal || collection.page(collection.meta.attributes.pageTotal)">Last</a>\
                    </li>\
                </ul>\
                <span ng-show="false" class="paginatorTotal customFontSecondary smallLabel">({{ collection.meta.attributes.countTotal }} Results)</span>\
                <md-progress-linear ng-if="collection.paginate" md-mode="indeterminate"></md-progress-linear>'
            };
        });
}));
