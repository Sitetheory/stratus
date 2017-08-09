// Permissions Component
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([

            // Libraries
            'stratus',
            'jquery',
            'underscore',
            'angular',

            // Modules
            'angular-material',

            // Services
            'stratus.services.collection'

        ], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {
    // Permissions
    Stratus.Components.Permissions = {
        bindings: {
            ngModel: '='
        },
        controller: function ($scope, $mdPanel, $attrs, registry) {

            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            $('ul.be-select').on('click', '.init', function () {
                $(this).closest('ul.be-select').children('li:not(.init)').toggle();
            });

            $scope.showRoleHeading = false;
            $scope.showContentHeading = false;

            $scope.showSelRole = function ($event, selValue) {

                console.log('show selected');
                $scope.roleSelected = selValue;
                $scope.showRoleHeading = true;
                console.log(selValue);
            };
            $scope.showSelContent = function ($event, selValue) {

                $scope.contentSelected = selValue;
                $scope.showContentHeading = true;
                console.log(selValue);
            };

            /* *
            var allOptions = $('ul.be-select').children('li:not(.init)');
            $('ul.be-select').on('click', 'li:not(.init)', function () {
                allOptions.removeClass('selected');  // TODO: use ngClass since this edits the DOM
                $(this).addClass('selected');
                $(this).children('.init').html(
                    $(this).html()
                );
                allOptions.toggle();
            });
            /* */
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };

}));
