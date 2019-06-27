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
const gulpStylelint = require('gulp-stylelint')
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
      'boot/env.js',
      'boot/config.js',
      'boot/init.js'
    ],
    output: 'dist/boot.js'
  },
  stratus: {
    source: [
      'umd/header.js',
      'source/prototype.js',
      'source/external.js',
      'source/prototypes.js',
      'source/internals.js',
      'source/selector.js',
      'loaders/angular.bind.js',
      'source/core.js',
      'umd/footer.js'
    ],
    output: 'dist/stratus.js'
  },
  external: {
    core: [
      // 'node_modules/requirejs/require.js'
    ],
    min: [
      // 'node_modules/requirejs/require.min.js'
    ]
  },
  mangle: {
    core: [
      'dist/*.js',
      'extras/normalizers/*.js',
      'services/*.js',
      'extras/services/*.js',
      'legacy/**/*.js',
      'src/**/*.js'
    ],
    min: [
      'dist/*.min.js',
      'extras/normalizers/*.min.js',
      'services/*.min.js',
      'extras/services/*.min.js',
      'legacy/**/*.min.js',
      'src/**/*.min.js'
    ]
  },
  preserve: {
    core: [
      'boot/*.js',
      'components/*.js',
      'extras/components/*.js',
      'controllers/*.js',
      'extras/controllers/*.js',
      'directives/*.js',
      'extras/directives/*.js',
      'filters/*.js',
      'extras/filters/*.js'
    ],
    min: [
      'boot/*.min.js',
      'components/*.min.js',
      'extras/components/*.min.js',
      'controllers/*.min.js',
      'extras/controllers/*.min.js',
      'directives/*.min.js',
      'extras/directives/*.min.js',
      'filters/*.min.js',
      'extras/filters/*.min.js'
    ]
  },
  less: {
    core: [
      // 'stratus.less',
      'components/*.less',
      'extras/components/*.less',
      'directives/*.less',
      'extras/directives/*.less',
      'src/**/*.less'
    ],
    compile: []
  },
  sass: {
    core: [
      // 'stratus.scss',
      'components/*.scss',
      'extras/components/*.scss',
      'directives/*.scss',
      'extras/directives/*.scss',
      'src/**/*.scss'
    ],
    compile: []
  },
  css: {
    core: [
      // 'stratus.css',
      'components/*.css',
      'extras/components/*.css',
      'directives/*.css',
      'extras/directives/*.css',
      'src/**/*.css'
    ],
    min: [
      // 'stratus.min.css',
      'components/*.min.css',
      'extras/components/*.min.css',
      'directives/*.min.css',
      'extras/directives/*.min.css',
      'src/**/*.min.css'
    ]
  },
  coffee: {
    core: [
      'components/*.coffee',
      'extras/components/*.coffee',
      'directives/*.coffee',
      'extras/directives/*.coffee',
      'src/**/*.coffee'
    ],
    compile: []
  },
  typescript: {
    core: [
      'components/*.ts',
      'extras/components/*.ts',
      'directives/*.ts',
      'extras/directives/*.ts',
      'src/**/*.ts'
    ],
    compile: []
  },
  template: {
    core: [
      'components/*.html',
      'extras/components/*.html',
      'directives/*.html',
      'extras/directives/*.html',
      'src/**/*.html'
    ],
    min: [
      'components/*.min.html',
      'extras/components/*.min.html',
      'directives/*.min.html',
      'extras/directives/*.min.html',
      'src/**/*.min.html'
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
    '!src/**/*.js', // TypeScript supersedes Standard JS
    '!legacy/**/*.js',
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
function lintCSS () {
  return src(_.union(location.css.core, nullify(location.css.min)))
    /* *
    .pipe(debug({
      title: 'Lint CSS:'
    }))
    /* */
    .pipe(gulpStylelint({
      // fix: true,
      reporters: [
        {
          formatter: 'string',
          console: true
        }]
    }))
}

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
function distStratus () {
  return src(location.stratus.source)
    /* *
    .pipe(debug({
      title: 'Build Stratus:'
    }))
    /* */
    .pipe(concat(location.stratus.output))
    .pipe(dest('.'))
}

// Mangle Functions
function cleanMangle () {
  if (!location.mangle.min.length) {
    return Promise.resolve('No files selected.')
  }
  return del(location.mangle.min)
}
function compressMangle () {
  return src(_.union(location.mangle.core, nullify(location.mangle.min)), {
    base: '.'
  })
  /* *
  .pipe(debug({
    title: 'Compress Mangle:'
  }))
  /* */
    .pipe(babel(babelSettings))
    .pipe(terser({
      // preserveComments: 'license',
      mangle: true
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
    .pipe(babel(babelSettings))
    .pipe(terser({
      // preserveComments: 'license',
      mangle: true
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
  return del(location.preserve.min)
}
function compressPreserve () {
  return src(_.union(location.preserve.core, nullify(location.preserve.min)), {
    base: '.'
  })
    /* *
    .pipe(debug({
      title: 'Compress Preserve:'
    }))
    /* */
    .pipe(babel(babelSettings))
    .pipe(terser({
      // preserveComments: 'license',
      mangle: false
    }))
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
exports.lint = parallel(
  lintJS,
  lintCSS
)
exports.dist = parallel(
  distBoot,
  distStratus
)

exports.compileTypeScript = series(cleanTypeScript, compileTypeScript)
