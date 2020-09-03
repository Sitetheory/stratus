# @stratusjs/map
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fmap.svg)](https://badge.fury.io/js/%40stratusjs%2Fmap "View this project on npm")

Angular Google Map component to be used as an add-on to StratusJS

## Usage

### Stratus HTML Components enabled
*   `<sa-map data-markers="{{Object or variablePath}}"></sa-map>`

See [the wiki](https://github.com/Sitetheory/stratus/wiki/Map-Package) for further instructions

---
## Frameworks & Libraries

### Installation
Within the project directory of Stratus

Either Yarn install
*   `yarn add @stratusjs/map`

Or NPM install
*   `npm install @stratusjs/map`

And include the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  // Angular Google Maps
  '@angular/google-maps': `${boot.deployment}@angular/google-maps/bundles/google-maps.umd${boot.suffix}`,


  // STRATUS SRC: Map
  '@stratusjs/map/*': `${boot.deployment}@stratusjs/map/src/*${boot.suffix}`,
}
```

And add modules to app.module.js + boot.js (pending instructions)

#### Dependencies
All dependencies need to be installed within the same project along with your config paths define.
(manually installed for the time being)
*   [@angular/google-maps](https://www.npmjs.com/package/@angular/google-maps)
*   [@stratusjs/angular](https://www.npmjs.com/package/@stratusjs/angular)
