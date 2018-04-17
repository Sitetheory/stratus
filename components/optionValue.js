// OptionValue Component
// ---------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'angular'], factory)
  } else {
    factory(root.Stratus)
  }
}(this, function (Stratus) {
  // This component intends to handle binding of an
  // item array into a particular attribute.
  Stratus.Components.OptionValue = {
    bindings: {
      ngModel: '=',
      multiple: '<',
      options: '=',
      type: '@'
    },
    controller: function ($scope) {
      Stratus.Instances[_.uniqueId('option_value_')] = $scope
      $scope.items = []
      var normalize = function () {
        if (!angular.isArray($scope.items)) {
          $scope.items = []
        }
        if (!$scope.items.length) {
          $scope.items.push({})
        }
      }
      normalize()
      $scope.$parent.$watch(function () {
        return $scope.$ctrl.ngModel
      }, function (items) {
        if (items !== $scope.items) {
          $scope.items = items
          normalize()
        }
      }, true)
      $scope.$watch('items', function (items) {
        $scope.$ctrl.ngModel = items
      }, true)
    },
    templateUrl: Stratus.BaseUrl +
    'sitetheorystratus/stratus/components/optionValue' +
    (Stratus.Environment.production ? '.min' : '') + '.html'
  }
}))
