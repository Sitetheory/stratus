// Carousel Component
// @stratusjs/swiper/carousel.component
// <stratus-swiper-carousel>
// --------------

// Runtime
import {findKey, get, has, isArray, isBoolean} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IAugmentedJQuery, IScope, ITimeoutService, IWindowService} from 'angular'
import {
    Swiper, SwiperOptions,
    // Modules
    A11y, Autoplay, Navigation, Pagination, Scrollbar, Zoom, // + Thumbs
    // Effects
    EffectCoverflow, EffectCube, EffectFade, EffectFlip // EffectCards, EffectCreative
} from 'swiper'
import {PaginationOptions} from 'swiper/types/modules/pagination'
import {AutoplayOptions} from 'swiper/types/modules/autoplay'
// Stratus Dependencies
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
// Stratus Directives
import '@stratusjs/angularjs-extras' // directives/src

// CSS imported directly in
import 'swiper/css/bundle'
import './carousel.component.less'

// Reusable Objects
export interface SlideImage {
    src?: string,
    title?: string,
    description?: string,
    link?: string,
    target?: string,
    lazy?: string
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'swiper'
// const moduleName = 'components'
const componentName = 'carousel'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type SwiperCarouselScope = IScope & {
    uid: string
    elementId: string
    localDir: string
    initialized: boolean
    swiperContainer: HTMLElement
    swiperParameters: SwiperOptions
    swiper: Swiper
    gallerySwiper?: Swiper
    model?: Model
    collection?: Collection
    property?: string
    images: SlideImage[]

    /** @deprecated */
    imageLinkTarget: '_self' | '_blank'
    slideLinkTarget: '_self' | '_blank'

    /** During pagination, allows a the last slide to return to the very first slide */
    loop: true | boolean
    /** Allow moving the slides using a finger of mouse */
    allowTouchMove: true | boolean
    direction: 'vertical' | 'horizontal'
    transitionEffect: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip'
    /** Set to true to round values of slides width and height to prevent blurry texts on usual resolution screens (if you have such) */
    roundLengths: true | boolean
    /** EXPERIMENTAL
     * Enables a thumbnail gallery directly below the main carousel. Does not currently with with loop and will disable it.
     */
    gallery: false | boolean
    /** Scales an image 'out' if it is too big for a the containing element to match to fit. Also centers all images
     *  that don't fit perfectly
     */
    scaleHeight: true | boolean
    /** Resizes the entire element to match the height of the current slide. May cause resizes every time slide changes */
    autoHeight: false | boolean
    /** Allow image to stretch wider than the image provided. May cause expected blurriness. */
    stretchWidth: false | boolean
    /** Allow Zooming into an image my double clicking or pinching on Mobile. Requires and force enabled scaleHeight */
    allowZoom: false | boolean
    transitionDelay: 3000 | number
    navigation: true | boolean
    /** FIXME 'bullet' is deprecated. Use 'bullets' instead */
    pagination: false | boolean | PaginationOptions & {
        render?: 'fraction' | 'customFraction' | 'progressbarOpposite' | 'progressbar' | 'numberBullet' | 'bullet' | 'bullets'
    }
    /** Automatically changes the slide at set intervals. Provide object and extra options */
    autoplay: boolean | AutoplayOptions
    scrollbar: false | boolean
    slidesPerGroup: 1 | number

    initSwiper(): void
    imageClick(slideImage: SlideImage): void
    remove(): void
}

type SwiperCarouselCtrl = {
    swiperPaginationEl?: HTMLElement | string
    swiperScrollbarEl?: HTMLElement | string
    swiperNextEl?: HTMLElement | string
    swiperPrevEl?: HTMLElement | string

    $onInit(): void
}

Stratus.Components.SwiperCarousel = {
    transclude: {
        slide: '?stratusCarouselSlide'
    },
    bindings: {
        // Basic Control for Designers
        elementId: '@',

        // ngModel Logic for a Symbiotic Controller Relationship
        ngModel: '=',
        property: '@',

        // Registry Elements
        target: '@',
        id: '@',
        manifest: '@',
        decouple: '@',
        direct: '@',
        api: '@',
        urlRoot: '@',

        // Collection Options
        limit: '@',
        options: '<',

        // Carousel Specific
        initNow: '=',
        slides: '<',
        /** @deprecated */
        imageLinkTarget: '@', // shortcut
        slideLinkTarget: '@', // shortcut
        direction: '@',
        transitionEffect: '@',
        roundLengths: '@',
        loop: '@',
        autoHeight: '@',
        autoplay: '@',
        autoplayDelay: '@',
        navigation: '@',
        pagination: '@',
        scrollbar: '@',
        slidesPerGroup: '@',
        stretchWidth: '@',
        allowTouchMove: '@',
        allowZoom: '@'
    },
    controller(
        $attrs: IAttributes,
        $element: IAugmentedJQuery,
        $scope: SwiperCarouselScope,
        $timeout: ITimeoutService,
        $window: IWindowService,
    ) {
        // Initialize
        const $ctrl: SwiperCarouselCtrl = this
        $scope.uid = safeUniqueId(packageName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.localDir = localDir
        $scope.initialized = false

        // Hoist Attributes
        $scope.property = $attrs.property || null

        // Symbiotic Data Connectivity
        $scope.$watch('$ctrl.ngModel', (data: Model | Collection) => {
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data as Model
            } else if (data instanceof Collection && data !== $scope.collection) {
                $scope.collection = data as Collection
            }
        })

        // Image Conversion
        $scope.$watch('collection.models', (models: Model[]) => {
                $scope.images = $scope.images || []
                models = models || []
                models.forEach(model => {
                    if (!$scope.property) {
                        return
                    }
                    const target = model.get($scope.property)
                    if (!target) {
                        return
                    }
                    $scope.images.push(target)
                })
            }
        )

        /**
         * Finds the current element's size, or it's recursive parent's size
         * @param el - An element
         * @param columns - Number of columns within the element that is except to calculate for size
         */
        const getElementSize = (el: Element | any, columns?: number): number => {
            // const el = Stratus.Select(selector)
            let width = el.width() / (columns || 1)
            if (width <= 0) {
                // console.log('no width found, looking for parent')
                const parent = el.parent()
                width = getElementSize(parent, columns || 1)
            }
            return width
        }

        /**
         * Determines the size a particular element and returns the applicable image size name to be used to load image files
         * @param selector - An element
         * @param columns - Number of columns within the element that is except to calculate for size
         */
        const getImageSizeName = (selector: Element | any, columns?: number): 'xs' | 's' | 'm' | 'l' | 'xl' | 'hq' | string => {
            const el = Stratus.Select(selector)
            const width = getElementSize(el, columns)
            // console.log('final width', width, el)
            return findKey(Stratus.Settings.image.size, (s: number) => {
                return (s >= width)
            })
        }

        /**
         * Determines the new url for the image size specified and returns proper string url
         * @param src - Original Url to update
         * @param sizeName - Size name to append to image url
         */
        const replaceImageSizeSrc = (src: string, sizeName: 'xs' | 's' | 'm' | 'l' | 'xl' | 'hq' | string): string => {
            const srcOrigin = src
            const srcRegex: RegExp = /^(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)/gi
            const srcMatch: RegExpExecArray = srcRegex.exec(src)
            if (srcMatch !== null) {
                src = srcMatch[1] + '-' + sizeName + '.' + srcMatch[3]
            } else {
                console.error('Unable to find file name for image src:', srcOrigin)
            }

            return src
        }

        /**
         * Prep and process a list of images for Swiper's use
         * TODO later process non-image based slides
         */
        const initImages = (images: SlideImage[] | string[] | string): void => {
            if (typeof images === 'string') {
                images = [images]
            }
            if (isArray(images)) {
                // The main element doesn't have a size ever, so use the inner container
                const thisEl = $element[0].querySelector('.swiper')
                const sizeName = getImageSizeName(thisEl)
                const processedImages: SlideImage[] = []
                images.forEach(
                    (image: string | SlideImage) => {
                        let preppedImage: SlideImage = {}
                        if (typeof image === 'string') {
                            // just urls were provided
                            preppedImage.src = image
                        } else if (typeof image === 'object') {
                            if (has(image, 'src')) {
                                if (get(image, 'lazy') === 'stratus-src') {
                                    image.src = replaceImageSizeSrc(image.src, sizeName)
                                    // console.log('image upgraded to ', image.src)
                                }
                                image.title = get(image, 'title')
                                image.description = get(image, 'ShortDescription') ||
                                    get(image, 'description') || get(image, 'LongDescription') || image.title
                                preppedImage = image
                            }
                        }
                        if (Object.keys(preppedImage).length > 0) {
                            processedImages.push(preppedImage)
                        }
                    })

                if (processedImages.length > 0) {
                    // console.log('processedImages', processedImages)
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
         * need to wait to prep variable only once are ready on the template side
         * TODO allow for altering the variables and updating Swiper after init (live editing/inline changes)
         */
        const init = (): void => {
            // NOTE: slides can be an expression, so we need to reference $ctrl, where they've already been parsed
            /** type {Array<SlideImage> || Array<String> || String} */
            const slides = this.slides ? this.slides : [] // References images for temporary backwards compatibility
            // console.log('CAROUSEL initing with', slides)

            /** @deprecated */
            $scope.imageLinkTarget = $attrs.imageLinkTarget ? $attrs.imageLinkTarget : null
            $scope.slideLinkTarget = $attrs.slideLinkTarget ? $attrs.slideLinkTarget : $scope.imageLinkTarget
            $scope.direction = $attrs.direction && $attrs.direction === 'vertical' ? 'vertical' : 'horizontal'
            $scope.transitionEffect = $attrs.transitionEffect ? $attrs.transitionEffect : 'slide'
            $scope.roundLengths = $attrs.roundLengths && isJSON($attrs.roundLengths) ? JSON.parse($attrs.roundLengths) : true
            $scope.loop = $attrs.loop && isJSON($attrs.loop) ? JSON.parse($attrs.loop) : true
            $scope.gallery = $attrs.gallery && isJSON($attrs.gallery) ? JSON.parse($attrs.gallery) : false
            /* if ($scope.gallery) {
                $scope.loop = false
            } */
            $scope.scaleHeight = $attrs.scaleHeight && isJSON($attrs.scaleHeight) ? JSON.parse($attrs.scaleHeight) : true
            $scope.allowZoom = $attrs.allowZoom && isJSON($attrs.allowZoom) ? JSON.parse($attrs.allowZoom) : false
            $scope.scaleHeight = $scope.scaleHeight || $scope.allowZoom
            $scope.stretchWidth = $attrs.stretchWidth && isJSON($attrs.stretchWidth) ? JSON.parse($attrs.stretchWidth) : false
            $scope.autoHeight = $attrs.autoHeight && isJSON($attrs.autoHeight) ? JSON.parse($attrs.autoHeight) : false
            $scope.autoplay = $attrs.autoplay && isJSON($attrs.autoplay) ? JSON.parse($attrs.autoplay) : false
            $scope.allowTouchMove = $attrs.allowTouchMove && isJSON($attrs.allowTouchMove) ? JSON.parse($attrs.allowTouchMove) : true
            $scope.transitionDelay = $attrs.transitionDelay && isJSON($attrs.transitionDelay) ? JSON.parse($attrs.transitionDelay) : 3000
            $scope.navigation = $attrs.navigation && isJSON($attrs.navigation) ? JSON.parse($attrs.navigation) : true

            /** type {Object || boolean} */
            $scope.pagination = $attrs.pagination && isJSON($attrs.pagination) ? JSON.parse($attrs.pagination) : false
            $scope.scrollbar = $attrs.scrollbar && isJSON($attrs.scrollbar) ? JSON.parse($attrs.scrollbar) : false
            $scope.slidesPerGroup = $attrs.slidesPerGroup && isJSON($attrs.slidesPerGroup) ? JSON.parse($attrs.slidesPerGroup) : 1

            initImages(slides)
            $scope.initSwiper()

            $scope.initialized = true
        }

        // Initialization by Event
        $ctrl.$onInit = () => {
            let initNow = true
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                // TODO: This needs better logic to determine what is acceptably initialized
                initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
            }

            if (initNow) {
                init()
                return
            }

            const stopWatchingInitNow = $scope.$watch('$ctrl.initNow', (initNowCtrl: boolean) => {
                // console.log('CAROUSEL initNow called later')
                if (initNowCtrl !== true) {
                    return
                }
                if (!$scope.initialized) {
                    init()
                }
                stopWatchingInitNow()
            })
        }

        /**
         * Actions to be preformed when an image is clicked. Will by default open a link is one exists
         * param {SlideImage} slideImage
         */
        $scope.imageClick = (slideImage: SlideImage): void => {
            // Clicking doesn't have to open new window. it does for now
            if (slideImage && Object.prototype.hasOwnProperty.call(slideImage, 'link')) {
                $window.open(slideImage.link, $scope.slideLinkTarget || slideImage.target || '_self')
            }
        }

        /**
         * Setup and load Swiper using the previously defined variables
         */
        $scope.initSwiper = (): void => {
            // TODO need to select like this: probably need to get away from className however
            $scope.swiperContainer = $element[0].querySelector('.swiper')

            $scope.swiperParameters = {
                init: false, // We will manually init
                modules: [
                    A11y
                ],
                // Optional parameters
                direction: $scope.direction,
                loop: $scope.loop,
                // roundLengths: $scope.roundLengths,
                autoHeight: $scope.autoHeight,
                allowTouchMove: $scope.allowTouchMove
            }

            // , , , , Thumbs modules
            // $scope.swiperParameters.modules.push(Navigation)

            /**
             * Navigation Options
             * @see {@link https://swiperjs.com/swiper-api#navigation}
             */
            if ($scope.navigation) {
                $scope.swiperParameters.modules.push(Navigation)
                $ctrl.swiperNextEl = $scope.swiperContainer.getElementsByClassName('swiper-button-next')[0] as HTMLElement
                $ctrl.swiperPrevEl = $scope.swiperContainer.getElementsByClassName('swiper-button-prev')[0] as HTMLElement

                $scope.swiperParameters.navigation = {
                    nextEl: $ctrl.swiperNextEl,
                    prevEl: $ctrl.swiperPrevEl
                }
            }

            /**
             * TransitionEffects
             * @see {@link https://swiperjs.com/swiper-api#coverflow-effect}
             * @see {@link https://swiperjs.com/swiper-api#cube-effect}
             * @see {@link https://swiperjs.com/swiper-api#fade-effect}
             * @see {@link https://swiperjs.com/swiper-api#flip-effect}
             * @TODO https://swiperjs.com/swiper-api#cards-effect
             * @TODO https://swiperjs.com/swiper-api#creative-effect
             */
            if ($scope.transitionEffect) {
                switch($scope.transitionEffect) {
                    case 'coverflow': {
                        $scope.swiperParameters.modules.push(EffectCoverflow)
                        // TODO add options
                        break
                    }
                    case 'cube': {
                        $scope.swiperParameters.modules.push(EffectCube)
                        // TODO add options
                        break
                    }
                    case 'fade': {
                        $scope.swiperParameters.modules.push(EffectFade)
                        $scope.swiperParameters.fadeEffect = {
                            crossFade: true
                        }
                        break
                    }
                    case 'flip': {
                        $scope.swiperParameters.modules.push(EffectFlip)
                        // TODO add options
                        break
                    }
                }
                $scope.swiperParameters.effect = $scope.transitionEffect
            }

            /**
             * Pagination Options
             * @see {@link https://swiperjs.com/swiper-api#pagination}
             */
            if ($scope.pagination) {
                $scope.swiperParameters.modules.push(Pagination)
                $scope.swiperParameters.pagination = {}

                if (typeof $scope.pagination === 'string') {
                    $scope.pagination = {
                        render: $scope.pagination
                    }
                }

                if (typeof $scope.pagination === 'object') {
                    /*if (Object.prototype.hasOwnProperty.call($scope.pagination, 'el')) {
                        $ctrl.swiperPaginationEl = $scope.swiperContainer.getElementsByClassName($scope.pagination.el)[0]
                    }*/
                    if (Object.prototype.hasOwnProperty.call($scope.pagination, 'clickable')) {
                        $scope.swiperParameters.pagination.clickable = $scope.pagination.clickable
                    }
                    if (Object.prototype.hasOwnProperty.call($scope.pagination, 'dynamicBullets')) {
                        $scope.swiperParameters.pagination.dynamicBullets = $scope.pagination.dynamicBullets
                    }
                    if (Object.prototype.hasOwnProperty.call($scope.pagination, 'dynamicMainBullets')) {
                        $scope.swiperParameters.pagination.dynamicMainBullets = $scope.pagination.dynamicMainBullets
                    }
                    if (Object.prototype.hasOwnProperty.call($scope.pagination, 'render')) {
                        // TODO this is just a custom selectable for now, need more customization
                        switch ($scope.pagination.render) {
                            case 'fraction':
                                $scope.swiperParameters.pagination.type = 'fraction'
                                break
                            case 'customFraction':
                                $scope.swiperParameters.pagination.type = 'fraction'
                                $scope.swiperParameters.pagination.renderFraction = (currentClass: string, totalClass: string) => {
                                    return '<span class="' + currentClass + '"></span>' + ' of ' + '<span class="' + totalClass + '"></span>'
                                }
                                break
                            case 'progressbarOpposite':
                                $scope.swiperParameters.pagination.progressbarOpposite = true
                                $scope.swiperParameters.pagination.type = 'progressbar'
                                break
                            case 'progressbar':
                                $scope.swiperParameters.pagination.type = 'progressbar'
                                break
                            // TODO requires custom css at this time (see testing page)
                            case 'numberBullet':
                                $scope.swiperParameters.pagination.renderBullet = (index: number, className: string) => {
                                    return '<span class="' + className + ' swiper-pagination-number-bullet">' + (index + 1) + '</span>'
                                }
                                break
                            case 'bullet':
                            case 'bullets':
                            default:
                                $scope.swiperParameters.pagination.type = 'bullets'
                        }
                    }
                }

                if (!$ctrl.swiperPaginationEl) {
                    $ctrl.swiperPaginationEl = $scope.swiperContainer.getElementsByClassName('swiper-pagination')[0] as HTMLElement
                }
                $scope.swiperParameters.pagination.el = $ctrl.swiperPaginationEl
            }

            /**
             * Scrollbar Options
             * @see {@link https://swiperjs.com/swiper-api#scrollbar}
             */
            if ($scope.scrollbar) {
                $ctrl.swiperScrollbarEl = $scope.swiperContainer.getElementsByClassName('swiper-scrollbar')[0] as HTMLElement
                $scope.swiperParameters.modules.push(Scrollbar)

                $scope.swiperParameters.scrollbar = {
                    el: $ctrl.swiperScrollbarEl
                }
            }

            // TODO: Add Documentation
            // TODO: This needs work but unused atm
            if ($scope.slidesPerGroup > 1) {
                $scope.swiperParameters.slidesPerView = $scope.slidesPerGroup
            }

            /**
             * Autoplay Options
             * @see {@link https://swiperjs.com/swiper-api#autoplay}
             */
            if ($scope.autoplay) {
                $scope.swiperParameters.modules.push(Autoplay)
                if ($scope.autoplay === true) {
                    $scope.autoplay = {
                        delay: $scope.transitionDelay,
                        // autoplay will not be disabled after user interactions (swipes), it will be restarted every time after interaction
                        disableOnInteraction: false
                    }
                }
                if (!$scope.loop && $scope.autoplay) {
                    if (isBoolean($scope.autoplay)) {
                        $scope.autoplay = {}
                    }
                    if (!Object.prototype.hasOwnProperty.call($scope.autoplay, 'stopOnLastSlide')) {
                        $scope.autoplay.stopOnLastSlide = true
                    }
                }

                $scope.swiperParameters.autoplay = $scope.autoplay
            }

            /**
             * Zoom Options
             * @see {@link https://swiperjs.com/swiper-api#zoom}
             */
            if ($scope.allowZoom) {
                $scope.swiperParameters.modules.push(Zoom)
                $scope.swiperParameters.zoom = $scope.allowZoom
            }
            // console.log('swiperParameters', $scope.swiperParameters)

            $scope.$applyAsync(() => {
                // $applyAsync is causing this function to run twice. Adding check to make sure it doesn't
                if ($scope.swiper) {
                    // console.log('swiper already exists, canceling')
                    return
                }
                // console.log('parameters:', $scope.swiperParameters, $ctrl)
                $scope.swiper = new Swiper($scope.swiperContainer, $scope.swiperParameters)
                /*
                Issue: When loading a page, the first time a set of Swiper slideshows are called, it will load fine.
                However, if a set is loaded a second time, the slides seem to fail to initialize and the next/prev buttons do not register.
                This issue seems to resolve itself when the Window is resized or swiper is forcibly updated (swiper.update())
                Below are attempts at a workaround to ensure swiper continues to work after second load by causing a delayed update
                */
                $scope.swiper.on('init', () => {
                    $timeout(() => {
                        $scope.swiper.update()
                    }, 100)
                })

                /**
                 * TODO refactor - remove gallery
                 * @see {@link https://swiperjs.com/swiper-api#thumbs}
                 */
                /* if ($scope.gallery) {
                    // TODO this all needs a refactor
                    $scope.swiperParameters.modules.push(Navigation)
                    $ctrl.galleryContainer = $element[0].getElementsByClassName('swiper-gallery')[0].getElementsByClassName('swiper')[0]
                    // Looping does not work correctly with gallery, so it will need to be disabled
                    // FIXME this is controlling the gallery, but its offset by 1 if looping...so it never matches... need to debug
                    $scope.gallerySwiper = new Swiper($ctrl.galleryContainer, {
                        direction: 'horizontal',
                        effect: 'slide',
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
                    $scope.swiper.controller.control = $scope.gallerySwiper
                    $scope.gallerySwiper.controller.control = $scope.swiper
                } */
                // initializing manually to allow on init events
                $scope.swiper.init()
            })
        }

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
            // console.log('destroying swiper widget... after destroying, still doenst work')
            delete $scope.swiper
            // delete $scope.gallerySwiper
        }
    },
    templateUrl: (): string => `${localDir}${componentName}.component${min}.html`
}
