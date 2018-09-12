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
            $scope.routeMessage = false;
            // the id of main route
            $scope.mainRoute = 0
            $scope.setAsHomePage = function (model, $event) {
                var confirm = $mdDialog.confirm()
                    .title('Set As Home Page')
                    .textContent("Are you sure you want to set this current page as your main home page ?   If you confirm, then all traffic to your main domain will load this page. Please also remember that if your current home page does not have a secondary friendly URL, the system will create a temporary URL for it (which you may want to change). And there may not be a way to access that page if it\'s not linked from your menu.")
                    .targetEvent($event)
                    .ok('Confirm')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    model.data.main = true;
                    model.save();
                    model.data.routing.push({'homePage':true});
                }, function () {
                    return false;
                });
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
                    // var count=1;
                    //     var resetRouting = [];
                    //     for(var i=0;i < data.routing.length;i++){
                    //         if(data.routing[i] && data.routing[i].main === true){
                    //             resetRouting[0] = data.routing[i];
                    //         }else{
                    //             resetRouting[count] = data.routing[i];
                    //             count++;
                    //         }
                    //     }
                    //     data.routing = resetRouting;
                }
            })
            $scope.update = function () {
                angular.forEach($scope.routes, function (route) {
                    route.main = (route.id === $scope.mainRoute)
                })
                return $scope.routes
            }
            $scope.removeEmptyRoute = function (model,$event,$index){
                if(model.data.routing[$index].url && model.data.routing[$index].url != undefined){
                    var alias = model.data.routing[$index].url;
                }else{
                    var alias = '';
                }
                var confirm = $mdDialog.confirm()
                    .title('Delete Route')
                    .textContent("Are you sure you want to remove friendly URL alias  '/"+alias+"'  from this page ? ")
                    .targetEvent($event)
                    .ok('Confirm')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    $scope.routeMessage = false;
                    model.data.routing.splice($index, 1);

                }, function () {
                    return false;
                });
            }
            $scope.checkEmptyRoute = function (model,$event) {
                var lastUrl = model.data.routing[(model.data.routing.length) - 1].url;
                var isMain = model.data.main;
                if(lastUrl === '' && isMain === true){
                    $scope.routeMessage = true;
                }else{
                    $scope.routeMessage = false;
                }
            }
        }]
}))
