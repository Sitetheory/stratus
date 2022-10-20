// Universal Button
import {
    InputButtonPlugin
} from '@stratusjs/angular/froala/plugins/inputButton'
import {
    MediaEmbed
} from '@stratusjs/angular/editor/media-dialog.component'

// @ts-ignore
import FroalaEditor from 'froala-editor'

// Plugin Options
FroalaEditor.DEFAULTS = Object.assign(FroalaEditor.DEFAULTS, {
    endpoint: '/Api/Media'
})

/**
 * @param editor The Froala instance
 */
FroalaEditor.PLUGINS.mediaManager = function mediaManager (editor: any) {
    let inputButton: InputButtonPlugin

    // const imagePlugin = FroalaEditor.PLUGINS.image(editor)
    const debug = false

    // When the plugin is initialized,this will be called.
    function _init() {
        inputButton = new InputButtonPlugin<MediaEmbed>({
            name: 'Media Manager',
            eventName: 'media-library',
            editor,
            insert: (media: MediaEmbed) => {
                // if (media.type === 'image') {
                //     imagePlugin.insert(media.url, true, media.attrs)
                // } else {
                //     editor.html.insert(media.html)
                // }
                editor.html.insert(media.html)
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
        title: 'Insert from Media Library',
        undo: false,
        focus: false,
        modal: true,
        callback() {
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
    title: 'Insert from Media Library',

    // Callback for the button.
    callback: function mediaManagerCallback () {
        const debug = false
        const inputButton = new InputButtonPlugin<MediaEmbed>({
            name: 'Media Manager',
            eventName: 'media-library',
            // Contextual `this` is equivalent to the editor instance
            editor: this,
            insert: (media: MediaEmbed) => {
                // console.log('media to insert directly:', media)
                this.html.insert(media.html)
            },
            autoSaveSelection: true,
            autoRestoreSelection: true,
            debug
        })
        if (!this.el) {
            console.warn('mediaManager.onClick(): unable to find element')
            return
        }
        inputButton.onClick(this.el)
    },

    // Save changes to undo stack.
    undo: true
})
