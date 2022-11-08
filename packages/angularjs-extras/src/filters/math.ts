// Math Filters
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'


Stratus.Filters.Ceil = () => (
    val: number
) => {
    return Math.ceil(val)
}

Stratus.Filters.Floor = () => (
    val: number
) => {
    return Math.floor(val)
}

Stratus.Filters.Max = () => (
    val: number,
    maxVal: number
) => {
    return Math.max(val, maxVal)
}

Stratus.Filters.Min = () => (
    val: number,
    minVal: number
) => {
    return Math.min(val, minVal)
}
