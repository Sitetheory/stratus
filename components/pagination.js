//     Stratus.Components.Pagination.js 1.0

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

// Stratus Pagination Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'angular-material', 'stratus.services.collection'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to handle binding and
    // full pagination for the scope's collection.
    Stratus.Components.Pagination = {
        controller: function ($scope, collection) {
            Stratus.Instances[_.uniqueId('pagination_')] = $scope;

            // Load Component CSS
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/pagination' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            // Settings
            $scope.pages = [];
            $scope.startPage = 0;
            $scope.endPage = 0;

            // Localize Collection & Meta
            $scope.collection = null;
            $scope.meta = null;
            $scope.$watch('$parent.collection', function (data) {
                if (data && data instanceof collection) {
                    $scope.collection = data;
                    $scope.meta = data.meta;
                }
            });

            // Handle Page Changes
            $scope.$watch('meta.attributes.pageCurrent', function (pageCurrent) {
                if (!pageCurrent) return true;
                if ($scope.meta.get('pageTotal') <= 10) {
                    // less than 10 total pages so show all
                    $scope.startPage = 1;
                    $scope.endPage = $scope.meta.get('pageTotal');
                } else {
                    // more than 10 total pages so calculate start and end pages
                    if ($scope.meta.get('pageCurrent') <= 6) {
                        $scope.startPage = 1;
                        $scope.endPage = 10;
                    } else if ($scope.meta.get('pageCurrent') + 4 >= $scope.meta.get('pageTotal')) {
                        $scope.startPage = $scope.meta.get('pageTotal') - 9;
                        $scope.endPage = $scope.meta.get('pageTotal');
                    } else {
                        $scope.startPage = $scope.meta.get('pageCurrent') - 5;
                        $scope.endPage = $scope.meta.get('pageCurrent') + 4;
                    }
                }
                if (!isNaN($scope.startPage) && !isNaN($scope.endPage)) {
                    $scope.pages = _.range($scope.startPage, $scope.endPage + 1);
                }
            });
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/pagination' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
