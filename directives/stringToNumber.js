// (function (root, factory) {
//   if (typeof define === 'function' && define.amd) {
//     define(['stratus', 'underscore', 'angular'], factory);
//   } else {
//     factory(root.Stratus, root._);
//   }
// }(this, function (Stratus, _) {
//   // This directive intends to handle binding of a dynamic variable to
//   Stratus.Directives.StringToNumber = function ($compile, $parse) {
//     return {
//       require: 'ngModel',
//       link: function ($scope, $element, $attrs, ngModel) {
//         Stratus.Instances[_.uniqueId('string_to_number_')] = $scope;
//         ngModel.$parsers.push(function (value) {
//           console.log('vao day');
//
//           return '' + value;
//         });
//         ngModel.$formatters.push(function (value) {
//           return parseFloat(value);
//         });
//       }
//     };
//   };
// }));
// Trigger Directive
// -----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a model to a function, triggered upon true
  Stratus.Directives.StringToNumber = function ($parse, $log) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, $element, $attrs, ngModel) {
        Stratus.Instances[_.uniqueId('string_to_number_')] = $scope;
        ngModel.$parsers.push(function (value) {
          return '' + value;
        });
        ngModel.$formatters.push(function (value) {
          return parseFloat(value);
        });
      }
    };
  };
}));
