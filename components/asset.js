//     Stratus.Components.Base.js 1.0

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

// Stratus Base Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'angular-material', 'stratus.services.registry'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to allow editing of various sssets depending on context.
    Stratus.Components.Asset = {
        bindings: {
            elementId: '@',
            ngModel: '=',
            assetType: '@',
            entityType: '@',
            entityId: '@'
        },
        controller: function ($scope, $attrs, $log, registry) {
            // Initialize
            this.uid = _.uniqueId('asset_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;

            // Asset Collection
            if ($attrs.assetType) {
                $scope.registry = new registry();
                $scope.registry.fetch($attrs.assetType, $scope);
            }

            // options[paging] = false

            // Data Connectivity
            $scope.assets = null;
            $scope.$watch('$ctrl.ngModel', function (data) {
                $log.log('Assets:', data);
                $scope.assets = data;
            });
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/asset' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
