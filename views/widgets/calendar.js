//     Stratus.Views.Widgets.Calendar.js 1.0

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

// Examples
// ========

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values. See the options in this.options below to know which attributes can be modified from the data attributes.

// Widget
// ======

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'underscore', 'moment', 'stratus.views.widgets.base', 'fullcalendar'], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.moment);
    }
}(this, function (Stratus, $, _, moment) {

    // Views
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Calendar = Stratus.Views.Widgets.Base.extend({

        model: Stratus.Models.Generic,
        template: _.template(''),
        url: '/Api/',
        /*routes: {
            'range/:dateStart': 'paginate',
            'range/:dateStart/:dateEnd': 'paginate'
        },*/

        options: {
            private: {
                requiredCssFile: [Stratus.BaseUrl + 'sitetheorystratus/stratus/bower_components/fullcalendar/dist/fullcalendar.min.css']
            },
            public: {
                customButtons: null, //See http://fullcalendar.io/docs/display/customButtons/
                buttonIcons: { //object. Determines which icons are displayed in buttons of the header. See http://fullcalendar.io/docs/display/buttonIcons/
                    prev: 'left-single-arrow',
                    next: 'right-single-arrow',
                    prevYear: 'left-double-arrow',
                    nextYear: 'right-double-arrow'
                },
                header: { //object. Defines the buttons and title at the top of the calendar. See http://fullcalendar.io/docs/display/header/
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                defaultDate: null, //Moment or date String(2014-02-01). The initial date displayed when the calendar first loads
                nowIndicator: false, //boolean. Whether or not to display a marker indicating the current time(week or day view)
                timezone: false, //false (default), 'local' (client-side), 'UTC', a timezone string ('America/Chicago'). Determines the timezone in which dates throughout the API are parsed and rendered
                eventForceAllDay: false, //boolean. Override option directly for events. true = shows only the date and hides time(even on week/day view)
                eventLimit: false, //false or int, a number assigns the max number of events to display per day
                eventLimitClick: 'popover', //'popover', 'week', 'day', view name, Function. Determines the action taken when the user clicks on a "more" link created by the eventLimit option. See http://fullcalendar.io/docs/display/eventLimitClick/
                fixedWeekCount: false, //boolean. true = month sets there to always be 6 weeks displayed
                firstDay: 0, //int. The day that each week begins. 0 = Sunday
                weekends: true, //boolean. Whether to include Saturday/Sunday columns
                hiddenDays: [], //Array of numbers. Exclude certain days-of-the-week from being displayed
                weekNumbers: false, //boolean. Determines if week numbers should be displayed
                weekNumberCalculation: 'local', //'local', 'ISO', or a Function. The method for calculating week numbers that are displayed
                businessHours: false, //boolean or object. Emphasizes certain time slots on the calendar. By default, Monday-Friday, 9am-5pm. See http://fullcalendar.io/docs/display/businessHours/
                RTLmode: false, //boolean. Displays the calendar in right-to-left mode
                height: null, //int, Function, 'parent', 'auto'. Will make the entire calendar (including header) a pixel height
                contentHeight: null, //int, Function, 'auto'. Will make the calendar's content area a pixel height
                aspectRatio: 1.35, //float. Determines the width-to-height aspect ratio of the calendar
                handleWindowResize: true, //boolean. Whether to automatically resize the calendar when the browser window resizes
                windowResizeDelay: 100 //int. Time, in milliseconds, the calendar will wait to adjust its size after a window resize event occurs
            }
        },

        initialRequest: true,
        startRange: moment(),
        endRange: moment(),
        /**
         * Methods to look into:
         * 'viewRender' for callbacks on new date range (pagination maybe)  - http://fullcalendar.io/docs/display/viewRender/
         * 'dayRender' for modifying day cells - http://fullcalendar.io/docs/display/dayRender/
         * 'windowResize' for callbacks on window resizing - http://fullcalendar.io/docs/display/windowResize/
         * 'render' force calendar to redraw - http://fullcalendar.io/docs/display/render/
         */
        /**
         * @param entries
         * @returns {boolean}
         */
        onRender: function (entries) {
            var that = this;
            that.$el.fullCalendar({
                customButtons: that.options.customButtons,
                buttonIcons: that.options.buttonIcons,
                header: that.options.header,
                defaultDate: that.options.defaultDate,
                nowIndicator: that.options.nowIndicator,
                timezone: that.options.timezone,
                eventLimit: that.options.eventLimit,
                eventLimitClick: that.options.eventLimitClick,
                fixedWeekCount: that.options.fixedWeekCount,
                firstDay: that.options.firstDay,
                weekends: that.options.weekends,
                hiddenDays: that.options.hiddenDays,
                weekNumbers: that.options.weekNumbers,
                weekNumberCalculation: that.options.weekNumberCalculation,
                businessHours: that.options.businessHours,
                isRTL: that.options.RTLmode,
                height: that.options.height,
                contentHeight: that.options.contentHeight,
                aspectRatio: that.options.aspectRatio,
                handleWindowResize: that.options.handleWindowResize,
                windowResizeDelay: that.options.windowResizeDelay,
                events: function (start, end, timezone, callback) {
                    //Alter the start/end to only fetch the range we don't have & Set the new parsed range
                    if (that.startRange <= start) {
                        start = null;
                    }

                    if (that.endRange >= end) {
                        end = null;
                    }

                    // Handle Scope
                    if (start != null && end != null) {//Overall greater
                        that.startRange = start;
                        that.endRange = end;
                    } else if (start == null && end != null) {//Extend right
                        start = that.endRange;
                        that.endRange = end;
                    } else if (end == null && start != null) {//Extend left
                        end = that.startRange;
                        that.startRange = start;
                    } //Else no scope change

                    if (!that.initialRequest && start != null && end != null) { //Request on other than initial and if there is a scope change
                        that.collection.once('success', function () {
                            console.log('Calendar fetch data: ', start.format(), end.format());
                            callback(that.parseEvents());
                        });
                        that.collection.meta.set('api.startRange', start.format('X'));
                        that.collection.meta.set('api.endRange', end.format('X'));
                        that.collection.refresh(); //FIXME: Does this merge the new collection results with the current?
                    } else {
                        callback(that.parseEvents());
                        that.initialRequest = false;
                    }
                }
            });
            return true;
        },
        /**
         * Parse Asset Collection into JSON Array usable by fullcalendar
         * @param callback {Array}
         * @returns {Array}
         */
        parseEvents: function (callback) {
            var that = this;
            var events = [];
            _.each(that.collection.toJSON().payload, function (payload) {
                if (payload.viewVersion) {
                    events.push({
                        id: payload.id,
                        title: payload.viewVersion.title,
                        start: moment.unix(payload.viewVersion.timeCustom || payload.viewVersion.timePublish || payload.time).format(),
                        end: ((!that.options.eventForceAllDay || !payload.viewVersion.meta.allDay) && payload.viewVersion.meta.timeEnd) ? moment.unix(payload.viewVersion.meta.timeEnd).format() : null,
                        url: payload.routingPrimary.url,
                        allDay: that.options.eventForceAllDay || payload.viewVersion.meta.allDay
                    });
                } else {
                    //no viewVersion would likely mean it is a media resource
                    events.push({
                        id: payload.id,
                        title: payload.name,
                        start: moment.unix(payload.time).format(),
                        url: '//' + payload.url + (payload.extension ? '.' + payload.extension : null),
                        allDay: that.options.eventForceAllDay
                    });
                }
            });
            if (callback) callback(events);
            return events;
        }
        /**
         * @param dateStart
         * @param dateEnd
         */
        /*paginate: function (dateStart, dateEnd) {
            if (dateStart === undefined) dateStart = '1';
            if (dateEnd === undefined) dateEnd = '1';
            if (!Stratus.Environment.get('production')) {
                console.log('Range: dateStart=', dateStart, 'dateEnd=', dateEnd);
            }
            var collection = Stratus.Collections.get(_.ucfirst(entity));
            if (typeof collection === 'object') {
                if (collection.isHydrated()) {
                    if (collection.meta.has('pageCurrent') && collection.meta.get('pageCurrent') !== parseInt(page)) {
                        if (collection.meta.get('pageTotal') >= parseInt(page) && parseInt(page) >= 1) {
                            collection.meta.set('api.p', page);
                            collection.refresh({ reset: true });
                        } else {
                            if (!Stratus.Environment.get('production')) {
                                console.log('Page', page, 'of entity', entity, 'does not exist.');
                            }
                        }
                    }
                } else {
                    collection.once('reset', function () {
                        this.paginate(dateStart, dateEnd);
                    }, this);
                }
            } else {
                Stratus.Collections.once('change:' + _.ucfirst(entity), function () {
                    this.paginate(dateStart, dateEnd);
                }, this);
            }
        }*/
    });

}));
