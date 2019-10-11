// Details Service
// ---------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular',
      'stratus.services.model'
    ],
    factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Services.Details = [
    '$provide', function ($provide) {
      $provide.factory('details', [
        '$http',
        'Model',
        '$interpolate',
        function ($http, Model, $interpolate) {
          return class AngularDetails {
            constructor () {
              // Scope Binding
              this.fetch = this.fetch.bind(this)
              this.build = this.build.bind(this)
            }

            fetch ($element, $scope) {
              const that = this
              return new Promise(function (resolve, reject) {
                if (angular.isString($element)) {
                  $element = { target: $element }
                }
                const options = {
                  selectedId: $element.attr
                    ? $element.attr('data-selectedId')
                    : $element.selectedId,
                  property: $element.attr
                    ? $element.attr('data-property')
                    : $element.property
                }
                let completed = 0
                $scope.$watch(function () {
                  return completed
                }, function (iteration) {
                  if (_.isNumber(iteration) &&
                    parseInt(iteration) === _.size(options)) {
                    resolve(that.build(options, $scope))
                  }
                })
                _.each(options, function (element, key) {
                  if (element && angular.isString(element)) {
                    const interpreter = $interpolate(element, false, null, true)
                    const initial = interpreter($scope.$parent)
                    if (angular.isDefined(initial)) {
                      options[key] = initial
                      completed++
                    } else {
                      $scope.$watch(function () {
                        return interpreter($scope.$parent)
                      }, function (value) {
                        if (value) {
                          options[key] = value
                          completed++
                        }
                      })
                    }
                  } else {
                    completed++
                  }
                })
              })
            }

            build (options, $scope) {
              if (options.selectedId) {
                let targetUrl
                if (options.property === 'version.layout') {
                  targetUrl = '/Api/Layout/' + options.selectedId
                }
                if (options.property === 'version.template') {
                  targetUrl = '/Api/Template/' + options.selectedId
                }
                const action = 'GET'
                const prototype = {
                  method: action,
                  url: targetUrl,
                  headers: {}
                }
                $http(prototype).then(function (response) {
                  if (response.status === 200 &&
                    angular.isObject(response.data)) {
                    $scope.convoyDetails = response.data.payload ||
                      response.data
                    $scope.selectedName = $scope.convoyDetails.name
                    $scope.selectedDesc = $scope.convoyDetails.description
                  }
                })
              }
            }
          }
        }])
    }]
}))
