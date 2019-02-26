// Calendar Component
// --------------
// See https://fullcalendar.io/docs/v4/release-notes
// https://www.gracedover.com/Connect/General-Calendar
// https://gracedover.ccbchurch.com/w_calendar_sub.ics?campus_id=1

// credit to https://github.com/leonaard/icalendar2fullcalendar for ics conversion
/* global define, ICAL */

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
      'ical', // Global ICAL variable.... not able to be sandboxed yet
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
  const name = 'calendar'

  // This component is a simple calendar at this time.
  Stratus.Components.Calendar = {
    transclude: true,
    bindings: {
      ngModel: '=',
      elementId: '@',
      options: '@'
    },
    controller: function ($scope, $attrs, $element, $log, $sce, $mdPanel, $mdDialog, Collection) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      $scope.calendarId = $scope.elementId + '_fullcalendar'
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'bower_components/fullcalendar/dist/fullcalendar' + min + '.css'
      )
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
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
      $scope.options.possibleViews = $scope.options.possibleViews || ['month', 'weekAgenda', 'dayAgenda'] // Not used yet @see https://fullcalendar.io/docs/header
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
      $scope.options.eventSources = $scope.options.eventSources || []

      $scope.initialized = false
      $scope.fetched = false
      $scope.startRange = moment()
      $scope.endRange = moment()

      // Event Collection
      $scope.collection = null

      $ctrl.$onInit = function () {
        // Load all timezones for use
        $ctrl.registerTimezones(timezones)

        $scope.$watch('$ctrl.ngModel', function (data) {
          if (data instanceof Collection) {
            $scope.collection = data
          }
        })

        // Ensure the Collection is ready first
        let collectionWatcher = $scope.$watch('collection.completed', async function (completed) {
          if (completed) {
            collectionWatcher() // Destroy this watcher
            $log.log('collection:', $scope.collection)
            // initialize everything here
            $ctrl.render()
            // process a list of URLS, just using single example below
            // Process each feed before continuing
            $log.log('loading external urls', $scope.options.eventSources)
            await Promise.all($scope.options.eventSources.map(url => $scope.addEventICSSource(url)))
            // $log.log('completed loading events', events);
            $log.log('events all loaded!')
            $scope.initialized = true
          }
        }, true)
      }

      $scope.addEventICSSource = async function (url) {
        return new Promise(function (resolve) {
          // TODO handle bad fetch softly
          jQuery.get(`https://cors-anywhere.herokuapp.com/${url}`, function (urlResponse) {
            $log.log('fetched the events from', url)

            const iCalExpander = new ICalExpander(urlResponse, { maxIterations: 0 })
            const events = iCalExpander.jsonEventsFC(new Date('2018-01-24T00:00:00.000Z'), new Date('2020-01-26T00:00:00.000Z'))
            jQuery('#' + $scope.calendarId).fullCalendar('addEventSource', {
              events: events
              // color: 'black',     // an option!
              // textColor: 'yellow' // an option!
            })
            resolve(events)
          })
        })
      }

      /**
       * Handles what actions to perform when an event is clicked
       * @param {Object} calEvent
       * @param {Object} jsEvent
       * @param {Object}view
       * @returns {Promise<boolean>}
       */
      $scope.handleEventClick = async function (calEvent, jsEvent, view) {
        // TODO in fullcalendarV4 calEvent, jsEvent, and view are combined into a single object
        /* $log.log('Event', calEvent)
        $log.log('Coordinates', jsEvent)
        $log.log('View', view.name) */

        // Simply open  popup for now
        $scope.displayEventDialog(calEvent, jsEvent)
        // Return false to not issue other functions (such as URL clicking)
        return false
      }

      $scope.displayEventDialog = async function (calEvent, clickEvent) {
        let panelPosition = $mdPanel.newPanelPosition()
          .relativeTo($element) // .relativeTo($element)
          .addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.CENTER)

        let panelAnimation = $mdPanel.newPanelAnimation()
          .openFrom(clickEvent.currentTarget)
          .closeTo(clickEvent.currentTarget)
          .duration(135)
          .withAnimation($mdPanel.animation.SCALE)

        /* $mdPanel.open({
          attachTo: angular.element(document.body),
          // parent: angular.element(document.body),
          templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/calendar.eventDialog' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',
          panelClass: 'dialogueContainer',
          position: panelPosition,
          animation: panelAnimation,
          // openFrom: clickEvent.currentTarget,
          clickOutsideToClose: true,
          escapeToClose: false,
          focusOnOpen: false,
          locals: {
            eventData: calEvent
          },
          controller: function ($scope, mdPanelRef) {
            let dc = this

            dc.$onInit = function () {
              if (
                dc.eventData &&
                dc.eventData.hasOwnProperty('description')
              ) {
                dc.eventData.descriptionHTML = $sce.trustAsHtml(dc.eventData.description)
              }

              dc.close = close
            }

            function close () {
              if (mdPanelRef) {
                mdPanelRef.close()
              }
            }
          },
          controllerAs: 'ctrl'
        }) */

        $mdDialog.show({
          templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/calendar.eventDialog' + (Stratus.Environment.get('production') ? '.min' : '') + '.html',
          parent: angular.element(document.body),
          targetEvent: clickEvent,
          clickOutsideToClose: true,
          escapeToClose: false,
          fullscreen: true, // Only for -xs, -sm breakpoints.
          locals: {
            eventData: calEvent
          },
          bindToController: true,
          controllerAs: 'ctrl',
          controller: function ($scope, $mdDialog) {
            let dc = this

            dc.$onInit = function () {
              if (
                dc.eventData &&
                dc.eventData.hasOwnProperty('description')
              ) {
                dc.eventData.descriptionHTML = $sce.trustAsHtml(dc.eventData.description)
              }

              dc.close = close
            }

            function close () {
              if ($mdDialog) {
                $mdDialog.hide()
              }
            }
          }
        })
      }

      /**
       *
       * Methods to look into:
       * 'viewRender' for callbacks on new date range (pagination maybe)  - http:// fullcalendar.io/docs/display/viewRender/
       * 'dayRender' for modifying day cells - http://fullcalendar.io/docs/display/dayRender/
       * 'windowResize' for callbacks on window resizing - http://fullcalendar.io/docs/display/windowResize/
       * 'render' force calendar to redraw - http://fullcalendar.io/docs/display/render/
       */
      $ctrl.render = function () {
        jQuery('#' + $scope.calendarId).fullCalendar({
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
          eventClick: $scope.handleEventClick // Handles what happens when an event is clicked
        })
      }

      /**
       * @TODO Move to a service?
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

      /**
       * Returns events between a date range
       * @param {Date=} after
       * @param {Date=} before
       * @returns {{occurrences: [Object], events: [Object]}}
       */
      ICalExpander.prototype.between = function (after, before) {
        /**
         * @param {Number | Date=} startTime
         * @param {Number | Date=} endTime
         * @returns {boolean}
         */
        const isEventWithinRange = function (startTime, endTime) {
          return (!after || endTime >= after.getTime()) &&
            (!before || startTime <= before.getTime())
        }

        /**
         * @param {Object} eventOrOccurrence
         * @returns {{startTime: number, endTime: number}}
         */
        const getTimes = function (eventOrOccurrence) {
          const startTime = eventOrOccurrence.startDate.toJSDate().getTime()
          let endTime = eventOrOccurrence.endDate.toJSDate().getTime()

          // If it is an all day event, the end date is set to 00:00 of the next day
          // So we need to make it be 23:59:59 to compare correctly with the given range
          if (eventOrOccurrence.endDate.isDate && (endTime > startTime)) {
            endTime -= 1
          }

          return { startTime, endTime }
        }

        const exceptions = []

        this.events.forEach((event) => {
          if (event.isRecurrenceException()) exceptions.push(event)
        })

        const ret = {
          events: [],
          occurrences: []
        }

        this.events.filter(e => !e.isRecurrenceException()).forEach((event) => {
          const exDates = []
          event.component.getAllProperties('exdate').forEach((exDateProp) => {
            const exDate = exDateProp.getFirstValue()
            exDates.push(exDate.toJSDate().getTime())
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
                const { startTime, endTime } = getTimes(occurrence)
                const isOccurrenceExcluded = exDates.indexOf(startTime) !== -1
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
          const { startTime, endTime } = getTimes(event)

          if (isEventWithinRange(startTime, endTime)) ret.events.push(event)
        })

        return ret
      }

      /**
       * Returns events from before a date
       * @param {Date} before
       * @returns {{occurrences: Object[], events: Object[]}}
       */
      ICalExpander.prototype.before = function (before) {
        return this.between(undefined, before)
      }

      /**
       * Returns events after a date
       * @param {Date} after
       * @returns {{occurrences: Object[], events: Object[]}}
       */
      ICalExpander.prototype.after = function (after) {
        return this.between(after)
      }

      /**
       * Returns events all events
       * @returns {{occurrences: Object[], events: Object[]}}
       */
      ICalExpander.prototype.all = function () {
        return this.between()
      }

      /**
       * Processes a Recurring Event into generic Object format.
       * @param {Object} e - Event data
       * @returns {{summary: String, sequence: Number | String, uid: String, endDate: Date, attendees: ICAL.Property[], organizer: String, description: String, location: String, startDate: Date, recurrenceId: Date}}
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
       * @returns {{summary: String, sequence: Number | String, uid: String, endDate: Date, attendees: ICAL.Property[], organizer: String, description: String, location: String, startDate: Date, recurrenceId: Date}}
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
          url: e.url,
          allDay: e.allDay
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
        let events
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
          summary: e.summary,
          description: e.description,
          attendees: e.attendees,
          organizer: e.organizer,
          id: e.uid,
          location: e.location,
          url: e.url,
          allDay: e.allDay
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
        // TODO fields to add
        // className, url, allDay
        // TODO allDay true if no endDate?
        let events
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
      $ctrl.registerTimezones = function (tzData) {
        Object.keys(tzData).forEach((key) => {
          const icsData = timezones[key]
          const parsed = ICAL.parse(`BEGIN:VCALENDAR\nPRODID:-//tzurl.org//NONSGML Olson 2012h//EN\nVERSION:2.0\n${icsData}\nEND:VCALENDAR`)
          const comp = new ICAL.Component(parsed)
          const vTimezone = comp.getFirstSubcomponent('vtimezone')

          ICAL.TimezoneService.register(vTimezone)
        })
      }
    },
    template: '<div id="{{ elementId }}">' +
      '<div id="{{ calendarId }}"></div>' +
      '</div>'
  }
}))
