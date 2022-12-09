// Twitter Feed Component
// ----------------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import 'angular'

// Third Party Libraries
import 'twitter'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {sanitize} from '@stratusjs/core/conversion'
import {cookie} from '@stratusjs/core/environment'

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'twitterFeed'
// const localPath = '@stratusjs/angularjs-extras/src/components'

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
        $scope.uid = _.uniqueId(_.snakeCase(name) + '_')
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.initialized = false

        // Settings
        $scope.feedOptions = {}

        // Delayed Initialization
        $scope.initialize = async () => {
            if ($scope.initialized) {
                return
            }
            $scope.initialized = true
            _.forEach(Stratus.Components.TwitterFeed.bindings, (value, key) => {
                _.set($scope.feedOptions, key, _.get($ctrl, key) || _.get($attrs, key))
            })
            if (cookie('env')) {
                console.log('feedOptions:', sanitize($scope.feedOptions))
            }
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
