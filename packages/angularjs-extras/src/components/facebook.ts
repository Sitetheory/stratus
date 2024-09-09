// Facebook Component
// --------------
// FIXME FB obejct does not get imported

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IScope, IWindowService} from 'angular'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {safeUniqueId} from '@stratusjs/core/misc'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'facebook'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type FacebookScope = IScope &  {
    uid: string
    elementId: string
    initialized: boolean

}

Stratus.Components.Facebook = {
    bindings: {
        pageId: '@',
        appId: '@',
        token: '@'
    },
    controller(
        $scope: FacebookScope,
        $attrs: IAttributes,
        $window: IWindowService
    ) {
        // Initialize
        // $scope.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        Stratus.Internals.CssLoader(`${localDir}${componentName}${min}.css`).then()
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.initialized = false

        // Custom Variables
        const facebookPageName = 'Test Page Name'
        const facebookPageId = 'enterpagId'
        const containerId = 'facebookPageContainer'
        const relatedContainerId = 'currentMediaContainer'
        const relatedContainerOffset = -150

        // Setup
        const container = document.getElementById(containerId)
        const relatedContainer = document.getElementById((relatedContainerId || containerId))

        // Functions
        // tslint:disable-next-line:no-unused-variable
        /*const resizePlugin = () => {
            // Manually resize Facebook Plugin's span and iframe to be 100%
            const plugin = document.querySelector('.fb-page')
            const containerSpan = plugin.querySelector('span')
            containerSpan.style.width = '100%'
            const iframe = plugin.querySelector('iframe')
            iframe.width = '100%'
            iframe.style.width = '100%'

            // FB has max 500px, scale if it's bigger so it fits in space at least
            const maxWidth = 500
            const width = container.offsetWidth
            if (width > maxWidth) {
                const scale = width / maxWidth
                iframe.style.transform = 'scale(' + scale + ')'
                iframe.style.transformOrigin = '0 0'
            }
        }*/

        const loadPlugin = () => {
            // Get height of the related Container (e.g. in another column)
            let height = relatedContainer.offsetHeight
            height = height > 0 ? (height + relatedContainerOffset) : height
            let width = container.offsetWidth
            const minHeight = 500
            const minWidth = 500
            height = height < minHeight ? minHeight : height
            width = width < minWidth ? minWidth : width

            // Facebook Page Plugin Code
            const content = '<div class="fb-page" data-href="https://www.facebook.com/' +
                facebookPageId + '" data-tabs="timeline" data-width="' + width +
                '" data-height="' + height +
                '" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"></div><blockquote cite="https://www.facebook.com/' +
                facebookPageId +
                '" class="fb-xfbml-parse-ignore"><a href="https://www.facebook.com/' +
                facebookPageId + '">' + facebookPageName + '</a></blockquote>'

            // Empty Container
            while (container.firstChild) {
                container.removeChild(container.firstChild)
            }

            // Add Plugin
            container.innerHTML = content

            // Parse Plugin
            // FIXME FB is not imported
            // FB.XFBML.parse()
        }

        // Register Resize after Plugin is Rendered
        // FIXME FB is not imported
        // FB.Event.subscribe('xfbml.render', () => {resizePlugin()})

        // (HACK): LoadPlugin does not resize height correctly on Load because it
        // does not know the correct height, so we delay it until the height is
        // set
        const loadJob = Stratus.Chronos.add(0.2, () => {
            // hard code a bit less than related container
            if (relatedContainer.offsetHeight > 0) {
                Stratus.Chronos.disable(loadJob)
                loadPlugin()
            }
        })
        Stratus.Chronos.enable(loadJob)

        // Reload on Resize
        $window.onresize = () => {
            loadPlugin()
        }

        /*
          $scope.fetch = function () {
            if ($scope.bindings.appId) {
              $http({
                method: 'POST',
                url: 'https://graph.facebook.com/' + $scope.bindings.pageId + '/feed?app_id=' + $scope.bindings.appId +
                 ($scope.bindings.token ? '&access_token=' + $scope.bindings.token : ''),
                data: {
                  message: 'message',
                  name: 'name',
                  caption: 'caption',
                  description: 'desc'
                }
              }).then(function (response) {
                console.log('success:', response)
              }, function (error) {
                console.error('error:', error)
              })
            }
          }
        */
        /*
        $scope.$watch('bindings', function () {
          $scope.fetch()
        })
        */
    }
}
