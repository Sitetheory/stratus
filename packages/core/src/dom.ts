import {dehydrate, hydrate, isAngular, isjQuery, LooseFunction} from '@stratusjs/core/misc'
import {first, includes, startsWith, size, forEach, map} from 'lodash'

// DOM Complete as a Promise instead of Callback
export function DOMComplete(): Promise<void> {
    return new Promise<void>(resolve => {
        document.readyState === 'complete' ? resolve() : window.addEventListener('load', () => resolve())
    })
}

/**
 * This function executes when the DOM is Complete, which means
 * the DOM is fully parsed and all resources are rendered.
 */
export function complete(fn: LooseFunction): void {
    (document.readyState === 'complete') ? fn() : window.addEventListener('load', fn)
}

/**
 * This function executes when the DOM is Ready, which means
 * the DOM is fully parsed, but still loading sub-resources
 * (CSS, Images, Frames, etc).
 */
export function ready(fn: LooseFunction): void {
    (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn)
}

/**
 * This function executes before the DOM has completely Unloaded,
 *  navigated from the current page.
 */
export function unload(fn: (e: BeforeUnloadEvent) => void){
    window.addEventListener('beforeunload', fn)
}

export class Selector {
    context: Document | Element
    length: number
    selection: any
    selector: string | Element | JQuery
    constructor(context: Document | Element, length?: number, selection?: any, selector?: string | Element | JQuery) {
        if (!context) {
            context = document
        }
        this.context = context
        this.length = length || 0
        this.selection = selection
        this.selector = selector
    }
    attr(attribute: any, value?: any) {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find "' + attribute + '" for list:', that.selection)
            return null
        }
        if (!attribute) {
            return this
        }
        if (typeof value === 'undefined') {
            value = that.selection.getAttribute(attribute)
            return hydrate(value)
        } else {
            that.selection.setAttribute(attribute, dehydrate(value))
        }
        return that
    }
    addEventListener(type: any, listener: any, options?: any) {
        const that: any = this
        if (!that.selection) {
            console.warn('Unable to add EventListener on empty selection.')
            return that
        }
        const listen: any = (node: Element) => node.addEventListener(type, listener, options)
        if (that.selection instanceof NodeList) {
            forEach(that.selection, listen)
            return that
        }
        if (that.selection instanceof EventTarget) {
            listen(that.selection)
            return that
        }
        console.warn('Unable to add EventListener on:', that.selection)
        return that
    }
    each(callable: any) {
        const that: any = this
        if (typeof callable !== 'function') {
            callable = (element: any) => {
                console.warn('each running on element:', element)
            }
        }
        if (that.selection instanceof NodeList) {
            forEach(that.selection, callable)
        }
        return that
    }
    find(selector: any) {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find "' + selector + '" for list:', that.selection)
        } else if (selector) {
            // return Stratus.Select(selector, that.selection)
            return Select(selector, that.selection)
        }
        return null
    }
    map(callable: any) {
        const that: any = this
        if (typeof callable !== 'function') {
            callable = (element: any) => {
                console.warn('map running on element:', element)
            }
        }
        if (that.selection instanceof NodeList) {
            return map(that.selection, callable)
        }
        return that
    }
    // TODO: Merge with prepend
    append(child: any) {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to append child:', child, 'to list:', that.selection)
        } else if (child) {
            that.selection.insertBefore(child, that.selection.lastChild)
        }
        return that
    }
    // TODO: Merge with append
    prepend(child: any) {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to prepend child:', child, 'to list:', that.selection)
        } else if (child) {
            that.selection.insertBefore(child, that.selection.firstChild)
        }
        return that
    }
    // Design Plugins
    addClass(className: any) {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to add class "' + className + '" to list:', that.selection)
        } else {
            forEach(className.split(' '), (name: any) => {
                if (that.selection.classList) {
                    that.selection.classList.add(name)
                } else {
                    that.selection.className += ' ' + name
                }
            })
        }
        return that
    }
    removeClass(className: string) {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to remove class "' + className + '" from list:', that.selection)
        } else if (that.selection.classList) {
            forEach(className.split(' '), name => {
                that.selection.classList.remove(name)
            })
        } else {
            that.selection.className = that.selection.className.replace(
                new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
                    'gi'), ' ')
        }
        return that
    }
    style() {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find style for list:', that.selection)
        } else if (that.selection instanceof Node) {
            return window.getComputedStyle(that.selection)
        }
        return null
    }
    // Positioning Plugins
    height() {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find height for list:', that.selection)
            return null
        }
        return that.selection.offsetHeight || 0
    }
    width() {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find width for list:', that.selection)
            return null
        }
        // if (cookie('env')) {
        //     console.log('width:', that.selection.scrollWidth, that.selection.clientWidth, that.selection.offsetWidth)
        // }
        return that.selection.offsetWidth || 0
    }
    offset() {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find offset for list:', that.selection)
        } else if (that.selection.getBoundingClientRect) {
            const rect: any = that.selection.getBoundingClientRect()
            return {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            }
        }
        return {
            top: null,
            left: null
        }
    }
    parent() {
        const that: any = this
        if (that.selection instanceof NodeList) {
            console.warn('Unable to find offset for list:', that.selection)
            return null
        }
        return Select(that.selection.parentNode)
    }
}

export function Select(selector: string | Element | JQuery, context?: Document | Element): Selector {
    if (!context) {
        context = document
    }
    let selection: any = selector
    if (typeof selector === 'string') {
        // let target
        // if (startsWith(selector, '.') || includes(selector, '[')) {
        //     target = 'querySelectorAll'
        // } else if (includes(['html', 'head', 'body'], selector) || startsWith(selector, '#')) {
        //     target = 'querySelector'
        // } else {
        //     target = 'querySelectorAll'
        // }
        // selection = context[target](selector)
        selection = (includes(['html', 'head', 'body'], selector) || startsWith(selector, '#'))
            ? context.querySelector(selector) : context.querySelectorAll(selector)
    }
    if (!selection || typeof selection !== 'object') {
        return selection
    }
    if (isAngular(selection) || isjQuery(selection)) {
        selection = selection.length ? first(selection) : {}
    }
    return new Selector(context, size(selection), selection, selector)
    /*return extend({}, Selector, {
        context: this,
        length: size(selection),
        selection,
        selector
    })*/
}

export interface DOMType {
    DOMComplete: typeof DOMComplete
    complete: typeof complete
    ready: typeof ready
    unload: typeof unload
    Select: typeof Select
    Selector: typeof Selector
}
export const DOM: DOMType = {
    DOMComplete,
    complete,
    ready,
    unload,
    Select,
    Selector
}
