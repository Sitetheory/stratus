import Quill from 'quill'
import {
    cookie
} from '@stratusjs/core/environment'

const Delta = Quill.import('delta')
const Break = Quill.import('blots/break')
const Embed = Quill.import('blots/embed')

const lineBreakMatcher = () => {
    const newDelta = new Delta()
    newDelta.insert({ break: '' })
    return newDelta
}

export class QuillBreak extends Break {
    length() {
        return 1
    }
    value() {
        return '\n'
    }

    insertInto(parent: any, ref: any) {
        if (cookie('env')) {
            console.log('insertInto:', parent, ref)
        }
        Embed.prototype.insertInto.call(this, parent, ref)
    }
}

QuillBreak.blotName = 'break'
QuillBreak.tagName = 'BR'
