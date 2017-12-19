(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.CompileTemplate = function ($compile, $parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
          attr.$observe('ngBindHtml', function () {
              if (attr.ngBindHtml) {
                $compile(element[0].children)(scope);
              }
            });
        }
    };
  };
}));
