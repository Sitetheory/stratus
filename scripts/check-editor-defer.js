// Exercise the actual editor methods with a deterministic clock, without Froala/DOM.
const assert = require('assert/strict')
const fs = require('fs')
const ts = require('typescript')
const vm = require('vm')
const { test } = require('node:test')
const source = fs.readFileSync('packages/angular/src/editor/editor.component.ts', 'utf8')
const tree = ts.createSourceFile('editor.ts', source, ts.ScriptTarget.Latest, true)
const editor = tree.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'EditorComponent')
const names = ['clearDataRetry', 'scheduleDataRetry', 'dataDefer', 'ngOnDestroy']
const methods = editor.members.filter(n => n.name && names.includes(n.name.getText(tree))).map(n => n.getText(tree))
assert.equal(methods.length, names.length)
const compiled = ts.transpileModule(`class Base { ngOnDestroy() {} }
exports.Editor = class extends Base { ${methods.join('\n')} }`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
}).outputText
function fixture() {
    const tasks = new Map()
    const warnings = []
    const values = []
    let serial = 0
    const context = { exports: {}, _: { clone: v => v }, console: { warn: (...v) => warnings.push(v) },
        setTimeout: fn => { tasks.set(++serial, fn); return serial }, clearTimeout: id => tasks.delete(id) }
    vm.runInNewContext(compiled, context)
    const instance = new context.exports.Editor()
    Object.assign(instance, { dataRetryCount: 0, destroyed: false, dataBindingFailed: false,
        dataReady: false, froalaConfig: {}, uid: 'test', dev: true,
        dataRef() { return this.incomingData = this.value || '' } })
    const subscriber = { closed: false, next: value => values.push(value) }
    const tick = () => { const next = tasks.entries().next().value; if (next) { tasks.delete(next[0]); next[1]() } }
    return { instance, subscriber, tasks, warnings, values, tick }
}
test('retries are bounded and late data can recover', () => {
    const f = fixture()
    for (let i = 0; i < 50; i++) f.instance.dataDefer(f.subscriber)
    assert.equal(f.tasks.size, 1, 'concurrent requests share one retry')
    for (let i = 0; i < 120; i++) f.tick()
    assert.equal(f.tasks.size, 0, 'unavailable data stops polling after 30 seconds')
    assert.equal(f.warnings.length, 1, 'one diagnostic rather than repeated warnings')
    assert.deepEqual(f.values, [], 'missing data is not emitted as empty saved content')
    f.instance.model = { completed: true }
    f.instance.value = 'Loaded after timeout'
    f.instance.dataDefer(f.subscriber)
    assert.deepEqual(f.values, ['Loaded after timeout'], 'late model event recovers after timeout')
})
for (const value of ['', 'Existing content']) {
    const f = fixture()
    f.instance.dataDefer(f.subscriber)
    f.tick()
    f.instance.model = { completed: true }
    f.instance.value = value
    f.tick()
    assert.deepEqual(f.values, [value], 'loaded empty and nonempty values both hydrate')
    assert.equal(f.tasks.size, 0)
    f.instance.dataReady = true
    f.instance.dataDefer(f.subscriber)
    assert.equal(f.values.length, 1, 'unchanged data does not emit again')
}
test('a subscriber arriving cancels its pending retry', () => {
    const f = fixture()
    f.instance.dataDefer(undefined)
    assert.equal(f.tasks.size, 1)
    f.instance.model = { completed: true }
    f.instance.dataDefer(f.subscriber)
    assert.equal(f.tasks.size, 0, 'subscriber arriving clears previous retry')
})
test('destruction cancels retries and removes only its listener', () => {
    const f = fixture()
    let unsubscribed = false
    const own = () => {}
    const other = () => {}
    f.instance.dataChangeHandler = own
    f.instance.dataChangeSource = { listeners: { change: [{ method: own }, { method: other }] } }
    f.instance.dataSubscription = { unsubscribe: () => { unsubscribed = true } }
    f.instance.dataDefer(f.subscriber)
    f.instance.ngOnDestroy()
    f.instance.dataDefer(f.subscriber)
    assert.equal(f.tasks.size, 0, 'destroyed editor cannot schedule retries')
    assert.equal(unsubscribed, true)
    assert.equal(f.instance.dataChangeSource.listeners.change.length, 1)
    assert.equal(f.instance.dataChangeSource.listeners.change[0].method, other)
})
test('closed subscribers stop retrying', () => {
    const f = fixture()
    f.instance.dataDefer(f.subscriber)
    f.subscriber.closed = true
    f.tick()
    assert.equal(f.tasks.size, 0, 'closed subscriber stops retries')
})
test('failed bindings do not poll', () => {
    const f = fixture()
    f.instance.dataBindingFailed = true
    f.instance.dataDefer(f.subscriber)
    assert.equal(f.tasks.size, 0, 'failed binding does not poll')
})
console.log('Editor defer lifecycle regression checks passed')
