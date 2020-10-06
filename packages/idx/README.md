# @stratusjs/idx
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fidx.svg)](https://badge.fury.io/js/%40stratusjs%2Fidx "View this project on npm")

AngularJS idx/property Service and Components bundle to be used as an add-on to Stratus

## Usage

### Stratus HTML Components enabled
*   `<stratus-idx-map></stratus-idx-map>`
*   `<stratus-idx-member-details></stratus-idx-member-details>`
*   `<stratus-idx-member-list></stratus-idx-member-list>`
*   `<stratus-idx-member-search></stratus-idx-member-search>`
*   `<stratus-idx-property-details></stratus-idx-property-details>`
*   `<stratus-idx-property-list></stratus-idx-property-list>`
*   `<stratus-idx-property-search></stratus-idx-property-search>`

See [the wiki](https://github.com/Sitetheory/stratus/wiki/Idx-Package) for further instructions

---
## Frameworks & Libraries

### Installation
Either Yarn install
*   `yarn add @stratusjs/idx`

Or NPM install
*   `npm install @stratusjs/idx`

And include the the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  // Idx Package
  '@stratusjs/idx/*': boot.deployment + '@stratusjs/idx/src/*' + boot.suffix,

  // Directives (Until upgraded to Angular 8+)
  'stratus.directives.stringToNumber': boot.deployment + '@stratusjs/angularjs-extras/src/directives/stringToNumber' + boot.suffix,

  // Components (Until upgraded to Angular 8+)
  'stratus.components.idxMap': boot.deployment + '@stratusjs/idx/src/map.component' + boot.suffix,
  'stratus.components.idxMemberDetails': boot.deployment + '@stratusjs/idx/src/member/details.component' + boot.suffix,
  'stratus.components.idxMemberList': boot.deployment + '@stratusjs/idx/src/member/list.component' + boot.suffix,
  'stratus.components.idxMemberSearch': boot.deployment + '@stratusjs/idx/src/member/search.component' + boot.suffix,
  'stratus.components.idxPropertyDetails': boot.deployment + '@stratusjs/idx/src/property/details.component' + boot.suffix,
  'stratus.components.idxPropertyDetailsSubSection': boot.deployment + '@stratusjs/idx/src/property/details-sub-section.component' + boot.suffix,
  'stratus.components.idxPropertyList': boot.deployment + '@stratusjs/idx/src/property/list.component' + boot.suffix,
  'stratus.components.idxPropertySearch': boot.deployment + '@stratusjs/idx/src/property/search.component' + boot.suffix,
}
```

#### Dependencies
The following dependencies will be installed
*   [@stratusjs/angular](https://www.npmjs.com/package/@stratusjs/angular)
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [@stratusjs/map](https://www.npmjs.com/package/@stratusjs/map)
*   [@stratusjs/runtime](https://www.npmjs.com/package/@stratusjs/runtime)
*   [@stratusjs/swiper](https://www.npmjs.com/package/@stratusjs/swiper)

---
## License
MIT license found in file `LICENSE`
