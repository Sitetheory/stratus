// Universal Button
import {
    InputButtonPlugin
} from './inputButton'

// @ts-ignore
import FroalaEditor from 'froala-editor'

// Plugin Options
FroalaEditor.DEFAULTS = Object.assign(FroalaEditor.DEFAULTS, {
    // endpoint: '/Api/Foo'
})

/**
 * @param editor The Froala instance
 *
 * Note: This is a basic button stub using the universal input button
 *       that will be expanded upon as I build out the menu properly.
 */
FroalaEditor.PLUGINS.menuButton = function menuButton (editor: any) {
    let inputButton: InputButtonPlugin

    const debug = false

    // When the plugin is initialized,this will be called.
    function _init() {
        inputButton = new InputButtonPlugin({
            name: 'Menu Button',
            eventName: 'menu-button',
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
            console.warn('menuButton.onClick(): unable to find element')
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
// FIXME: This needs to ensure menuButtons exists!  can't push to undefined!!!
if (FroalaEditor.DEFAULTS) {
    if (typeof FroalaEditor.DEFAULTS.menuButtons === 'undefined') {
        FroalaEditor.DEFAULTS.menuButtons = []
    }
    FroalaEditor.DEFAULTS.menuButtons.push('menuButton')
}
FroalaEditor.RegisterCommand('menuButton', {
    title: 'Insert from Menu Button',
    undo: false,
    focus: false,
    modal: false,
    refreshAfterCallback: true,
    callback() {
        const debug = false
        if (debug) {
            console.log('clicked:', this.menuButton)
        }
        this.menuButton.onClick()
    },
    plugin: 'menuButton',
})
FroalaEditor.DefineIcon('menuButton', {NAME: 'folder', SVG_KEY: 'imageManager'})
FroalaEditor.DefineIcon('menuButtonInsert', {NAME: 'plus', SVG_KEY: 'add'})
FroalaEditor.DefineIcon('menuButtonDelete', {NAME: 'trash', SVG_KEY: 'remove'})

// Define a quick insert button
FroalaEditor.RegisterQuickInsertButton('menu', {
    // Icon name.
    icon: 'menuButton',

    // Tooltip.
    title: 'Insert from Menu Button',

    // Callback for the button.
    callback: function menuButtonCallback () {
        const debug = false
        const inputButton = new InputButtonPlugin({
            name: 'Menu Button',
            eventName: 'menu-button',
            // Contextual `this` is equivalent to the editor instance
            editor: this,
            debug
        })
        if (!this.el) {
            console.warn('menuButton.onClick(): unable to find element')
            return
        }
        inputButton.onClick(this.el)
    },

    // Save changes to undo stack.
    undo: true
})
