// Truncate Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    truncate,
    LooseObject
} from '@stratusjs/core/misc'
import _ from 'lodash'

// This filter truncates a string
Stratus.Filters.Truncate = () =>
    (input: number, options?: LooseObject) => {
        if (!_.isString(input)) {
            return input
        }
        const tempScope: {
            limit?: number,
            suffix?: string
        }  = {
            limit: null,
            suffix: null
        }
        if (_.isObject(options)) {
            _.extend(tempScope, options)
        }
        return truncate(input, tempScope.limit, tempScope.suffix)
    }
