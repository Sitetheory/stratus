const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const vm = require('node:vm')
const source = fs.readFileSync('packages/angularjs-extras/src/directives/onScreen.ts','utf8')
const ast = ts.createSourceFile('onScreen.ts',source,ts.ScriptTarget.Latest,true)
const statement = ast.statements.find(n=>ts.isExpressionStatement(n) && ts.isBinaryExpression(n.expression) && n.expression.left.getText(ast)==='Stratus.Directives.OnScreen')
const code = ts.transpileModule(statement.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2018}}).outputText
let callback, destroy, measurements=0, disconnected=false, timers=0
const classes = new Set()
const node = {}
const target = {0:node,length:1,hasClass:c=>classes.has(c),addClass:c=>c.split(' ').forEach(v=>classes.add(v)),removeClass:c=>c.split(' ').forEach(v=>classes.delete(v))}
const events = {}
const Stratus={Directives:{},Instances:{},Environment:{get:()=>null,on:(n,fn)=>events[n]=fn},Internals:{OnScroll:()=>{},IsOnScreen:()=>{measurements++;return false}}}
const context={Stratus,packageName:'extras',moduleName:'directives',directiveName:'onScreen',safeUniqueId:()=> 'test',Select:n=>({selection:n}),element:()=>target,hydrate:v=>v,isNumber:v=>typeof v==='number',isUndefined:v=>v===undefined,setTimeout:()=>{timers++},clearTimeout:()=>{},IntersectionObserver:class{constructor(fn){callback=fn}observe(n){assert.equal(n,node)}disconnect(){disconnected=true}}}
vm.runInNewContext(code,context)
Stratus.Directives.OnScreen({}).link({$on:(n,fn)=>{if(n==='$destroy')destroy=fn}},target,{})
assert(classes.has('off-screen'))
callback([{isIntersecting:true,intersectionRect:{width:100,height:100}}])
assert(classes.has('on-screen')&&classes.has('on-screen-init'))
callback([{isIntersecting:false,intersectionRect:{width:0,height:0}}])
assert(classes.has('off-screen')&&!classes.has('on-screen'))
callback([{isIntersecting:true,intersectionRect:{width:100,height:100}}])
assert(classes.has('on-screen'),'Reentry retriggers class-based animation')
events['change:viewPortChange']()
assert.equal(measurements,0,'Ordinary visibility must not synchronously measure layout')
assert.equal(timers,0,'Ordinary visibility needs no startup polling')
destroy();assert(disconnected)
console.log('PASS async visibility, exit/reentry, no layout polling, observer cleanup')
