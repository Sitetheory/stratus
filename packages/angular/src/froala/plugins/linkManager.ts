// Universal Button
import {
    InputButtonPlugin
} from './inputButton'

// Link Dialog
import {
    Link
} from '../../editor/link-dialog.component'

// Stratus Core
import {
    cookie
} from '@stratusjs/core/environment'
import {
    isJSON,
    LooseObject
} from '@stratusjs/core/misc'

// Stratus Runtime
import {
    Stratus
} from '@stratusjs/runtime/stratus'

// External Dependencies
import {
    uniqueId
} from 'lodash'

// @ts-ignore
import FroalaEditor from 'froala-editor'

// Plugin Options
FroalaEditor.DEFAULTS = Object.assign(FroalaEditor.DEFAULTS, {
    endpoint: '/Api/Content'
})

/**
 * @param editor The Froala instance
 */
FroalaEditor.PLUGINS.linkManager = function linkManager (editor: any) {
    // Local Variables
    let inputButton: InputButtonPlugin

    const debugCookie = cookie('debug-link-manager')
    const debug = !!(isJSON(debugCookie) ? JSON.parse(debugCookie) : false)

    // When the plugin is initialized,this will be called.
    function _init() {
        // Set UID
        this.uid = uniqueId(`froala_link_manager_`)
        Stratus.Instances[this.uid] = this

        // Create Input Button
        inputButton = new InputButtonPlugin<Link>({
            name: 'Link Manager',
            eventName: 'link-library',
            editor,
            insert: (link: Link) => {
                const attrs: LooseObject = {}
                if (link.id) {
                    attrs['data-content-id'] = link.id
                }
                if (link.target) {
                    attrs.target = '_blank'
                }
                editor.link.insert(link.url, link.text, attrs)
            },
            // Note: We use Custom Bindings for this via this.insert()
            autoSaveSelection: true,
            // maintainSnapshot: true,
            autoRestoreSelection: true,
            // maintainSelection: false,
            debug
        })

        // Hoist Local Variables to Scope (Useful for Debugging)
        this.inputButton = inputButton
        this.editor = editor

        if (debug) {
            // Output to Console
            console.log('initialized:', {
                options: editor.opts.endpoint,
                instance: this,
                inputButton: inputButton.uid,
            })
        }

        // Editor methods
        // editor.methodName(params);

        // Event listeners
        // editor.events.add('contentChanged', function (params) {});
    }

    function onClick(el?: HTMLElement, data?: any) {
        if (!editor.el) {
            console.warn('linkManager.onClick(): unable to find element')
            return
        }
        const link = editor.link.get()
        if (debug) {
            console.log('[linkManager.onClick()]:', link)
        }
        inputButton.onClick(editor.el, link)
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
// TODO: Register a linkManagerEdit button pointed to the edit svg
FroalaEditor.RegisterCommand('linkManager', {
    title: 'Insert from Link Library',
    undo: false,
    focus: true,
    modal: true,
    // refreshAfterCallback: false,
    refreshOnCallback: false,
    callback() {
        // console.log('linkManager callback initiated!', this.link)
        // console.log('selection:', this.selection.isCollapsed(), this.selection, this.$el)
        this.linkManager.onClick()
    },
    plugin: 'linkManager',
}),
FroalaEditor.DefineIcon('linkManager', {NAME: 'folder', SVG_KEY: 'insertLink'}),

// Link Edit Icon
FroalaEditor.RegisterCommand('linkManagerEdit', {
    title: 'Edit Link',
    undo: false,
    focus: false,
    modal: true,
    callback() {
        // TODO: Review the Quick Insert command to determine if this needs the same logic changes as the toolbar button
        // console.log('linkManagerEdit callback initiated!', this.link)
        this.linkManager.onClick(undefined, this.link.get())
    },
    plugin: 'linkManager',
}),
FroalaEditor.DefineIcon('linkManagerEdit', {NAME: 'edit', SVG_KEY: 'edit'}),

// Other Icons
FroalaEditor.DefineIcon('linkManagerInsert', {NAME: 'plus', SVG_KEY: 'add'}),
FroalaEditor.DefineIcon('linkManagerDelete', {NAME: 'trash', SVG_KEY: 'remove'})

// Define a quick insert button
FroalaEditor.RegisterQuickInsertButton('link', {
    // Icon name.
    icon: 'linkManager',

    // Tooltip.
    title: 'Insert from Link Library',

    // Callback for the button.
    callback: function linkManagerCallback () {
        const debugCookie = cookie('debug-link-manager-quick-insert')
        const debug = !!(isJSON(debugCookie) ? JSON.parse(debugCookie) : false)
        const inputButton = new InputButtonPlugin<Link>({
            name: 'Link Manager',
            eventName: 'link-library',
            // Contextual `this` is equivalent to the editor instance
            editor: this,
            insert: (link: Link) => {
                this.link.insert(link.url, '', {'aria-label': link.title})
            },
            autoSaveSelection: true,
            // maintainSnapshot: false,
            autoRestoreSelection: true,
            // maintainSelection: true,
            debug
        })
        if (!this.el) {
            console.warn('linkManager.onClick(): unable to find element')
            return
        }
        inputButton.onClick(this.el)
    },

    // Save changes to undo stack.
    undo: true
})
