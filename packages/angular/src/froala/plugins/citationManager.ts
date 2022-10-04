import {cookie} from '@stratusjs/core/environment'
import {Stratus} from '@stratusjs/runtime/stratus'
import {extend} from 'lodash'
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

// Define toolbar template.
extend(FroalaEditor.POPUP_TEMPLATES,{
    'citationManager.toolbar': '[_BUTTONS_]'
})

// Define toolbar buttons.
extend(FroalaEditor.DEFAULTS,{
    citationToolbarButtons: ['citationEdit', 'citationDelete']
})

/*
 * @param editor The Froala instance
 */
FroalaEditor.PLUGINS.citationManager = function citationManager(editor: any) {
    let inputButton: InputButtonPlugin

    const debug = false

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
                instance: this
            })
        }

        // Editor methods
        // editor.methodName(params);

        // Event listeners
        editor.events.on('click', (clickEvent: MouseEvent) => {
            if (
                clickEvent.hasOwnProperty('target') &&
                // clickEvent.target.hasOwnProperty('nodeName') &&
                (clickEvent.target as Element).nodeName === 'STRATUS-CITATION'
            ) {
                const citation = getSelectedCitation() // If citation isn't fully grabbed, will not attempt
                if (citation) {
                    editor.citationManager.showToolbar(clickEvent, citation)
                }
            }
        })
    }

    function onClick() {
        if (!editor.el) {
            console.warn('citationManager.onClick(): unable to find element')
            return
        }
        inputButton.onClick(editor.el)
    }

    function getSelectedCitation(): Element | null {
        let containedElement = editor.selection.endElement()
        if (containedElement.tagName === 'STRATUS-CITATION') {
            // console.log('returning endElement', containedElement.tagName)
            return containedElement
        }

        // console.log('endElement was a ', containedElement.tagName, containedElement)
        containedElement = editor.selection.element()
        if (containedElement.tagName === 'STRATUS-CITATION') {
            // console.log('returning element', containedElement.tagName)
            return containedElement
        }

        // console.log('element was a ', containedElement.tagName, containedElement)
        // Check the parent just to be sure
        containedElement = containedElement.parentElement
        if (containedElement.tagName === 'STRATUS-CITATION') {
            // console.log('returning parent element', containedElement.tagName)
            return containedElement
        }
        // console.log('parent element was a ', containedElement.tagName, containedElement, 'returning nothing')

        return null
    }

    function getLastKnownCitation() {
        // console.log('returning last citation', editor.citationManager.lastCitation)
        return editor.citationManager.lastCitation || null
    }

    function setLastKnownCitation(el: Element | null) {
        // console.log('setting last citation to', el)
        editor.citationManager.lastCitation = el
    }

    // Create custom inline toolbar.
    function initToolbar() {
        // Toolbar buttons.
        let citationToolbarButtons = ''
        // Create the list of buttons.
        if (editor.opts.citationToolbarButtons.length > 1) {
            citationToolbarButtons += '<div class="fr-buttons">'
            citationToolbarButtons += editor.button.buildList(editor.opts.citationToolbarButtons)
            citationToolbarButtons += '</div>'
        }
        // Load popup template.
        const template = {
            buttons: citationToolbarButtons
        }
        // Create popup.
        return editor.popups.create('citationManager.toolbar', template)
    }

    // Show the toolbar
    function showToolbar(clickEvent: MouseEvent, citation: Element) {
        // Get the popup object defined above.
        const popup = editor.popups.get('citationManager.toolbar')
        // If popup doesn't exist then create it.
        // To improve performance it is best to create the popup when it is first needed
        // and not when the editor is initialized.
        if (!popup) initToolbar()

        // Set the editor toolbar as the popup's container.
        editor.popups.setContainer('citationManager.toolbar', editor.$tb)
        // This will trigger the refresh event assigned to the popup.
        // editor.popups.refresh('citationManager.toolbar');
        // This custom popup is opened by pressing a button from the editor's toolbar.
        // Get the button's object in order to place the popup relative to it.
        const btn = editor.$tb.find('.fr-command[data-cmd="myButton"]')
        // Set the popup's position.
        const left = clickEvent.pageX
        const top = clickEvent.pageY
        // Show the custom toolbar.
        // The button's outerHeight is required in case the popup needs to be displayed above it.
        editor.popups.show('citationManager.toolbar', left, top, btn.outerHeight())
        editor.citationManager.setLastKnownCitation(citation)
    }

    // Hide the custom popup.
    function hideToolbar() {
        editor.citationManager.setLastKnownCitation(null)
        editor.popups.hide('citationManager.toolbar')
    }

    // Expose public methods.
    // Public methods can be accessed through the editor API:
    // editor.myPlugin.publicMethod();
    return {
        // If _init is not public then the plugin won't be initialized.
        _init,
        onClick,
        showToolbar,
        hideToolbar,
        getSelectedCitation,
        getLastKnownCitation,
        setLastKnownCitation
    }
}
export type CitationManager = {
    hideToolbar(): void
    showToolbar(): void
    getSelectedCitation(): Element | null
    getLastKnownCitation(): Element | null
    setLastKnownCitation(el: Element | null): void
}

FroalaEditor.DefineIcon('citationDelete',{NAME: 'citationDelete', SVG_KEY: 'remove'})
FroalaEditor.RegisterCommand('citationDelete', {
    title: 'Delete Citation',
    undo: false,
    focus: false,
    callback() {
        /// only grab the selectedCitation
        const containedElement = this.citationManager.getSelectedCitation()
        if (containedElement) {
            (containedElement as Element).remove()
        }
        this.citationManager.hideToolbar()
    }
})

// Define button icons
FroalaEditor.DefineIcon('citationManager', {NAME: 'citationManager', SVG_KEY: 'imageCaption'})
// See https://froala.com/wysiwyg-editor/docs/concepts/custom/icon/ for making new icons

// Define a insert button
FroalaEditor.RegisterCommand('citationInsert', {
    icon: 'citationManager',
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

// Define a edit button
FroalaEditor.RegisterCommand('citationEdit', {
    icon: 'citationManager',
    title: 'Edit Citation',
    undo: false,
    focus: false,
    modal: true,
    callback(cmd: unknown, _val: unknown, _params: unknown) {
        const debug = false
        if (debug) {
            console.log('clicked:', this.citationManager)
        }
        this.citationManager.onClick()
    },
    plugin: 'citationManager',
})



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
