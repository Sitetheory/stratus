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
      this.diff = null // Difference between two dates (as a number).
      this.from = null // Difference between two dates (with human grammar)
      this.relative = '1w'
      this.duration = 'days' // Used with 'diff' to display the incremental between: seconds, minutes, hours, days, weeks, months, years
      this.format = 'MMM Do YYYY, h:mma'
      if (angular.isObject(options)) angular.extend(this, options)
      if (this.relative && typeof this.relative === 'string' && Math.round(new Date().getTime() / 1000) > (input + _.seconds(this.relative))) this.since = false
      let time = this.unix ? moment.unix(input) : moment(input)
      time = this.tz && this.tz !== 'local' ? time.tz(this.tz) : time

      if (this.diff) {
        let until = this.unix ? moment.unix(this.diff) : this.diff === true ? moment() : moment(this.diff)
        until = this.tz ? until.tz(this.tz) : until
        // console.log('between', time, 'and', until)
        return until.diff(time, this.duration)
      } else if (this.from) {
        let from = this.unix ? moment.unix(this.from) : moment(this.from)
        from = this.tz ? from.tz(this.tz) : from
        // console.log('from', from, 'to', time)
        return time.from(from, true)
      } else {
        return (!this.since) ? time.format(this.format) : time.fromNow(!this.ago)
      }
    }
  }
}))
