//     Stratus.Directives.SingleClick.js 1.0

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

// Stratus Singleclick Directive
// ----------------------
// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // This directive intends to handle binding of a dynamic variable to
    Stratus.Directives.SingleClick = function ($parse, $log) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attr) {

                var fn = $parse($attr.stratusSingleClick);
                var delay = 300;
                var clicks = 0;
                var timer = null;
                $element.on('click', function (event) {

                    clicks++;

                    // count clicks
                    if (clicks === 1) {

                        timer = setTimeout(function () {

                            $scope.$apply(function () {

                                fn($scope, { $event: event });

                            });
                            clicks = 0;
                        }, delay);
                    } else {

                        clearTimeout(timer);
                        clicks = 0;
                    }
                });
            }
        };
    };
}));

