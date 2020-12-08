// Numeral Filter
// -----------------

// Runtime
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    isObject,
    extend
} from 'angular'
import numeral from 'numeral'
import {LooseObject} from '@stratusjs/core/misc'

export const numeralFormat = (value: number, maxDecimals: number = 1, format?: string): string => {
    if (!format) {
        format = '0'
        if (maxDecimals > 0) {
            format += '[.]0'
            for (let i = 1; i < maxDecimals; i++) {
                format += '[0]'
            }
        }
        format += 'a'
    }

    return numeral(value).format(format)
}

Stratus.Filters.Numeral = () => {
    return (input: number, options?: LooseObject) => {
        const tempScope: {
            maxDecimals?: number,
            format?: string
        }  = {
            maxDecimals: null,
            format: null
        }
        if (isObject(options)) extend(tempScope, options)
        return numeralFormat(input, tempScope.maxDecimals, tempScope.format)
    }
}
