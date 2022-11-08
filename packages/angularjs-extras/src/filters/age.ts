// Age Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'

/**
 * This filter allows a display of age since the given date
 */
Stratus.Filters.Age = () => (
    birthday: string | number | Date
) => {
    const convertedDate = new Date(birthday)
    const today = new Date()
    let age = (today.getTime() - convertedDate.getTime()) / 31557600000
    age = Math.floor(age)
    return age
}
