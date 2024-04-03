// iCAL Parsing Service
// ----------------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {forEach} from 'lodash'
import {auto} from 'angular'
import 'ical.js' // Global ICAL variable.... not able to be sandboxed yet
import {entityDecode, LooseObject} from '@stratusjs/core/misc'

// Globals
declare var ICAL: any

// original author: Mikael Finstad https://github.com/mifi/ical-expander
// licence: MIT https://github.com/mifi/ical-expander/blob/master/LICENSE
export class ICalExpander {
    maxIterations = 1000
    skipInvalidDates = false
    jCalData: unknown
    component: ICalComponent
    events: ICalEvent[]

    [key: string]: any

    constructor(icsData: any, opts?: LooseObject) {
        // Hydrate Options
        opts = opts || {}
        // Only populate non-null values
        forEach(opts, (key: string, value: any) => {
            if (value === null) {
                return
            }
            this[key] = value
        })

        this.jCalData = ICAL.parse(icsData)
        this.component = new ICAL.Component(this.jCalData)
        this.events = this.component.getAllSubcomponents('vevent').map(
            (vevent) => new ICAL.Event(vevent)
        )

        if (this.skipInvalidDates) {
            this.events = this.events.filter((evt) => {
                try {
                    // Ensure these are proper Dates
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

    isEventWithinRange(after: Date, before: Date, startTime: number, endTime: number) {
        return (!after || endTime >= after.getTime()) && (!before || startTime <= before.getTime())
    }

    getTimes(eventOrOccurrence: ICalOccurrence | ICalEvent) {
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

    /**
     * This is a fixed version of iCal, where a recurrenceId shouldn't be referencing itself. Will ignore instead
     */
    isRecurrenceException(event: ICalEvent) {
        if (
            event.isRecurrenceException() &&
            event.recurrenceId.toUnixTime() === event.startDate.toUnixTime()
        ) {
            return false
        }
        return event.isRecurrenceException()
    }

    // Returns events between a date range
    between(after?: Date, before?: Date) {
        const exceptions: ICalEvent[] = []

        this.events.forEach((event) => {
            // if (event.isRecurrenceException()) {
            if (this.isRecurrenceException(event)) {
                exceptions.push(event)
            }
        })

        const ret: {
            events: ICalEvent[]
            occurrences: ICalOccurrence[]
        } = {
            events: [],
            occurrences: []
        }

        this.events
            // .filter((e) => !e.isRecurrenceException())
            .filter((e) => !this.isRecurrenceException(e))
            .forEach((event) => {
                const exDates: number[] = []
                event.component.getAllProperties('exdate').forEach((exDateProp) => {
                    const exDate: ICalTime = exDateProp.getFirstValue()
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
                        if (!next) {
                            continue
                        }
                        const occurrence = event.getOccurrenceDetails(next)
                        const {
                            startTime,
                            endTime
                        } = this.getTimes(occurrence)
                        const isOccurrenceExcluded = exDates.indexOf(startTime) !== -1
                        // TODO check that within same day?
                        const exception = exceptions.find(
                            (ex) => ex.uid === event.uid &&
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
                        } else {
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
    before(before: Date) {
        return this.between(undefined, before)
    }

    // Returns events after a date
    after(after: Date) {
        return this.between(after)
    }

    // Returns events all events
    all() {
        return this.between()
    }

    // Processes a Recurring Event into generic Object format.
    flattenRecurringEvent(e: ICalOccurrence) {
        const event = this.flattenEvent(e.item)
        event.recurrenceId = e.recurrenceId.toJSDate()
        event.startDate = e.startDate.toJSDate()
        event.endDate = e.endDate.toJSDate()
        return event
    }

    // Processes an Event into generic Object format.
    // Events that were reoccurring need to use flattenRecurringEvent to process extra data
    flattenEvent(e: ICalEvent): ICalEventCleaned {
        // console.log('flattenEvent has zone', clone(e.startDate.timezone))
        return {
            startDate: e.startDate.toJSDate(),
            endDate: e.endDate.toJSDate(),
            // timeZone: e.startDate.zone.tzid,
            timeZone: e.startDate.timezone === 'Z' ? 'UTC' : e.startDate.timezone,
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
    jsonEvents(startRange: Date, endRange: Date): ICalEventCleaned[] {
        let events
        if (startRange && endRange) {
            events = this.between(startRange, endRange)
        } else {
            events = this.all()
        }
        const mappedEvents = events.events.map((o) => this.flattenEvent(o))
        const mappedOccurrences = events.occurrences.map((o) => this.flattenRecurringEvent(o))
        return [].concat(mappedEvents, mappedOccurrences)
    }

    // Processes a Recurring Event into Full Calendar usable format.

    flattenRecurringEventForFullCalendar(e: ICalOccurrence) {
        const event = this.flattenEventForFullCalendar(e.item)
        event.start = e.startDate.toJSDate()
        event.end = e.endDate.toJSDate()
        return event
    }


    // Processes an Event into Full Calendar usable format.
    // Events that were reoccurring need to use flattenRecurringEventForFullCalendar to process extra data
    flattenEventForFullCalendar(e: ICalEvent): FullCalEvent {
        const summary = entityDecode(e.summary)
        return {
            start: e.startDate.toJSDate(),
            end: e.endDate.toJSDate(),
            timeZone: e.startDate.timezone === 'Z' ? 'UTC' : e.startDate.timezone,
            title: summary,
            summary,
            description: e.description,
            attendees: e.attendees,
            organizer: e.organizer,
            id: e.uid,
            location: e.location,
            url: e.url || '',
            allDay: e.allDay,
            image: e.image // Custom item
        }
    }

    // Return Full Calendar usable array of Events for display in a date range.
    // If Dates are not specified, processes all possible dates
    jsonEventsForFullCalendar(startRange: Date, endRange: Date): FullCalEvent[] {
        // TODO fields to add
        // className, url, allDay
        // TODO allDay true if no endDate?
        let events
        if (startRange && endRange) {
            events = this.between(startRange, endRange)
        } else {
            events = this.all()
        }
        const mappedEvents = events.events.map(
            (o) => this.flattenEventForFullCalendar(o)
        )
        const mappedOccurrences = events.occurrences.map(
            (o) => this.flattenRecurringEventForFullCalendar(o)
        )
        return [].concat(mappedEvents, mappedOccurrences)
    }
}

/** These appear in extendedProps object */
export interface FullCalEventExtendedProps {
    summary: string
    description: string
    attendees: unknown[]
    organizer?: string
    location?: string
    allDay?: boolean // Custom item
    image?: string // Custom item
    timeZone: string
}

interface FullCalEvent extends FullCalEventExtendedProps {
    id: string
    start: Date
    end: Date
    title: string
    summary: string
    url?: string // Custom item
}

interface ICalEventCleaned extends FullCalEventExtendedProps {
    uid: string
    recurrenceId?: Date
    sequence: number
    startDate: Date
    endDate: Date
    title: string
    summary: string
    url?: string
}

/** @see ical.js/lib/ical/component.js */
interface ICalComponent {
    getAllProperties(name: string): LooseObject[]
    getAllSubcomponents(name: string): ICalComponent[]
    getFirstSubcomponent(name: string): ICalComponent
}

/** @see ical.js/lib/ical/event.js occurrenceDetails */
interface ICalOccurrence {
    recurrenceId: ICalTime
    item: ICalEvent
    startDate: ICalTime
    endDate: ICalTime
}

/** @see ical.js/lib/ical/event.js */
interface ICalEvent {
    component: ICalComponent
    uid: string
    recurrenceId?: ICalTime
    sequence: number
    startDate: ICalTime
    endDate: ICalTime
    summary: string
    description: string
    attendees: unknown[]
    organizer: string
    location: string
    url?: string // Custom item
    allDay?: boolean // Custom item
    image?: string // Custom item
    getOccurrenceDetails(occurrence: ICalTime): ICalOccurrence
    iterator(startTime?: ICalTime): ICalRecurExpansion
    /** Checks if the event describes a recurrence exception */
    isRecurrenceException(): boolean
    /** Checks if the event is recurring */
    isRecurring(): boolean
}

/** @see ical.js/lib/ical/recur_expansion.js */
interface ICalRecurExpansion {
    next(): ICalTime
}

/** @see ical.js/lib/ical/time.js */
interface ICalTime {
    timezone: string
    isDate(): boolean
    toJSDate(): Date
    toUnixTime(): number
}

// To process timezones and recurrence properly, Dates need to be converted by registering all timezones. This is a quick manual setup
// Data supplied by stratus.components.calendar.timezones has this information already prepared.
export function registerTimezones(tzData: LooseObject<string>) {
    Object.keys(tzData).forEach((key) => {
        const icsData = tzData[key]
        const parsed = ICAL.parse(`BEGIN:VCALENDAR\nPRODID:-//tzurl.org//NONSGML Olson 2012h//EN\nVERSION:2.0\n${icsData}\nEND:VCALENDAR`)
        const comp: ICalComponent = new ICAL.Component(parsed)
        const vTimezone = comp.getFirstSubcomponent('vtimezone')

        ICAL.TimezoneService.register(vTimezone)
    })
}

Stratus.Services.iCal = [
    '$provide',
    ($provide: auto.IProvideService) => {
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
