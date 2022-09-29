// Universal Button
import {
    InputButtonPlugin
} from '@stratusjs/angular/froala/plugins/inputButton'
import {
    Link
} from '@stratusjs/angular/editor/link-dialog.component'

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
    let inputButton: InputButtonPlugin

    const debug = false

    // When the plugin is initialized,this will be called.
    function _init() {
        inputButton = new InputButtonPlugin<Link>({
            name: 'Link Manager',
            eventName: 'link-library',
            editor,
            insert: (link: Link) => {
                FroalaEditor.PLUGINS.link(editor).insert(link.url, '', {'aria-label': link.title})
            },
            autoSaveSelection: true,
            autoRestoreSelection: true,
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
            console.warn('linkManager.onClick(): unable to find element')
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
// FroalaEditor.DEFAULTS.imageInsertButtons.push('linkManager')
FroalaEditor.RegisterCommand('linkManager', {
    title: 'Insert from Link Library',
    undo: false,
    focus: false,
    modal: true,
    callback() {
        // debug info (move variable elsewhere)
        const debug = false
        if (debug) {
            console.log('clicked:', this.linkManager)
        }
        // testing selection saving at earlier point to avoid loss of data
        // this.selection.save()
        // initiate click
        this.linkManager.onClick()
    },
    plugin: 'linkManager',
}),
FroalaEditor.DefineIcon('linkManager', {NAME: 'folder', SVG_KEY: 'insertLink'}),
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
        const debug = false
        const inputButton = new InputButtonPlugin<Link>({
            name: 'Link Manager',
            eventName: 'link-library',
            // Contextual `this` is equivalent to the editor instance
            editor: this,
            insert: (link: Link) => {
                FroalaEditor.PLUGINS.link(this).insert(link.url, '', {'aria-label': link.title})
            },
            autoSaveSelection: true,
            autoRestoreSelection: true,
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
