const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const {JSDOM} = require('jsdom')
const _ = require('lodash')

const propertyDir = path.join(__dirname, '../packages/idx/src/property')
const source = ts.createSourceFile('search.component.ts', fs.readFileSync(path.join(propertyDir, 'search.component.ts'), 'utf8'), ts.ScriptTarget.Latest, true)
const methods = ['getListingTypeCount', 'selectListingTypeGroup', 'canDisplayListingTypeButton', 'selectDefaultListingType', 'toggleArrayElement', 'isIntersecting']
const statements = []
function visit(node) {
  if (ts.isExpressionStatement(node)) {
    const text = node.getText(source)
    if (methods.some(name => text.startsWith(`$scope.${name} =`)) ||
        (text.startsWith('$scope.options.selection.ListingType') && text.includes('??=')) ||
        (text.startsWith('$scope.options.selection.Status') && text.includes('??=')) ||
        text.startsWith("$scope.$watchCollection('options.query.where.ListingType'")) statements.push(text)
  }
  ts.forEachChild(node, visit)
}
visit(source)
const setup = ts.transpileModule(statements.join('\n'), {compilerOptions: {target: ts.ScriptTarget.ES2020}}).outputText
const dom = new JSDOM('<!doctype html><html><body></body></html>', {runScripts: 'outside-only'})
dom.window.eval(fs.readFileSync(require.resolve('angular/angular'), 'utf8'))
const angular = dom.window.angular
const injector = angular.injector(['ng'])
const root = injector.get('$rootScope')
const compile = injector.get('$compile')
function createScope(listingTypes) {
  const scope = root.$new()
  scope.options = {selection: {}, forRent: false, query: {where: {ListingType: listingTypes, Status: ['Active', 'Closed']}}}
  scope._ = _
  scope.initialized = true
  scope.search = () => {}
  new Function('$scope', 'includes', 'isArray', 'intersection', setup)(scope, _.includes, _.isArray, _.intersection)
  scope.$digest()
  return scope
}
for (const name of ['admin/search.filter', 'search', 'search.classic', 'search.compact']) {
  const scope = createScope(['House', 'Other', 'Commercial'])
  const template = dom.window.document.createElement('div')
  template.innerHTML = fs.readFileSync(path.join(propertyDir, `${name}.component.html`), 'utf8')
  const host = angular.element('<div></div>')
  host.append(template.querySelector('.property-zoning'))
  host.append(template.querySelector('.listing-types'))
  compile(host)(scope)
  scope.$digest()
  const button = label => host[0].querySelector(`[aria-label="${label}"]`)
  const click = label => angular.element(button(label)).triggerHandler('click')
  assert.match(button('Residential').textContent, /Residential\s+\(2\)/)
  assert.match(button('Commercial').textContent, /Commercial\s+\(1\)/)
  const selected = scope.options.query.where.ListingType
  click('Commercial')
  assert.equal(scope.options.query.where.ListingType, selected, `${name}: tabs must not replace the saved selection`)
  assert.deepEqual(selected, ['House', 'Other', 'Commercial'])
  assert.equal(button('House').classList.contains('ng-hide'), true)
  assert.equal(button('Commercial Business Op').classList.contains('ng-hide'), false)
  click('Commercial Business Op')
  assert.match(button('Commercial').textContent, /\(2\)/)
  click('Residential')
  assert.equal(button('Commercial').classList.contains('md-primary'), true, `${name}: hidden category stays colored`)
  click('House')
  click('Other')
  assert.equal(button('Residential').classList.contains('md-primary'), false)
  assert.equal(scope.activeListingTypeGroup, 'Residential')
  assert.deepEqual(selected, ['Commercial', 'CommercialBusinessOp'])
  assert.equal(button('House').classList.contains('ng-hide'), false, 'Empty category must remain editable')
  scope.$destroy()
}
const commercial = createScope('Commercial')
assert.equal(commercial.activeListingTypeGroup, 'Commercial', 'Reopen a saved commercial-only filter in Commercial')
assert.equal(commercial.getListingTypeCount('Commercial'), 1)
const rental = createScope(['LeaseHouse', 'LeaseCommercial'])
rental.selectListingTypeGroup('Commercial')
rental.toggleArrayElement('LeaseCommercial', rental.options.query.where.ListingType)
rental.selectListingTypeGroup('Residential')
rental.toggleArrayElement('LeaseHouse', rental.options.query.where.ListingType)
rental.$digest()
assert.equal(rental.options.forRent, true, 'Clearing the last rental must preserve Rent mode')
assert.equal(rental.canDisplayListingTypeButton(rental.options.selection.ListingType.All.find(type => type.value === 'LeaseHouse')), true)
rental.options.forRent = false
rental.selectDefaultListingType()
rental.$digest()
assert.deepEqual(Array.from(rental.options.query.where.ListingType), ['House', 'Condo', 'Townhouse'])
rental.toggleArrayElement('House', rental.options.query.where.ListingType)
assert.deepEqual(Array.from(rental.options.selection.ListingType.default.Sale.Residential), ['House', 'Condo', 'Townhouse'], 'Selections must not mutate defaults')
assert.deepEqual(Array.from(rental.options.query.where.Status), ['Active', 'Closed'], 'Category selection does not change sale statuses')
console.log('IDX property filters: all four templates retain mixed selections, counts, colors, saved filters, rental mode, and immutable defaults')

// Feed sources come from the authorized service list, including Exclusive (0).
// A static option would duplicate that source or offer it without a subscription.
const feedTemplate = dom.window.document.createElement('div')
feedTemplate.innerHTML = fs.readFileSync(path.join(propertyDir, 'admin/search.filter.component.html'), 'utf8')
for (const services of [[{id: 0, name: 'Exclusive'}, {id: 5, name: 'MLS'}], [{id: 5, name: 'MLS'}]]) {
  const scope = root.$new()
  scope.options = {query: {service: [0]}}
  scope.getMLSVariables = () => services
  const selector = angular.element(feedTemplate.querySelector('[data-ng-model="options.query.service"]').cloneNode(true))
  compile(selector)(scope)
  scope.$digest()
  const options = Array.from(selector[0].querySelectorAll('md-option'))
  assert.deepEqual(options.map(option => option.textContent.trim()), services.map(service => service.name))
  assert.deepEqual(options.map(option => angular.element(option).scope().$eval(option.getAttribute('data-ng-value'))), services.map(service => service.id))
  assert.deepEqual(scope.options.query.service, [0], 'Rendering feed options must preserve saved service IDs')
  scope.$destroy()
}
console.log('PASS: one option per authorized feed source, including serviceId 0')
