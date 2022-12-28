// TruncateHtml Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    truncate,
    LooseObject
} from '@stratusjs/core/misc'
import {extend, isObject, isString} from 'lodash'

// This filter truncates a string
Stratus.Filters.TruncateHtml = () =>
    (input: number, options?: LooseObject) => {
        if (!isString(input)) {
            return input
        }
        const tempScope: {
            limit?: number,
            suffix?: string
        }  = {
            limit: 100, // 100 is the default from original misc/truncate
            suffix: '...' // '...' is the default from original misc/truncate
        }
        if (isObject(options)) {
            extend(tempScope, options)
        }
        return truncate(input, tempScope.limit, tempScope.suffix)
    }
