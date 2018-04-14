// DateTime Component
// ------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'moment', 'angular'], factory)
  } else {
    factory(root.Stratus, root.moment)
  }
}(this, function (Stratus, moment) {
  // This component intends to handle binding of
  // Date and Time into a simple unix timestamp
  Stratus.Components.DateTime = {
    bindings: {
      ngModel: '=',
      elementId: '@'
    },
    controller: function ($scope, $attrs) {
      // Basic Instantiation
      var uid = _.uniqueId('date_time_')
      Stratus.Instances[uid] = $scope
      $scope.elementId = $attrs.elementId || uid

      // Data Connectivity
      $scope.$watch('property', function (property) {
        $scope.$ctrl.ngModel = moment(property).unix()
      }, true)
      $scope.$watch(function () {
        return $scope.$ctrl.ngModel
      }, function (property) {
        if (property) {
          var momentTime = property
            ? moment.unix(parseInt(property))
            : moment()
          $scope.property = new Date(momentTime.year(), momentTime.month(),
            momentTime.date(), momentTime.hour(), momentTime.minute())
        }
      }, true)
    },
    template: '<input id="{{ elementId }}" type="datetime-local" ng-model="property" aria-label="datetime"/>'
  }
}))
