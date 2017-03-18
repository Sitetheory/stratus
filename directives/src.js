//     Stratus.Directives.Trigger.js 1.0

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

// Stratus Src Directive
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
    Stratus.Directives.Src = function ($parse, $log) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                Stratus.Instances[_.uniqueId('src_')] = $scope;
                if ($attrs.stratusSrc) {
                    var src = $parse($attrs.stratusSrc);
                    $scope.$watch('$parent', function (newValue) {
                        if (typeof newValue !== 'undefined') {
                            $log.log('stratus-src:', src($scope.$parent));
                        }
                    });
                }
                $log.log('register:', $element);
                Stratus.RegisterGroup.add('OnScroll', {
                    method: Stratus.Internals.LoadImage,
                    el: $element,
                    spy: $element.data('spy') ? $($element.data('spy')) : $element
                });
            }
        };
    };
}));
