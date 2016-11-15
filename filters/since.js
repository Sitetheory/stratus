//     Stratus.Collections.Provider.js 1.0

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
        define(['stratus', 'underscore', 'angular', 'stratus.models.provider'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {

    // Angular Filter
    // ------------------

    // This filter allows a display of time since the given date
    Stratus.Filters.Since = angular.module('since', []).filter('since', function () {
        return function (input, future) {
            var substitute = function (stringOrFunction, number, strings) {
                var string = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
                var value = (strings.numbers && strings.numbers[number]) || number;
                return string.replace(/%d/i, value);
            };
            var nowTime = (new Date()).getTime();
            var date = (new Date(input)).getTime();

            //var refreshMillis= 6e4; //A minute
            var allowFuture = future || false;
            var strings = {
                prefixAgo: '',
                prefixFromNow: '',
                suffixAgo: 'ago',
                suffixFromNow: 'from now',
                seconds: 'less than a minute',
                minute: 'about a minute',
                minutes: '%d minutes',
                hour: 'about an hour',
                hours: 'about %d hours',
                day: 'a day',
                days: '%d days',
                month: 'about a month',
                months: '%d months',
                year: 'about a year',
                years: '%d years'
            };
            var dateDifference = nowTime - date;
            var words;
            var seconds = Math.abs(dateDifference) / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var years = days / 365;
            var separator = strings.wordSeparator === undefined ? ' ' : strings.wordSeparator;

            var prefix = strings.prefixAgo;
            var suffix = strings.suffixAgo;

            if (allowFuture) {
                if (dateDifference < 0) {
                    prefix = strings.prefixFromNow;
                    suffix = strings.suffixFromNow;
                }
            }

            words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
                seconds < 90 && substitute(strings.minute, 1, strings) ||
                minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
                minutes < 90 && substitute(strings.hour, 1, strings) ||
                hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
                hours < 42 && substitute(strings.day, 1, strings) ||
                days < 30 && substitute(strings.days, Math.round(days), strings) ||
                days < 45 && substitute(strings.month, 1, strings) ||
                days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
                years < 1.5 && substitute(strings.year, 1, strings) ||
                substitute(strings.years, Math.round(years), strings);
            prefix.replace(/ /g, '');
            words.replace(/ /g, '');
            suffix.replace(/ /g, '');
            return (prefix + ' ' + words + ' ' + suffix + ' ' + separator);

        };
    });

}));
