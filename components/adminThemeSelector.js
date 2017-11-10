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
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea',
          populate: 1,
          category: 'Real Estale',
          created_at: '2017-11-13'
        },
        {
          id: 2,
          title: 'Kurage 2',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea',
          populate: 5,
          category: 'Real Estale',
          created_at: '2017-11-12'
        },
        {
          id: 3,
          title: 'Kurage 3',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea',
          populate: 4,
          category: 'Churche',
          created_at: '2017-11-15'
        },
        {
          id: 4,
          title: 'Kurage 4',
          content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea',
          populate: 3,
          category: 'Artist',
          created_at: '2017-11-10'
        }
      ];
      $ctrl.currentThemes = $ctrl.themes;

      $ctrl.categories = ['Real Estale', 'Churche', 'Small Business', 'Corporate', 'Artist', 'Health & Fitness'];

      // define methods
      $ctrl.sortBy = sortBy;
      $ctrl.setFavorite = setFavorite;
      $ctrl.getHeartColor = getHeartColor;
      $ctrl.showCategory = showCategory;

      // methods
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
