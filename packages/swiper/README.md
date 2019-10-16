# @stratusjs/swiper
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fswiper.svg)](https://badge.fury.io/js/%40stratusjs%2Fswiper "View this project on npm")

AngularJS Swiper Carousel component to be used as an add on to StratusJS

## Usage

### Stratus HTML Components enabled
*   `<stratus-swiper-carousel></stratus-swiper-carousel>`

[TODO]() More details and instructions

---
## Frameworks & Libraries

### Installation
Within the project directory of Stratus

Either Yarn install
*   `yarn add @stratusjs/swiper`

Or NPM install
*   `npm install @stratusjs/swiper`

And include the the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  // Swiper Package
  'swiper': boot.bundle + 'swiper/js/swiper.esm.browser.bundle' + boot.suffix,

  // Components
  'stratus.components.swiperCarousel': boot.bundle + '@stratusjs/swiper/src/carousel' + boot.suffix
}
```

#### Dependencies
All dependencies need to be installed within the same project along with your config paths define.
(manually installed for the time being)
*   [stratus.js](https://www.npmjs.com/package/stratus.js) (while Stratus is converting)
*   [@stratusjs/core](https://www.npmjs.com/package/@stratusjs/core)
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [swiper](https://www.npmjs.com/package/swiper)

[TODO]() Items such as angularjs should be automatically installed

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
