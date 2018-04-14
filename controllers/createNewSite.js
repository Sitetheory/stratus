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
      'stratus.services.createNewSite',
      'stratus.services.commonMethods'
    ], factory)
  } else {
    factory(root.Stratus, root._)
  }
}(this, function (Stratus, _) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.CreateNewSite = [
    '$scope',
    '$element',
    '$log',
    '$parse',
    'registry',
    'createNewSite',
    'commonMethods',
    function (
      $scope, $element, $log, $parse, registry, createNewSite, commonMethods) {
      // Store Instance
      Stratus.Instances[_.uniqueId('createNewSite_')] = $scope

      // Registry
      $scope.registry = new registry()
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

      // Variables
      $scope.errorMsg = null
      $scope.steps = {
        isWelcome: true,
        isThemeSelecting: false,
        isSuccess: false,
        isBillingPackage: false
      }

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
      $scope.currentMethod = false

      $scope.$watch('model.data', function (modelData) {
        if (angular.isObject(modelData)) {
          $scope.currentMethod = modelData.masterContentMethod
        }
      })

      // cause the create new site api have not yet finish so I assume it
      // success to call another follow.
      $scope.stepFinish = function (name) {
        switch (name) {
          case 'ThemeSelecting':
            $scope.steps.isThemeSelecting = false
            $scope.steps.isSuccess = true
            break
          case 'Success':
            $scope.steps.isSuccess = false
            $scope.steps.isBillingPackage = true
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
          if (commonMethods.getStatus(res).code ==
            commonMethods.RESPONSE_CODE.success) {
            $scope.errorMsg = null
            $scope.steps.isWelcome = false
            if (res.data.payload) {
              window.location.href = '/Site/Edit?id=' + res.data.payload.id
            }
          } else {
            $scope.errorMsg = commonMethods.getStatus(res).message
          }
        })
      }

      $scope.checkMasterSite = function (genreId, masterSite) {
        if (masterSite && genreId) {
          var data = {
            genreId: genreId,
            isMasterSite: masterSite
          }
          createNewSite.checkMaster(data).then(function (res) {
            if (commonMethods.getStatus(res).code ==
              commonMethods.RESPONSE_CODE.success) {
              $scope.errorMsg = commonMethods.getStatus(res).message
            } else {
              $scope.errorMsg = null
            }
          })
        } else {
          $scope.errorMsg = null
        }
      }

      $scope.choosePackage = function () {
        $scope.steps.isSuccess = false
        $scope.steps.isBillingPackage = true
      }
    }
  ]
}))
