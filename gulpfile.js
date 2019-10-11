// Dependencies
const { src, dest, series, parallel } = require('gulp')
const concat = require('gulp-concat')
// const debug = require('gulp-debug')
const gulpDest = require('gulp-dest')
const terser = require('gulp-terser')
const del = require('del')
const _ = require('lodash')

// Unit Testing
// const mocha = require('mocha')
// const chai = require('chai')

// Task Specific
const standard = require('gulp-standard')
// const gulpStylelint = require('gulp-stylelint')
const minCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')

// Interpreters
const babel = require('gulp-babel')
const less = require('gulp-less')
const sass = require('gulp-sass')
const coffee = require('gulp-coffee')
// const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')

// Project
const tsProject = ts.createProject('tsconfig.json')

// Helper Functions
const nullify = function (proto) {
  proto = proto || []
  const clone = _.clone(proto)
  if (_.size(proto)) {
    _.each(clone, function (value, key, list) {
      list[key] = '!' + value
    })
  }
  return clone
}

const babelSettings = {
  /* *
  presets: [
    ['env', {
      targets: {
        // The % refers to the global coverage of users from browserslist
        browsers: ['>0.25%']
      }
      // exclude: ['transform-strict-mode']
    }]
  ],
  /* */
  plugins: [
    // 'transform-runtime',
    ['transform-es2015-modules-commonjs', {
      allowTopLevelThis: true,
      strictMode: false
    }]
  ]
}

// Locations
const location = {
  boot: {
    source: [
      'packages/boot/src/env.js',
      'packages/boot/src/config.js',
      'packages/boot/src/init.js'
    ],
    output: 'packages/boot/dist/boot.js'
  },
  external: {
    core: [],
    min: []
  },
  mangle: {
    core: [
      'dist/**/*.js',
      'packages/*/src/**/*.js'
    ],
    min: [
      'dist/**/*.min.js',
      'packages/*/src/**/*.min.js'
    ]
  },
  preserve: {
    core: [
      'packages/angularjs/src/**/*.js',
      'packages/angularjs-extras/src/**/*.js'
    ],
    min: [
      'packages/angularjs/src/**/*.min.js',
      'packages/angularjs-extras/src/**/*.min.js'
    ]
  },
  less: {
    core: [
      // 'stratus.less',
      'packages/*/src/**/*.less'
    ],
    compile: []
  },
  sass: {
    core: [
      // 'stratus.scss',
      'packages/*/src/**/*.scss'
    ],
    compile: []
  },
  css: {
    core: [
      // 'stratus.css',
      'packages/*/src/**/*.css'
    ],
    min: [
      // 'stratus.min.css',
      'packages/*/src/**/*.min.css'
    ],
    nonstandard: [
      'packages/*/src/**/*.css'
    ]
  },
  coffee: {
    core: [
      'packages/*/src/**/*.coffee'
    ],
    compile: []
  },
  typescript: {
    core: [
      'packages/*/src/**/*.ts'
    ],
    compile: []
  },
  template: {
    core: [
      'packages/*/src/**/*.html'
    ],
    min: [
      'packages/*/src/**/*.min.html'
    ]
  }
}

// Code Linters
function lintJS () {
  return src([
    '**/*.js',
    '!**/*.min.js',
    '!node_modules/**/*.js',
    '!dist/**/*.js',
    '!packages/**/*.js', // TypeScript supersedes Standard JS
    '!reports/**/*.js',
    '!umd/**/*.js'
  ])
  /* *
  .pipe(debug({
    title: 'Lint JS:'
  }))
  /* */
    .pipe(standard())
    .pipe(standard.reporter('default', {
      fix: true,
      breakOnError: true,
      breakOnWarning: true,
      showRuleNames: true
    }))
}
/* *
function lintCSS () {
  return src(_.union(location.css.core, nullify(location.css.min), nullify(location.css.nonstandard)))
    .pipe(debug({
      title: 'Lint CSS:'
    }))
    .pipe(gulpStylelint({
      // fix: true,
      reporters: [
        {
          formatter: 'string',
          console: true
        }]
    }))
}
/* */

// Distribution Functions
function distBoot () {
  return src(location.boot.source)
    /* *
    .pipe(debug({
      title: 'Build Boot:'
    }))
    /* */
    .pipe(concat(location.boot.output))
    .pipe(dest('.'))
}

// Mangle Functions
function cleanMangle () {
  if (!location.mangle.min.length) {
    return Promise.resolve('No files selected.')
  }
  return del(_.union(location.mangle.min, nullify(location.preserve.min)))
}
function compressMangle () {
  if (!location.mangle.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.mangle.core, nullify(location.mangle.min), nullify(location.preserve.core)), {
    base: '.'
  })
  /* *
  .pipe(debug({
    title: 'Compress Mangle:'
  }))
  /* */
    // .pipe(sourcemaps.init())
    .pipe(babel(babelSettings))
    .pipe(terser({
      // preserveComments: 'license',
      mangle: true,
      sourceMap: {
        url: 'inline'
      }
    }))
    .pipe(gulpDest('.', {
      ext: '.min.js'
    }))
    .pipe(dest('.'))
}

// External Functions
function cleanExternal () {
  if (!location.external.min.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.external.min)
}
function compressExternal () {
  if (!location.external.core.length) {
    return Promise.resolve('No files selected.')
  }

  return src(_.union(location.external.core, nullify(location.external.min)), {
    base: '.'
  })
    /* *
    .pipe(debug({
      title: 'Compress External:'
    }))
    /* */
    // .pipe(sourcemaps.init())
    .pipe(babel(babelSettings))
    .pipe(terser({
      // preserveComments: 'license',
      mangle: true,
      sourceMap: {
        url: 'inline'
      }
    }))
    .pipe(gulpDest('.', {
      ext: '.min.js'
    }))
    .pipe(dest('.'))
}

// Preserve Functions
function cleanPreserve () {
  if (!location.preserve.min.length) {
    return Promise.resolve('No files selected.')
  }
  return del(_.union(location.preserve.min, nullify(location.mangle.min)))
}
function compressPreserve () {
  if (!location.preserve.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.preserve.core, nullify(location.preserve.min), nullify(location.mangle.min)), {
    base: '.'
  })
    /* *
    .pipe(debug({
      title: 'Compress Preserve:'
    }))
    /* */
    // .pipe(sourcemaps.init())
    .pipe(babel(babelSettings))
    .pipe(terser({
      // preserveComments: 'license',
      mangle: false,
      sourceMap: {
        url: 'inline'
      }
    }))
    // .pipe(sourcemaps.write())
    .pipe(gulpDest('.', {
      ext: '.min.js'
    }))
    .pipe(dest('.'))
}

// LESS Functions
const cleanLESS = function () {
  if (!location.less.compile.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.less.compile)
}
function compileLESS () {
  if (!location.less.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.less.core, nullify(location.less.compile)), { base: '.' })
  // .pipe(debug({ title: 'Compile LESS:' }))
    .pipe(less({
      globalVars: {
        asset: "'/assets/1/0'"
      }
    }))
    .pipe(gulpDest('.', { ext: '.css' }))
    .pipe(dest('.'))
}

// SASS Functions
function cleanSASS () {
  if (!location.sass.compile.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.sass.compile)
}
function compileSASS () {
  if (!location.sass.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.sass.core, nullify(location.sass.compile)), { base: '.' })
  // .pipe(debug({ title: 'Compile SASS:' }))
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulpDest('.', { ext: '.css' }))
    .pipe(dest('.'))
}

// CSS Functions
function cleanCSS () {
  if (!location.css.min.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.css.min)
}
function compressCSS () {
  if (!location.css.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.css.core, nullify(location.css.min)), { base: '.' })
  // .pipe(debug({ title: 'Compress CSS:' }))
    .pipe(minCSS({
      compatibility: '*',
      inline: ['none'],
      rebaseTo: 'none' // FIXME: This is a temporary hack I created by breaking some code in CleanCSS to get back relative urls
    }))
    .pipe(gulpDest('.', { ext: '.min.css' }))
    .pipe(dest('.'))
}

// CoffeeScript Functions
function cleanCoffee () {
  if (!location.coffee.compile.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.coffee.compile)
}
function compileCoffee () {
  if (!location.coffee.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.coffee.core, nullify(location.coffee.compile)), { base: '.' })
  // .pipe(debug({ title: 'Compile Coffee:' }))
    .pipe(coffee({}))
    .pipe(gulpDest('.', { ext: '.js' }))
    .pipe(dest('.'))
}

// TypeScript Functions
function cleanTypeScript () {
  if (!location.typescript.compile.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.typescript.compile)
}
function compileTypeScript () {
  if (!location.typescript.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.typescript.core, nullify(location.typescript.compile)), { base: '.' })
    // .pipe(debug({ title: 'Compile TypeScript:' }))
    // .pipe(sourcemaps.init())
    .pipe(tsProject())
    // .pipe(sourcemaps.write())
    .pipe(gulpDest('.', { ext: '.js' }))
    .pipe(dest('.'))
}

// Template Functions
const cleanTemplate = function () {
  if (!location.template.min.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.template.min)
}
function compressTemplate () {
  if (!location.template.core.length) {
    return Promise.resolve('No files selected.')
  }
  return src(_.union(location.template.core, nullify(location.template.min)), {
    base: '.'
  })
  /* *
  .pipe(debug({
    title: 'Compress Template:'
  }))
  /* */
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeEmptyAttributes: true
    }))
    .pipe(gulpDest('.', {
      ext: '.min.html'
    }))
    .pipe(dest('.'))
}

// Module Exports
exports.compile = parallel(
  series(cleanLESS, compileLESS),
  series(cleanSASS, compileSASS),
  series(cleanCoffee, compileCoffee),
  series(cleanTypeScript, compileTypeScript)
)
exports.compress = parallel(
  series(cleanMangle, compressMangle),
  series(cleanPreserve, compressPreserve),
  series(cleanCSS, compressCSS),
  series(cleanTemplate, compressTemplate),
  series(cleanExternal, compressExternal)
)
exports.clean = parallel(
  cleanMangle,
  cleanPreserve,
  cleanLESS,
  cleanSASS,
  cleanCSS,
  cleanCoffee,
  cleanTypeScript,
  cleanTemplate,
  cleanExternal
)
exports.lint = lintJS
exports.dist = parallel(
  distBoot
  // distStratus
)

exports.compileTypeScript = series(cleanTypeScript, compileTypeScript)
