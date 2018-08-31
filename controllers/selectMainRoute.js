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
        $scope.homepage = 0
        $scope.setAsHomePage = function (model) {

            var checkstr =  confirm('Are you sure you want to set this current page as your main home page that people land on when they visit your domain ?');
            if(checkstr == true){
                model.data.main = true;
            }else{
                return false;
            }
        }
      // Data Connectivity
      $scope.$watch('model.data.routing', function (routing) {
        if (routing) {
          $scope.routes = routing
          angular.forEach($scope.routes, function (route) {
            if (route.main) {
              $scope.mainRoute = route.id

            }
              route.homepage = $scope.homepage;
          })
        }
        console.log($scope.routes);
      })

      $scope.update = function () {
        angular.forEach($scope.routes, function (route) {
            route.homepage = $scope.homepage;
            console.log(route);
          route.main = (route.id === $scope.mainRoute)
        })

          console.log($scope.routes);
        return $scope.routes
      }
    }]
}))
