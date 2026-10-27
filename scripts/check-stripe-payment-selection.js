const assert = require('assert/strict')
const fs = require('fs')
const ts = require('typescript')
const vm = require('vm')
const { test } = require('node:test')
const source = fs.readFileSync('packages/stripe/src/payment-method-selector.component.ts', 'utf8')
const tree = ts.createSourceFile('selector.ts', source, ts.ScriptTarget.Latest, true)
const component = tree.statements.find(n => ts.isClassDeclaration(n))
const methods = component.members.filter(n => n.name && ['selectCreatedPaymentMethod', 'valueChanged'].includes(n.name.getText(tree)))
const context = {exports: {}, CustomEvent: class {}}
vm.runInNewContext(ts.transpileModule(`exports.Selector = class {${methods.map(n => n.getText(tree)).join('\n')}}`, {compilerOptions: {target: ts.ScriptTarget.ES2020}}).outputText, context)
const model = (id, status = 1) => ({get: key => ({id, status})[key]})
function fixture(models = []) {
    const selector = new context.exports.Selector()
    const fields = {}
    Object.assign(selector, {collection: {models}, fieldName: 'choice', fieldNameId: 'id',
        elementRef: {nativeElement: {dispatchEvent() {}}},
        form: {get: key => ({setValue: value => {fields[key] = value; if (key === 'choice') selector.valueChanged(value)}})}, refresh() {}})
    return {selector, fields}
}
test('saved card remains selectable while replica returns an empty list', () => {
    const {selector, fields} = fixture()
    const saved = model(557)
    selector.selectCreatedPaymentMethod(saved)
    assert.equal(fields.choice, saved)
    assert.equal(fields.id, 557)
    assert.equal(selector.collection.models.length, 1)
})
test('selects exact ID without relying on list order, name or email', () => {
    const saved = model(557), other = model(558)
    const {selector, fields} = fixture([saved, other])
    selector.selectCreatedPaymentMethod(model(557))
    assert.equal(fields.choice, saved)
    assert.equal(selector.collection.models.length, 2)
})
test('unverified or missing methods are not selected; deselection clears ID', () => {
    const {selector, fields} = fixture()
    selector.selectCreatedPaymentMethod(undefined)
    selector.selectCreatedPaymentMethod(model(558, 0))
    assert.equal(fields.choice, undefined)
    selector.valueChanged(model(557))
    selector.valueChanged(null)
    assert.equal(fields.id, null)
})

const paymentSource = fs.readFileSync('packages/stripe/src/payment-method.component.ts', 'utf8')
const paymentTree = ts.createSourceFile('payment.ts', paymentSource, ts.ScriptTarget.Latest, true)
const paymentClass = paymentTree.statements.find(n => ts.isClassDeclaration(n))
const save = paymentClass.members.find(n => n.name && n.name.getText(paymentTree) === 'saveCard')
function paymentFixture(failSave = false) {
    const emitted = []
    const errorElement = {textContent: ''}
    class Model {
        async save() {
            if (failSave) throw new Error('Write failed')
            this.data = {id: 557, status: 1}
        }
        get(key) { return this.data[key] }
    }
    const sandbox = {exports: {}, Model, isString: v => typeof v === 'string',
        document: {getElementById: () => errorElement}}
    vm.runInNewContext(ts.transpileModule(`exports.Payment = class {${save.getText(paymentTree)}}`, {
        compilerOptions: {target: ts.ScriptTarget.ES2020}
    }).outputText, sandbox)
    const payment = new sandbox.exports.Payment()
    Object.assign(payment, {isSubmittable: () => true, cardSaved: false,
        Stripe: {confirmSetup: async () => ({setupIntent: {status: 'succeeded', payment_method: 'test-pm'}}),
            fetchCollections: async () => {throw new Error('Replica unavailable')},
            emitManual: (...args) => emitted.push(args)}})
    return {payment, emitted, errorElement}
}
test('successful write still selects saved card when collection refresh fails', async () => {
    const {payment, emitted} = paymentFixture()
    await payment.saveCard()
    assert.equal(payment.cardSaved, true)
    assert.equal(payment.formPending, false)
    assert.equal(emitted.length, 1)
    assert.equal(emitted[0][3].get('id'), 557)
})
test('failed persistence does not show success or select a card and releases pending state', async () => {
    const {payment, emitted, errorElement} = paymentFixture(true)
    await payment.saveCard()
    assert.equal(payment.cardSaved, false)
    assert.equal(payment.formPending, false)
    assert.equal(emitted.length, 0)
    assert.match(errorElement.textContent, /Unable to save/)
})

const serviceSource = fs.readFileSync('packages/stripe/src/stripe.service.ts', 'utf8')
const serviceTree = ts.createSourceFile('service.ts', serviceSource, ts.ScriptTarget.Latest, true)
const serviceClass = serviceTree.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'StripeService')
const initialization = serviceClass.members.filter(n => n.name && ['initialize', 'waitForInitialization'].includes(n.name.getText(serviceTree)))
function serviceFixture(loadStripe) {
    const sandbox = {exports: {}, loadStripe, setTimeout, clearTimeout}
    vm.runInNewContext(ts.transpileModule(`exports.Service = class {${initialization.map(n => n.getText(serviceTree)).join('\n')}}`, {
        compilerOptions: {target: ts.ScriptTarget.ES2020}
    }).outputText, sandbox)
    return new sandbox.exports.Service()
}
test('opening payment form again reuses initialized Stripe without hanging', async () => {
    let calls = 0
    const service = serviceFixture(async () => {calls++; return {}})
    await service.initialize('test-key')
    await service.initialize('test-key')
    assert.equal(calls, 1)
    assert.equal(service.initialized, true)
})
test('simultaneous opens share initialization; failed initialization can retry', async () => {
    let calls = 0
    const service = serviceFixture(async () => {if (++calls === 1) throw new Error('Offline'); return {}})
    await assert.rejects(service.initialize('test-key'), /Offline/)
    assert.equal(service.initializing, false)
    await Promise.all([service.initialize('test-key'), service.initialize('test-key')])
    assert.equal(calls, 2)
    assert.equal(service.initialized, true)
})
