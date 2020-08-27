// iCAL Parsing Service
// ----------------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'

// Libraries
import _ from 'lodash'
import angular from 'angular'
// tslint:disable-next-line:no-duplicate-imports
import 'angular'
import 'ical.js' // Global ICAL variable.... not able to be sandboxed yet

// Globals
declare var ICAL: any

// original author: Mikael Finstad https://github.com/mifi/ical-expander
// licence: MIT https://github.com/mifi/ical-expander/blob/master/LICENSE
export class ICalExpander {
    maxIterations = 1000
    skipInvalidDates = false
    jCalData: any
    component: any
    events: any

    [key: string]: any

    constructor(icsData: any, opts?: { [key: string]: any }) {
        // Hydrate Options
        opts = opts || {}
        _.forEach(opts, (key: string, value: any) => {
            if (value === null) {
                return
            }
            this[key] = value
        })

        this.jCalData = ICAL.parse(icsData)
        this.component = new ICAL.Component(this.jCalData)
        this.events = this.component.getAllSubcomponents('vevent').map(
            (vevent: any) => new ICAL.Event(vevent)
        )

        if (this.skipInvalidDates) {
            this.events = this.events.filter((evt: any) => {
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

    isEventWithinRange(after: any, before: any, startTime: any, endTime: any) {
        return (!after || endTime >= after.getTime()) && (!before || startTime <= before.getTime())
    }

    getTimes(eventOrOccurrence: any) {
        const startTime = eventOrOccurrence.startDate.toJSDate().getTime()
        let endTime = eventOrOccurrence.endDate.toJSDate().getTime()

        // If it is an all day event, the end date is set to 00:00 of the next day
        // So we need to make it be 23:59:59 to compare correctly with the given range
        if (eventOrOccurrence.endDate.isDate && (endTime > startTime)) {
            endTime -= 1
        }

        return {
            startTime,
            endTime
        }
    }

    // Returns events between a date range
    between(after?: any, before?: any) {
        const exceptions: any = []

        this.events.forEach((event: any) => {
            if (event.isRecurrenceException()) {
                exceptions.push(event)
            }
        })

        const ret: any = {
            events: [],
            occurrences: []
        }

        this.events
            .filter((e: any) => !e.isRecurrenceException())
            .forEach((event: any) => {
                const exDates: any = []
                event.component.getAllProperties('exdate').forEach((exDateProp: any) => {
                    const exDate: any = exDateProp.getFirstValue()
                    exDates.push(exDate.toJSDate().getTime())
                })

                // Recurring event is handled differently
                if (event.isRecurring()) {
                    const iterator: any = event.iterator()

                    let next
                    let i: any = 0

                    do {
                        i += 1
                        next = iterator.next()
                        if (!next) {
                            continue
                        }
                        const occurrence: any = event.getOccurrenceDetails(next)
                        const {
                            startTime,
                            endTime
                        } = this.getTimes(occurrence)
                        const isOccurrenceExcluded: any = exDates.indexOf(startTime) !== -1
                        // TODO check that within same day?
                        const exception: any = exceptions.find(
                            (ex: any) => ex.uid === event.uid &&
                                ex.recurrenceId.toJSDate().getTime() === occurrence.startDate.toJSDate().getTime()
                        )

                        // We have passed the max date, stop
                        if (before && startTime > before.getTime()) {
                            break
                        }
                        // Check that we are within our range
                        if (this.isEventWithinRange(after, before, startTime, endTime)) {
                            if (exception) {
                                ret.events.push(exception)
                            } else if (!isOccurrenceExcluded) {
                                ret.occurrences.push(occurrence)
                            }
                        }
                    }
                    while (next && (!this.maxIterations || i < this.maxIterations))

                    return
                }

                // Non-recurring event:
                const nonRecurring = this.getTimes(event)

                if (this.isEventWithinRange(after, before, nonRecurring.startTime, nonRecurring.endTime)) {
                    ret.events.push(event)
                }
            })

        return ret
    }

    // Returns events from before a date
    before(before: any) {
        return this.between(undefined, before)
    }

    // Returns events after a date
    after(after: any) {
        return this.between(after)
    }

    // Returns events all events
    all() {
        return this.between()
    }

    // Processes a Recurring Event into generic Object format.
    flattenRecurringEvent(e: any) {
        const event: any = this.flattenEvent(e.item)
        event.recurrenceId = e.recurrenceId.toJSDate()
        event.startDate = e.startDate.toJSDate()
        event.endDate = e.endDate.toJSDate()
        return event
    }

    // Processes an Event into generic Object format.
    // Events that were reoccurring need to use flattenRecurringEvent to process extra data
    flattenEvent(e: any) {
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

    // Return an array of generic Events in a date range. Provide more details than jsonEventsFC.
    // If Dates are not specified, processes all possible dates
    jsonEvents(startRange: any, endRange: any) {
        let events
        if (startRange && endRange) {
            events = this.between(startRange, endRange)
        } else {
            events = this.all()
        }
        const mappedEvents: any = events.events.map((o: any) => this.flattenEvent(o))
        const mappedOccurrences: any = events.occurrences.map((o: any) => this.flattenRecurringEvent(o))
        return [].concat(mappedEvents, mappedOccurrences)
    }

    // Processes a Recurring Event into Full Calendar usable format.

    flattenRecurringEventForFullCalendar(e: any) {
        const event: any = this.flattenEventForFullCalendar(e.item)
        event.start = e.startDate.toJSDate()
        event.end = e.endDate.toJSDate()
        return event
    }


    // Processes an Event into Full Calendar usable format.
    // Events that were reoccurring need to use flattenRecurringEventForFullCalendar to process extra data
    flattenEventForFullCalendar(e: any) {
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

    // Return Full Calendar usable array of Events for display in a date range.
    // If Dates are not specified, processes all possible dates
    jsonEventsForFullCalendar(startRange: any, endRange: any) {
        // TODO fields to add
        // className, url, allDay
        // TODO allDay true if no endDate?
        let events
        if (startRange && endRange) {
            events = this.between(startRange, endRange)
        } else {
            events = this.all()
        }
        const mappedEvents: any = events.events.map(
            (o: any) => this.flattenEventForFullCalendar(o)
        )
        const mappedOccurrences: any = events.occurrences.map(
            (o: any) => this.flattenRecurringEventForFullCalendar(o)
        )
        return [].concat(mappedEvents, mappedOccurrences)
    }
}

// To process timezones and recurrence properly, Dates need to be converted by registering all timezones. This is a quick manual setup
// Data supplied by stratus.components.calendar.timezones has this information already prepared.
export function registerTimezones(tzData: any) {
    Object.keys(tzData).forEach((key) => {
        const icsData: any = tzData[key]
        const parsed: any = ICAL.parse(`BEGIN:VCALENDAR\nPRODID:-//tzurl.org//NONSGML Olson 2012h//EN\nVERSION:2.0\n${icsData}\nEND:VCALENDAR`)
        const comp: any = new ICAL.Component(parsed)
        const vTimezone: any = comp.getFirstSubcomponent('vtimezone')

        ICAL.TimezoneService.register(vTimezone)
    })
}

Stratus.Services.iCal = [
    '$provide',
    ($provide: angular.auto.IProvideService) => {
        $provide.factory(
            'iCal',
            [
                () => {
                    return {
                        ICalExpander,
                        registerTimezones
                    }
                }
            ]
        )
    }
]
