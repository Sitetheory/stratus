const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const vm = require('node:vm')
const source = fs.readFileSync('packages/runtime/src/stratus.ts', 'utf8')
const ast = ts.createSourceFile('stratus.ts', source, ts.ScriptTarget.Latest, true)
const statement = ast.statements.find(node => ts.isExpressionStatement(node) &&
    ts.isBinaryExpression(node.expression) && node.expression.left.getText(ast) === 'Stratus.Internals.IsOnScreen')
assert(statement, 'Find the actual runtime function, not a copied implementation')
const code = ts.transpileModule(statement.getText(ast), {compilerOptions:{target:ts.ScriptTarget.ES2018}}).outputText
let root
function jQuery(element) { if (!(this instanceof jQuery)) return new jQuery(element); this[0] = element; this.length = 1 }
const context = {Stratus:{Internals:{},Environment:{get:()=>root}},jQuery,head:e=>e[0],window:{innerWidth:1280,innerHeight:720},document:{documentElement:{clientWidth:1280,clientHeight:720}}}
vm.runInNewContext(code, context)
const rect = (top,bottom,left=0,right=1280) => ({getBoundingClientRect:()=>({top,bottom,left,right})})
const visible = context.Stratus.Internals.IsOnScreen
root = rect(74,7979)
assert.equal(visible(rect(794,1729),0,true), false, 'Full document root must not admit below-fold modules')
assert.equal(visible(rect(100,500),0,true), true)
assert.equal(visible(rect(700,800),0,true), true)
assert.equal(visible(rect(700,800),0,false), false)
assert.equal(visible(rect(740,800),-50,true), true, 'Preserve intentional preload margin')
root = rect(100,500,100,600)
assert.equal(visible(rect(550,650),0,true), false, 'Nested scroller clips children')
assert.equal(visible(rect(150,250,150,250),0,false), true)
root = rect(800,1200)
assert.equal(visible(rect(850,950),0,true), false, 'Offscreen root has no visible area')
root = new jQuery(rect(74,7979))
assert.equal(visible(rect(800,900),0,true), false, 'Wrapped roots retain clipping')
root = context.window
assert.equal(visible(rect(100,200),0,true), true)
assert.equal(visible(rect(800,900),0,true), false)
console.log('PASS viewport clipping, nested/wrapped roots, partial/full visibility and preload offsets')
