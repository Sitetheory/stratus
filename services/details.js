//     Stratus.Services.Details.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'stratus.services.model'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // Angular Details Service
    // ------------------------

     
    Stratus.Services.Details = ['$provide', function ($provide) {
        $provide.factory('details', ['$http', 'model', '$interpolate', '$q', function ($http,  model, $interpolate, $q) {
            return function () {

               this.fetch = function ($element, $scope) {
                    var that = this;
                    return new $q(function (resolve, reject) {
                        if (angular.isString($element)) $element = { target: $element };
                        var options = {
                            selectedid: $element.attr ? $element.attr('data-selectedid') : $element.selectedid,
                            property: $element.attr ? $element.attr('data-property') : $element.property,
                        };

                        var completed = 0;
                        $scope.$watch(function () {
                            return completed;
                        }, function (iteration) {
                            if (_.isNumber(iteration) && parseInt(iteration) === _.size(options)) {
                                resolve(that.build(options, $scope));
                            }
                        });
                        _.each(options, function (element, key) {
                            if (element && angular.isString(element)) {
                                var interpreter = $interpolate(element, false, null, true);
                                var initial = interpreter($scope.$parent);
                                if (angular.isDefined(initial)) {
                                    options[key] = initial;
                                    completed++;
                                } else {
                                    $scope.$watch(function () {
                                        return interpreter($scope.$parent);
                                    }, function (value) {
                                        if (value) {
                                            options[key] = value;
                                            completed++;
                                        }
                                    });
                                }
                            } else {
                                completed++;
                            }
                        });
                    });
                };
                
                this.build = function (options, $scope) {
                    if (options.selectedid) {
                        if(options.property == 'version.layout'){
                            var targetUrl = "/Api/Layout/"+options.selectedid
                        }if(options.property == 'version.template'){
                            var targetUrl = "/Api/Template/"+options.selectedid
                        }
                        action =  'GET';
                        var prototype = {
                            method: action,
                            url: targetUrl,
                            headers: {}
                        };
                        $http(prototype).then(function (response) {
                            if (response.status === 200 && angular.isObject(response.data)) {
                                $scope.convoyDetails =  response.data.payload || response.data;
                                $scope.selectedName = $scope.convoyDetails.name;
                                $scope.selectedDesc = $scope.convoyDetails.description;


                            } 
                        });                          

                    } 
                };
            };
        }]);
    }];

}));
