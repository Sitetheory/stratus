import {
    dehydrate,
    hydrate,
    isAngular,
    isjQuery,
    LooseFunction
} from './misc'
import {
    first,
    includes,
    startsWith,
    size,
    forEach,
    map
} from 'lodash'

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
    context: HTMLDocument | HTMLElement
    length: number
    selection: HTMLElement
    selector: string | Node | HTMLElement | JQuery
    constructor(
        context: HTMLDocument | HTMLElement,
        length?: number, selection?: HTMLElement,
        selector?: string | Node | HTMLElement | JQuery
    ) {
        if (!context) {
            context = document
        }
        this.context = context
        this.length = length || 0
        this.selection = selection
        this.selector = selector
    }
    attr(attribute: any, value?: any) {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find "' + attribute + '" for list:', this.selection)
            return null
        }
        if (!attribute) {
            return this
        }
        if (typeof value === 'undefined') {
            return hydrate(
                this.selection.getAttribute(attribute)
            )
        }
        this.selection.setAttribute(attribute, dehydrate(value))
        return this
    }
    addEventListener(type: any, listener: any, options?: any) {
        if (!this.selection) {
            console.warn('Unable to add EventListener on empty selection.')
            return this
        }
        const listen: any = (node: Element) => node.addEventListener(type, listener, options)
        if (this.selection instanceof NodeList) {
            forEach(this.selection, listen)
            return this
        }
        if (this.selection instanceof EventTarget) {
            listen(this.selection)
            return this
        }
        console.warn('Unable to add EventListener on:', this.selection)
        return this
    }
    each(callable: any) {
        if (typeof callable !== 'function') {
            callable = (element: any) => {
                console.warn('each running on element:', element)
            }
        }
        if (this.selection instanceof NodeList) {
            forEach(this.selection, callable)
        }
        return this
    }
    find(selector: any) {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find "' + selector + '" for list:', this.selection)
        } else if (selector) {
            // return Stratus.Select(selector, this.selection)
            return Select(selector, this.selection)
        }
        return null
    }
    map(callable: any) {
        if (typeof callable !== 'function') {
            callable = (element: any) => {
                console.warn('map running on element:', element)
            }
        }
        if (this.selection instanceof NodeList) {
            return map(this.selection, callable)
        }
        return this
    }
    // TODO: Merge with prepend
    append(child: any) {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to append child:', child, 'to list:', this.selection)
        } else if (child) {
            // TODO: This should be insertAfter
            this.selection.insertBefore(child, this.selection.lastChild)
        }
        return this
    }
    // TODO: Merge with append
    prepend(child: any) {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to prepend child:', child, 'to list:', this.selection)
        } else if (child) {
            this.selection.insertBefore(child, this.selection.firstChild)
        }
        return this
    }
    // Design Plugins
    addClass(className: any) {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to add class "' + className + '" to list:', this.selection)
        } else {
            forEach(className.split(' '), (name: any) => {
                if (this.selection.classList) {
                    this.selection.classList.add(name)
                } else {
                    this.selection.className += ' ' + name
                }
            })
        }
        return this
    }
    removeClass(className: string) {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to remove class "' + className + '" from list:', this.selection)
        } else if (this.selection.classList) {
            forEach(className.split(' '), name => {
                this.selection.classList.remove(name)
            })
        } else {
            this.selection.className = this.selection.className.replace(
                new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
                    'gi'), ' ')
        }
        return this
    }
    style() {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find style for list:', this.selection)
        } else if (this.selection instanceof Node) {
            return window.getComputedStyle(this.selection)
        }
        return null
    }
    // Positioning Plugins
    height() {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find height for list:', this.selection)
            return null
        }
        return this.selection.offsetHeight || 0
    }
    width() {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find width for list:', this.selection)
            return null
        }
        // if (cookie('env')) {
        //     console.log('width:', this.selection.scrollWidth, this.selection.clientWidth, this.selection.offsetWidth)
        // }
        return this.selection.offsetWidth || 0
    }
    offset() {
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find offset for list:', this.selection)
        } else if (this.selection.getBoundingClientRect) {
            const rect: any = this.selection.getBoundingClientRect()
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
        if (this.selection instanceof NodeList) {
            console.warn('Unable to find offset for list:', this.selection)
            return null
        }
        return Select(this.selection.parentNode)
    }
}

export function Select(selector: string | Node | HTMLElement | JQuery, context?: HTMLDocument | HTMLElement): Selector {
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
