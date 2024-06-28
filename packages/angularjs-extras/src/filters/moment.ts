// Moment Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {extend, isObject, isString} from 'lodash'
// import moment from 'moment'
import moment from 'moment-timezone' // 'moment-timezone/builds/moment-timezone-with-data'
import {seconds} from '@stratusjs/core/conversion'
import {unitOfTime} from 'moment'

type MomentOptions = {
    unix?: boolean
    ago?: boolean
    since?: boolean
    diff?: number
    from?: number
    relative?: string
    duration?: unitOfTime.Base // string | 'days'
    format?: string
    tz?: 'local' | string
}

/**
 * @deprecated for Luxon https://github.com/Sitetheory/stratus/wiki/AngularJS-Extras-Package-Filters-Usage#user-content-luxon
 * @author https://github.com/petebacondarwin/angular-toArrayFilter
 */
Stratus.Filters.Moment = () => {
    return (input: number, options?: MomentOptions) => {
        const currentOptions: MomentOptions = {
            unix: true,
            ago: true,
            since: false,
            diff: null, // Difference between two dates (as a number).
            relative: '1w', // Difference between two dates (with human grammar)
            duration: 'days', // Used with 'diff' to display the incremental between: seconds, minutes, hours, days, weeks, months, years
            format: 'MMM Do YYYY, h:mma'
        }
        if (isObject(options)) extend(currentOptions, options)
        if (
            isString(currentOptions.relative) &&
            Math.round(new Date().getTime() / 1000) > (input + seconds(currentOptions.relative))
        )  {
            currentOptions.since = false
        }
        let time = currentOptions.unix ? moment.unix(input) : moment(input)
        time = currentOptions.tz && currentOptions.tz !== 'local' ? time.tz(currentOptions.tz) : time

        if (currentOptions.diff) {
            let until = currentOptions.unix ? moment.unix(currentOptions.diff) :
                (currentOptions.diff as unknown) === true ? moment() : moment(currentOptions.diff)
            until = currentOptions.tz ? until.tz(currentOptions.tz) : until
            // console.log('between', time, 'and', until)
            return until.diff(time, currentOptions.duration)
        } else if (currentOptions.from) {
            let from = currentOptions.unix ? moment.unix(currentOptions.from) : moment(currentOptions.from)
            from = currentOptions.tz ? from.tz(currentOptions.tz) : from
            // console.log('from', from, 'to', time)
            return time.from(from, true)
        } else {
            return (!currentOptions.since) ? time.format(currentOptions.format) : time.fromNow(!currentOptions.ago)
        }
    }
}
