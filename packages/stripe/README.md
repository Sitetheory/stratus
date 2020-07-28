# @stratusjs/stripe
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fstripe.svg)](https://badge.fury.io/js/%40stratusjs%2Fstripe "View this project on npm")

AngularJS Stripe Elements component to be used as an add on to StratusJS

## Usage

### Stratus HTML Components enabled
*   `<stratus-stripe-payment-method></stratus-stripe-payment-method>`

See [the wiki](https://github.com/Sitetheory/stratus/wiki/Stripe-Package) for further instructions

---
## Frameworks & Libraries

### Installation
Within the project directory of Stratus

Either Yarn install
*   `yarn add @stratusjs/stripe`

Or NPM install
*   `npm install @stratusjs/stripe`

And include the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  // STRATUS SRC: Stripe
  '@stratusjs/stripe/*': boot.deployment + '@stratusjs/stripe/src/*' + boot.suffix,

  // Components (Until Converted to Angular 10+)
  'stratus.components.stripePaymentMethod': boot.deployment + '@stratusjs/stripe/src/payment-method.component' + boot.suffix,
}
```

#### Dependencies
All dependencies need to be installed within the same project along with your config paths define.
(manually installed for the time being)
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [@stratusjs/runtime](https://www.npmjs.com/package/@stratusjs/runtime)

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
