// Truncate Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    LooseObject
} from '@stratusjs/core/misc'
import {extend, isObject, isString, truncate} from 'lodash'

// This filter truncates a string
Stratus.Filters.Truncate = () =>
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
        return truncate(input, {
            length: tempScope.limit,
            omission: tempScope.suffix,
            separator: /,? +/
        })
    }
