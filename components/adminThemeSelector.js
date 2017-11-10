(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular) {
  // This component intends to allow editing of various selections depending on context.
  Stratus.Components.AdminThemeSelector = {
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
      $ctrl.themes = [
        {
          id: 1,
          title: 'Kurage',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea'
        },
        {
          id: 2,
          title: 'Kurage',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea'
        },
        {
          id: 3,
          title: 'Kurage',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea'
        },
        {
          id: 4,
          title: 'Kurage',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea'
        }
      ];

      // methods
      $ctrl.setFavorite = function (id) {
        $ctrl.favorites.includes(id) ? $ctrl.favorites.splice($ctrl.favorites.indexOf(id, 1)) : $ctrl.favorites.push(id);
      };

      $ctrl.getHeartColor = function (id) {
        return $ctrl.favorites.includes(id) ? 'fa fa-heart heart-color' : 'fa fa-heart-o';
      };
    },
    templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/adminThemeSelector' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  };
}));
