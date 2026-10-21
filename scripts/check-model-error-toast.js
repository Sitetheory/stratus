const assert = require('assert/strict')
const fs = require('fs')
const ts = require('typescript')
const vm = require('vm')
const { test } = require('node:test')
const source = fs.readFileSync('packages/angularjs/src/services/model.ts', 'utf8')
const tree = ts.createSourceFile('model.ts', source, ts.ScriptTarget.Latest, true)
const model = tree.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'Model')
const names = ['fetch', 'doSave', 'destroy']
const methods = model.members.filter(n => n.name && names.includes(n.name.getText(tree))).map(n => n.getText(tree))
assert.equal(methods.length, names.length)
const compiled = ts.transpileModule(`exports.Model = class { ${methods.join('\n')} }`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
}).outputText
for (const method of names) {
    for (const enabled of [true, false]) {
        test(`${method}: error toast ${enabled ? 'enabled' : 'disabled'}, rejection preserved`, async () => {
            const notifications = []
            const failure = new Error('Maximum of 3 articles reached')
            const context = { exports: {}, console: { error() {} }, isObject: v => typeof v === 'object',
                has: (v, k) => Object.hasOwn(v, k), isEmpty: v => !v || !Object.keys(v).length,
                getPreferredStatusMessage: () => 'Quota reached', isRetryableTransientWrite: () => false,
                Toastify: options => ({ showToast: () => notifications.push(options.text) }) }
            vm.runInNewContext(compiled, context)
            const instance = new context.exports.Model()
            Object.assign(instance, { toast: true, errorToast: enabled, target: 'Content',
                meta: { get() { return {} }, data: {} }, sync: () => Promise.reject(failure),
                resetXHRFlags() {}, errorMessage: () => failure.message, isNew: () => false,
                getIdentifier: () => 1, toJSON: () => ({}) })
            await assert.rejects(instance[method](), error => error === failure)
            assert.equal(instance.error, true)
            assert.equal(notifications.length, enabled ? 1 : 0)
        })
    }
}
