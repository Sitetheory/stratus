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
  Stratus.Services.Media = ['$provide', function ($provide) {
    $provide.factory('media', ['$q', '$http', function ($q, $http) {
      var urlApi = '/Api/Template';

      return {
        dragenter: dragenter,
        dragleave: dragleave
      };

      function dragenter(event) {
        $('#main').addClass('blurred');
      }

      function dragleave(event) {
        $('#main').removeClass('blurred');
      }
    }]);
  }];
}));
