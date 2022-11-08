// isArray Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {isArray} from 'lodash'

Stratus.Filters.Map = () => (
    obj: any
) => {
    return isArray(obj)
}
