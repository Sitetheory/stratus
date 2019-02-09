// Calendar Component
// --------------
// See https://fullcalendar.io/docs/v4/release-notes
// https://www.gracedover.com/Connect/General-Calendar
// https://gracedover.ccbchurch.com/w_calendar_sub.ics?campus_id=1

// credit to https://github.com/leonaard/icalendar2fullcalendar for ics conversion
// TODO lacks removal of certain dates?
/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'jquery',
      'moment',
      'angular',
      'fullcalendar',
      'stratus.components.calendar.timezones',
      'ical',
      'angular-material',
      'moment-range'
    ], factory)
  } else {
    factory(
      root.Stratus,
      root._,
      root.jQuery,
      root.moment,
      root.angular
    )
  }
}(this, function (Stratus, _, jQuery, moment, angular, fullcalendar, timezones) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''

  // This component is a simple calendar at this time.
  Stratus.Components.Calendar = {
    transclude: true,
    bindings: {
      ngModel: '=',
      elementId: '@',
      eventSources: '@',
    },
    controller: function ($scope, $attrs, $log, Collection) {
      this.uid = _.uniqueId('calendar_')
      Stratus.Instances[this.uid] = $scope
      $scope.elementId = $attrs.elementId || this.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'bower_components/fullcalendar/dist/fullcalendar' + min + '.css'
      )
      $scope.options = $attrs.options && _.isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
      $scope.options.customButtons = $scope.options.customButtons || null // See http://fullcalendar.io/docs/display/customButtons/
      $scope.options.buttonIcons = $scope.options.buttonIcons || { // object. Determines which icons are displayed in buttons of the header. See http://fullcalendar.io/docs/display/buttonIcons/
        prev: 'left-single-arrow',
        next: 'right-single-arrow',
        prevYear: 'left-double-arrow',
        nextYear: 'right-double-arrow'
      }
      $scope.options.header = $scope.options.header || { // object. Defines the buttons and title at the top of the calendar. See http://fullcalendar.io/docs/display/header/
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      }
      $scope.options.defaultView = $scope.options.defaultView || 'month'
      $scope.options.defaultDate = $scope.options.defaultDate || null
      $scope.options.nowIndicator = $scope.options.nowIndicator || false
      $scope.options.timezone = $scope.options.timezone || false
      $scope.options.eventForceAllDay = $scope.options.eventForceAllDay || false
      $scope.options.eventLimit = $scope.options.eventLimit || 7
      $scope.options.eventLimitClick = $scope.options.eventLimitClick || 'popover'
      $scope.options.fixedWeekCount = $scope.options.fixedWeekCount || false
      $scope.options.firstDay = $scope.options.firstDay || 0
      $scope.options.weekends = $scope.options.weekends || true
      $scope.options.hiddenDays = $scope.options.hiddenDays || []
      $scope.options.weekNumbers = $scope.options.weekNumbers || false
      $scope.options.weekNumberCalculation = $scope.options.weekNumberCalculation || 'local'
      $scope.options.businessHours = $scope.options.businessHours || false
      $scope.options.RTL = $scope.options.RTL || false
      $scope.options.height = $scope.options.height || null
      $scope.options.contentHeight = $scope.options.contentHeight || null
      $scope.options.aspectRatio = $scope.options.aspectRatio || 1.35
      $scope.options.handleWindowResize = $scope.options.handleWindowResize || true
      $scope.options.windowResizeDelay = $scope.options.windowResizeDelay || 100

      $scope.eventSources = $attrs.eventSources && _.isJSON($attrs.eventSources) ? JSON.parse($attrs.eventSources) : [
        //'https://gracedover.ccbchurch.com/w_calendar_sub.ics?campus_id=1'
      ];

      console.log('$scope.eventSources', $scope.eventSources);

      $scope.initialized = false
      $scope.fetched = false
      $scope.startRange = moment()
      $scope.endRange = moment()

      //Load all timezones for use
      registerTimezones(timezones)

      $log.log('calendar:', this)
      $log.log('fullcalendar:', fullcalendar)

      // Event Collection
      $scope.collection = null
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Collection) {
          $scope.collection = data
        }
      })

      //Ensure the Collection is ready first
      let collectionWatcher = $scope.$watch('collection.completed', async function (completed) {
        if (completed) {
          collectionWatcher() //Destroy this watcher
          $log.log('collection:', $scope.collection)
          //TODO initialize everything here
          render()
          //TODO process a list of URLS, just using single xample below
          //let events = await $scope.addEventICSSource('https://gracedover.ccbchurch.com/w_calendar_sub.ics?campus_id=1');

          // Process each feed before continuing
          await Promise.all($scope.eventSources.map(url => $scope.addEventICSSource(url)))
          //test3()
          //console.log('completed loading events', events);
          console.log('events all loaded!');
          $scope.initialized = true
        }
      }, true)


      $scope.addEventICSSource = async function (url) {
        return new Promise(function (resolve, reject) {
          jQuery.get(`https://cors-anywhere.herokuapp.com/${url}`, function (urlResponse) {
            console.log('fetched the events from', url)

            const iCalExpander = new ICalExpander(urlResponse, {maxIterations: 0})
            const events = iCalExpander.jsonEventsFC(new Date('2018-01-24T00:00:00.000Z'), new Date('2020-01-26T00:00:00.000Z'))
            jQuery('#calendar').fullCalendar('addEventSource', {
              events: events,
              //color: 'black',     // an option!
              //textColor: 'yellow' // an option!
            })
            resolve(events);
          });
        })
      }

      /*let initializedWatcher = $scope.$watch('initialized', function (initialized) {
        if(initialized) {
          initializedWatcher() //Destroy this watcher
          $log.log('Calendar Fetched/Initialized')
        }
      }, true)*/

      /**
       *
       * Methods to look into:
       * 'viewRender' for callbacks on new date range (pagination maybe)  - http:// fullcalendar.io/docs/display/viewRender/
       * 'dayRender' for modifying day cells - http://fullcalendar.io/docs/display/dayRender/
       * 'windowResize' for callbacks on window resizing - http://fullcalendar.io/docs/display/windowResize/
       * 'render' force calendar to redraw - http://fullcalendar.io/docs/display/render/
       */
      /**
       * @TODO old code
       * @param entries
       * @returns {boolean}
       */
      function render(entries) {
        //var that = this
        setupCustomView()
        //that.$el.fullCalendar({
        jQuery('#calendar').fullCalendar({
          customButtons: $scope.options.customButtons,
          buttonIcons: $scope.options.buttonIcons,
          header: $scope.options.header,
          defaultView: $scope.options.defaultView,
          defaultDate: $scope.options.defaultDate,
          nowIndicator: $scope.options.nowIndicator,
          timezone: $scope.options.timezone,
          eventLimit: $scope.options.eventLimit,
          eventLimitClick: $scope.options.eventLimitClick,
          fixedWeekCount: $scope.options.fixedWeekCount,
          firstDay: $scope.options.firstDay,
          weekends: $scope.options.weekends,
          hiddenDays: $scope.options.hiddenDays,
          weekNumbers: $scope.options.weekNumbers,
          weekNumberCalculation: $scope.options.weekNumberCalculation,
          businessHours: $scope.options.businessHours,
          isRTL: $scope.options.RTL,
          height: $scope.options.height,
          contentHeight: $scope.options.contentHeight,
          aspectRatio: $scope.options.aspectRatio,
          handleWindowResize: $scope.options.handleWindowResize,
          windowResizeDelay: $scope.options.windowResizeDelay,
          //events: function (start, end, timezone, callback) {
          // Alter the start/end to only fetch the range we don't have & Set the new parsed range
          /*if ($scope.startRange <= start) {
            start = null
          }

          if ($scope.endRange >= end) {
            end = null
          }

          //  Handle Scope
          if (start != null && end != null) {// Overall greater
            $scope.startRange = start
            $scope.endRange = end
          } else if (start == null && end != null) {// Extend right
            start = $scope.endRange
            $scope.endRange = end
          } else if (end == null && start != null) {// Extend left
            end = $scope.startRange
            $scope.startRange = start
          } // Else no scope change

          if (!$scope.initialRequest && start != null && end != null) { // Request on other than initial and if there is a scope change
            $scope.collection.once('success', function () {
              console.log('Calendar fetch data: ', start.format(), end.format())
              callback($scope.parseEvents())
            })
            $scope.collection.meta.set('api.startRange', start.format('X'))
            $scope.collection.meta.set('api.endRange', end.format('X'))
            $scope.collection.refresh() // FIXME: Does this merge the new collection results with the current?
          } else {
            callback($scope.parseEvents())
            $scope.initialRequest = false
          }*/
          //}
        })
        //jQuery('#calendar').fullCalendar('removeEventSources') // for some reason needed to reinit
        return true
      }

      /**
       * @todo This is old unused code
       * Parse Asset Collection into JSON Array usable by fullcalendar
       * @param callback {Array}
       * @returns {Array}
       */

      /*function parseEvents(callback) {
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
      }*/

      function setupCustomView() {
        // TODO this is old unused code
        // TODO Needs to be setup to allow views to be 'plugged in'
        // TODO need to render these from their own template file
        var FC = jQuery.fullCalendar // a reference to FullCalendar's root namespace

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
            var $html = jQuery('<ul class="fc-' + viewName + '"></ul>')

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
                if (dayCompare !== temp) {
                  jQuery(
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
                  $eventdisplay = jQuery(
                    '<li class="fc-item">' +
                    '<' + (lUrl ? 'a href="' + FC.htmlEscape(lUrl) + '"' : 'div') +
                    ' class="fc-listEvent ' + classes + '">' +
                    '<div class="fc-time">' +
                    '<span class="fc-start-time">' + startDate + '</span> ' +
                    '<span class="fc-end-time">' + (endDate ? endDate : '') + '</span>' +
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
            jQuery(this.el).html($html)
            this.trigger('eventAfterAllRender')
          }


        })
        FC.views.listMonth = {
          duration: {months: 1},
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
          duration: {weeks: 1},
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

      /**
       * @todo Move to a service?
       * @author Mikael Finstad https://github.com/mifi/ical-expander
       * @licence MIT https://github.com/mifi/ical-expander/blob/master/LICENSE
       * @param {String} [icsData]
       * @param {Object=} [opts]
       * @param {number=} [opts.maxIterations=1000]
       * @param {boolean=} [opts.skipInvalidDates=false]
       * @constructor
       * @property {number} maxIterations
       * @property {boolean} skipInvalidDates
       * @property {Object} jCalData
       * @property {Object} component
       * @property {[Object]} events
       */
      const ICalExpander = function (icsData, opts) {
        opts = opts || {}
        this.maxIterations = opts.maxIterations != null ? opts.maxIterations : 1000
        this.skipInvalidDates = opts.skipInvalidDates != null ? opts.skipInvalidDates : false

        this.jCalData = ICAL.parse(icsData)
        this.component = new ICAL.Component(this.jCalData)
        this.events = this.component.getAllSubcomponents('vevent').map(vevent => new ICAL.Event(vevent))

        if (this.skipInvalidDates) {
          this.events = this.events.filter((evt) => {
            try {
              evt.startDate.toJSDate()
              evt.endDate.toJSDate()
              return true
            } catch (err) {
              // skipping events with invalid time
              return false
            }
          })
        }
      }

      ICalExpander.prototype.between = function (after, before) {
        function isEventWithinRange(startTime, endTime) {
          return (!after || endTime >= after.getTime()) &&
            (!before || startTime <= before.getTime())
        }

        function getTimes(eventOrOccurrence) {
          const startTime = eventOrOccurrence.startDate.toJSDate().getTime()
          let endTime = eventOrOccurrence.endDate.toJSDate().getTime()

          // If it is an all day event, the end date is set to 00:00 of the next day
          // So we need to make it be 23:59:59 to compare correctly with the given range
          if (eventOrOccurrence.endDate.isDate && (endTime > startTime)) {
            endTime -= 1
          }

          return {startTime, endTime}
        }

        const exceptions = []

        this.events.forEach((event) => {
          if (event.isRecurrenceException()) exceptions.push(event)
        })

        const ret = {
          events: [],
          occurrences: [],
        }

        this.events.filter(e => !e.isRecurrenceException()).forEach((event) => {
          const exdates = []

          event.component.getAllProperties('exdate').forEach((exdateProp) => {
            const exdate = exdateProp.getFirstValue()
            exdates.push(exdate.toJSDate().getTime())
          })

          // Recurring event is handled differently
          if (event.isRecurring()) {
            const iterator = event.iterator()

            let next
            let i = 0

            do {
              i += 1
              next = iterator.next()
              if (next) {
                const occurrence = event.getOccurrenceDetails(next)

                const {startTime, endTime} = getTimes(occurrence)

                const isOccurrenceExcluded = exdates.indexOf(startTime) !== -1

                // TODO check that within same day?
                const exception = exceptions.find(ex => ex.uid === event.uid && ex.recurrenceId.toJSDate().getTime() === occurrence.startDate.toJSDate().getTime())

                // We have passed the max date, stop
                if (before && startTime > before.getTime()) break

                // Check that we are within our range
                if (isEventWithinRange(startTime, endTime)) {
                  if (exception) {
                    ret.events.push(exception)
                  } else if (!isOccurrenceExcluded) {
                    ret.occurrences.push(occurrence)
                  }
                }
              }
            }
            while (next && (!this.maxIterations || i < this.maxIterations))

            return
          }

          // Non-recurring event:
          const {startTime, endTime} = getTimes(event)

          if (isEventWithinRange(startTime, endTime)) ret.events.push(event)
        })

        return ret
      }

      ICalExpander.prototype.before = function (before) {
        return this.between(undefined, before)
      }

      ICalExpander.prototype.after = function (after) {
        return this.between(after)
      }

      ICalExpander.prototype.all = function () {
        return this.between()
      }

      /**
       * Processes a Recurring Event into generic Object format.
       * @param {Object} e - Event data
       * @returns {{summary: String, sequence: Number, uid: String, endDate: Date, attendees: ICAL.Property[], organizer: String, description: String, location: String, startDate: Date, recurrenceId: Date}}
       */
      ICalExpander.prototype.flattenRecurringEvent = function (e) {
        let event = this.flattenEvent(e.item)
        event.recurrenceId = e.recurrenceId.toJSDate()
        event.startDate = e.startDate.toJSDate()
        event.endDate = e.endDate.toJSDate()
        return event
      }

      /**
       * Processes an Event into generic Object format.
       * Events that were reoccurring need to use flattenRecurringEvent to process extra data
       * @param {Object} e - Event data
       * @returns {{summary: String, sequence: Number, uid: String, endDate: Date, attendees: ICAL.Property[], organizer: String, description: String, location: String, startDate: Date}}
       */
      ICalExpander.prototype.flattenEvent = function (e) {
        return {
          startDate: e.startDate.toJSDate(),
          endDate: e.endDate.toJSDate(),
          description: e.description,
          summary: e.summary,
          attendees: e.attendees,
          organizer: e.organizer,
          sequence: e.sequence,
          uid: e.uid,
          location: e.location,
        }
      }

      /**
       * Return an array of generic Events in a date range. Provide more details than jsonEventsFC.
       * If Dates are not specified, processes all possible dates
       * @param {Date=} startRange
       * @param {Date=} endRange
       * @returns {[Object]}
       */
      ICalExpander.prototype.jsonEvents = function (startRange, endRange) {
        let events;
        if (startRange && endRange) {
          events = this.between(startRange, endRange)
        } else {
          events = this.all()
        }
        const mappedEvents = events.events.map(o => this.flattenEvent(o))
        const mappedOccurrences = events.occurrences.map(o => this.flattenRecurringEvent(o))
        return [].concat(mappedEvents, mappedOccurrences)
      }

      /**
       * Processes a Recurring Event into Full Calendar usable format.
       * @param {Object} e - Event data
       * @returns {{start: Date, end: Date, location: String, id: String, title: String}}
       */
      ICalExpander.prototype.flattenRecurringEventFC = function (e) {
        let event = this.flattenEventFC(e.item)
        event.start = e.startDate.toJSDate()
        event.end = e.endDate.toJSDate()
        return event
      }

      /**
       * Processes an Event into Full Calendar usable format.
       * Events that were reoccurring need to use flattenRecurringEventFC to process extra data
       * @param {Object} e - Event data
       * @returns {{start: Date, end: Date, location: String, id: String, title: String}}
       */
      ICalExpander.prototype.flattenEventFC = function (e) {
        return {
          start: e.startDate.toJSDate(),
          end: e.endDate.toJSDate(),
          title: e.summary,
          id: e.uid,
          location: e.location,
        }
      }

      /**
       * Return Full Calendar usable array of Events for display in a date range.
       * If Dates are not specified, processes all possible dates
       * @param {Date=} startRange
       * @param {Date=} endRange
       * @returns {[Object]}
       */
      ICalExpander.prototype.jsonEventsFC = function (startRange, endRange) {
        //TODO fields to add
        //className, url, allDay
        //TODO allDat true is no endDate?
        let events;
        if (startRange && endRange) {
          events = this.between(startRange, endRange)
        } else {
          events = this.all()
        }
        const mappedEvents = events.events.map(o => this.flattenEventFC(o))
        const mappedOccurrences = events.occurrences.map(o => this.flattenRecurringEventFC(o))
        return [].concat(mappedEvents, mappedOccurrences)
      }


      /**
       * To process timezones and recurrence properly, Dates need to be converted by registering all timezones. This is a quick manual setup
       * @param {Object<String, String>} tzData - Render Timezone data from calendar.timezones.js
       */
      function registerTimezones(tzData) {
        Object.keys(tzData).forEach((key) => {
          const icsData = timezones[key]
          const parsed = ICAL.parse(`BEGIN:VCALENDAR\nPRODID:-//tzurl.org//NONSGML Olson 2012h//EN\nVERSION:2.0\n${icsData}\nEND:VCALENDAR`)
          const comp = new ICAL.Component(parsed)
          const vtimezone = comp.getFirstSubcomponent('vtimezone')

          ICAL.TimezoneService.register(vtimezone)
        })
      }


    },
    template: '<div id="{{ elementId }}">' +
      'Calendar Stub' +
      '<div id="calendar"></div>' +
      '</div>'
  }
}))
