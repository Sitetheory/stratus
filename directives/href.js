//     Stratus.Directives.Href.js 1.0

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

// Stratus HREF Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This directive intends to handle binding of a dynamic variable to
    Stratus.Directives.Href = function ($parse, $location, $log) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                Stratus.Instances[_.uniqueId('href_')] = $scope;
                $scope.href = null;
                if ($attrs.stratusHref) {
                    var href = $parse($attrs.stratusHref);
                    $scope.$watch('$parent', function (newValue) {
                        if (typeof newValue !== 'undefined') {
                            $scope.href = href($scope.$parent);
                            $log.log('stratus-href:', href($scope.href));
                        }
                    });
                    $element.bind('click', function () {
                        $scope.$apply(function () {
                            if ($scope.href) {
                                $location.path($scope.href);
                            }
                        });
                    });
                }
            }
        };
    };
}));
