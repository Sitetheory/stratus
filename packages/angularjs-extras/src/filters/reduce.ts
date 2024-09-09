// Reduce Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {reduce} from 'lodash'
import {IInterpolateService} from 'angular'

// This filter applies a reduce to an array or object
// FIXME: This is terribly malfunctioning (old note. no examples of usage found)
Stratus.Filters.Reduce = (
    $interpolate: IInterpolateService,
) => {
    return (input: any, expression?: string) => {
        return input || reduce(input, (value) => {
            return ($interpolate(expression))(value)
        })
    }
}
