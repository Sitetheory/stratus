// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAugmentedJQuery, IScope, ITranscludeFunction} from 'angular'

// Stratus Dependencies
import {safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

export type CitationComponentScope = IScope & {
    // testId: string
    uid: string
    initialized: boolean
    // title: string
    // content: string // HTML
    citationOpened: boolean
    auto: boolean

    toggleCitation(): void
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'citation'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.Citation = {
    transclude: {
        content: '?stratusCitationContent',
        title: '?stratusCitationTitle',
    },
    controller(
        $scope: CitationComponentScope,
        $element: IAugmentedJQuery,
        $transclude: ITranscludeFunction,
        // $attrs: IAttributes
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.auto = true
        $scope.initialized = false
        // $scope.testId = $attrs.testId || '0'

        Stratus.Internals.CssLoader(`${localDir}${componentName}${min}.css`).then()

        // Initialization
        this.$onInit = () => {
            if (!$transclude.isSlotFilled('content')) {
                console.warn('Warning, stratus-citation had no content', $scope, $element)
                return // don't load
            }
            if ($transclude.isSlotFilled('title')) {
                // We need to use the custom title
                $scope.auto = false
            }
            $scope.$applyAsync(() => {$scope.initialized = true})
            // console.log('initted', $scope, $element)
        }
        $scope.toggleCitation = () => {
            $scope.citationOpened = !$scope.citationOpened
        }
    },
    templateUrl: `${localDir}${componentName}${min}.html`,
}
