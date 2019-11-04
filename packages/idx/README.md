# @stratusjs/idx
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fidx.svg)](https://badge.fury.io/js/%40stratusjs%2Fidx "View this project on npm")

AngularJS idx/property Service and Components bundle to be used as an add on to Stratus

## Usage

### Stratus HTML Components enabled
*   `<stratus-idx-property-list></stratus-idx-property-list>`
*   `<stratus-idx-property-details></stratus-idx-property-details>`
*   `<stratus-idx-property-search></stratus-idx-property-search>`
*   `<stratus-idx-member-list></stratus-idx-member-list>`
*   `<stratus-idx-member-details></stratus-idx-member-details>`
*   `<stratus-idx-member-search></stratus-idx-member-search>`

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

  // Components (Until upgraded to Angular 8+)
  'stratus.components.idxPropertyDetails': boot.deployment + '@stratusjs/idx/src/property/details.component' + boot.suffix,
  'stratus.components.idxPropertyDetailsSubSection': boot.deployment + '@stratusjs/idx/src/property/details-sub-section.component' + boot.suffix,
  'stratus.components.idxPropertyList': boot.deployment + '@stratusjs/idx/src/property/list.component' + boot.suffix,
  'stratus.components.idxPropertySearch': boot.deployment + '@stratusjs/idx/src/property/search.component' + boot.suffix,
  'stratus.components.idxMemberList': boot.deployment + '@stratusjs/idx/src/member/list.component' + boot.suffix,
  'stratus.components.idxMemberDetails': boot.deployment + '@stratusjs/idx/src/member/details.component' + boot.suffix,
  'stratus.components.idxMemberSearch': boot.deployment + '@stratusjs/idx/src/member/search.component' + boot.suffix,
}
```

#### Dependencies
The following dependencies will be installed
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [@stratusjs/runtime](https://www.npmjs.com/package/@stratusjs/runtime)
*   [@stratusjs/swiper](https://www.npmjs.com/package/@stratusjs/swiper)

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
