// Generic Controller
// ------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.registry',
      'stratus.services.createNewSite'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.Generic = [
    '$scope',
    '$element',
    '$log',
    '$parse',
    'Registry',
    'createNewSite',
    function ($scope, $element, $log, $parse, Registry, createNewSite) {
      // Store Instance
      Stratus.Instances[_.uniqueId('generic_')] = $scope

      // Registry
      Registry.fetch($element, $scope)

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _
      $scope.setUrlParams = function (options) {
        if (angular.isObject(options)) {
          let substance = false
          angular.forEach(options, function (value) {
            if (angular.isDefined(value) && value !== null) {
              if (!angular.isString(value)) {
                substance = true
              } else if (value.length > 0) {
                substance = true
              }
            }
          })
          if (substance) {
            window.location.replace(_.setUrlParams(options))
          }
        }
      }
      $scope.$log = $log

      // Type Checks
      $scope.isArray = angular.isArray
      $scope.isDate = angular.isDate
      $scope.isDefined = angular.isDefined
      $scope.isElement = angular.isElement
      $scope.isFunction = angular.isFunction
      $scope.isNumber = angular.isNumber
      $scope.isObject = angular.isObject
      $scope.isString = angular.isString
      $scope.isUndefined = angular.isUndefined

      $scope.createSite = function (
        siteTitle, siteGenreId, masterSite, masterContentMethod) {
        let data = {
          name: siteTitle,
          genre: siteGenreId,
          masterSite: masterSite,
          masterContentMethod: masterContentMethod
        }
        createNewSite.create(data).then(function (res) {
          console.log(res)
        })
      }

      // Handle Selected
      if ($scope.collection) {
        let selected = {
          id: $element.attr('data-selected'),
          raw: $element.attr('data-raw')
        }
        if (selected.id) {
          if (angular.isString(selected.id)) {
            if (_.isJSON(selected.id)) {
              selected.id = JSON.parse(selected.id)
              $scope.$watch('collection.models', function (models) {
                if (!$scope.selected && !$scope.selectedInit) {
                  angular.forEach(models, function (model) {
                    if (selected.id === model.getIdentifier()) {
                      $scope.selected = selected.raw ? model.data : model
                      $scope.selectedInit = true
                    }
                  })
                }
              })
            } else {
              selected.model = $parse(selected.id)
              selected.value = selected.model($scope.$parent)
              if (angular.isArray(selected.value)) {
                selected.value = selected.value.filter(function (n) {
                  return n
                })
                if (selected.value.length) {
                  $scope.selected = _.first(selected.value)
                }
              }
            }
          }
        }
      }
    }]
}))
