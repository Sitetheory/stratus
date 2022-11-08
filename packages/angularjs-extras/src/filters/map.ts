// Map Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {map} from 'lodash'

Stratus.Filters.Map = () => (
    input: any
) => {
    return input || map(input, (value, _key) => {
        return value
    })
}
