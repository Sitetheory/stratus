const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const source = fs.readFileSync('packages/runtime/src/stratus.ts', 'utf8')
const tree = ts.createSourceFile('stratus.ts', source, ts.ScriptTarget.Latest, true)
// Fail if any shipped runtime statement reintroduces token sync or its receiver.
for (const statement of tree.statements) {
    assert(!/SessionSync|PostMessage\.Convoy|Internals\.Auth\b|auth\.sitetheory\.io/.test(ts.transpileModule(statement.getText(tree), { compilerOptions: { removeComments: true } }).outputText))
}
const update = tree.statements.find(s => s.getText(tree).startsWith('Stratus.Internals.UpdateEnvironment ='))
assert(update, 'Preserve the same-domain environment updater')
const calls = []; const writes = []; const environment = []
let session = 'existing-session'
const context = {
    document: { cookie: 'SITETHEORY=existing-session' },
    cookie(value) { if (typeof value === 'object') writes.push(value); return session },
    forEach(items, callback) { items.forEach(callback) },
    Stratus: { Internals: { XHR: options => calls.push(options) }, Environment: { set: (...args) => environment.push(args) } }
}
vm.runInNewContext(ts.transpileModule(update.getText(tree), {
    compilerOptions: { target: ts.ScriptTarget.ES2020 }
}).outputText, context)
context.Stratus.Internals.UpdateEnvironment({ timezone: 'UTC' })
assert.equal(calls.length, 1)
assert.equal(calls[0].url, '/Api/Session')
assert.equal(calls[0].method, 'PUT')
assert(!calls[0].data.session && !calls[0].data.meta)
calls[0].success({ payload: { timezone: 'UTC' } })
assert.deepEqual(environment, [['timezone', 'UTC']])
assert.deepEqual(writes, [])
session = null
context.Stratus.Internals.UpdateEnvironment({ timezone: 'UTC' })
assert.equal(calls.length, 1, 'No session means no environment request')
console.log('PASS: no cross-domain SSO transport/receiver; same-origin environment request and response preserved')
