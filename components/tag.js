(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'angular-material',
      'stratus.services.commonMethods'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This component intends to allow editing of various tags
  Stratus.Components.Tag = {
    bindings: {
      ngModel: '=',
      collection: '<'
    },
    controller: function ($scope, $parse, $attrs, commonMethods) {
      // Initialize
      commonMethods.componentInitializer(this, $scope, $attrs, 'tag', true);
      var $ctrl = this;
      $ctrl.selectedChips = [];
      $ctrl.collection = [];
      $ctrl.queryText = '' ;

      // init model for md-chips
      $scope.$watch('$ctrl.ngModel', function (items) {
        $ctrl.selectedChips = items || [];
      });

      // init model for autocomplete
      $scope.$watch('$ctrl.collection', function (data) {
        $ctrl.collection = data;
      });

      /**
      * Init value for search list
      */
      $ctrl.queryData = function () {
        var results = $ctrl.collection.filter($ctrl.queryText);
        return Promise.resolve(results).then(function (value) {
          return value.filter(function (item) {
            return $ctrl.selectedChips.indexOf(item.name) === -1;
          });
        });
      };

      /**
      * Return the proper object when the append is called.
      * @return {name: 'value'}
      */
      $ctrl.transformChip = function (chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
          return chip;
        }

        // Otherwise, create a new one
        return { name: chip };
      };

      /**
      * Add an object when it isn't match with the exists list;
      */
      $ctrl.createTag = function () {
        $ctrl.selectedChips.push($ctrl.transformChip($ctrl.queryText));
        $ctrl.queryText = null;
        $('input').blur();
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/tag' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
