// Carousel Component
// -----------------------
// Dependant on Swiper
// See https://github.com/nolimits4web/Swiper
// http://idangero.us/swiper/get-started/

/* global define */

/**
 * @typedef {Object} SlideImage
 * @property {String} src
 * @property {String} title
 * @property {String} description
 * @property {String} link
 * @property {String} target
 */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',

      'swiper',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.Swiper)
  }
}(this, function (Stratus, _, Swiper) {
  Stratus.Components.Carousel = {
    bindings: {
      // ngModel: '=',
      elementId: '@',
      initNow: '=',
      images: '@',
      imageLinkTarget: '@', // shortcut
      direction: '@',
      transitionEffect: '@',
      roundLengths: '@',
      loop: '@',
      autoHeight: '@',
      autoplay: '@',
      autoplayDelay: '@',
      lazyLoad: '@',
      navigation: '@',
      pagination: '@',
      scrollbar: '@'
    },
    controller: [
      '$scope',
      '$attrs',
      '$window',
      '$element',
      'utility',
      function ($scope, $attrs, $window, $element, utility) {
        // Initialize
        Stratus.Internals.CssLoader(Stratus.BaseUrl +
          Stratus.BundlePath + 'bower_components/swiper/dist/css/swiper' +
          (Stratus.Environment.get('production') ? '.min' : '') + '.css')
        utility.componentInitializer(this, $scope, $attrs, 'carousel', true)
        $scope.initialized = false

        let $ctrl = this
        $ctrl.$onInit = function () {
          let initNow = true
          if ($attrs.$attr.hasOwnProperty('initNow')) {
            initNow = _.isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
          }

          if (initNow) {
            init()
          } else {
            $ctrl.stopWatchingInitNow = $scope.$watch('$ctrl.initNow', function (initNow) {
              if (initNow === true) {
                if (!$scope.initialized) {
                  init()
                }
                $ctrl.stopWatchingInitNow()
              }
            })
          }
        }

        /**
         * need to wait to prep variable only once are ready on the template side
         * TODO allow for altering the variables and updating Swiper after init (live editing/inline changes)
         */
        function init () {
          /** @type {Array<SlideImage> || Array<String> || String} */
          let images = $attrs.images && _.isJSON($attrs.images) ? JSON.parse($attrs.images) : []
          /** @type {String} */
          $scope.imageLinkTarget = $attrs.imageLinkTarget ? $attrs.imageLinkTarget : null
          /**
           * @type {String}
           **/
          $scope.direction = $attrs.loop && $attrs.loop === 'vertical' ? 'vertical' : 'horizontal'
          /**
           * FIXME Some transitions seem to have trouble with lazyLoad that we'll need to work on
           * @type {String} ['slide,'fade,'cube,'coverflow','flip']
           */
          $scope.transitionEffect = $attrs.transitionEffect ? $attrs.transitionEffect : 'slide'
          /**
           * Set to true to round values of slides width and height to prevent blurry texts on usual resolution screens (if you have such)
           * Enabled by default
           * @type {boolean}
           */
          $scope.roundLengths = $attrs.roundLengths && _.isJSON($attrs.roundLengths) ? JSON.parse($attrs.roundLengths) : true
          /**
           * During pagination, allows a the last slide to return to the very first slide
           * Enabled by default
           * @type {boolean}
           **/
          $scope.loop = $attrs.loop && _.isJSON($attrs.loop) ? JSON.parse($attrs.loop) : true
          /**
           * EXPERIMENTAL
           * Enables a thumbnail gallery directly below the main carousel. Does not currently with with loop and will disable it.
           * Disabled by default
           * @type {boolean}
           **/
          $scope.gallery = $attrs.gallery && _.isJSON($attrs.gallery) ? JSON.parse($attrs.gallery) : false
          if ($scope.gallery) {
            $scope.loop = false
          }
          /**
           * Scales an image 'out' if it is too big for a the containing element to match to fit. Also centers all images that don't fit perfectly
           * Enabled by default
           * @type {boolean}
           */
          $scope.scaleHeight = $attrs.scaleHeight && _.isJSON($attrs.scaleHeight) ? JSON.parse($attrs.scaleHeight) : true
          /**
           * Allow Zooming into an image my double clicking or pinchig on Mobile. Requires and force enabled scaleHeight
           * Disabled by default
           * @type {boolean}
           */
          $scope.allowZoom = $attrs.allowZoom && _.isJSON($attrs.allowZoom) ? JSON.parse($attrs.allowZoom) : false
          $scope.scaleHeight = $scope.scaleHeight || $scope.allowZoom
          /**
           * Allow image to stretch wider than the image provided. May cause expected blurriness.
           * @type {boolean}
           */
          $scope.stretchWidth = $attrs.stretchWidth && _.isJSON($attrs.stretchWidth) ? JSON.parse($attrs.stretchWidth) : false
          /**
           * Resizes the entire element to match the height of the current slide. May cause resizes every time slide changes
           * @type {boolean}
           **/
          $scope.autoHeight = $attrs.autoHeight && _.isJSON($attrs.autoHeight) ? JSON.parse($attrs.autoHeight) : false
          /**
           * Automatically changes the slide are set intervals. Provide object and extra options
           * @type {Object || boolean}
           **/
          $scope.autoplay = $attrs.autoplay && _.isJSON($attrs.autoplay) ? JSON.parse($attrs.autoplay) : false
          /**
           * Allow moving the slides uing a finger of mouse
           * Enabled by default
           * @type {boolean}
           */
          $scope.allowTouchMove = $attrs.allowTouchMove && _.isJSON($attrs.allowTouchMove) ? JSON.parse($attrs.allowTouchMove) : true
          /** @type {Number} */
          $scope.transitionDelay = $attrs.transitionDelay && _.isJSON($attrs.transitionDelay) ? JSON.parse($attrs.transitionDelay) : 3000
          /**
           * Enable Lazy Loading to prevent everything from being fetched at once
           * By default Lazy Loading is enabled only for the next and previous images to give a buffer
           * @type {Object || boolean}
           */
          $scope.lazyLoad = $attrs.lazyLoad && _.isJSON($attrs.lazyLoad) ? JSON.parse($attrs.lazyLoad) : {}
          /** @type {boolean} */
          $scope.navigation = $attrs.navigation && _.isJSON($attrs.navigation) ? JSON.parse($attrs.navigation) : true
          /** @type {Object || boolean} */
          $scope.pagination = $attrs.pagination && _.isJSON($attrs.pagination) ? JSON.parse($attrs.pagination) : false
          /** @type {boolean} */
          $scope.scrollbar = $attrs.scrollbar && _.isJSON($attrs.scrollbar) ? JSON.parse($attrs.scrollbar) : false

          initImages(images)
          initSwiper()

          $scope.initialized = true
        }

        /**
         * Actions to be preformed when an image is clicked. Will by default open a link is one exists
         * @param {SlideImage} slideImage
         */
        $scope.imageClick = function imageClick (slideImage) {
          // Clicking doesn't have to open new window. it does for now
          if (slideImage && slideImage.hasOwnProperty('link')) {
            $window.open(slideImage.link, $scope.imageLinkTarget || slideImage.target || '_self')
          }
        }

        /**
         * Prep and process a list of images for Swiper's use
         * @param {Array<SlideImage> || Array<String> || String} images
         */
        function initImages (images) {
          if (typeof images === 'string') {
            images = [images]
          }
          if (_.isArray(images)) {
            /** @type {Array<SlideImage>} */
            let processedImages = []
            images.forEach(function (image) {
              /** @type {SlideImage} */
              let preppedImage = {}
              if (typeof image === 'string') {
                // just urls were provided
                preppedImage.src = image
              } else if (typeof image === 'object') {
                if (image.hasOwnProperty('src')) {
                  preppedImage = image
                }
              }
              if (Object.keys(preppedImage).length > 0) {
                processedImages.push(preppedImage)
              }
            })

            if (processedImages.length > 0) {
              $scope.images = processedImages
              // There is no extra images so remove the looping
              if ($scope.images.length < 2) {
                $scope.loop = false
                $scope.allowTouchMove = false
              }
            }
          }
        }

        /**
         * Setup and load Swiper using the previously defined variables
         */
        function initSwiper () {
          // TODO shouldn't be querying global, need to select like this: probably need to get away from className however
          $ctrl.swiperContainer = $element[0].getElementsByClassName('swiper-main')[0].getElementsByClassName('swiper-container')[0]

          $ctrl.swiperParameters = {
            // Optional parameters
            direction: $scope.direction,
            zoom: $scope.allowZoom,
            loop: $scope.loop,
            // roundLengths: $scope.roundLengths,
            effect: $scope.transitionEffect,
            autoHeight: $scope.autoHeight,
            allowTouchMove: $scope.allowTouchMove
          }

          /**
           * Navigation Options
           * @see {@link http://idangero.us/swiper/api/#navigation|Swiper Doc}
           */
          if ($scope.navigation) {
            $ctrl.swiperNextEl = $ctrl.swiperContainer.getElementsByClassName('swiper-button-next')[0]
            $ctrl.swiperPrevEl = $ctrl.swiperContainer.getElementsByClassName('swiper-button-prev')[0]

            $ctrl.swiperParameters.navigation = {
              nextEl: $ctrl.swiperNextEl,
              prevEl: $ctrl.swiperPrevEl
            }
          }

          /**
           * Pagination Options
           * @see {@link http://idangero.us/swiper/api/#pagination|Swiper Doc}
           */
          if ($scope.pagination) {
            $ctrl.swiperParameters.pagination = {}

            if (typeof $scope.pagination === 'object') {
              if ($scope.pagination.hasOwnProperty('el')) {
                $ctrl.swiperPaginationEl = $ctrl.swiperContainer.getElementsByClassName($scope.pagination.el)[0]
              }
              if ($scope.pagination.hasOwnProperty('clickable')) {
                $ctrl.swiperParameters.pagination.clickable = $scope.pagination.clickable
              }
              if ($scope.pagination.hasOwnProperty('dynamicBullets')) {
                $ctrl.swiperParameters.pagination.dynamicBullets = $scope.pagination.dynamicBullets
              }
              if ($scope.pagination.hasOwnProperty('dynamicMainBullets')) {
                $ctrl.swiperParameters.pagination.dynamicMainBullets = $scope.pagination.dynamicMainBullets
              }
              if ($scope.pagination.hasOwnProperty('render')) {
                // TODO this is just a custom selectable for now, need more customization
                switch ($scope.pagination.render) {
                  case 'fraction':
                    $ctrl.swiperParameters.pagination.type = 'fraction'
                    break
                  case 'customFraction':
                    $ctrl.swiperParameters.pagination.type = 'fraction'
                    $ctrl.swiperParameters.pagination.renderFraction = function (currentClass, totalClass) {
                      return '<span class="' + currentClass + '"></span>' + ' of ' + '<span class="' + totalClass + '"></span>'
                    }
                    break
                  case 'progressbarOpposite':
                    $ctrl.swiperParameters.pagination.progressbarOpposite = true
                    $ctrl.swiperParameters.pagination.type = 'progressbar'
                    break
                  case 'progressbar':
                    $ctrl.swiperParameters.pagination.type = 'progressbar'
                    break
                  // TODO requires custom css at this time (see testing page)
                  case 'numberBullet':
                    $ctrl.swiperParameters.pagination.renderBullet = function (index, className) {
                      return '<span class="' + className + ' swiper-pagination-number-bullet">' + (index + 1) + '</span>'
                    }
                    break
                  case 'bullet':
                  default:
                    $ctrl.swiperParameters.pagination.type = 'bullet'
                }
              }
            }

            if (!$ctrl.swiperPaginationEl) {
              $ctrl.swiperPaginationEl = $ctrl.swiperContainer.getElementsByClassName('swiper-pagination')[0]
            }
            $ctrl.swiperParameters.pagination.el = $ctrl.swiperPaginationEl
          }

          /**
           * Scrollbar Options
           * @see {@link http://idangero.us/swiper/api/#scrollbar|Swiper Doc}
           */
          if ($scope.scrollbar) {
            $ctrl.swiperScrollbarEl = $ctrl.swiperContainer.getElementsByClassName('swiper-scrollbar')[0]

            $ctrl.swiperParameters.scrollbar = {
              el: $ctrl.swiperScrollbarEl
            }
          }

          /**
           * Auto play Options
           * @see {@link http://idangero.us/swiper/api/#autoplay|Swiper Doc}
           */
          if ($scope.autoplay) {
            if ($scope.autoplay === true) {
              $scope.autoplay = {
                delay: $scope.transitionDelay,
                // autoplay will not be disabled after user interactions (swipes), it will be restarted every time after interaction
                disableOnInteraction: false
              }
            }
            if (!$scope.loop && $scope.autoplay) {
              if (typeof $scope.autoplay === 'boolean') {
                $scope.autoplay = {}
              }
              if (!$scope.autoplay.hasOwnProperty('stopOnLastSlide')) {
                $scope.autoplay.stopOnLastSlide = true
              }
            }

            $ctrl.swiperParameters.autoplay = $scope.autoplay
          }

          /**
           * Lazy Loading Options
           * @see {@link http://idangero.us/swiper/api/#lazy|Swiper Doc}
           */
          if ($scope.lazyLoad) {
            if ($scope.lazyLoad === true) {
              $scope.lazyLoad = {}
            }
            if ($scope.lazyLoad && !$scope.lazyLoad.hasOwnProperty('loadPrevNext')) {
              // preload the current, previous and next slides
              $scope.lazyLoad.loadPrevNext = true
            }
            if ($scope.lazyLoad && !$scope.lazyLoad.hasOwnProperty('loadPrevNextAmount')) {
              // preload X number of slides ahead/behind
              $scope.lazyLoad.loadPrevNextAmount = 1
            }
            if ($scope.lazyLoad && !$scope.lazyLoad.hasOwnProperty('loadOnTransitionStart')) {
              // begin to preload before the transition
              $scope.lazyLoad.loadOnTransitionStart = true
            }

            $ctrl.swiperParameters.lazy = $scope.lazyLoad
            $ctrl.swiperParameters.preloadImages = false
          }

          // console.log('swiperParameters', $ctrl.swiperParameters)

          $scope.$applyAsync(function () {
            $ctrl.swiper = new Swiper($ctrl.swiperContainer, $ctrl.swiperParameters)
            if ($scope.gallery) {
              $ctrl.galleryContainer = $element[0].getElementsByClassName('swiper-gallery')[0].getElementsByClassName('swiper-container')[0]
              // Looping does not work correctly with gallery, so it will need to be disabled
              // FIXME this is controlling the gallery, but its offset by 1 if looping...so it never matches... need to debug
              $ctrl.gallerySwiper = new Swiper($ctrl.galleryContainer, {
                direction: 'horizontal',
                effect: 'slide',
                // lazy: $scope.lazyLoad,
                preloadImages: false,
                // preventInteractionOnTransition: true,
                // allowSlidePrev: false,
                // allowSlideNext: false,
                // loop: true,
                // normalizeSlideIndex: false,
                // loopedSlides: 8,
                // loopAdditionalSlides: 2,
                // spaceBetween: 10,
                // centeredSlides: true,
                // slidesPerView: 8,
                // slidesPerView: 'auto',
                // freeMode: true,
                // touchRatio: 0.2,
                // slideToClickedSlide: true,
                // breakpoints
                spaceBetween: 10,
                centeredSlides: true,
                slidesPerView: 8,
                touchRatio: 0.2,
                slideToClickedSlide: true
              })
              $ctrl.swiper.controller.control = $ctrl.gallerySwiper
              $ctrl.gallerySwiper.controller.control = $ctrl.swiper
            }
          })
        }
      }
    ],
    templateUrl: Stratus.BaseUrl +
    Stratus.BundlePath + 'components/carousel' +
    (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
