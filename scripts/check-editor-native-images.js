// Exercise the actual writers and save/reopen methods against a DOM.
const assert = require('assert/strict')
const fs = require('fs')
const ts = require('typescript')
const vm = require('vm')
const { JSDOM } = require('jsdom')
const dom = new JSDOM('')
const context = { exports: {}, window: dom.window, document: dom.window.document, _: require('lodash'), console }
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
vm.runInNewContext(compile(fs.readFileSync('packages/angular/src/editor/native-image.ts', 'utf8')), context)
Object.assign(context, context.exports)
function methods(file, name, names) {
  const source = fs.readFileSync(file, 'utf8')
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const cls = tree.statements.find(n => ts.isClassDeclaration(n) && n.name.text === name)
  const selected = cls.members.filter(n => n.name && names.includes(n.name.getText(tree)))
  assert.equal(selected.length, names.length)
  vm.runInNewContext(compile(`exports.${name} = class { ${selected.map(n => n.getText(tree)).join('\n')} }`), context)
  return new context.exports[name]()
}
const editor = methods('packages/angular/src/editor/editor.component.ts', 'EditorComponent',
  ['normalizeIn', 'normalizeOut', 'changeImgSize', 'getSizedImageSrc', 'ensureImageRatioStyle', 'parseImageRatio'])
const dialog = methods('packages/angular/src/editor/media-dialog.component.ts', 'MediaDialogComponent',
  ['createEmbed', 'getImageRatioStyle', 'getImageRatioAttributes', 'parseRatio'])
const parse = html => { const div = dom.window.document.createElement('div'); div.innerHTML = html; return div }
const media = { mime: 'image/jpeg', prefix: 'cdn.sitetheory.io/site/430/photo', extension: 'jpg', dimensions: '1000,750',
  name: 'Photo " & <caption>', timeEdit: 123, _thumbnailUrl: '//cdn.sitetheory.io/site/430/photo-xs.jpg?cachebusting=123' }
windowCheck(false)
function windowCheck(enabled) { context.window.sitetheoryNativeImagePlaceholder = enabled }
let html = dialog.createEmbed(media).html
assert.ok(html.includes('data-stratus-src'), 'older host keeps legacy insertion')
assert.equal(parse(editor.normalizeOut(html)).querySelector('img').hasAttribute('src'), false)
windowCheck(true)
html = dialog.createEmbed(media).html
let image = parse(html).querySelector('img')
assert.equal(image.getAttribute('alt'), media.name)
assert.ok(image.srcset.includes('photo-xs.jpg?cachebusting=123 200w'))
assert.ok(!image.srcset.includes('1200w'), 'no derivatives wider than original')
assert.equal(image.getAttribute('width'), '1000')
for (let round = 0; round < 3; round++) html = editor.normalizeOut(editor.normalizeIn(html))
image = parse(html).querySelector('img')
assert.equal(image.getAttribute('src'), '//cdn.sitetheory.io/site/430/photo.jpg?cachebusting=123')
assert.ok(image.hasAttribute('srcset'))
assert.equal(image.getAttribute('loading'), 'lazy')
assert.equal(image.getAttribute('decoding'), 'async')
assert.ok(!image.hasAttribute('data-stratus-src'))
// Existing native content is preserved even on a host with the flag off.
windowCheck(false)
assert.ok(parse(editor.normalizeOut(html)).querySelector('img').hasAttribute('srcset'))
windowCheck(true)
// Replacement must not keep downloading the old photo through retained candidates.
image.setAttribute('src', 'https://external.example/replacement.jpg?token=a&b=2')
image = parse(editor.normalizeOut(image.outerHTML)).querySelector('img')
assert.equal(image.getAttribute('src'), 'https://external.example/replacement.jpg?token=a&b=2')
assert.ok(!image.hasAttribute('srcset'))
for (const source of ['https://external.example/a.jpg?token=a&b=2', 'data:image/png;base64,AAAA', 'blob:https://example.com/id']) {
  const result = dialog.createEmbed({ ...media, service: 'directLink', file: '', url: source, _thumbnailUrl: source }).html
  const item = parse(editor.normalizeOut(editor.normalizeIn(result))).querySelector('img')
  assert.equal(item.getAttribute('src'), source)
  assert.ok(!item.hasAttribute('srcset'), 'external/blob/data sources stay exact')
}
for (const extension of ['gif', 'svg']) {
  const item = parse(dialog.createEmbed({ ...media, extension, mime: 'image/' + extension, _thumbnailUrl: 'https://example.com/photo.' + extension }).html).querySelector('img')
  assert.ok(!item.hasAttribute('srcset'))
}
const legacy = '<img data-stratus-src data-src="//cdn.sitetheory.io/photo-xs.jpg" src="data:image/svg+xml,placeholder" class="fr-fic loading" data-ratio-real="4:3"><img src="https://other.example/b.jpg">'
const converted = parse(editor.normalizeOut(editor.normalizeIn(legacy)))
assert.equal(converted.querySelector('img').getAttribute('data-src'), '//cdn.sitetheory.io/photo-xs.jpg')
assert.equal(converted.querySelectorAll('[data-stratus-src]').length, 1, 'stored legacy HTML keeps compatibility until database migration')
assert.equal(converted.querySelectorAll('img').length, 2)
assert.ok(converted.querySelector('img').classList.contains('fr-fic'))
assert.equal(editor.normalizeOut('<p>Image removed</p>'), '<p>Image removed</p>')
const source = fs.readFileSync('packages/angular/src/editor/editor.component.ts', 'utf8')
const allowlist = source.slice(source.indexOf('htmlAllowedAttrs:'), source.indexOf('htmlAllowedEmptyTags:'))
for (const attribute of ['loading', 'decoding', 'srcset', 'sizes']) assert.ok(allowlist.includes(`'${attribute}'`))
console.log('PASS editor native images: media insertion, repeated save/reopen, replacement, legacy hosts, legacy content, external/blob/data URLs, GIF/SVG, multiple images and removal')
