// Stratus Infrastructure
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    TriggerInterface
} from '@stratusjs/angular/core/trigger.interface'

// External Dependencies
import _ from 'lodash'

// Universal Button
// TODO: Move this elsewhere, since it isn't specific to Froala
export class InputButtonPlugin implements TriggerInterface {
    // Local
    uid: string
    snapshot: any

    // Settings
    debug = false
    name = 'inputButton'
    eventName = 'input-button'
    editor: any

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

    onClick(el: HTMLElement) {
        const uid = this.findUID(el)
        const instance = this.getInstance(uid)
        if (!instance) {
            return
        }
        // FIXME: The snapshot is specific to Froala
        // Get snapshot before passing off event
        this.updateSnapshot()
        instance.trigger(this.eventName, null, this)
    }

    trigger(name: string, data: any, callee: TriggerInterface) {
        // This allows  us to handle data on the return
        if (this.debug) {
            console.log(`${this.name}.trigger():`, name, data, callee)
        }
        // This checks the data and inserts it on the cursor
        if (!_.isString(data)) {
            console.warn(`${this.name}.trigger():`, data, 'is not a data string.')
            return
        }
        if (!this.editor) {
            console.warn(`${this.name}.trigger(): unable to inject html without a set editor.`)
            return
        }
        // FIXME: This is specific to the media-insert plugin
        if (name !== 'media-insert') {
            console.warn(`${this.name}.trigger():`, name, 'event is not supported.')
            return
        }
        // FIXME: Everything below is specific to the Froala API
        if (!this.restoreSnapshot()) {
            return
        }
        // Insert our data into Froala on the caret
        this.editor.html.insert(data)
        // Update snapshot for next insert
        this.updateSnapshot()
    }

    restoreSnapshot(): boolean {
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
        // FIXME: This is specific to the Froala API
        this.snapshot = this.editor.snapshot.get()
    }
}
