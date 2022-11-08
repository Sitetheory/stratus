// Avatar Filter
// -----------------

import {
    Stratus
} from '@stratusjs/runtime/stratus'
import md5 from 'js-md5'

// This filter supplies a avatar icon based on email(input) or defaults to a fallback icon
Stratus.Filters.Avatar = () => (
    input: string, size?: number, fallback?: 'retro'|'robohash'|'pagan'|'wavatar'|'monsterid'|'identicon'|'mm'|'mmng'
) => {
    size = size || 80
    fallback = fallback || 'retro' // use wording 'fallback' as 'default' is reserved
    return `//seccdn.libravatar.org/avatar/${md5(input.trim().toLowerCase())}?s=${size}&d=${fallback}`
}

/*
    // Old Gravatar old moved to avatar
    Stratus.Filters.Gravatar = function () {
        return function (input) {
            if (!input) {
                return '//www.gravatar.com/avatar/'
            }
            return '//www.gravatar.com/avatar/' + md5(input.trim().toLowerCase())
        }
    }
*/
