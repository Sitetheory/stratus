//     Stratus.Views.Widgets.Calendar.js 1.0

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
    define(['stratus', 'jquery', 'underscore', 'moment', 'moment-range', 'stratus.views.widgets.base', 'fullcalendar'], factory)
  } else {
    factory(root.Stratus, root.$, root._, root.moment)
  }
}(this, function (Stratus, $, _, moment) {
  // Views
  // -------------

  // This Backbone View intends to handle Generic rendering for a single Model.
  Stratus.Views.Widgets.Calendar = Stratus.Views.Widgets.Base.extend({

    model: Stratus.Models.Generic,
    template: _.template(''),
    url: '/Api/',
    /* routes: {
        'range/:dateStart': 'paginate',
        'range/:dateStart/:dateEnd': 'paginate'
    }, */

    options: {
      private: {
        requiredCssFile: [Stratus.BaseUrl + Stratus.BundlePath + 'bower_components/fullcalendar/dist/fullcalendar.min.css']
      },
      public: {
        cssFile: [Stratus.BaseUrl + Stratus.BundlePath + 'views/widgets/calendar.css'],
        customButtons: null, // See http://fullcalendar.io/docs/display/customButtons/
        buttonIcons: { // object. Determines which icons are displayed in buttons of the header. See http://fullcalendar.io/docs/display/buttonIcons/
          prev: 'left-single-arrow',
          next: 'right-single-arrow',
          prevYear: 'left-double-arrow',
          nextYear: 'right-double-arrow'
        },
        header: { // object. Defines the buttons and title at the top of the calendar. See http://fullcalendar.io/docs/display/header/
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        defaultView: 'month',
        defaultDate: null, // Moment or date String(2014-02-01). The initial date displayed when the calendar first loads
        nowIndicator: false, // boolean. Whether or not to display a marker indicating the current time(week or day view)
        timezone: false, // false (default), 'local' (client-side), 'UTC', a timezone string ('America/Chicago'). Determines the timezone in which dates throughout the API are parsed and rendered
        eventForceAllDay: false, // boolean. Override option directly for events. true = shows only the date and hides time(even on week/day view)
        eventLimit: 7, // false or int, a number assigns the max number of events to display per day
        eventLimitClick: 'popover', // 'popover', 'week', 'day', view name, Function. Determines the action taken when the user clicks on a "more" link created by the eventLimit option. See http://fullcalendar.io/docs/display/eventLimitClick/
        fixedWeekCount: false, // boolean. true = month sets there to always be 6 weeks displayed
        firstDay: 0, // int. The day that each week begins. 0 = Sunday
        weekends: true, // boolean. Whether to include Saturday/Sunday columns
        hiddenDays: [], // Array of numbers. Exclude certain days-of-the-week from being displayed
        weekNumbers: false, // boolean. Determines if week numbers should be displayed
        weekNumberCalculation: 'local', // 'local', 'ISO', or a Function. The method for calculating week numbers that are displayed
        businessHours: false, // boolean or object. Emphasizes certain time slots on the calendar. By default, Monday-Friday, 9am-5pm. See http://fullcalendar.io/docs/display/businessHours/
        RTL: false, // boolean. Displays the calendar in right-to-left mode
        height: null, // int, Function, 'parent', 'auto'. Will make the entire calendar (including header) a pixel height
        contentHeight: null, // int, Function, 'auto'. Will make the calendar's content area a pixel height
        aspectRatio: 1.35, // float. Determines the width-to-height aspect ratio of the calendar
        handleWindowResize: true, // boolean. Whether to automatically resize the calendar when the browser window resizes
        windowResizeDelay: 100 // int. Time, in milliseconds, the calendar will wait to adjust its size after a window resize event occurs
      }
    },

    initialRequest: true,
    startRange: moment(),
    endRange: moment(),
    /**
     * Methods to look into:
     * 'viewRender' for callbacks on new date range (pagination maybe)  - http:// fullcalendar.io/docs/display/viewRender/
     * 'dayRender' for modifying day cells - http://fullcalendar.io/docs/display/dayRender/
     * 'windowResize' for callbacks on window resizing - http://fullcalendar.io/docs/display/windowResize/
     * 'render' force calendar to redraw - http://fullcalendar.io/docs/display/render/
     */
    /**
     * @param entries
     * @returns {boolean}
     */
    onRender: function (entries) {
      var that = this
      that.setupCustomView()
      that.$el.fullCalendar({
        customButtons: that.options.customButtons,
        buttonIcons: that.options.buttonIcons,
        header: that.options.header,
        defaultView: that.options.defaultView,
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
        isRTL: that.options.RTL,
        height: that.options.height,
        contentHeight: that.options.contentHeight,
        aspectRatio: that.options.aspectRatio,
        handleWindowResize: that.options.handleWindowResize,
        windowResizeDelay: that.options.windowResizeDelay,
        events: function (start, end, timezone, callback) {
          // Alter the start/end to only fetch the range we don't have & Set the new parsed range
          if (that.startRange <= start) {
            start = null
          }

          if (that.endRange >= end) {
            end = null
          }

          //  Handle Scope
          if (start != null && end != null) { // Overall greater
            that.startRange = start
            that.endRange = end
          } else if (start == null && end != null) { // Extend right
            start = that.endRange
            that.endRange = end
          } else if (end == null && start != null) { // Extend left
            end = that.startRange
            that.startRange = start
          } // Else no scope change

          if (!that.initialRequest && start != null && end != null) { // Request on other than initial and if there is a scope change
            that.collection.once('success', function () {
              console.log('Calendar fetch data: ', start.format(), end.format())
              callback(that.parseEvents())
            })
            that.collection.meta.set('api.startRange', start.format('X'))
            that.collection.meta.set('api.endRange', end.format('X'))
            that.collection.refresh() // FIXME: Does this merge the new collection results with the current?
          } else {
            callback(that.parseEvents())
            that.initialRequest = false
          }
        }
      })
      return true
    },
    /**
     * Parse Asset Collection into JSON Array usable by fullcalendar
     * @param callback {Array}
     * @returns {Array}
     */
    parseEvents: function (callback) {
      var that = this
      var events = []
      _.each(that.collection.toJSON().payload, function (payload) {
        if (payload.version) {
          events.push({
            id: payload.id,
            title: payload.version.title,
            start: moment.unix(payload.version.timeCustom || payload.version.timePublish || payload.time).format(),
            end: ((!that.options.eventForceAllDay || !payload.version.meta.allDay) && payload.version.meta.timeEnd) ? moment.unix(payload.version.meta.timeEnd).format() : null,
            url: payload.routingPrimary.url,
            allDay: that.options.eventForceAllDay || payload.version.meta.allDay
          })
        } else {
          // no version would likely mean it is a media resource
          events.push({
            id: payload.id,
            title: payload.name,
            start: moment.unix(payload.time).format(),
            url: '//' + payload.url + (payload.extension ? '.' + payload.extension : null),
            allDay: that.options.eventForceAllDay
          })
        }
      })
      if (callback) callback(events)
      return events
    },
    setupCustomView: function () {
      // TODO Needs to be setup to allow views to be 'plugged in'
      // TODO need to render these from their own template file
      var FC = $.fullCalendar // a reference to FullCalendar's root namespace

      FC.ListView = FC.View.extend({
        /**
         * Determines is a 'time' falls within the current interval
         * @param time
         * @returns {!boolean}
         */
        isMomentInRange: function (time) {
          var intervalRange = moment.range(this.intervalStart, this.intervalEnd)
          return time.within(intervalRange)
        },
        /**
         * Determine if an event falls within the current interval
         * @param event
         * @returns boolean
         */
        isEventInRange: function (event) {
          if (event.end) {
            var intervalRange = moment.range(this.intervalStart, this.intervalEnd)
            var eventRange = moment.range(event.start, event.end)
            return eventRange.overlaps(intervalRange)
          } else {
            return this.isMomentInRange(event.start)
          }
        },
        /**
         * Duplicate the list of events and use the duplicate to format and print ordered list of events for only this date range
         * We need to duplicate so that we can have multiple-days event split into number of each day event for the displaying purpose
         * Event start Monday to Friday, we will have to display the same event everyday, hence adding that on Tuesday, Wednesday and Thursday
         *
         * For multiple-days event, We need to know each and every day this particular event should be displayed for
         * an event that start from 12 - 15 / we have to display this event also on 13 and 14 hence a new list of objects to hold these displaying dates
         * @param events
         * @returns {Array}
         */
        prepareEvents: function (events) {
          var preparedEvents = []
          var tStart
          var tEnd
          var event
          for (i in events) {
            if (events.hasOwnProperty(i)) {
              if (this.isEventInRange(events[i])) {
                tStart = events[i].start.clone()
                tEnd = events[i].end ? events[i].end.clone() : events[i].start.clone()
                while (tEnd >= tStart) {
                  if (this.isMomentInRange(tStart)) {
                    event = Object.create(events[i])
                    event.displayDay = tStart.clone()

                    preparedEvents.push(event)
                  }

                  tStart.add(1, 'day')
                }
              }
            }
          }

          // We would like to display these events in order, newest first
          preparedEvents.sort(function (a, b) {
            var dateA = new Date(a.displayDay)
            var dateB = new Date(b.displayDay)
            return dateA - dateB
          })

          return preparedEvents
        },
        /**
         * Re-renders the view
         * Called on each interval change and initialization
         * @param events
         * @param modifiedEventId
         */
        renderEvents: function (events, modifiedEventId) {
          console.log('Rending Events')

          var preparedEvents = this.prepareEvents(events)

          // Start displaying our sorted list
          var viewName = this.opt('viewName') || 'list'
          var $html = $('<ul class="fc-' + viewName + '"></ul>')

          var disLeft
          var disRight
          var lUrl
          var lTitle
          var allDay
          var startDate
          var endDate
          var classes
          var description
          var dayCompare
          var temp
          var count = 0

          for (i in preparedEvents) {
            if (preparedEvents.hasOwnProperty(i)) {
              disLeft = disRight = lUrl = lTitle = allDay = startDate = endDate = classes = description = null

              count++
              disLeft = moment(preparedEvents[i].displayDay).format(this.opt('leftHeaderFormat'))
              disRight = moment(preparedEvents[i].displayDay).format(this.opt('rightHeaderFormat'))
              dayCompare = moment(preparedEvents[i].displayDay).format('LL')
              lTitle = FC.htmlEscape(preparedEvents[i].title)
              allDay = preparedEvents[i].allDay
              startDate = FC.htmlEscape(moment(preparedEvents[i].start).format(this.opt('eventTimeFormat')))
              if (preparedEvents[i].end) {
                endDate = FC.htmlEscape(moment(preparedEvents[i].end).format(this.opt('eventTimeFormat')))
              }
              lUrl = preparedEvents[i].url
              classes = preparedEvents[i].className
              description = preparedEvents[i].description

              // if the events are from source, then pick the className from the source not from event object itself
              if (preparedEvents[i].source) {
                classes = classes.concat(preparedEvents[i].source.className)
              }
              if (dayCompare != temp) {
                $(
                  '<li class="fc-day-header">' +
                  '<span class="fc-header-left">' + disLeft + '</span>' +
                  '<span class="fc-header-right">' + disRight + '</span>' +
                  '</li>'
                ).appendTo($html)
                temp = dayCompare
              }
              if (allDay) {
                // if the event is all day , make sure you print that and not date and time
                // otherwise do the opposite
                $eventdisplay = $(
                  '<li class="fc-item">' +
                  '<' + (lUrl ? 'a href="' + FC.htmlEscape(lUrl) + '"' : 'div') +
                  ' class="fc-listEvent ' + classes + '">' +
                  '<div class="fc-time">' +
                  '<span class="fc-all-day">' + this.opt('allDayText') + '</span>' +
                  '</div>' +
                  '<div class="fc-details">' +
                  '<div class="fc-title">' + lTitle + '</div>' +
                  (description ? '<div class="fc-desc">' + FC.htmlEscape(description) + '</div>' : '') +
                  '</div>' +
                  '</' + (lUrl ? 'a' : 'div') + '>' +
                  '</li>'
                ).appendTo($html)
              } else {
                $eventdisplay = $(
                  '<li class="fc-item">' +
                  '<' + (lUrl ? 'a href="' + FC.htmlEscape(lUrl) + '"' : 'div') +
                  ' class="fc-listEvent ' + classes + '">' +
                  '<div class="fc-time">' +
                  '<span class="fc-start-time">' + startDate + '</span> ' +
                  '<span class="fc-end-time">' + (endDate || '') + '</span>' +
                  '</div>' +
                  '<div class="fc-details">' +
                  '<div class="fc-title">' + lTitle + '</div>' +
                  (description ? '<div class="fc-desc">' + FC.htmlEscape(description) + '</div>' : '') +
                  '</div>' +
                  '</' + (lUrl ? 'a' : 'div') + '>' +
                  '</li>'
                ).appendTo($html)
              }
            }
          }
          $(this.el).html($html)
          this.trigger('eventAfterAllRender')
        }
      })
      FC.views.listMonth = {
        duration: { months: 1 },
        defaults: {
          viewName: 'list', // Affects the class name
          eventTimeFormat: 'LT', // 8:30 PM
          leftHeaderFormat: 'dddd', // Monday
          rightHeaderFormat: 'MMMM Do', // August 2nd
          allDayText: 'All Day',
          buttonText: 'month'
        },
        class: FC.ListView
      }

      FC.views.listWeek = {
        duration: { weeks: 1 },
        defaults: {
          viewName: 'list', // Affects the class name
          eventTimeFormat: 'LT', // 8:30 PM
          leftHeaderFormat: 'dddd', // Monday
          rightHeaderFormat: 'MMMM Do', // August 2nd
          allDayText: 'All Day',
          buttonText: 'week'
        },
        class: FC.ListView
      }
    }
  })
}))
