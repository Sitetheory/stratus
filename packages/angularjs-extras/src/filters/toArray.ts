// ToArray Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    LooseObject
} from '@stratusjs/core/misc'
import * as angular from 'angular'

/**
 * @author https://github.com/petebacondarwin/angular-toArrayFilter
 */
Stratus.Filters.ToArray = () => (
    obj: LooseObject, addKey?: boolean
) => {
    if (!angular.isObject(obj)) return obj
    if (addKey === false) {
        return Object.keys(obj).map((key) => {
            return (obj as LooseObject)[key]
        })
    } else {
        return Object.keys(obj).map((key) => {
            const value = (obj as LooseObject)[key]
            return angular.isObject(value) ?
                Object.defineProperty(value, '$key', { enumerable: false, value: key }) :
                { $key: key, $value: value }
        })
    }
}
