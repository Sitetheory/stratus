const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const {test} = require('node:test')
const source = fs.readFileSync('packages/angular/src/editor/editor.component.ts', 'utf8')
const tree = ts.createSourceFile('editor.ts', source, ts.ScriptTarget.Latest, true)
const editor = tree.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'EditorComponent')
const methods = ['applyIncomingValue', 'modelSave'].map(name => editor.members.find(n => n.name?.getText(tree) === name).getText(tree))
const context = {exports: {}, setTimeout: fn => fn(), console}
vm.runInNewContext(ts.transpileModule(`exports.Editor = class {${methods.join('\n')}}`, {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText, context)
function fixture() {
    const editor = new context.exports.Editor()
    const control = {value:'<p>Saved</p>', events:0, patchValue(value, options) {this.value=value;if(options?.emitEvent!==false)this.events++}}
    Object.assign(editor, {pendingLocalValue:null, focused:false, form:{get:()=>control}, ref:{detectChanges(){}}, refresh(){}, ensureFroalaHydration(){}, normalizeOut:v=>v, detectFroalaHydrationFailure:()=>false, froalaConfig:{useClasses:true}, debounceSave:true, property:'version.text', model:{completed:true,set(path,value){this.value=value}}})
    return {editor,control}
}
test('API hydration cannot overwrite text waiting for the editor debounce after blur',()=>{
    const {editor,control}=fixture()
    control.value='<p>Saved</p><p>New paragraph</p>'
    editor.pendingLocalValue=control.value
    editor.applyIncomingValue('<p>Saved</p>')
    assert.equal(control.value,editor.pendingLocalValue)
    editor.modelSave(control.value)
    assert.equal(editor.model.value,control.value)
    assert.equal(editor.pendingLocalValue,null)
    editor.applyIncomingValue(control.value)
    assert.equal(control.events,0)
})
test('intentional clearing is protected and saved',()=>{
    const {editor,control}=fixture();control.value='';editor.pendingLocalValue=''
    editor.applyIncomingValue('<p>Saved</p>');assert.equal(control.value,'')
    editor.modelSave('');assert.equal(editor.model.value,'')
})
test('clean model refresh hydrates without scheduling a write',()=>{
    const {editor,control}=fixture();editor.applyIncomingValue('<p>Server value</p>')
    assert.equal(control.value,'<p>Server value</p>');assert.equal(control.events,0)
})
