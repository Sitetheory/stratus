// Stratus Infrastructure
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    TriggerInterface
} from '../../core/trigger.interface'
import {
    LooseFunction,
    LooseObject
} from '@stratusjs/core/misc'

// External Dependencies
import _ from 'lodash'

export type ScrollPositions = Array<[Element, number]>

// Scroll positions of an element and its ancestors, the page included
export function scrollPositions(element: Element): ScrollPositions {
    const positions: ScrollPositions = []
    for (; element; element = element.parentElement) {
        positions.push([element, element.scrollTop])
    }
    return positions
}

// Put them back at once (the admin sets `scroll-behavior: smooth` on html)
export function restoreScroll(positions: ScrollPositions) {
    const root = document.documentElement
    const scrollBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    for (const [element, top] of positions) {
        element.scrollTop = top
    }
    root.style.scrollBehavior = scrollBehavior
}

// Universal Button
// TODO: Some of this can move elsewhere, since it isn't completely specific to Froala
export class InputButtonPlugin<EventData = string|LooseObject> implements TriggerInterface {
    // Local
    uid: string
    snapshot: any
    // Text selected when the dialog opened
    selectionText = ''

    // Settings
    debug = false
    name = 'inputButton'
    eventName = 'input-button'
    editor: any
    insert: LooseFunction
    autoRestoreSelection = false
    autoSaveSelection = false
    maintainSelection = false
    maintainSnapshot = false

    // The quill parameter should be a type of Quill, but that doesn't appear to have the container attribute
    constructor(options: any) {
        // Initialization
        this.uid = _.uniqueId(`input_button_`)
        Stratus.Instances[this.uid] = this

        this.debug = options && options.debug

        // normalize options
        if (!options || typeof options !== 'object') {
            options = {}
        }
        this.name = options.name || this.name
        this.eventName = options.eventName || this.eventName
        this.editor = options.editor || null
        this.insert = options.insert || null
        this.autoRestoreSelection = options.autoRestoreSelection || null
        this.autoSaveSelection = options.autoSaveSelection || null
        this.maintainSelection = options.maintainSelection || null
        this.maintainSnapshot = options.maintainSnapshot || null
    }

    findUID(el: HTMLElement): string {
        if ('uid' in el.dataset) {
            return el.dataset.uid
        }
        return this.findUID(el.parentElement)
    }

    getInstance(uid?: string): TriggerInterface {
        if (!(uid in Stratus.Instances)) {
            return undefined
        }
        return Stratus.Instances[uid]
    }

    onClick(el: HTMLElement, data?: any) {
        const uid = this.findUID(el)
        const instance = this.getInstance(uid)
        if (!instance) {
            return
        }
        // Save selection before passing off event
        if (this.autoSaveSelection) {
            // Froala's popups (e.g. the link popup) restore the selection from the same markers when they close,
            // which would use up ours
            this.editor.popups.hideAll()
            this.selectionText = this.editor.selection ? this.editor.selection.text() : ''
            this.saveSelection()
            // A blur saves and can re-render the editor, losing the markers; restoreSelection() turns blur back on
            this.editor.events.disableBlur()
        }
        // Get snapshot before passing off event
        this.updateSnapshot()
        if (this.debug) {
            console.log(`[${this.eventName}]:`, {instance, data})
        }
        instance.trigger(this.eventName, data, this)
    }

    trigger(name: string, data: EventData, callee: TriggerInterface) {
        // This allows us to handle data on the return
        if (this.debug) {
            console.log(`${this.name}.trigger():`, name, data, callee)
        }
        // Only inserts need data; 'restore' (cancel) just puts the selection back
        if (name === 'insert' && _.isEmpty(data)) {
            console.warn(`${this.name}.trigger():`, data, 'is not valid data.')
            return
        }
        if (!this.editor) {
            console.warn(`${this.name}.trigger(): unable to inject html without a set editor.`)
            return
        }
        // Ensure we only continue for 'insert' or 'restore' events
        if (!['insert', 'restore'].includes(name)) {
            console.warn(`${this.name}.trigger():`, name, 'event is not supported.')
            return
        }
        // Handle the Froala Editor Insertion
        if (!this.restoreSnapshot()) {
            return
        }
        // Attempt to Restore Selection
        if (this.autoRestoreSelection) {
            this.restoreSelection()
        }
        if (name !== 'insert') {
            return
        }
        // Insert our data into Froala on the caret
        this.insert ? this.insert(data): this.editor.html.insert(data)
        // The undo step is what fires contentChanged, which saves the model
        this.editor.undo.saveStep()
        // Update snapshot for next insert
        this.updateSnapshot()
        // Save new selection
        if (this.maintainSelection) {
            this.saveSelection()
        }
    }

    restoreSnapshot(): boolean {
        if (!this.maintainSnapshot) {
            return true
        }
        if (!this.snapshot) {
            console.warn(`${this.name}.restoreSnapshot(): unable to restore editor session without a snapshot.`)
            return false
        }
        // Get focus back to the editor
        if (this.debug) {
            console.log('[restoreSnapshot]is focused:', this.editor.core.hasFocus())
        }
        // Always disable blur before changing focus
        this.editor.events.disableBlur()
        // Get focus back to the editor
        this.editor.events.focus()
        // Restore last snapshot
        this.editor.snapshot.restore(this.snapshot)
        // Enable Blur after snapshot
        this.editor.events.enableBlur()
        return true
    }

    updateSnapshot() {
        if (!this.maintainSnapshot) {
            return true
        }
        this.snapshot = this.editor.snapshot.get()
    }

    restoreSelection(): boolean {
        // Ensure selection exists
        if (!this.editor.selection) {
            console.warn(`${this.name}.restoreSelection(): unable to restore editor selection.`)
            return false
        }
        // Note Focus
        if (this.debug) {
            console.log('[restoreSelection]is focused:', this.editor.core.hasFocus())
        }
        // Focusing the editor resets its inner scroll (long content) and can move the page
        const positions = scrollPositions(this.editor.el)
        // Always disable blur before changing focus
        this.editor.events.disableBlur()
        // Get focus back to the editor
        this.editor.events.focus()
        // Restore last selection
        this.editor.selection.restore()
        // Enable Blur
        this.editor.events.enableBlur()
        restoreScroll(positions)
        return true
    }

    saveSelection(): boolean {
        if (!this.editor.selection) {
            console.warn(`${this.name}.saveSelection(): unable to save editor selection.`)
            return false
        }
        // Disable blur before save
        this.editor.events.disableBlur()
        // Save selection inside Content-Editable HTML on DOM
        this.editor.selection.save()
        // Enable Blur after save
        this.editor.events.enableBlur()
        return true
    }

    clearSelection(): boolean {
        if (!this.editor.selection) {
            console.warn(`${this.name}.clearSelection(): unable to clear editor selection.`)
            return false
        }
        this.editor.selection.clear()
        return true
    }
}
