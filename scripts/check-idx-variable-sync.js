const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const ts = require('typescript')
const _ = require('lodash')
const {JSDOM} = require('jsdom')
const dom = new JSDOM('<!doctype html><body></body>', {runScripts: 'outside-only'})
dom.window.eval(fs.readFileSync(require.resolve('angular/angular'), 'utf8'))
const angular = dom.window.angular
const Stratus = {Directives: {}, Instances: {}}
const isJSON = value => {try {JSON.parse(value); return true} catch (_) {return false}}
const directive = fs.readFileSync(path.join(__dirname, '../packages/angularjs-extras/src/directives/jsonToObject.ts'), 'utf8')
vm.runInNewContext(ts.transpileModule(directive, {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText, {
  exports: {}, require: name => name === 'lodash' ? _ : name.includes('runtime') ? {Stratus} : {isJSON, safeUniqueId: () => 'test'}
})
angular.module('syncTest', []).directive('stratusJsonToObject', Stratus.Directives.JsonToObject)
const injector = angular.injector(['ng', 'syncTest'])
const source = ts.createSourceFile('search.component.ts', fs.readFileSync(path.join(__dirname, '../packages/idx/src/property/search.component.ts'), 'utf8'), ts.ScriptTarget.Latest, true)
let syncCode
function visit(node) {
  if (ts.isExpressionStatement(node) && node.getText(source).startsWith('$scope.variableSync =')) syncCode = node.getText(source)
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(syncCode)
syncCode = ts.transpileModule(syncCode, {compilerOptions: {target: ts.ScriptTarget.ES2020}}).outputText
const fields = {filter: 'options.query.where', service: 'options.query.service', sort: 'options.query.order', office: 'options.officeGroups'}
async function fixture(saved, syncOnInit = false) {
  const scope = injector.get('$rootScope').$new()
  scope.saved = _.cloneDeep(saved)
  scope.options = {query: {where: {}, service: []}, officeGroups: []}
  scope.setWhere = where => {where.ListingType ??= []; where.Status ??= []}
  const host = angular.element('<div><textarea id="filter" ng-model="saved.filter" stratus-json-to-object></textarea><textarea id="service" ng-model="saved.service" stratus-json-to-object></textarea><input id="sort" ng-model="saved.sort" ng-change="saved.sort = saved.sort === \'\' ? null : saved.sort"><textarea id="office" ng-model="saved.office" stratus-json-to-object></textarea></div>')
  injector.get('$compile')(host)(scope)
  scope.$digest()
  let changes = 0
  for (const el of host[0].querySelectorAll('input,textarea')) el.addEventListener('change', () => changes++)
  const Idx = {
    getInput: id => angular.element(host[0].querySelector('#' + id)),
    updateScopeValuePath: async (target, key, value) => {
      if (value == null || value === 'null' || value === '') return false
      _.set(target, key, isJSON(value) ? JSON.parse(value) : value)
    }
  }
  const $q = executor => new Promise(executor)
  $q.all = promises => Promise.all(promises)
  new Function('$scope', '$attrs', 'Idx', '$q', '_', 'isJSON', 'isArray', 'isEmpty', 'isString', 'isNumber', 'Event', syncCode)(scope, {variableSync: JSON.stringify(fields), variableSyncOnInit: String(syncOnInit)}, Idx, $q, _, isJSON, _.isArray, _.isEmpty, _.isString, _.isNumber, dom.window.Event)
  await scope.variableSync()
  scope.$digest()
  return {scope, host, changes: () => changes}
}
;(async () => {
  for (const saved of [{}, {filter: null, service: null, sort: null, office: null}, {filter: {ListingType: ['House', 'Commercial']}, service: [1], sort: '-BestPrice', office: [{name: 'Office A', group: ['123']}]}]) {
    const {scope, changes} = await fixture(saved)
    assert.deepEqual(scope.saved, saved, 'Opening a live editor must preserve missing, null, and saved values')
    assert.equal(changes(), 0, 'Hydration must not dispatch change events')
    scope.options.query.order = 'BestPrice'
    scope.$digest()
    assert.equal(scope.saved.sort, 'BestPrice', 'Actual edits still sync')
    scope.options.query.order = undefined
    scope.$digest()
    assert.equal(scope.saved.sort, null, 'Clearing sort explicitly clears with null')
    for (const [key, selected] of [['service', [1, 2]], ['office', [{name: 'Office B'}]], ['filter', {ListingType: ['House', 'Commercial']} ]]) {
      _.set(scope, fields[key], selected)
      scope.$digest()
      assert.equal(JSON.stringify(scope.saved[key]), JSON.stringify(selected))
      _.set(scope, fields[key], key === 'filter' ? {} : [])
      scope.$digest()
      assert.equal(scope.saved[key], null, `Explicitly clearing ${key} sends null`)
    }
    scope.$destroy()
  }
  const legacy = await fixture({}, true)
  assert.ok(legacy.changes() > 0, 'Existing callers retain initial-sync behavior unless disabled')
  console.log('PASS: no hydration writes for absent/null/persisted fields; user edits sync; explicit clears become null; legacy initialization preserved')
})().catch(error => {console.error(error); process.exitCode = 1})
