// Luxon Filter
// -----------------
// TODO add locale to change locale
// FIXME does not auto localize language currently (auto timezone, does but not language)

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {clone, extend, isEmpty, isObject, isNull, isString, isUndefined} from 'lodash'
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
    format?: string,
    locale?: string,
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

    // force to UTC to avoid edge case issues (we store in UTC)
    // we must first apply the zone ('utc') before applying timezone to avoid issues where daylight savings time
    // overlaps, e.g California March 9, Italy March 30, in the middle it is using a local timestamp instead of utc
    // NOTE: this likely isn't necessary since we just "assume" the timestamp is stored as UTC in the admin
    // What actually matters is what's stored in the DB but it doen't hurt and if someone past in some other
    // value from some other non UTC corrected source, it needs to happen
    if (unix) {
        if (isString(date)) {
            date = parseInt(date, 10)
        }
        timeLuxon = DateTime.fromSeconds(date as number).toUTC()
    } else if(date instanceof Date) {
        timeLuxon = DateTime.fromJSDate(date as Date).toUTC()
    } else if('now' === date) {
        timeLuxon = DateTime.now().toUTC()
    } else {
        timeLuxon = DateTime.fromISO(date as string).toUTC()
    }
    return timeLuxon
}

/**
 * @author https://github.com/petebacondarwin/angular-toArrayFilter
 */
Stratus.Filters.Luxon = () => {
    return (input: LuxonPossibleInput, options?: LuxonOptions) => {
        if (isNull(input)) {
            // There is nothing we can process if this input is null... just return it
            return input
        }
        // Setup defaults
        const currentOptionsLuxon: LuxonOptions = {
            unix: true,
            since: false,
            relative: '1w', // Difference between two dates (with human grammar)
            duration: 'days', // Used with 'diff' to display the incremental between: seconds, minutes, hours, days, weeks, months, years
            format: 'LLL d yyyy, h:mma',
            locale: 'en',
            tz: 'local'
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
        timeLuxon = timeLuxon.setLocale(currentOptionsLuxon.locale)
        if (!timeLuxon.isValid) {
            console.warn('Invalid Locale', clone(currentOptionsLuxon.locale), clone(timeLuxon))
            return 'Invalid Locale'
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
