// Twitter Feed Component
// ----------------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import 'angular'

// Third Party Libraries
// @ts-ignore
import * as twitter from 'twitter'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {camelToSnake, sanitize} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const name = 'twitterFeed'
const localPath = 'extras/components'

// This component is just a simple twitter feed.
Stratus.Components.TwitterFeed = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',

        // Twitter Options
        // https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference
        type: '=',
        screenName: '=',
        limit: '=',
        lang: '=',
        width: '=',
        height: '=',
        theme: '=',
        linkColor: '=',
        borderColor: '=',
        ariaPolite: '=',
        dnt: '=',
    },
    controller(
        $scope: any,
        $attrs: any,
        $element: any
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.initialized = false

        // Settings
        $scope.feedOptions = {}

        // Delayed Initialization
        $scope.initialize = async () => {
            if ($scope.initialized) {
                return
            }
            $scope.initialized = true
            _.each(Stratus.Components.TwitterFeed.bindings, (value, key) => {
                _.set($scope.feedOptions, key, _.get($ctrl, key) || _.get($attrs, key))
            })
            console.log('feedOptions:', sanitize($scope.feedOptions))
            // @ts-ignore
            const timeline = await twttr.widgets.createTimeline(
                {
                    sourceType: $scope.feedOptions.type || 'profile',
                    screenName: $scope.feedOptions.screenName,
                },
                $element[0],
                sanitize($scope.feedOptions) || {}
            )
        }

        // Initialize if hydrated
        if (!_.isEmpty($ctrl.screenName || $attrs.screenName)) {
            $scope.initialize()
            return
        }

        // Screen Name Watcher
        $scope.$watch('$ctrl.screenName', (newVal: any, oldVal: any) => {
            if (!newVal) {
                return
            }
            $scope.initialize()
        })
    },
    template: '<div id="{{ elementId }}"></div>'
}
