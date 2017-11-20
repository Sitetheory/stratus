(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'jquery',
      'underscore',
      'angular',

      // Modules
      'angular-material',

      // Services
      'stratus.services.registry',
      'stratus.services.collection',
      'stratus.services.model',
      'stratus.services.details',

      // Components
      'stratus.components.search',
      'stratus.components.pagination'
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.AdminThemeSelector = {
    bindings: {
      // Basic
      elementId: '@',
      ngModel: '=',
      property: '@',

      // Selector
      type: '@',
      limit: '@',
      multiple: '<',

      // Custom
      details: '<',
      search: '<'
    },
    controller: function ($scope, $window, $attrs, $log, $http, $mdDialog) {
      // Initialize
      this.uid = _.uniqueId('admin_theme_selector_');
      Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
      Stratus.Instances[this.uid] = $scope;
      $scope.elementId = $attrs.elementId || this.uid;
      var $ctrl = this;

      // mock DB
      $ctrl.favorites = [];
      $ctrl.heartCollor = [];
      $ctrl.currentThemes = $ctrl.themes;

      $ctrl.categories = ['Real Estale', 'Churche', 'Small Business', 'Corporate', 'Artist', 'Health & Fitness'];

      // define methods
      $ctrl.sortBy = sortBy;
      $ctrl.setFavorite = setFavorite;
      $ctrl.getHeartColor = getHeartColor;
      $ctrl.showCategory = showCategory;

      // Functionality methods
      function showCategory(index) {
        $ctrl.currentThemes = $ctrl.themes.filter(theme => theme.category == $ctrl.categories[index]);
        if (index < 0) {
          $ctrl.currentThemes = $ctrl.themes;
        }
      }

      function setFavorite(id) {
        $ctrl.favorites.includes(id) ? $ctrl.favorites.splice($ctrl.favorites.indexOf(id, 1)) : $ctrl.favorites.push(id);
      };

      // return the color for the heart.
      function getHeartColor(id) {
        return $ctrl.favorites.includes(id) ? 'fa fa-heart heart-color' : 'fa fa-heart-o';
      };

      function sortBy(type) {
        $ctrl.currentThemes = (function (type) {
          switch (type) {
            case 'lastest':
              return lastest();
            case 'populate':
              return populate();
            case 'favorite':
              return favorite();
          }
        })(type);
      };

      // Helpers
      function lastest() {
        return $ctrl.currentThemes.sort(function (a, b) {
          return parseFloat(new Date(b.created_at).getTime()) - parseFloat(new Date(a.created_at).getTime());
        });
      }

      function populate() {
        return $ctrl.currentThemes.sort(function (a, b) {
          return parseFloat(b.populate) - parseFloat(a.populate);
        });
      }

      function favorite() {
        return $ctrl.currentThemes.sort(function (a) {
          return $ctrl.favorites.includes(a.id) ? -1 : 1;
        });
      }
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
