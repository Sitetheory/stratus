// Stratus Core
import {LooseFunction, LooseObject} from '@stratusjs/core/misc'
import {Extension} from '@codemirror/state'

// CodeMirror
import {basicSetup, EditorView} from 'codemirror'

// Data Type Interfaces
interface CodeMirrorPos {
    line: number,
    ch: number
}

/**
 * This provides bridged functionality for CodeMirror 6 in legacy implementations.
 */
interface CodeMirrorBridgeOptions {
    extensions?: Extension
}
export class CodeMirrorBridge {
    editorView: EditorView
    extensions?: Extension
    constructor(opts?: CodeMirrorBridgeOptions) {
        if (!opts || !(typeof opts === 'object')) {
            return
        }
        this.extensions = opts.extensions
    }
    fromTextArea(el: HTMLTextAreaElement, opts: LooseObject) {
        this.editorView = new EditorView({
            doc: el.value,
            extensions: this.extensions || [],
        })
        el.parentNode.insertBefore(this.editorView.dom, el)
        el.style.display = 'none'
        if (el.form) el.form.addEventListener('submit', () => {
            el.value = this.editorView.state.doc.toString()
        })
        return this
    }
    focus() {
        return this.editorView.focus()
    }
    refresh() {
        // TODO: Implement this, if we find a CodeMirror 6 equivalent or necessity.
        console.warn('CodeMirror Bridge has not implemented a refresh function.')
    }
    clearHistory() {
        // TODO: Implement this, if we find a CodeMirror 6 equivalent or necessity.
        console.warn('CodeMirror Bridge has not implemented a clearHistory function.')
    }
    on(event: string, func: LooseFunction) {
        // TODO: Implement this, if we find a CodeMirror 6 equivalent or necessity.
        console.warn('bind attempt:', {event, func})
        console.warn('CodeMirror Bridge has not implemented an on(event) function.')
    }
    setSize(width?: string|number, height?: string|number) {
        // TODO: Implement this, if we find a CodeMirror 6 equivalent or necessity.
        console.warn('CodeMirror Bridge has not implemented a setSize function.')
    }
    getValue() {
        return this.editorView.state.doc.toString()
    }
    setValue(html: string) {
        this.editorView.dispatch({
            changes: {from: 0, to: this.editorView.state.doc.length, insert: html}
        })
    }
    setSelection(start: CodeMirrorPos, end: CodeMirrorPos) {
        const posToOffset = (pos: CodeMirrorPos): number => {
            const doc = this.editorView.state.doc
            return doc.line(pos.line + 1).from + pos.ch
        }
        this.editorView.dispatch({
            selection: {
                anchor: posToOffset(start),
                head: posToOffset(end)
            }
        })
    }
    toTextArea() {
        // TODO: Implement this, if we find a CodeMirror 6 equivalent or necessity.
        console.warn('CodeMirror Bridge has not implemented a toTextArea function.')
    }
}
