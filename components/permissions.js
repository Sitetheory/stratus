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
            'angular-material'
        ], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {
    // Permissions
    Stratus.Components.Permissions = {
        bindings: {
            permissionId: '<',
            ngModel: '='
        },
        controller: function ($scope, $timeout, $attrs, $http) {

            var $ctrl = this;

            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');

            // mock up list permissions
            $scope.permissionSelected = [];
            $scope.complete = false;

            $scope.permissions = [
                { value: 1, name: 'View' },
                { value: 2, name: 'Create' },
                { value: 4, name: 'Edit' },
                { value: 8, name: 'Delete' },
                { value: 16, name: 'Publish' },
                { value: 32, name: 'Design' },
                { value: 64, name: 'Dev' },
                { value: 128, name: 'Master' }
            ];
            // mock up list roles
            $scope.userRoleSelected = null;
            $scope.updateUserRole = null;

            // mock up list contents
            $scope.contentSelected = null;
            $scope.updateContent = null;

            $scope.$watch('$ctrl.permissionId', function (permissionId) {
                if (typeof permissionId !== 'undefined') {
                    $scope.getPermission(permissionId);
                }
            });

            $scope.getPermission = function (permissionId) {
                return $http({
                    method: 'GET',
                    url: '/Api/Permission/' + permissionId,
                    headers: { 'Content-Type': 'application/json' }
                }).then(
                    function (response) {
                        // success
                        if (response) {
                            var data = response.data.payload;

                            //Set permission selected
                            permissions = data.summary;
                            angular.forEach(permissions, function (permission, index) {
                                index = $scope.permissions.findIndex(function(x) {
                                    return x.name === permission;
                                });

                                if (index > -1) {
                                    $scope.permissionSelected.push($scope.permissions[index].value);
                                }
                            });

                            $ctrl.ngModel.data.permissions = $scope.permissionSelected;

                            //Set identity name
                            $scope.userRoleSelected = data.identityRole ? data.identityRole : data.identityUser;
                            $scope.updateUserRole = data.identityRole ? data.identityRole : data.identityUser;

                            if ($scope.userRoleSelected.name) {
                                $scope.userRoleSelected.name += ' - ' + $scope.userRoleSelected.id;
                            } else if ($scope.userRoleSelected.bestName) {
                                $scope.userRoleSelected.bestName += ' - ' + $scope.userRoleSelected.id;
                            }
                            //Set asset name
                            $scope.updateContent = {
                                name: data.assetContent,
                                assetType : data.asset,
                                id: data.assetId
                            };
                        }
                    },
                    function (response) {
                        // something went wrong
                        console.log('response error', response);

                    });
            };

            /**
             * Retrieve data from server
             */
            $scope.identityQuery = function (collection, query) {
                var results = collection.filter(query);
                return Promise.resolve(results).then(function (value) {
                    var response = [];
                    if (value.User) {
                        value.User.name += " - " + value.User.id;
                        response = response.concat(value.User);
                    }
                    if (value.Role) {
                        value.Role.bestName += " - " + value.Role.id;
                        response = response.concat(value.Role);
                    }
                    if (!(value.User) && !(value.Role)) {
                        if (value.name) {
                            value.name += " - " + value.id;
                        } else if (value.bestName) {
                            value.bestName += " - " + value.id;
                        }
                        response = response.concat(value);
                    }
                    console.log(response);
                    return response;
                });
            };

            $scope.contentQuery = function (collection, query) {
                var results = collection.filter(query);
                return Promise.resolve(results).then(function (value) {
                    var response = [];

                    if (value.Bundle) {
                        angular.forEach(value.Bundle, function (bundle, index) {
                            value.Bundle[index].type = "Bundle";
                            value.Bundle[index].assetType = "SitetheoryContentBundle:Bundle"
                        });

                        response = response.concat(value.Bundle);
                    }
                    if (value.Content) {
                        angular.forEach(value.Content, function (content, index) {
                            value.Content[index].type = "Content";
                            value.Content[index].assetType = "Sitetheory" + content.contentType.bundle.name + "Bundle:" + content.contentType.entity;
                        });
                        response = response.concat(value.Content);
                    }
                    if (value.ContentType) {
                        angular.forEach(value.ContentType, function (contentType, index) {
                            value.ContentType[index].type = "ContentType";
                            value.ContentType[index].assetType = "SitetheoryContentBundle:ContentType"
                        });
                        response = response.concat(value.ContentType);
                    }

                    if (!value.Bundle && !value.Content && !value.ContentType) {
                        response = response.concat(value);
                    }

                    return response;
                });
            };

            $scope.selectedUserRoleChange = function (item) {
                $scope.userRoleSelected = item;
                if ($scope.userRoleSelected && $scope.userRoleSelected.name) {
                    $ctrl.ngModel.data.identityRole = item;
                    $ctrl.ngModel.data.identityUser = null;
                } else {
                    $ctrl.ngModel.data.identityRole = null;
                    $ctrl.ngModel.data.identityUser = item;
                }
            };

            $scope.selectedContentChange = function (content) {
                $scope.contentSelected = content;

                if ($scope.contentSelected.type === 'Content') {
                    $ctrl.ngModel.data.assetId = $scope.contentSelected.version.meta.id;
                } else {
                    $ctrl.ngModel.data.assetId = $scope.contentSelected.id;
                }

                $ctrl.ngModel.data.asset = $scope.contentSelected.assetType;
            };

            /**
             * If user selected the master Action, the other action selected will be ignored.
             * If user selected all of actions except the master action, the action Selected will be converted to only contain master.
             */
            $scope.processSelectAction = function () {
                var masterIndex = $scope.permissionSelected.indexOf(128);
                if ((masterIndex != -1) || ($scope.permissionSelected.length == $scope.permissions.length - 1)) {
                    $scope.permissionSelected = [$scope.permissions[$scope.permissions.length - 1].value];
                }

                $ctrl.ngModel.data.permissions = $scope.permissionSelected;
            };
            $scope.selectedIdentify = function (item) {
                if (item.name) {
                    return item.name + " - " + item.id;
                } else {
                    return item.bestName + " - " + item.id;
                }
            };

            $scope.selectedContent = function (item) {
                if (item.version) {
                    return item.version + " - " + item.verision.meta.id;
                } else if (item.name) {
                    return item.name + " - " + item.id;
                }
            };
            /**
             * process data for submit
             * return {*}
             */
            $scope.processDataSubmit = function () {
                if ($scope.userRoleSelected && $scope.userRoleSelected.name) {
                    return { identity: { role: $scope.userRoleSelected.id }, asset: { asset: $scope.contentSelected.assetType, id: $scope.contentSelected.id }, permissions: $scope.permissionSelected };
                }
                return { identity: { user: $scope.userRoleSelected.id }, asset: { asset: $scope.contentSelected.assetType, id: $scope.contentSelected.id }, permissions: $scope.permissionSelected };
            };

            $scope.submit = function () {

                var data = $scope.processDataSubmit();
                var url = '/Api/Permission';
                var method = 'POST';

                if ($ctrl.permissionId) {
                    url += '/' + $ctrl.permissionId;
                    method = 'PUT';
                }
                return $http({
                    method: method,
                    url: url,
                    data: data,
                    headers: { 'Content-Type': 'application/json' }
                }).then(
                    function (response) {
                        // success
                        console.log('response', response);
                    },
                    function (response) {
                        // something went wrong
                        console.log('response error', response);

                    });
            };
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/permissions' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
