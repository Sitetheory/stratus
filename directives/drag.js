//     Stratus.Directives.Drag.js 1.0

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

// Stratus Drag Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'stratus.directives.drop'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This directive intends to handle binding of a dynamic variable to
    Stratus.Directives.Drag = function ($parse, $log) {
        return {
            restrict: 'A',
            scope: {
                ngModel: '=ngModel'
            },
            link: function ($scope, $element, $attrs) {
                Stratus.Instances[_.uniqueId('drag_')] = $scope;

                $element.bind('dragstart', function (event) {
                    console.log('dragstart:', event);
                    event.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be droppable
                    event.dataTransfer.setData('Text', this.id); // required otherwise doesn't work
                });

                $element.bind('dragenter', function (event) {
                    console.log('dragenter:', event);
                    return false;
                });

                $element.bind('dragover', function (event) {
                    console.log('dragover:', event);
                    if (event.preventDefault) event.preventDefault();
                    event.dataTransfer.dropEffect = 'move'; // or 'copy'
                    return false;
                });

                $element.bind('dragleave', function (event) {
                    console.log('dragleave:', event);
                });

                $element.bind('drop', function (event) {
                    console.log('drop:', event);
                    if (event.stopPropagation) event.stopPropagation(); // stops the browser from redirecting... why???
                    var el = document.getElementById(event.dataTransfer.getData('Text'));
                    el.parentNode.removeChild(el);
                    return false;
                });
            }
        };
    };
}));
