//     Stratus.Filters.Moment.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
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

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'moment', 'angular'], factory);
    } else {
        factory(root.Stratus, root.moment);
    }
}(this, function (Stratus, moment) {

    // Angular Moment Filter
    // ---------------------

    // This filter allows a display of time since the given date
    Stratus.Filters.Moment = function () {
        return function (input, options) {
            this.since = false;
            this.relative = '1w';
            this.format = 'MMM Do YYYY, h:mma';
            if (angular.isObject(options)) angular.extend(this, options);
            if (this.relative && typeof this.relative === 'string' && Math.round(new Date().getTime() / 1000) > (input + _.seconds(this.relative))) this.since = false;
            return (!this.since) ? moment.unix(input).format(this.format) : moment.unix(input).fromNow(true);
        };
    };

}));
