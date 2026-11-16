// Toolbar buttons for code: a code block (<pre>) and inline code (<code>)

// @ts-ignore
import FroalaEditor from 'froala-editor'

FroalaEditor.DefineIcon('codeBlock', {NAME: '{ }', template: 'text'})
FroalaEditor.RegisterCommand('codeBlock', {
    title: 'Code Block',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback() {
        const block = this.selection.blocks()[0]
        this.paragraphFormat.apply(block && block.tagName === 'PRE' ? 'N' : 'PRE')
    },
    refresh($btn: any) {
        const block = this.selection.blocks()[0]
        $btn.toggleClass('fr-active', !!block && block.tagName === 'PRE')
    }
})

FroalaEditor.DefineIcon('inlineCode', {NAME: '`c`', template: 'text'})
FroalaEditor.RegisterCommand('inlineCode', {
    title: 'Inline Code',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback() {
        this.format.toggle('code')
    },
    refresh($btn: any) {
        $btn.toggleClass('fr-active', this.format.is('code'))
    }
})
