/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Controllers.SelectMainRoute = [
    '$scope',
    '$mdDialog',
    function ($scope, $mdDialog) {
      // Store Instance
      Stratus.Instances[_.uniqueId('select_main_route_')] = $scope

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      // list route is got from server;
      $scope.routes = []
      // the id of main route
      $scope.mainRoute = 0
      $scope.setAsHomePage = function (model, $event) {
        var confirm = $mdDialog.confirm()
          .title('Set As Home Page')
          .textContent("Are you sure you want to set this current page as your main home page?  If you confirm, then all traffic to your main domain will load this page. Please also remember that if your current home page does not have a secondary friendly URL, the system will create a temporary URL for it (which you may want to change). And there may not be a way to access that page if it's not linked from your menu.")
          .targetEvent($event)
          .ok('Confirm')
          .cancel('Cancel')
        $mdDialog.show(confirm).then(function () {
          model.data.main = true
          model.save()
          model.data.routing.push({'homePage': true})
        }, function () {
          return false
        })
      }
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
          route.main = (route.id === $scope.mainRoute)
        })
        return $scope.routes
      }
    }]
}))
