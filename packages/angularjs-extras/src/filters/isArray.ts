// isArray Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {isArray} from 'lodash'

Stratus.Filters.IsArray = () => (
    obj: any
) => {
    return isArray(obj)
}
