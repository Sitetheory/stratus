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
    ], factory);
  } else {
    factory(root.Stratus, root._);
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
    function ($scope, $element, $log, $parse, registry, createNewSite) {
      // Store Instance
      Stratus.Instances[_.uniqueId('createNewSite_')] = $scope;

      // Registry
      $scope.registry = new registry();
      $scope.registry.fetch($element, $scope);

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;
      $scope.setUrlParams = function (options) {
        if (angular.isObject(options)) {
          var substance = false;
          angular.forEach(options, function (value) {
            if (angular.isDefined(value) && value !== null) {
              if (!angular.isString(value)) {
                substance = true;
              } else if (value.length > 0) {
                substance = true;
              }
            }
          });
          if (substance) {
            window.location.replace(Stratus.Internals.SetUrlParams(options));
          }
        }
      };
      $scope.$log = $log;

      // Variables
      $scope.steps = {
        isWelcome: false,
        isThemeSelecting: true,
        isBillingPackage: false,
        isSuccess: false
      };

      // Type Checks
      $scope.isArray = angular.isArray;
      $scope.isDate = angular.isDate;
      $scope.isDefined = angular.isDefined;
      $scope.isElement = angular.isElement;
      $scope.isFunction = angular.isFunction;
      $scope.isNumber = angular.isNumber;
      $scope.isObject = angular.isObject;
      $scope.isString = angular.isString;
      $scope.isUndefined = angular.isUndefined;

      $scope.createSite = function (siteTitle, siteGenreId) {
        var data = {
          name: siteTitle,
          genre: siteGenreId
        };
        createNewSite.create(data).then(function (res) {
          _.each($scope.steps, function (value, key) {
            if (key === 'isWelcome') {
              $scope.steps.isWelcome = !value;
            };
            if (key === 'isThemeSelecting') {
              $scope.steps.isThemeSelecting = !value;
            };
          });
        });
      };

    }
  ];
}));
