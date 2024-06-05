// Luxon Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {clone, extend, isEmpty, isObject, isString, isUndefined} from 'lodash'
import {DateTime, Interval} from 'luxon'
import {seconds} from '@stratusjs/core/conversion'
import {DurationUnit} from 'luxon/src/duration'

type LuxonOptions = {
    unix?: boolean
    ago?: boolean
    since?: boolean
    diff?: LuxonPossibleInput | true // number|string|Date
    relative?: string // '1w'
    duration?: DurationUnit // string | 'days' | 'hours'
    format?: string
    tz?: 'local' | string
}

type LuxonPossibleInput = number|string|Date

const timeDifference = (from: DateTime, until: DateTime, durationUnit?: DurationUnit): string => {
    durationUnit ??= 'days'
    const interval = Interval.fromDateTimes(from, until)
    return Math.floor(interval.length(durationUnit)).toString()
}

const convertLuxon = (date: LuxonPossibleInput, unix?: boolean): DateTime => {
    let timeLuxon: DateTime
    if (
        'API::NOW' === date ||
        'now' === date ||
        isUndefined(date)
    ) {
        date = 'now'
        unix = false
    }

    if (unix) {
        if (isString(date)) {
            date = parseInt(date, 10)
        }
        timeLuxon = DateTime.fromSeconds(date as number)
    } else if(date instanceof Date) {
        timeLuxon = DateTime.fromJSDate(date as Date)
    } else if('now' === date) {
        timeLuxon = DateTime.now()
    } else {
        timeLuxon = DateTime.fromISO(date as string)
    }
    return timeLuxon
}

/**
 * @author https://github.com/petebacondarwin/angular-toArrayFilter
 */
Stratus.Filters.Luxon = () => {
    return (input: LuxonPossibleInput, options?: LuxonOptions) => {
        // Setup defaults
        const currentOptionsLuxon: LuxonOptions = {
            unix: true,
            since: false,
            relative: '1w', // Difference between two dates (with human grammar)
            duration: 'days', // Used with 'diff' to display the incremental between: seconds, minutes, hours, days, weeks, months, years
            format: 'LLL d yyyy, h:mma'
        }
        if (isObject(options)) extend(currentOptionsLuxon, options)
        if (!currentOptionsLuxon.tz || isEmpty(currentOptionsLuxon.tz)) currentOptionsLuxon.tz = 'local'

        // Process luxon logic
        let timeLuxon = convertLuxon(input, currentOptionsLuxon.unix)
        if (!timeLuxon.isValid) {
            console.warn('Invalid DateTime', clone(input), clone(timeLuxon))
            return 'Invalid DateTime'
        }
        timeLuxon = timeLuxon.setZone(currentOptionsLuxon.tz)
        if (!timeLuxon.isValid) {
            console.warn('Invalid TimeZone', clone(currentOptionsLuxon.tz), clone(timeLuxon))
            return 'Invalid TimeZone'
        }

        if (
            isString(currentOptionsLuxon.relative) &&
            Math.round(new Date().getTime() / 1000) > (timeLuxon.toSeconds() + seconds(currentOptionsLuxon.relative))
        ) {
            currentOptionsLuxon.since = false
        }

        if (currentOptionsLuxon.diff) {
            // Handle Time Difference
            const until: DateTime = currentOptionsLuxon.diff === true ? DateTime.now() :
                convertLuxon(currentOptionsLuxon.diff as LuxonPossibleInput, currentOptionsLuxon.unix).setZone(currentOptionsLuxon.tz)
            return timeDifference(timeLuxon, until, currentOptionsLuxon.duration)
        } /*else if (currentOptions.from) {

        }*/ else if (currentOptionsLuxon.since) {
            // Relative time
            return timeLuxon.toRelative()
        } else {
            // Default Formatted Time
            return timeLuxon.toFormat(currentOptionsLuxon.format)
        }
    }
}
