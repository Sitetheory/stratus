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
        '$rootScope',
        function ($scope, $mdDialog, $rootScope) {
            // Store Instance
            Stratus.Instances[_.uniqueId('select_main_route_')] = $scope

            // Wrappers
            $scope.Stratus = Stratus
            $scope._ = _

            // list route is got from server;
            $scope.routes = []
            $scope.routeEmptyMessage = false;
            $scope.routeUniqueMessage = false;
            $scope.routeRegularEmpMessage = false;
            $scope.selectedId = 0;
            $scope.duplecateArr = [];
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
                    model.data.routing.push({'homePage': true});
                }, function () {
                    return false;
                });
            }

            // Data Connectivity
            // following code watches any change happen to routes on the content
            //such as route in the header, route while creating article and while changing primary, setting home page
            $scope.$watch('model.data', function (routings) {
                if (routings.routing) {
                    var count = 1
                    var resetRouting = []
                    for (var i = 0; i < routings.routing.length; i++) {
                        if (routings.routing[i] && routings.routing[i].main === true) {
                            resetRouting[0] = routings.routing[i];
                        } else {
                            resetRouting[count] = routings.routing[i]
                            count++
                        }
                    }
                    routings.routing = resetRouting
                    $scope.routes = routings.routing
                    angular.forEach($scope.routes, function (route) {
                        if (route.main) {
                            $scope.mainRoute = route.id
                        }
                    })
                }
                $rootScope.$$childHead.data.changed = false;

            })
            $scope.update = function () {
                angular.forEach($scope.routes, function (route) {
                    route.main = (route.id === $scope.mainRoute || route.uid === $scope.mainRoute)

                })
                return $scope.routes
            }
            $scope.removeEmptyRoute = function (model, $event, $index) {
                if (model.data.routing[$index] != undefined && model.data.routing[$index].url && model.data.routing[$index].url != undefined) {
                    var alias = model.data.routing[$index].url;
                } else {
                    var alias = '';
                }
                var confirm = $mdDialog.confirm()
                    .title('Delete Route')
                    .textContent("Are you sure you want to remove the friendly URL alias  '/" + alias + "'  from this page? ")
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
            /*Validation of urls */
            $scope.checkEmptyRoute = function (model, $event) {
                var lastUrl = $event.$parent.route.url;
                var isMain = model.data.main;
                if (lastUrl === '' && isMain === true) {
                    $scope.routeEmptyMessage = true;
                } else {
                    $scope.routeEmptyMessage = false;
                    var uniqueValidation = $scope.checkUniqueRoute(model, $event);
                    if (uniqueValidation === true) {
                        $scope.routeUniqueMessage = true;
                        $scope.selectedId = $event.$parent.route.uid;
                    } else {
                        $scope.routeUniqueMessage = false;
                        $scope.selectedId = $event.$parent.route.uid;
                        var patternValidation = $scope.checkPattern($event);
                        if (patternValidation === true) {
                            $scope.routeRegularEmpMessage = true;
                            $scope.selectedIds = $event.$parent.route.uid;
                        } else {
                            $scope.routeRegularEmpMessage = false;
                            $scope.selectedIds = $event.$parent.route.uid;
                        }
                    }
                }

            }
            $scope.checkUniqueRoute = function (model, $event) {
                var valueArr = [];
                $scope.duplecateArr = [];
                 model.data.routing.map(function (item) {
                     valueArr.push(item.url);
                });
                valueArr.some(function (item, idx) {
                    if (valueArr.indexOf(item) != idx) {
                        $scope.duplecateArr[idx]=idx;
                        $scope.selectedIds = idx;
                    }
                });
                if($scope.duplecateArr.length > 0){
                    return true;
                }else{
                    return false;
                }
            }
            $scope.checkPattern = function ($event) {
                var patt = /^([a-z0-9]+)([a-z0-9\_\/\~\.\-])*([a-z0-9]+)$/i;
                if (patt.test($event.$parent.route.url)) {
                    return false;
                } else {
                    return true;
                }
            }
        }]
}))
