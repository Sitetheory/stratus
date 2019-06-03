// iCAL Parsing Service
// ----------------------

/* global define, ICAL */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'ical' // Global ICAL variable.... not able to be sandboxed yet
    ], factory)
  } else {
    factory(root.Stratus)
  }
}(this, function (Stratus, _, angular) {
  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  Stratus.Services.iCal = [
    '$provide', function ($provide) {
      $provide.factory('iCal', [
        function () {
          /** Create a new instance of a iCal object parser
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
           * @returns {EventObject}
           */
          ICalExpander.prototype.flattenRecurringEvent = function (e) {
            let event = this.flattenEvent(e.item)
            event.recurrenceId = e.recurrenceId.toJSDate()
            event.startDate = e.startDate.toJSDate()
            event.endDate = e.endDate.toJSDate()
            return event
          }

          /**
           * @typedef {Object} EventObject
           * @property {Date} startDate
           * @property {Date} endDate
           * @property {string} description
           * @property {string} title
           * @property {string} summary
           * @property {[]} attendees
           * @property {string} organizer
           * @property {number || string} sequence
           * @property {Date} recurrenceId
           * @property {string} uid
           * @property {string} location
           * @property {string} location
           * @property {string} url
           * @property {boolean} allDay
           * @property {string} image
           */

          /**
           * Processes an Event into generic Object format.
           * Events that were reoccurring need to use flattenRecurringEvent to process extra data
           * @param {Object} e - Event data
           * @returns {EventObject}
           */
          ICalExpander.prototype.flattenEvent = function (e) {
            return {
              startDate: e.startDate.toJSDate(),
              endDate: e.endDate.toJSDate(),
              description: e.description,
              title: e.summary,
              summary: e.summary,
              attendees: e.attendees,
              organizer: e.organizer,
              sequence: e.sequence,
              uid: e.uid,
              location: e.location,
              url: e.url,
              allDay: e.allDay,
              image: e.image // Custom item
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
           * @returns {EventObject}
           */
          ICalExpander.prototype.flattenRecurringEventForFullCalendar = function (e) {
            let event = this.flattenEventForFullCalendar(e.item)
            event.start = e.startDate.toJSDate()
            event.end = e.endDate.toJSDate()
            return event
          }

          /**
           * Processes an Event into Full Calendar usable format.
           * Events that were reoccurring need to use flattenRecurringEventForFullCalendar to process extra data
           * @param {Object} e - Event data
           * @returns {EventObject}
           */
          ICalExpander.prototype.flattenEventForFullCalendar = function (e) {
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
              allDay: e.allDay,
              image: e.image // Custom item
            }
          }

          /**
           * Return Full Calendar usable array of Events for display in a date range.
           * If Dates are not specified, processes all possible dates
           * @param {Date=} startRange
           * @param {Date=} endRange
           * @returns {EventObject[]}
           */
          ICalExpander.prototype.jsonEventsForFullCalendar = function (startRange, endRange) {
            // TODO fields to add
            // className, url, allDay
            // TODO allDay true if no endDate?
            let events
            if (startRange && endRange) {
              events = this.between(startRange, endRange)
            } else {
              events = this.all()
            }
            const mappedEvents = events.events.map(o => this.flattenEventForFullCalendar(o))
            const mappedOccurrences = events.occurrences.map(o => this.flattenRecurringEventForFullCalendar(o))
            return [].concat(mappedEvents, mappedOccurrences)
          }

          /**
           * To process timezones and recurrence properly, Dates need to be converted by registering all timezones. This is a quick manual setup
           * Data supplied by stratus.components.calendar.timezones has this information already prepared.
           * @param {Object<String, String>} tzData - Render Timezone data from calendar.timezones.js
           */
          function registerTimezones (tzData) {
            Object.keys(tzData).forEach((key) => {
              const icsData = tzData[key]
              const parsed = ICAL.parse(`BEGIN:VCALENDAR\nPRODID:-//tzurl.org//NONSGML Olson 2012h//EN\nVERSION:2.0\n${icsData}\nEND:VCALENDAR`)
              const comp = new ICAL.Component(parsed)
              const vTimezone = comp.getFirstSubcomponent('vtimezone')

              ICAL.TimezoneService.register(vTimezone)
            })
          }

          return {
            ICalExpander: ICalExpander,
            registerTimezones: registerTimezones
          }
        }])
    }]
}))
