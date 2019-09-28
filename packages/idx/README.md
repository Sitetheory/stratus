# @stratusjs/idx
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fidx.svg)](https://badge.fury.io/js/%40stratusjs%2Fidx "View this project on npm")

AngularJS idx/property Service and Components bundle to be used as an add on to Stratus

## Usage

### Stratus HTML Components enabled
* `<stratus-property-list></stratus-property-list>`
* `<stratus-property-details></stratus-property-details>`
* `<stratus-property-search></stratus-property-search>`
* `<stratus-property-member-list></stratus-member-list>`
* `<stratus-property-member-details></stratus-member-details>`
* `<stratus-property-member-search></stratus-member-search>`

[TODO]() More details and instructions

---
## Frameworks & Libraries

### Installation
Within the project directory of Stratus

Either Yarn install
* `yarn add @stratusjs/idx`

Or NPM install
* `npm install @stratusjs/idx`

And include the the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  //Components
  'stratus.components.propertyDetails': boot.bundle + '@stratusjs/idx/components/propertyDetails' + boot.suffix,
  'stratus.components.propertyDetailsSubSection': boot.bundle + '@stratusjs/idx/components/propertyDetailsSubSection' + boot.suffix,
  'stratus.components.propertyList': boot.bundle + '@stratusjs/idx/components/propertyList' + boot.suffix,
  'stratus.components.propertySearch': boot.bundle + '@stratusjs/idx/components/propertySearch' + boot.suffix,
  'stratus.components.propertyMemberList': boot.bundle + '@stratusjs/idx/components/propertyMemberList' + boot.suffix,
  'stratus.components.propertyMemberDetails': boot.bundle + '@stratusjs/idx/components/propertyMemberDetails' + boot.suffix,
  'stratus.components.propertyMemberSearch': boot.bundle + '@stratusjs/idx/components/propertyMemberSearch' + boot.suffix,

  //Services
  'stratus.services.idx': boot.bundle + '@stratusjs/idx/services/idx' + boot.suffix
}
```

#### Dependencies
All dependencies need to be installed within the same project along with your config paths define.
(manually installed for the time being)
* [stratus.js](https://www.npmjs.com/package/stratus.js)
* angular
* angular-animate
* angular-aria
* angular-chart.js
* angular-drag-and-drop-lists
* angular-froala-wysiwyg
* angular-material
* angular-messages
* angular-paging
* angular-resource
* angular-sanitize
* angular-scroll-spy
* angular-ui-tree
* moment
* moment-range
* moment-timezone

[TODO]() Items such as angular and moment should be automatically installed

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
