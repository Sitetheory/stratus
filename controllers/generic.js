// Generic Controller
// ------------------

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
    factory(root.Stratus, root._)
  }
}(this, function (Stratus, _) {
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
      $scope.registry = new Registry()
      $scope.registry.fetch($element, $scope)

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _
      $scope.setUrlParams = function (options) {
        if (angular.isObject(options)) {
          var substance = false
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
            window.location.replace(Stratus.Internals.SetUrlParams(options))
          }
        }
      }
      $scope.$log = $log

      $scope.$watch('model.data', function (oldVal, newVal) {
        if (newVal) {
          $scope.linkTo = newVal.content || newVal.url
        }
      })

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

      $scope.getContentForMenu = function (query) {
        return $scope.collection.filter(query).then(function (res) {
          return res.map(function (item) {
            return item.data
          })
        })
      }

      $scope.handleSelection = function (content, type) {
        switch (type) {
          case 'content':
            $scope.model.data.url = null
            $scope.model.data.content = content
            break
          case 'url':
            $scope.model.data.content = null
            $scope.model.data.url = url
            break
        }
      }

      $scope.createSite = function (
        siteTitle, siteGenreId, masterSite, masterContentMethod) {
        var data = {
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
        var selected = {
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
