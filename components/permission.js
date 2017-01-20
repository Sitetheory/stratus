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
        define(['stratus', 'underscore', 'angular', 'angular-material', 'stratus.components.help'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component intends to allow editing of various permissions depending on context.
    Stratus.Components.Permission = {
        bindings: {
            elementId: '@',
            ngModel: '=',
            user: '@',
            role: '@',
            bundle: '@',
            type: '@',
            target: '@',
            sentinel: '@'
        },
        controller: function ($scope, $attrs, $log) {
            this.uid = _.uniqueId('permission_');
            Stratus.Instances[this.uid] = $scope;
            $scope.elementId = $attrs.elementId || this.uid;

            /*
            $scope.$watch('$ctrl.ngModel', function (value) {
                $log.log('watch:', value);
            });
            */

            /*
            $scope.sentinel = new Stratus.Prototypes.Sentinel();
            $scope.$watch('sentinel', function (value) {
                // $log.log('sentinel:', value, );
            }, true);
            */

            // $log.log('component:', this);
        },
        template: '<div layout="row" flex="100" ng-repeat="permission in $ctrl.ngModel.models"><div flex ng-controller="Generic" data-raw="true" data-target="User"><md-autocomplete md-menu-class="autocomplete-custom-template" md-selected-item="selected" md-search-text="query" md-items="user in collection.filter(query)" md-no-cache="true" md-autoselect="true" md-floating-label="User or Role" placeholder="Choose an Identity"><md-item-template><div class="contact-item" layout="row"><img ng-src="{{ user.email | gravatar }}" class="md-avatar" alt="{{ user.bestName }}"><div flex class="md-list-item-text compact"><p class="md-contact-name" md-highlight-text="true" md-highlight-flags="i">{{ user.bestName }}</p><p class="md-contact-email">{{ user.email }}</p></div></div></md-item-template></md-autocomplete></div><div flex ng-controller="Generic" data-raw="true" data-target="ContentType"><md-autocomplete md-menu-class="autocomplete-custom-template" md-selected-item="selected" md-search-text="query" md-items="contentType in collection.filter(query)" md-no-cache="true" md-autoselect="true" md-floating-label="Content" placeholder="Choose an Asset"><md-item-template><div class="contact-item" layout="row"><div flex class="md-list-item-text compact"><p>{{ contentType.name }}</p></div></div></md-item-template></md-autocomplete></div><div flex layout-align="center center" layout="column"><md-menu><a ng-click="$mdOpenMenu($event)" aria-label="Choose Permissions" href="#">Total: {{ sentinel.permissions() }}<div class="caret"></div></a><md-menu-content width="3"><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.view" aria-label="View">View</md-checkbox></md-menu-item><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.create" aria-label="Create">Create</md-checkbox></md-menu-item><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.edit" aria-label="Edit">Edit</md-checkbox></md-menu-item><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.delete" aria-label="Delete">Delete</md-checkbox></md-menu-item><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.publish" aria-label="Publish">Publish</md-checkbox></md-menu-item><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.design" aria-label="Design">Design</md-checkbox></md-menu-item><md-menu-item ng-show="!sentinel.master"><md-checkbox ng-model="sentinel.dev" aria-label="Dev">Dev</md-checkbox></md-menu-item><md-menu-divider ng-show="!sentinel.master"></md-menu-divider><md-menu-item><md-checkbox ng-model="sentinel.master" aria-label="Master">Master</md-checkbox></md-menu-item></md-menu-content></md-menu></div><md-button flex ng-if="$last" ng-click="collection.add()">+</md-button></div>'
    };
}));
