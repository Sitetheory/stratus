// Stratus.Filters.ToArray.js

// Function Factory
// ----------------
// Author https://github.com/petebacondarwin/angular-toArrayFilter

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'angular'], factory)
  } else {
    factory(root.Stratus, root.angular)
  }
}(this, function (Stratus) {
  // Angular ToArray Filter
  // ---------------------

  Stratus.Filters.ToArray = [
    function () {
      return function (obj, addKey) {
        if (!angular.isObject(obj)) return obj
        if (addKey === false) {
          return Object.keys(obj).map(function (key) {
            return obj[key]
          })
        } else {
          return Object.keys(obj).map(function (key) {
            var value = obj[key]
            return angular.isObject(value) ?
              Object.defineProperty(value, '$key', { enumerable: false, value: key }) :
              { $key: key, $value: value }
          })
        }
      }
    }
  ]
}))
