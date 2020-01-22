# @stratusjs/calendar

AngularJS Calendar component and iCAL service to be used as an add on to StratusJS. Makes use of fullcalendar and iCAL


## Usage

### Stratus HTML Components enabled
*   `<stratus-calendar></stratus-calendar>`

TODO Wiki Page

---
## Frameworks & Libraries

### Installation
Either Yarn install
*   `yarn add @stratusjs/calendar`

Or NPM install
*   `npm install @stratusjs/calendar`

And include the the library paths into your stratus `config.js` such as
```js
boot.configuration.paths = {
  // Calendar Package
  '@stratusjs/calendar/*': boot.deployment + '@stratusjs/calendar/src/*' + boot.suffix,

  // Components (Until upgraded to Angular 8+)
  'stratus.components.calendar': boot.deployment + '@stratusjs/calendar/src/calendar' + boot.suffix,

  // Required dependencies (Until Auto Dependency Injection is complete)
   ical: boot.deployment + 'ical.js/build/ical' + boot.suffix,
  '@fullcalendar/core': boot.deployment + '@fullcalendar/core/main' + boot.suffix,
  '@fullcalendar/moment': boot.deployment + '@fullcalendar/moment/main' + boot.suffix,
  '@fullcalendar/moment-timezone': boot.deployment + '@fullcalendar/moment-timezone/main' + boot.suffix,
  '@fullcalendar/daygrid': boot.deployment + '@fullcalendar/daygrid/main' + boot.suffix,
  '@fullcalendar/timegrid': boot.deployment + '@fullcalendar/timegrid/main' + boot.suffix,
  '@fullcalendar/list': boot.deployment + '@fullcalendar/list/main' + boot.suffix,
}
```

#### Dependencies
The following dependencies will be installed
*   [@stratusjs/angularjs](https://www.npmjs.com/package/@stratusjs/angularjs)
*   [@stratusjs/angularjs-extras](https://www.npmjs.com/package/@stratusjs/angularjs-extras)
*   [@stratusjs/runtime](https://www.npmjs.com/package/@stratusjs/runtime)
*   [@fullcalendar/core](https://www.npmjs.com/package/@fullcalendar/core)
*   [@fullcalendar/daygrid](https://www.npmjs.com/package/@fullcalendar/daygrid)
*   [@fullcalendar/list](https://www.npmjs.com/package/@fullcalendar/list)
*   [@fullcalendar/moment](https://www.npmjs.com/package/@fullcalendar/moment)
*   [@fullcalendar/moment-timezone](https://www.npmjs.com/package/@fullcalendar/moment-timezone)
*   [@fullcalendar/timegrid](https://www.npmjs.com/package/@fullcalendar/timegrid)
*   [ical.js](https://www.npmjs.com/package/ical.js)

---
## License
All information contained herein is, and remains the property of Sitetheory and its suppliers, if any. The intellectual and technical concepts contained herein are proprietary to Sitetheory and its suppliers and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Sitetheory.
