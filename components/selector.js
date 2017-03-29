//     Stratus.Components.Selector.js 1.0

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

// Stratus Selector Component
// --------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'angular-material', 'stratus.services.registry', 'stratus.services.model'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to allow editing of various selections depending on context.
    Stratus.Components.Selector = {
        transclude: {
            image: '?stratusSelectorImage',
            label: '?stratusSelectorLabel'
        },
        bindings: {
            elementId: '@',
            ngModel: '=',
            type: '@',
            property: '@',
            multiple: '&'
        },
        controller: function ($scope, $attrs, $log, registry, model) {
            // Initialize
            this.uid = _.uniqueId('selector_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;

            // Asset Collection
            if ($attrs.type) {
                $scope.registry = new registry();
                $scope.registry.fetch({
                    target: $attrs.type,
                    decouple: 'true',
                    api: '{"options":{"paging": false},"limit":5000}'
                }, $scope);
            }

            // Store Asset Property for Verification
            $scope.property = $attrs.property || null;

            // Store Toggle Options for Custom Actions
            $scope.toggleOptions = {
                multiple: _.isJSON($attrs.multiple) ? JSON.parse($attrs.multiple) : true
            };

            // Data Connectivity
            $scope.model = null;
            $scope.$watch('$ctrl.ngModel', function (data) {
                if (data instanceof model && data !== $scope.model) {
                    $scope.model = data;
                }
            });
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/selector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
