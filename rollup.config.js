// import glob from 'glob'
import multi from '@rollup/plugin-multi-entry'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  // ------------------------
  // Core Config
  // ------------------------
  {
    input: {
      include: [
        './packages/core/src/**/*.js'
      ],
      exclude: [
        './packages/core/src/**/*.min.js'
      ]
    },
    external: [
      'lodash',
      '@stratusjs'
    ],
    output: {
      // file: 'packages/core/dist/core.bundle.js',
      dir: 'packages/core/dist/',
      format: 'system'
    },
    plugins: [
      multi({
        exports: true,
        entryFileName: 'core.bundle.js'
      }),
      nodeResolve()
    ]
  },
  // ------------------------
  // Angular+ Config
  // ------------------------
  // This includes all things in app.module.ts like the Map Package, Stripe, etc
  {
    input: {
      include: [
        './packages/angular/src/**/*.js'
      ],
      exclude: [
        // min files
        './packages/angular/src/**/*.min.js',
        // test files
        './packages/angular/src/test/**/*.js',
        // unused
        './packages/angular/src/quill-plugins/**/*.js',
        // prototype file (not functional)
        './packages/angular/src/angular.module.js',
        // boot controls angular detection, so it shouldn't be packages
        './packages/angular/src/boot.js'
      ]
    },
    external: [
      'froala-editor',
      'html2pdf',
      'lodash',
      'zone.js/dist/zone',
      // TODO: This one may be a transformer, so it shouldn't need to be imported.
      '@agentepsilon/decko'
    ],
    output: {
      // file: 'packages/angular/dist/angular.bundle.js',
      dir: 'packages/angular/dist/',
      format: 'system'
    },
    plugins: [
      multi({
        exports: true,
        entryFileName: 'angular.bundle.js'
      }),
      nodeResolve()
    ]
  },
  // ------------------------
  // AngularJS Config
  // ------------------------
  {
    input: {
      include: [
        './packages/angularjs/src/**/*.js'
      ],
      exclude: [
        './packages/angularjs/src/**/*.min.js'
      ]
    },
    external: [
      'lodash',
      'angular',
      '@stratusjs',
      'angular-material',
      'angular-sanitize',
      'ts-transformer-keys'
    ],
    output: {
      // file: 'packages/angularjs/dist/angularjs.bundle.js',
      dir: 'packages/angularjs/dist/',
      format: 'system'
    },
    plugins: [
      multi({
        exports: true,
        entryFileName: 'angularjs.bundle.js'
      }),
      nodeResolve()
    ]
  },
  // ------------------------
  // AngularJS-extras Config
  // ------------------------
  {
    input: {
      include: [
        './packages/angularjs-extras/src/**/*.js'
      ],
      exclude: [
        './packages/angularjs-extras/src/**/*.min.js',
        './packages/angularjs-extras/src/components/deprecated-reference/*.js',
        // Non-TypeScript Directories
        './packages/angularjs-extras/src/controllers/*.js',
        './packages/angularjs-extras/src/loaders/*.js',
        './packages/angularjs-extras/src/normalizers/*.js',
        './packages/angularjs-extras/src/services/*.js',
        // Non-TypeScript Components (todo: remove soon!)
        // './packages/angularjs-extras/src/components/base.js',
        // './packages/angularjs-extras/src/components/facebook.js',
        // './packages/angularjs-extras/src/components/jsonEditor.js',
        // './packages/angularjs-extras/src/components/tweet.js',
        // Non-Bundled Directives
        // Note: Froala is huge and should be optional
        './packages/angularjs-extras/src/directives/froala.js',
        // Note: Redactor is large and should be optional
        './packages/angularjs-extras/src/directives/redactor.js',
        // Unused Components
        // Twitter is an external dependency, so it should be optional
        './packages/angularjs-extras/src/components/twitterFeed.js'
      ]
    },
    external: [
      'angular',
      'angular-material',
      'angular-sanitize',
      'jquery',
      'lodash',
      'moment',
      'moment-timezone',
      'numeral',
      'js-md5',
      '@stratusjs'
    ],
    output: {
      // file: 'packages/angularjs-extras/dist/angularjs-extras.bundle.js',
      dir: 'packages/angularjs-extras/dist/',
      format: 'system'
    },
    plugins: [
      multi({
        exports: true,
        entryFileName: 'angularjs-extras.bundle.js'
      }),
      nodeResolve()
    ]
  }
  // ------------------------
  // Map Config
  // ------------------------
  // This is included in Angular+, so it isn't currently in use.
  // {
  //   input: glob.sync(
  //     './packages/map/src/**/*.js',
  //     {
  //       ignore: [
  //         './packages/map/src/**/*.min.js',
  //       ]
  //     }
  //   ),
  //   output: {
  //     dir: 'packages/map/dist/',
  //     format: 'system'
  //   },
  //   plugins: [
  //     multi({
  //       exports: true,
  //       entryFileName: 'map.bundle.js',
  //     })
  //   ]
  // },
  // {
  //   input: glob.sync(
  //     './packages/map/src/**/*.js',
  //     {
  //       ignore: [
  //         './packages/map/src/**/*.min.js',
  //       ]
  //     }
  //   ),
  //   output: {
  //     dir: 'packages/map/dist/',
  //     format: 'amd'
  //   },
  //   plugins: [multi({
  //     exports: true,
  //     entryFileName: 'map.bundle.js',
  //   })]
  // }
]
