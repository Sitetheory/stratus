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

  // This Service is used share data of multi div which using the same FilterContentType controller
  Stratus.Services.FilterContentType = ['$provide', function ($provide) {
    $provide.factory('filterContentType', ['$q', function ($q) {
      this.data = { contents: [] };
      return this.data;
    }]);
  }];
}));
