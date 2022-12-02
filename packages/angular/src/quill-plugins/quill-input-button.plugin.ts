// Stratus Infrastructure
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    TriggerInterface
} from '../core/trigger.interface'

// External Dependencies
import _ from 'lodash'

// Quill
import Quill from 'quill'

// Universal Button
export class QuillInputButtonPlugin implements TriggerInterface {
    // Local
    uid: string

    // Settings
    debug = false
    buttonHTML = '<i class="fas fa-carrot"></i>'
    buttonTitle = 'Input Button'
    name = 'inputButton'
    eventName = 'input-button'

    // The quill parameter should be a type of Quill, but that doesn't appear to have the container attribute
    constructor(quill: any, options: any) {
        // Initialization
        this.uid = _.uniqueId(`quill_input_button_`)
        Stratus.Instances[this.uid] = this

        this.debug = options && options.debug

        // normalize options
        if (!options || typeof options !== 'object') {
            options = {}
        }
        this.buttonHTML = options.buttonHTML || this.buttonHTML
        this.buttonTitle = options.buttonTitle || this.buttonTitle
        this.name = options.name || this.name
        this.eventName = options.eventName || this.eventName

        // create toolbar module
        this.createToolbarModule(quill)
    }

    createToolbarModule(quill: any) {
        // Generate Toolbar Module
        // obtained from: https://github.com/benwinding/quill-html-edit-button
        const toolbarModule: any = quill.getModule('toolbar')
        if (!toolbarModule) {
            throw new Error(
                `quill.${this.name} requires the "toolbar" module`
            )
        }
        this.registerDivModule()

        // Create Container
        const toolbarEl: Element = toolbarModule.container
        const buttonContainer: HTMLSpanElement = document.createElement('span')
        buttonContainer.setAttribute('class', 'ql-formats')

        // Crete Button
        const button: HTMLButtonElement = document.createElement('button')
        button.innerHTML = this.buttonHTML
        button.title = this.buttonTitle
        button.onclick = (e: Event) => {
            e.preventDefault()
            this.onClick(quill)
        }
        buttonContainer.appendChild(button)
        toolbarEl.appendChild(buttonContainer)
    }

    registerDivModule() {
        // To allow divs to be inserted into html editor
        // obtained from issue: https://github.com/quilljs/quill/issues/2040
        const Block = Quill.import('blots/block')
        class Div extends Block {}
        Div.tagName = 'div'
        Div.blotName = 'div'
        Div.allowedChildren = Block.allowedChildren
        Div.allowedChildren.push(Block)
        Quill.register(Div)
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

    onClick(quill: any) {
        const container = quill.container
        const uid = this.findUID(container)
        const instance = this.getInstance(uid)
        if (!instance) {
            return
        }
        instance.trigger(this.eventName, null, this)
    }

    trigger(name: string, data: any, callee: TriggerInterface) {
        // This allows  us to handle data on the return
        if (this.debug) {
            console.log(`quill.${this.name}.trigger:`, name, data, callee)
        }
    }
}

// export default QuillInputButtonPlugin
// export { QuillInputButtonPlugin }
