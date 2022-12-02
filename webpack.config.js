const glob = require('glob')
const path = require('path')
const ts = require('gulp-typescript')
const keysTransformer = require('ts-transformer-keys/transformer').default

module.exports = {
  mode: 'production',
  entry: {
    angular: glob.sync(
      './packages/angular/src/**/*.ts',
      {
        ignore: [
          './packages/**/src/**/typings.d.ts',
          './packages/angular/src/test/**/*.ts',
          './packages/angular/src/quill-plugins/*.ts',
          './packages/angular/src/boot.ts'
        ]
      }
    ),
    angularjs: glob.sync('./packages/angularjs/src/**/*.ts'),
    // This package is mixed with JavaScript / TypeScript, so the bundle only has the JavaScript at this time
    'angularjs-extras': glob.sync('./packages/angularjs-extras/src/**/*.ts'),
    // This package is not in use yet
    // backend: glob.sync('./packages/backend/src/**/*.ts'),
    // The boot package is Native JavaScript
    // boot: glob.sync('./packages/boot/src/**/*.ts'),
    calendar: glob.sync('./packages/calendar/src/**/*.ts'),
    core: glob.sync('./packages/core/src/**/*.ts'),
    idx: glob.sync('./packages/idx/src/**/*.ts'),
    map: glob.sync('./packages/map/src/**/*.ts'),
    // React isn't set up
    // react: glob.sync('./packages/react/src/**/*.ts'),
    // Runtime has complex requires
    // runtime: glob.sync('./packages/runtime/src/**/*.ts'),
    stripe: glob.sync('./packages/stripe/src/**/*.ts'),
    swiper: glob.sync('./packages/swiper/src/**/*.ts')
  },
  // entry: {
  //   boot: './packages/angular/src/boot.ts',
  //   main: './packages/angular/src/main.ts',
  // },
  output: {
    path: path.resolve(__dirname, 'packages'),
    filename: '[name]/dist/[name].bundle.js',
    // libraryTarget: 'system'
  },
  plugins: [],
  module: {
    rules: [
      // {
      //   parser: {
      //     system: false
      //   }
      // },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          getCustomTransformers: program => ({
            before: [
              keysTransformer(program)
            ]
          })
        }
      },
      {
        test: /\.(s(a|c)ss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  }
}
