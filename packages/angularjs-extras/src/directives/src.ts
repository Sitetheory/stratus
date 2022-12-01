// Src Directive
// -----------------

// Runtime
import {filter, size, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import jQuery from 'jquery' // FIXME jQuery needs to be removed and tested
import {
    IAttributes,
    IAugmentedJQuery,
    IScope
} from 'angular'

// Environment
const name = 'src'

export type SrcScope = IScope & {
    whitelist: string[]
    filter?: string[]
    registered?: boolean
    group: {
        method: CallableFunction,
        el: IAugmentedJQuery,
        spy: string | IAugmentedJQuery
    }

    register(): void
    setSrc(tagType: string, src: string): void
}

// This directive intends to handle binding of a dynamic variable to
Stratus.Directives.Src = () => ({
    restrict: 'A',
    scope: {
        src: '@src',
        stratusSrc: '@stratusSrc',
        // stratusSrcSizes: '@stratusSrcSizes', // Unused at this time
        stratusSrcVersion: '@stratusSrcVersion',
        style: '@style'
    },
    link: (
        $attrs: IAttributes,
        $element: IAugmentedJQuery,
        $scope: SrcScope,
    ) => {
        // Initialize
        Stratus.Instances[uniqueId(name + '_')] = $scope

        $scope.whitelist = [
            'jpg',
            'jpeg',
            'png',
            'gif'
        ]
        $scope.filter = null

        // Add Watchers
        $scope.$watch(() => {
            return $attrs.stratusSrc || $attrs.src || $attrs.style
        }, (newVal, _oldVal, _scope) => {
            if (newVal && $element.attr('data-size')) {
                $scope.registered = false
            }
            $scope.register()
        })

        /** Sets the image src/css background on a tag */
        $scope.setSrc = (tagType: string, src: string) => {
            // FIXME: This is the problem?
            if (tagType === 'img') {
                $element.attr('src', src)
            } else {
                $element.css('background-image', `url(${src})`)
            }
        }

        // Group Registration
        $scope.registered = false
        $scope.register = () => {
            // find background image in CSS if there is no src (e.g. for div)
            let backgroundImage = null
            const type = $element.prop('tagName').toLowerCase()
            if (type !== 'img') {
                backgroundImage = $element.css('background-image') || null
                if (backgroundImage) {
                    backgroundImage = backgroundImage.slice(4, -1).replace(/"/g, '')
                }
            }

            // Prevent Progressive loading if set to false. Will not continue any further
            if (
                $attrs.stratusSrcVersion === 'false' ||
                $attrs.stratusSrcVersion === false
            ) {
                // Requested to not progressive load
                // Set it's suggested image and exit
                $scope.setSrc(type, $attrs.stratusSrc || $attrs.src || backgroundImage)
                return true
            }

            // Prevent Progressive loading if set to false
            if (
                $attrs.stratusSrc === 'false' ||
                $attrs.stratusSrc === false
            ) {
                // Requested to not progressive load
                // Set it's suggested image and exit
                // $scope.setSrc(type, $attr.src || backgroundImage)
                // New: if set to false, don't do stratus-src at all. see https://app.asana.com/0/348823217261712/1149917100747392
                return true
            }

            // Treat stratus-src="true" the same as empty
            if (
                $attrs.stratusSrc === 'true' ||
                $attrs.stratusSrc === true
            ) {
                $attrs.stratusSrc = null
            }

            const src = $attrs.stratusSrc || $attrs.src || backgroundImage

            // Get Extension
            let ext = src ? src.match(/\.([0-9a-z]+)(\?.*)?$/i) : null
            if (ext) {
                ext = ext[1] ? ext[1].toLowerCase() : null
            }

            // Limit Resizable Types
            $scope.filter = filter($scope.whitelist, value => ext === value)
            if (!size($scope.filter)) {
                // Set its suggested image and exit
                $scope.setSrc(type, src)
                return true
            }

            // Ensure we have a location
            if (!src) {
                return false
            }

            // Don't re-register
            if ($scope.registered) {
                return true
            }
            $scope.registered = true

            // Begin Registration
            $element.attr('data-src', src)

            // FIXME: This needs to be converted to the new event structure.
            // TODO: this also needs to listen for if the src or stratus-src changes, so it retriggers, e.g. in a
            //  reusable popup where the contents change.
            // TODO: this also needs to work in popups that may not be trigger "onScroll" or "onScreen" because they
            //  are outside the flow of the page (usually at the bottom of the page out of view, but in the window with
            //  an absolute position)
            $scope.group = {
                method: Stratus.Internals.LoadImage,
                el: $element,
                // Could be replaced with spy: $element.data('spy') ? $document[0].querySelector($element.data('spy')) : $element
                // TODO need spy examples to test with
                spy: $element.data('spy') ? jQuery($element.data('spy')) : $element
                // spy: $element.data('spy') ? Stratus.Select($element.data('spy')) : $element
            }
            Stratus.RegisterGroup.add('OnScroll', $scope.group) // TODO Stratus.RegisterGroup typings needed
            Stratus.Internals.LoadImage($scope.group) // TODO Stratus.Internals.LoadImage typings needed
            Stratus.Internals.OnScroll() // TODO Stratus.Internals.OnScroll typings needed
        }

        // Source Interpolation
        /* *
        $scope.src = $scope.src || $scope.stratusSrc
        $scope.interpreter = $interpolate($scope.src, false, null, true)
        $scope.initial = $scope.interpreter($scope.$parent)
        if (!isUndefined($scope.initial)) {
          $element.attr('stratus-src', $scope.initial)
          $scope.register()
        }

        $scope.$watch('stratusSrc', function (value) {
          if (!isUndefined(value) && !isEmpty(value)) {
            $element.attr('stratus-src', value)
            $element.attr('data-loading', false)
            $scope.registered = false
            $scope.register()
          }
        })
        /* */
    }
})
