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

[TODO]() More details and instructions

---
## Frameworks & Libraries

### Installation
Within the project directory of Stratus

Either Yarn install
*   `yarn add @stratusjs/idx`

Or NPM install
*   `npm install @stratusjs/idx`

And include the the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  // Idx Package
  '@stratusjs/idx/*': boot.bundle + '@stratusjs/idx/src/*' + boot.suffix,

  // Components
  'stratus.components.idxPropertyDetails': boot.bundle + '@stratusjs/idx/src/property/details.component' + boot.suffix,
  'stratus.components.idxPropertyDetailsSubSection': boot.bundle + '@stratusjs/idx/src/property/details-sub-section.component' + boot.suffix,
  'stratus.components.idxPropertyList': boot.bundle + '@stratusjs/idx/src/property/list.component' + boot.suffix,
  'stratus.components.idxPropertySearch': boot.bundle + '@stratusjs/idx/src/property/search.component' + boot.suffix,
  'stratus.components.idxMemberList': boot.bundle + '@stratusjs/idx/src/member/list.component' + boot.suffix,
  'stratus.components.idxMemberDetails': boot.bundle + '@stratusjs/idx/src/member/pdetails.component' + boot.suffix,
  'stratus.components.idxMemberSearch': boot.bundle + '@stratusjs/idx/src/member/search.component' + boot.suffix,
}
```

#### Dependencies
All dependencies need to be installed within the same project along with your config paths define.
(manually installed for the time being)
*   [@stratusjs/runtime](https://www.npmjs.com/package/@stratusjs/runtime)
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [@stratusjs/swiper](https://www.npmjs.com/package/@stratusjs/swiper)

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
