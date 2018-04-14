// PasswordCheck Directive
// ---------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory)
  } else {
    factory(root.Stratus, root._)
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.PasswordCheck = function () {
    return {
      require: 'ngModel',
      scope: {
        password: '@'
      },
      link: function (scope, element, attr, ngModel) {
        element.focusout(function () {
          ngModel.$validators.passwordCheck = function (modelValue) {
            return modelValue == scope.password
          }
          ngModel.$validate()
        })
      }
    }
  }
}))
