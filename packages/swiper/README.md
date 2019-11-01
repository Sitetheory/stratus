# @stratusjs/swiper
[![npm version](https://badge.fury.io/js/%40stratusjs%2Fswiper.svg)](https://badge.fury.io/js/%40stratusjs%2Fswiper "View this project on npm")

AngularJS Swiper Carousel component to be used as an add on to StratusJS

## Usage

### Stratus HTML Components enabled
*   `<stratus-swiper-carousel></stratus-swiper-carousel>`

See [the wiki](https://github.com/Sitetheory/stratus/wiki/Swiper-Package) for further instructions

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
  'swiper': boot.deployment + 'swiper/js/swiper.esm.browser.bundle' + boot.suffix,

  // STRATUS SRC: Swiper
  '@stratusjs/swiper/*': boot.deployment + '@stratusjs/swiper/src/*' + boot.suffix,

  // Components (Until Converted to Angular 8+)
  'stratus.components.swiperCarousel': boot.deployment + '@stratusjs/swiper/src/carousel.component' + boot.suffix
}
```

#### Dependencies
All dependencies need to be installed within the same project along with your config paths define.
(manually installed for the time being)
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [@stratusjs/runtime](https://www.npmjs.com/package/@stratusjs/runtime)
*   [swiper](https://www.npmjs.com/package/swiper)

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
