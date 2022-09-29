import {cookie} from '@stratusjs/core/environment'
import {Stratus} from '@stratusjs/runtime/stratus'
// Universal Button
import {
    InputButtonPlugin
} from '@stratusjs/angular/froala/plugins/inputButton'

// @ts-ignore
import FroalaEditor from 'froala-editor'


// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'citationManager'
const parentModuleName = 'froala/plugins'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

// Plugin Options
FroalaEditor.DEFAULTS = Object.assign(FroalaEditor.DEFAULTS, {
    endpoint: '/Api/Content'
})

/**
 * @param editor The Froala instance
 */
FroalaEditor.PLUGINS.citationManager = function citationManager (editor: any) {
    let inputButton: InputButtonPlugin

    const debug = true // needs false

    // When the plugin is initialized,this will be called.
    function _init() {
        Stratus.Internals.CssLoader(`${localDir}${parentModuleName}/${moduleName}${min}.css`)
        inputButton = new InputButtonPlugin({
            name: 'Citation Manager',
            eventName: 'citation-input',
            editor,
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
            console.warn('citationManager.onClick(): unable to find element')
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

// Insert Plugin to Image Insert TODO will not in the end
FroalaEditor.DEFAULTS.imageInsertButtons.push('citationManager')
FroalaEditor.RegisterCommand('citationManager', {
    title: 'Insert Citation',
    undo: false,
    focus: false,
    modal: true,
    callback(cmd: unknown, _val: unknown, _params: unknown) {
        // Store the selection/cursor location so that it can be used later when inserting by restoring it first
        // this.selection.save()

        const debug = false
        if (debug) {
            console.log('clicked:', this.citationManager)
        }
        this.citationManager.onClick()
    },
    plugin: 'citationManager',
})

// Define button icons
FroalaEditor.DefineIcon('citationManager', {NAME: 'folder', SVG_KEY: 'imageCaption'})
// See https://froala.com/wysiwyg-editor/docs/concepts/custom/icon/ for making new icons

// Define a quick insert button
FroalaEditor.RegisterQuickInsertButton('citation', {
    // Icon name.
    icon: 'citationManager',

    // Tooltip.
    title: 'Insert Citation',

    // Callback for the button.
    callback: function citationManagerCallback () {
        // console.warn('citationManagerCallback quickButton test')
        const debug = false
        const inputButton = new InputButtonPlugin({
            name: 'Citation Manager',
            eventName: 'citation-input',
            // Contextual `this` is equivalent to the editor instance
            editor: this,
            autoSaveSelection: true,
            autoRestoreSelection: true,
            debug
        })
        if (!this.el) {
            console.warn('citationManager.onClick(): unable to find element')
            return
        }
        inputButton.onClick(this.el)
    },

    // Save changes to undo stack.
    undo: true
})
