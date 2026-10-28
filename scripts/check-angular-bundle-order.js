const fs = require('fs')
const path = require('path')

const bundlePath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../packages/angular/dist/angular.bundle.js')
const bundle = fs.readFileSync(bundlePath, 'utf8')

const bootstrapMarker = 'platformBrowserDynamic().bootstrapModule(AppModule)'
const bootstrapFunctionMarker = 'function bootstrapStratusAngular()'
const scheduledBootstrapMarker = 'setTimeout(() => bootstrapStratusAngular());'

const bootstrapIndex = bundle.indexOf(bootstrapMarker)
const bootstrapFunctionIndex = bundle.indexOf(bootstrapFunctionMarker)
const scheduledBootstrapIndex = bundle.indexOf(scheduledBootstrapMarker)

if (bootstrapIndex === -1) {
  console.error(`Missing Angular bootstrap marker in ${bundlePath}`)
  process.exit(1)
}

if (bootstrapFunctionIndex === -1) {
  console.error(`Missing delayed Angular bootstrap function in ${bundlePath}`)
  process.exit(1)
}

if (scheduledBootstrapIndex === -1) {
  console.error(`Angular bootstrap must be scheduled after bundle registration in ${bundlePath}`)
  process.exit(1)
}

if (bootstrapIndex < bootstrapFunctionIndex || bootstrapIndex > scheduledBootstrapIndex) {
  console.error(`Angular bootstrap must only run from the delayed bootstrap function in ${bundlePath}`)
  process.exit(1)
}

// TypeScript's __metadata helper silently skips design:paramtypes until this
// polyfill exists. Delaying Angular bootstrap cannot restore skipped metadata.
const metadataIndex = bundle.indexOf('function metadata(metadataKey, metadataValue)')
const backendIndex = bundle.indexOf('class BackendService')
if (metadataIndex === -1 || backendIndex === -1 || metadataIndex > backendIndex) {
  console.error(`Reflect metadata must initialize before BackendService decorators in ${bundlePath}`)
  process.exit(1)
}

console.log('Angular bootstrap and BackendService metadata order are valid.')
