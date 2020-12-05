// Stratus Infrastructure
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    TriggerInterface
} from '@stratusjs/angular/core/trigger.interface'

// External Dependencies
import _ from 'lodash'
// @ts-ignore
import FroalaEditor from 'froala-editor'

// Plugin Options
FroalaEditor.DEFAULTS = Object.assign(FroalaEditor.DEFAULTS, {
    endpoint: '/Api/Media'
})

// TODO: Move this to a core file
// Universal Button
export class InputButtonPlugin implements TriggerInterface {
    // Local
    uid: string

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
        instance.trigger(this.eventName, null, this)
    }

    trigger(name: string, data: any, callee: TriggerInterface) {
        // This allows  us to handle data on the return
        if (this.debug) {
            console.log(`${this.name}.trigger:`, name, data, callee)
        }
        // This checks the data and inserts it on the cursor
        if (!_.isString(data)) {
            console.warn(`${this.name}.trigger:`, data, 'is not a data string.')
            return
        }
        if (!this.editor) {
            console.warn(`${this.name}.trigger: unable to inject html without a set editor.`)
            return
        }
        if (name !== 'media-insert') {
            console.warn(`${this.name}.trigger:`, name, 'event is not supported.')
            return
        }
        // this tells Froala to insert our data on the cursor
        this.editor.html.insert(data)
    }
}

/**
 * @param editor The Froala instance
 */
FroalaEditor.PLUGINS.mediaManager = function mediaManager (editor: any) {
    let inputButton: InputButtonPlugin

    const debug = false

    // When the plugin is initialized,this will be called.
    function _init() {
        inputButton = new InputButtonPlugin({
            name: 'Media Manager',
            eventName: 'media-library',
            editor,
            debug
        })

        if (debug) {
            console.log('initialized:', {
                options: editor.opts.endpoint,
                instance: this
            })
        }

        // Editor methods
        // editor.methodName(params);

        // Event listeners
        // editor.events.add('contentChanged', function (params) {});
    }

    function onClick() {
        if (!editor.el) {
            console.warn('mediaManager.onClick(): unable to find element')
            return
        }
        inputButton.onClick(editor.el)
    }

    // Expose public methods.
    // Public methods can be accessed through the editor API:
    // editor.myPlugin.publicMethod();
    return {
        // If _init is not public then the plugin won't be initialized.
        _init,
        onClick
    }
}

// Insert Plugin to Image Insert
FroalaEditor.DEFAULTS.imageInsertButtons.push('mediaManager'),
    FroalaEditor.RegisterCommand('mediaManager', {
        title: 'Insert Media',
        undo: !1,
        focus: !1,
        modal: !0,
        callback() {
            console.log('clicked:', this.mediaManager)
            this.mediaManager.onClick()
        },
        plugin: 'mediaManager',
    }),
    FroalaEditor.DefineIcon('mediaManager', {NAME: 'folder', SVG_KEY: 'imageManager'}),
    FroalaEditor.DefineIcon('mediaManagerInsert', {NAME: 'plus', SVG_KEY: 'add'}),
    FroalaEditor.DefineIcon('mediaManagerDelete', {NAME: 'trash', SVG_KEY: 'remove'})

// Define a quick insert button
FroalaEditor.RegisterQuickInsertButton('media', {
    // Icon name.
    icon: 'mediaManager',

    // Tooltip.
    title: 'Insert Media',

    // Input Button
    inputButton: null,

    // Console Messages
    debug: true,

    // Callback for the button.
    callback: function mediaManagerCallback () {
        this.inputButton = this.inputButton || new InputButtonPlugin({
            name: 'Media Manager',
            eventName: 'media-library',
            // Contextual `this` is equivalent to the editor instance
            editor: this,
            debug: this.debug
        })
        if (!this.el) {
            console.warn('mediaManager.onClick(): unable to find element')
            return
        }
        if (this.debug) {
            this.html.insert('<i>current cursor location!</i>')
        }
        this.inputButton.onClick(this.el)
    },

    // Save changes to undo stack.
    undo: true
})
