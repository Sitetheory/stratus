//     Stratus.Filters.Gravatar.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Function Factory
// ----------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'lodash', 'angular', 'md5'], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.md5)
  }
}(this, function (Stratus, _, angular, md5) {
  // Angular Gravatar Filter
  // -----------------------

  // This filter allows a display of time since the given date
  Stratus.Filters.Gravatar = function () {
    return function (input) {
      if (!input) {
        return '//www.gravatar.com/avatar/'
      }
      return '//www.gravatar.com/avatar/' + md5(input.trim().toLowerCase())
    }
  }
}))
