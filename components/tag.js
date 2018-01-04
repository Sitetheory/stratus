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
      $ctrl.bindingList = [];
      $ctrl.selectedChips = [];
      $ctrl.collection = [];

      // init model for md-chips
      $scope.$watch('$ctrl.ngModel', function (items) {
        $ctrl.bindingList = items;
        $ctrl.selectedChips = [];
        angular.forEach(items, function (item) {
          $ctrl.selectedChips.push(item.name);
        });
      });

      // init model for autocomplete
      $scope.$watch('$ctrl.collection', function (data) {
        $ctrl.collection = data;
      });

      // init search value
      $ctrl.searchData = function (query) {
        var results = $ctrl.collection.filter(query);
        return Promise.resolve(results).then(function (value) {
          return value.filter(function (item) {
            return $ctrl.selectedChips.indexOf(item.name) === -1;
          });
        });
      };

      // prepare data before add into list;
      $ctrl.transformChip = function (chip) {
        if (typeof (chip) === 'object') {
          return chip.name;
        }
      };

      $ctrl.addToParent = function (chip) {
        $ctrl.collection.filter(chip).then(
          function (response) {
            if (_.isEmpty(response)) {
              chip = { name: chip };
            } else {
              chip = response[0];
            }
            $ctrl.bindingList.push(chip);
          }
        );
      };

      $ctrl.removeFromParent = function (chip) {
        var index = $ctrl.bindingList.findIndex(function (x) {
          return x.name === chip;
        });
        $ctrl.bindingList.splice(index, 1);
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/tag' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
