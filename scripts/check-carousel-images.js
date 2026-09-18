// Run with: node scripts/check-carousel-images.js
const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const vm = require('vm')

const source = fs.readFileSync(path.join(__dirname, '../packages/swiper/src/image.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
})
const context = { exports: {} }
vm.runInNewContext(compiled.outputText, context)
const { getCarouselImageSize, resizeCarouselImage, getCarouselImageName } = context.exports
const sizes = { xs: 200, s: 400, m: 600, l: 800, xl: 1200, hq: 1600 }

for (const [width, expected] of [[200, 'xs'], [201, 's'], [1200, 'xl'], [1440, 'hq'],
  [1600, 'hq'], [1920, 'hq'], [3840, 'hq'], [0, 'hq'], [NaN, 'hq']]) {
  assert.equal(getCarouselImageSize(width, sizes), expected, `width ${width}`)
}
assert.equal(getCarouselImageSize(900, { hq: 1600, xl: 1200, s: 400 }), 'xl')
assert.equal(getCarouselImageSize(1920, {}), 'hq')

const original = '//cdn.sitetheory.io/site/689/570454/380%20Larch%20Road%202-xs.webp?cachebusting=1786463081'
assert.equal(resizeCarouselImage(original, getCarouselImageSize(1920, sizes)),
  original.replace('-xs.webp', '-hq.webp'))
for (const size of Object.keys(sizes)) {
  assert.equal(resizeCarouselImage(`https://example.com/house-${size}.webp?v=1.2#photo`, 'hq'),
    'https://example.com/house-hq.webp?v=1.2#photo')
}
assert.equal(resizeCarouselImage('https://example.com/house-l-l.jpg', 'hq'), 'https://example.com/house-l-hq.jpg')
assert.equal(resizeCarouselImage(original, undefined), original)
assert.equal(resizeCarouselImage('https://example.com/image?file=photo.jpg', 'hq'), 'https://example.com/image?file=photo.jpg')
assert.equal(getCarouselImageName(original, true), '380 Larch Road 2')
assert.equal(getCarouselImageName('https://example.com/608+Seminary+Dr+1-hq.jpg', true), '608 Seminary Dr 1')
assert.equal(getCarouselImageName('https://example.com/living%20room.jpg'), 'living room')
assert.equal(getCarouselImageName('https://example.com/photo-l.jpg'), 'photo-l')
assert.equal(getCarouselImageName('https://example.com/bad%escape-xs.jpg', true), 'bad%escape')
console.log('Carousel image regression checks passed')
