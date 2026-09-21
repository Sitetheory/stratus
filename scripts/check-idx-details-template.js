const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const vm = require('vm')

const propertyDir = path.join(__dirname, '../packages/idx/src/property')
const source = ts.createSourceFile('details.component.ts', fs.readFileSync(path.join(propertyDir, 'details.component.ts'), 'utf8'), ts.ScriptTarget.Latest, true)
let resolver
function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'templateUrl') resolver = node.initializer.getText(source)
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(resolver, 'Details component must expose a template resolver')
const compiled = ts.transpileModule(`const resolveTemplate = ${resolver}`, {compilerOptions: {target: ts.ScriptTarget.ES2020}}).outputText
for (const min of ['', '.min']) {
  const context = vm.createContext({localDir: '/idx/property/', componentName: 'details', min})
  vm.runInContext(compiled, context)
  for (const [template, expected] of [[undefined, 'details.showcase'], ['', 'details.showcase'], ['details', 'details.showcase'], ...['showcase', 'luxury', 'cosmopolitan', 'compact'].map(name => [`details.${name}`, `details.${name}`])]) {
    context.attrs = {template}
    assert.equal(vm.runInContext('resolveTemplate(attrs)', context), `/idx/property/${expected}.component${min}.html`)
    assert.ok(fs.existsSync(path.join(propertyDir, `${expected}.component.html`)))
  }
}
assert.equal(fs.existsSync(path.join(propertyDir, 'details.component.html')), false, 'Legacy design must be removed')
console.log('IDX default/legacy alias resolve to Showcase; all four layouts preserved (normal and minified paths)')
