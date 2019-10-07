// Twitter Feed Component
// ----------------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import 'angular'

// Third Party Libraries
// @ts-ignore
import * as twitter from 'https://platform.twitter.com/widgets'

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
        type: '<',
        screenName: '<',
        limit: '<',
        lang: '<',
        width: '<',
        height: '<',
        theme: '<',
        linkColor: '<',
        borderColor: '<',
        ariaPolite: '<',
        dnt: '<',
    },
    controller(
        $scope: any,
        $attrs: any
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.initialized = false

        // Delayed Initialization
        $scope.initialize = async () => {
            if ($scope.initialized) {
                return
            }
            $scope.initialized = true
            twitter.widgets.createTimeline(
                {
                    sourceType: 'list',
                    ownerScreenName: $scope.screenName
                },
                document.getElementById($scope.elementId),
                sanitize($attrs)
            )
        }

    },
    template: '<div id="{{ elementId }}"></div>'
}
