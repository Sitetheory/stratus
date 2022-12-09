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

// Universal Button
// TODO: Move this elsewhere, since it isn't specific to Froala
export class InputButtonPlugin<EventData = string|LooseObject> implements TriggerInterface {
    // Local
    uid: string
    snapshot: any

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
            this.saveSelection()
        }
        // Get snapshot before passing off event
        this.updateSnapshot()
        instance.trigger(this.eventName, data, this)
    }

    trigger(name: string, data: EventData, callee: TriggerInterface) {
        // This allows us to handle data on the return
        if (this.debug) {
            console.log(`${this.name}.trigger():`, name, data, callee)
        }
        // This checks the data and inserts it on the cursor
        if (_.isEmpty(data)) {
            console.warn(`${this.name}.trigger():`, data, 'is not valid data.')
            return
        }
        if (!this.editor) {
            console.warn(`${this.name}.trigger(): unable to inject html without a set editor.`)
            return
        }
        if (name !== 'insert') {
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
        // Insert our data into Froala on the caret
        this.insert ? this.insert(data): this.editor.html.insert(data)
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
        this.editor.events.focus()
        // Restore last snapshot
        this.editor.snapshot.restore(this.snapshot)
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
        // Get focus back to the editor
        this.editor.events.focus()
        // Restore last selection
        this.editor.selection.restore()
        return true
    }

    saveSelection(): boolean {
        if (!this.editor.selection) {
            console.warn(`${this.name}.saveSelection(): unable to save editor selection.`)
            return false
        }
        this.editor.selection.save()
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
