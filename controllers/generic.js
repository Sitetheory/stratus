// Generic Controller
// ------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.registry'
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.Generic = [
  '$scope',
  '$element',
  '$mdToast',
  '$log',
  '$parse',
  'registry',
  function ($scope, $element, $mdToast, $log, $parse, registry) {
    // Store Instance
    Stratus.Instances[_.uniqueId('generic_')] = $scope;

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

    // the articles get from collection
    $scope.rootArticles = [];

    // the articles is used to show in to html.
    $scope.articles = [];
    $scope.contentTypes = [];

    // constraint the contentType is choosed in showOnly
    $scope.showOnly = [];

    // Data Connectivity
    $scope.$watch('collection.models', function (models) {
      if (models && models.length > 0) {
        $scope.rootArticles = $scope.articles = models;
      }
    });

    $scope.$watch('collection.meta.attributes.usedContentTypes', function (contentType) {
      if (contentType) {
        $scope.contentTypes = contentType;
      }
    });

    //  Handle showOnly check
    $scope.toggle = function (contentType) {
      var index = $scope.showOnly.findIndex(x => x.value == contentType.value);
      (index != -1) ? $scope.showOnly.splice(index, 1) : $scope.showOnly.push(contentType);
      reloadArticles();
    };

    // reload articles
    function reloadArticles() {
      if ($scope.showOnly.length > 0) {
        $scope.articles = [];
        angular.forEach($scope.rootArticles, function (article) {
          if ($scope.showOnly.findIndex(x => x.prompt == article.data.contentType.name) != -1) {
            $scope.articles.push(article);
          }
        });
      }else {
        $scope.articles = $scope.rootArticles;
      }
    }

    // Handle Selected
    if ($scope.collection) {
      var selected = {
        id: $element.attr('data-selected'),
        raw: $element.attr('data-raw')
      };
      if (selected.id) {
        if (angular.isString(selected.id)) {
          if (_.isJSON(selected.id)) {
            selected.id = JSON.parse(selected.id);
            $scope.$watch('collection.models', function (models) {
              if (!$scope.selected && !$scope.selectedInit) {
                angular.forEach(models, function (model) {
                  if (selected.id === model.get('id')) {
                    $scope.selected = selected.raw ? model.data : model;
                    $scope.selectedInit = true;
                  }
                });
              }
            });
          } else {
            selected.model = $parse(selected.id);
            selected.value = selected.model($scope.$parent);
            if (angular.isArray(selected.value)) {
              selected.value = selected.value.filter(function (n) {
                return n;
              });
              if (selected.value.length) {
                $scope.selected = _.first(selected.value);
              }
            }
          }
        }
      }
    }
  }];
}));
