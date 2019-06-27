//     Stratus.Filters.Moment.js 1.0

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
    define(['stratus', 'lodash', 'angular', 'moment', 'moment-timezone/builds/moment-timezone-with-data'], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.moment)
  }
}(this, function (Stratus, _, angular, moment) {
  // Angular Moment Filter
  // ---------------------

  // This filter allows a display of time since the given date
  Stratus.Filters.Moment = function () {
    return function (input, options) {
      this.unix = true
      this.ago = true
      this.since = false
      this.relative = '1w'
      this.format = 'MMM Do YYYY, h:mma'
      if (angular.isObject(options)) angular.extend(this, options)
      if (this.relative && typeof this.relative === 'string' && Math.round(new Date().getTime() / 1000) > (input + _.seconds(this.relative))) this.since = false
      let time = this.unix ? moment.unix(input) : moment(input)
      time = this.tz ? time.tz(this.tz) : time
      return (!this.since) ? time.format(this.format) : time.fromNow(!this.ago)
    }
  }
}))
