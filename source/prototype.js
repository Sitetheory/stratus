/* global boot, _, bowser */

// Stratus Layer Prototype
// -----------------------

// This prototype is the only Global Object that will ever be used within the
// Stratus layer.  Each individual instantiated reference from a constructor
// gets stored in the Instances property, and every Data Set is maintained in
// the Catalog, for efficient access and debugging purposes.  Further down this
// initialization routine, this Global Object gets mixed with a function that
// allows for Native DOM Selectors with added functionality to ensure the core
// Stratus files never require external DOM Libraries, such as jQuery.
/**
 * @param selector
 * @param context
 * @returns {NodeList|Node}
 * @constructor
 */
let Stratus = {
  /* Settings */
  Settings: {
    image: {
      size: { xs: 200, s: 400, m: 600, l: 800, xl: 1200, hq: 1600 }
    },
    status: {
      reset: -2,
      deleted: -1,
      inactive: 0,
      active: 1
    },
    consent: {
      reject: -1,
      pending: 0,
      accept: 1
    }
  },

  /* Native */
  DOM: {},
  Key: {},
  PostMessage: {},
  LocalStorage: {},

  /* Selector Logic */
  Selector: {},
  Select: null,

  /* Boot */
  BaseUrl: (boot && _.has(boot, 'configuration') ? boot.configuration.baseUrl : null) || '/',
  BundlePath: (boot && _.has(boot, 'configuration') ? boot.configuration.bundlePath : '') || '',

  /* This is used internally for triggering events */
  Events: null,

  /* Angular */
  Apps: {},
  Catalog: {},
  Compendium: {},
  Components: {},
  Controllers: {},
  Directives: {},
  Filters: {},
  Modules: {
    ngMaterial: true,
    ngMessages: true
    /* ngMdIcons: true */
  },
  Services: {},

  /* Bowser */
  Client: bowser,

  /* Stratus */
  CSS: {},
  Chronos: null,
  Data: {},
  Environment: {
    ip: null,
    production: !(typeof document.cookie === 'string' &&
      document.cookie.indexOf('env=') !== -1),
    context: null,
    contextId: null,
    contextMasterSiteId: null,
    siteId: null,
    masterSiteId: null,
    language: navigator.language,
    timezone: null,
    trackLocation: 0,
    trackLocationConsent: 0,
    lat: null,
    lng: null,
    postalCode: null,
    city: null,
    region: null,
    country: null,
    debugNest: false,
    liveEdit: false,
    viewPortChange: false,
    viewPort: null,
    lastScroll: false
  },
  History: {},
  Instances: {},
  Internals: {},
  Loaders: {},
  Prototypes: {},
  Resources: {},
  Roster: {

    // dynamic
    controller: {
      selector: '[ng-controller]',
      namespace: 'stratus.controllers.'
    },
    components: {
      namespace: 'stratus.components.'
    },
    directives: {
      namespace: 'stratus.directives.',
      type: 'attribute'
    },

    // angular material
    flex: {
      selector: '[flex]',
      require: ['angular', 'angular-material']
    },

    // TODO: Find a more scalable ideology
    // third party
    chart: {
      selector: '[chart]',
      require: ['angular', 'angular-chart'],
      module: true,
      suffix: '.js'
    },

    // TODO: Move Froala to Sitetheory since it is specific to Sitetheory
    modules: {
      selector: [
        '[ng-sanitize]', '[froala]'
      ],
      namespace: 'angular-',
      module: true
    },

    // TODO: Move these to Sitetheory since they are specific to Sitetheory
    countUp: {
      selector: [
        '[count-up]', '[scroll-spy]'
      ],
      namespace: 'angular-',
      module: true,
      suffix: 'Module'
    },
    uiTree: {
      selector: '[ui-tree]',
      require: ['angular-ui-tree'],
      module: 'ui.tree'
    }
  },

  /* Methods that need to be called as a group later, e.g. OnScroll */
  // TODO: RegisterGroup needs to be removed
  RegisterGroup: {},

  // TODO: Turn this into a Dynamic Object loaded from the DOM in Sitetheory
  Api: {
    GoogleMaps: 'AIzaSyBatGvzPR7u7NZ3tsCy93xj4gEBfytffyA',
    Froala: 'FB2C2D2B1uB5A2B2D3A5F1D4E1A3B17hfE-13cA-9mrI-7sogE4in=='
  }
}

// Declare Warm Up
if (!Stratus.Environment.production) {
  console.group('Stratus Warm Up')
}
