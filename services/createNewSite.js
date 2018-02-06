(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define([
        'stratus',
        'underscore',
        'angular'
      ], factory);
    } else {
      factory(root.Stratus, root._);
    }
  }(this, function (Stratus, _) {

    // This Collection Service handles data binding for multiple objects with the $http Service
    Stratus.Services.CreateNewSite = ['$provide', function ($provide) {
      $provide.factory('createNewSite', ['$q', '$http', function ($q, $http) {
        var createNewSiteServices = {};
        var url = '/Api/Site';

        // TODO: This can use collections from the registry

        createNewSiteServices.create = function (data) {
          return $http({
            url: url,
            method: 'POST',
            data: data
          }).then(
            function (response) {
              // success
              return $q.resolve(response);
            },
            function (response) {
              // something went wrong
              return $q.reject(response);
            });
        };

        createNewSiteServices.checkMaster = function (data) {
            return $http({
                url: '/Api/SiteGenre',
                method: 'GET',
                params: data
            }).then(
                function (response) {
                    // success
                    return $q.resolve(response);
                },
                function (response) {
                    // something went wrong
                    return $q.reject(response);
                });
        };

        return createNewSiteServices;
      }]);
    }];

  }));
