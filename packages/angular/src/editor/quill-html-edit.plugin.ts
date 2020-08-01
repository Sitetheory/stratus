// Original Button forked from: https://github.com/benwinding/quill-html-edit-button

// TODO: Remove this when we have a better replacement

// import './styles.css'

import Quill from 'quill'

function $create(elName: any) {
    return document.createElement(elName)
}
function $setAttr(el: any, key: any, value: any) {
    return el.setAttribute(key, value)
}

let debug: any = false
const Logger: any = {
    prefixString() {
        return `</> quill-html-edit-button: `
    },
    get log() {
        if (!debug) {
            return () => {}
        }
        const boundLogFn: any = console.log.bind(console, this.prefixString())
        return boundLogFn
    }
}

class QuillHtmlEditPlugin {
    constructor(quill: any, options: any) {
        debug = options && options.debug
        Logger.log('logging enabled')
        // Add button to all quill toolbar instances
        const toolbarModule: any = quill.getModule('toolbar')
        if (!toolbarModule) {
            throw new Error(
                'quill.htmlEditButton requires the "toolbar" module to be included too'
            )
        }
        this.registerDivModule()
        const toolbarEl: any = toolbarModule.container
        const buttonContainer: any = $create('span')
        $setAttr(buttonContainer, 'class', 'ql-formats')
        const button: any = $create('button')
        button.innerHTML = options.buttonHTML || '&lt;&gt;'
        button.title = options.buttonTitle || 'Show HTML source'
        button.onclick = (e: any) => {
            e.preventDefault()
            launchPopupEditor(quill, options)
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
}

function launchPopupEditor(quill: any, options: any) {
    const htmlFromEditor: any = quill.container.querySelector('.ql-editor').innerHTML
    const popupContainer: any = $create('div')
    const overlayContainer: any = $create('div')
    const msg: any = options.msg || 'Edit HTML here, when you click "OK" the quill editor\'s contents will be replaced'
    const cancelText: any = options.cancelText || 'Cancel'
    const okText: any = options.okText || 'Ok'

    $setAttr(overlayContainer, 'class', 'ql-html-overlayContainer')
    $setAttr(popupContainer, 'class', 'ql-html-popupContainer')
    const popupTitle: any = $create('i')
    $setAttr(popupTitle, 'class', 'ql-html-popupTitle')
    popupTitle.innerText = msg
    const textContainer: any = $create('div')
    textContainer.appendChild(popupTitle)
    $setAttr(textContainer, 'class', 'ql-html-textContainer')
    const textArea: any = $create('textarea')
    $setAttr(textArea, 'class', 'ql-html-textArea')
    textArea.value = formatHTML(htmlFromEditor)
    const buttonCancel: any = $create('button')
    buttonCancel.innerHTML = cancelText
    $setAttr(buttonCancel, 'class', 'ql-html-buttonCancel')
    const buttonOk: any = $create('button')
    buttonOk.innerHTML = okText
    const buttonGroup: any = $create('div')
    $setAttr(buttonGroup, 'class', 'ql-html-buttonGroup')

    buttonGroup.appendChild(buttonCancel)
    buttonGroup.appendChild(buttonOk)
    textContainer.appendChild(textArea)
    textContainer.appendChild(buttonGroup)
    popupContainer.appendChild(textContainer)
    overlayContainer.appendChild(popupContainer)
    document.body.appendChild(overlayContainer)

    buttonCancel.onclick = () => {
        document.body.removeChild(overlayContainer)
    }
    overlayContainer.onclick = buttonCancel.onclick
    popupContainer.onclick = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
    }
    buttonOk.onclick = () => {
        const output: any = textArea.value.split(/\r?\n/g).map((el: any) => el.trim())
        const noNewlines: any = output.join('')
        quill.container.querySelector('.ql-editor').innerHTML = noNewlines
        document.body.removeChild(overlayContainer)
    }
}

// Adapted FROM jsfiddle here: https://jsfiddle.net/buksy/rxucg1gd/
function formatHTML(code: any) {
    'use strict'
    const stripWhiteSpaces: any = true
    const stripEmptyLines: any = true
    const whitespace: any = ' '.repeat(2) // Default indenting 4 whitespaces
    let currentIndent: any = 0
    const newlineChar: any = '\n'
    let char: any = null
    let nextChar: any = null

    let result: any = ''
    for (let pos: any = 0; pos <= code.length; pos++) {
        char = code.substr(pos, 1)
        nextChar = code.substr(pos + 1, 1)

        const isBrTag: any = code.substr(pos, 4) === '<br>'
        const isOpeningTag: any = char === '<' && nextChar !== '/' && !isBrTag
        const isClosingTag: any = char === '<' && nextChar === '/' && !isBrTag
        if (isBrTag) {
            // If opening tag, add newline character and indention
            result += newlineChar
            currentIndent--
            pos += 4
        }
        if (isOpeningTag) {
            // If opening tag, add newline character and indention
            result += newlineChar + whitespace.repeat(currentIndent)
            currentIndent++
        } else if (isClosingTag) {
            // If there're more closing tags than opening
            if (--currentIndent < 0) { currentIndent = 0 }
            result += newlineChar + whitespace.repeat(currentIndent)
        } else if (stripWhiteSpaces === true && char === ' ' && nextChar === ' ') {
            char = ''
 } else if (stripEmptyLines === true && char === newlineChar) {
            // debugger;
            if (code.substr(pos, code.substr(pos).indexOf('<')).trim() === '') {
                char = ''
            }
        }

        result += char
    }
    Logger.log('formatHTML', {
        before: code,
        after: result
    })
    return result
}

// AMD Setup
// window.QuillHtmlEdit = QuillHtmlEdit
// module.exports = QuillHtmlEdit

// TypeScript Setup
export default QuillHtmlEditPlugin
export { QuillHtmlEditPlugin }
