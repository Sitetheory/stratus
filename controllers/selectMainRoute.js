(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._)
  }
}(this, function (Stratus, _) {
  Stratus.Controllers.SelectMainRoute = [
    '$scope',
    function ($scope) {
      // Store Instance
      Stratus.Instances[_.uniqueId('select_main_route_')] = $scope

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      // list route is got from server;
      $scope.routes = []

      // the id of main route
      $scope.mainRoute = 0

      // Data Connectivity
      $scope.$watch('model.data.routing', function (routing) {
        if (routing) {
          $scope.routes = routing
          angular.forEach($scope.routes, function (route) {
            if (route.main) {
              $scope.mainRoute = route.id
            }
          })
        }
      })

      $scope.update = function () {
        angular.forEach($scope.routes, function (route) {
          route.main = (route.id == $scope.mainRoute)
        })
        return $scope.routes
      }
    }]
}))
