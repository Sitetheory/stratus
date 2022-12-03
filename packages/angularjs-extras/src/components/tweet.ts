// Tweet Component
// --------------
// FIXME I don't quite understand this logic, but I feel this component will not work
// FIXME requires twttr loaded

// Runtime
import {camelCase, uniqueId} from 'lodash'
import {Stratus} from '../../../runtime/src/stratus'
import {IAttributes, IAugmentedJQuery, ILogService, IParseService, IScope, IWindowService} from 'angular'
// import 'https://platform.twitter.com/widgets.js'

// Stratus Dependencies
import {cookie} from '../../../core/src/environment'
import {Model} from '@stratusjs/angularjs/services/model'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'tweet'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type TweetScope = IScope &  {
    uid: string
    elementId: string
    initialized: boolean

    model: Model
    tweet: string

    render(): void
}

Stratus.Components.Tweet = {
    bindings: {
        ngModel: '='
    },
    controller(
        $scope: TweetScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes,
        $parse: IParseService,
        $window: IWindowService
    ) {
        // Initialize
        // $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        $scope.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        Stratus.Instances[$scope.uid] = $scope
        $scope.model = $parse($attrs.ngModel) as unknown as Model
        // $scope.tweet = $scope.model($scope.$parent) // FIXME I don't understand this logic. commenting out
        $scope.render = () => {
            if (typeof $scope.tweet === 'string' && $scope.tweet.length) {
                $window.twttr.widgets.createTweet($scope.tweet, $element[0], { // FIXME requires twttr loaded
                    conversation: 'all', // or none
                    cards: 'visible', // or hidden
                    linkColor: '#cc0000', // default is blue
                    theme: 'light' // or dark
                })
            }
        }
        if ($scope.tweet) {
            $scope.render()
        }

        const strcmp = (a: string, b: string) => {
            return (a<b?-1:(a>b?1:0))
        }

        $scope.$parent.$watch($attrs.ngModel, (tweet: string) => {
            if (tweet && strcmp(tweet, $scope.tweet) !== 0) {
                $scope.tweet = tweet
                $scope.render()
            }
        })
    },
    templateUrl: `${localDir}${componentName}${min}.html`,
}
