//     Stratus.Directives.Pagination.js 1.0

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
    // $scope component intends to handle binding and
    // full pagination for the scope's collection.
    Stratus.Components.Facebook = {
        bindings: {
            pageId: '@',
            appId: '@',
            token: '@'
        },
        controller: function ($scope, $http) {
            $scope.bindings = this;
            /*
            $scope.fetch = function () {
                if ($scope.bindings.appId) {
                    $http({
                        method: 'POST',
                        url: 'https://graph.facebook.com/' + $scope.bindings.pageId + '/feed?app_id=' + $scope.bindings.appId + ($scope.bindings.token ? '&access_token=' + $scope.bindings.token : ''),
                        data: {
                            message: 'message',
                            name: 'name',
                            caption: 'caption',
                            description: 'desc'
                        }
                    }).then(function (response) {
                        console.log('success:', response);
                    }, function (error) {
                        console.error('error:', error);
                    });
                }
            };
            */
            $scope.$watch('bindings', function () {
                // $scope.fetch();
            });
        },
        template: ''
    };
}));
