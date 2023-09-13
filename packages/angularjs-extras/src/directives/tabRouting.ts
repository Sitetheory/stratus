/**
 * @file TabRouting Directive @stratusjs/angularjs-extras/directives/tabRouting
 * @description Provides On-Load and Tab switching support for URL sharing of md-tabs positions.
 * @example <md-tabs stratus-tab-routing />
 * @example <md-tabs stratus-tab-routing='{"urlLabel":"Section"}' />
 */

import {assignIn, head} from 'lodash'
import {element, IAttributes, IAugmentedJQuery, ILocationService, IRootScopeService, IScope} from 'angular'
import {Stratus} from '@stratusjs/runtime/stratus'
import {safeUniqueId} from '@stratusjs/core/misc'
import 'angular-material'

export type TabRoutingScope = IScope & {
    uid: string
    initialized: boolean
    options: {
        urlLabel: string
    }
    mdTabController?: MdTabsController
    tabIndexes: {[tabName: string]: number}

    init(): Promise<void>
    getTabNameOnUrl(): string | null
    hijackMdTabsController(): boolean
    onTabClick(tabName: string): void
    processTabs(): void
    selectTabName(tabName: string): boolean
    setTabNameOnUrl(tabName: string): void
}

type MdTab = {
    element: IAugmentedJQuery
    hasContent: boolean
    id: string
    index: number
    label: string // Tab title
    template: string // html string
    clickInjected?: boolean // custom variable being added
    getIndex(): number
    hasFocus(): boolean
    isActive(): boolean
    isLeft(): boolean
    isRight(): boolean
    shouldRender(): boolean
}

type MdTabsController = {
    hasFocus: boolean
    lastSelectedIndex: number
    selectedIndex: number
    tabs: MdTab[]

    getFocusedTabId(): string
    canPageBack(): boolean
    canPageForward(): boolean
    getTabElementIndex(tabEl: HTMLElement): number
    insertTab(tabData: MdTab, index: number): MdTab
    nextPage(): void
    previousPage(): void
    refreshIndex(): void
    removeTab(tabData: MdTab): void
    select(index: number, canSkipClick?: boolean): void
}

type MdTabsWrapperScope = IScope & {
    $mdTabsCtrl: MdTabsController
}

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'tabRouting'

Stratus.Directives.TabRouting = (
    $location: ILocationService,
    $rootScope: IRootScopeService
) => {
    return {
        restrict: 'A',
        // ensure we are nested on md-tabs
        require: 'mdTabs',
        link(
            $scope: TabRoutingScope,
            $element: IAugmentedJQuery,
            $attrs: IAttributes,
        ) {
            // Initialize
            $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
            Stratus.Instances[$scope.uid] = $scope
            $scope.options = {
                urlLabel: 'Tab'
            }

            const additionalOptions = $attrs.stratusTabRouting
                ? $scope.$eval($attrs.stratusTabRouting)
                : {}
            assignIn($scope.options, additionalOptions)

            const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

            $scope.init = async () => {
                // Wait a moment to init for parent md-tabs to process tabs first
                await sleep(500)
                if (!$scope.hijackMdTabsController()) {
                    console.warn(`${$scope.uid} unable to bind to MdTabsController.`)
                    return
                }
                // TODO need some type of watcher in case tabs change or get added to
                $scope.processTabs()

                $scope.initialized = true

                // Wait a moment to init then select a tab
                await sleep(250)

                // fetch the current URL route
                let tabName = $scope.getTabNameOnUrl()

                if (tabName) {
                    // turn spaces into dashes and use lowercase throughout
                    tabName = tabName.replace(/\s+/g, '-').toLowerCase()
                    $scope.selectTabName(tabName)
                }
            }

            $scope.hijackMdTabsController = () => {
                const mdTabsWrapperEl: HTMLElement = head($element.find('md-tabs-wrapper'))
                if (!mdTabsWrapperEl) {
                    console.warn('TabRouting could not find md-tabs-wrapper nested in it\'s element. Ensure this directive is attached to md-tabs.')
                    return false
                }
                const mdTabsWrapperScope: MdTabsWrapperScope = element(mdTabsWrapperEl).scope()
                $scope.mdTabController = mdTabsWrapperScope.$mdTabsCtrl
                return true
            }

            $scope.processTabs = () => {
                $scope.tabIndexes = {}
                $scope.mdTabController.tabs.forEach((tab) => {
                    let tabName = tab.label
                    // turn spaces into dashes and use lowercase throughout
                    tabName = tabName.replace(/\s+/g, '-').toLowerCase()
                    $scope.tabIndexes[tabName] = tab.getIndex()
                    if (!tab.hasOwnProperty('clickInjected')) {
                        tab.element.on('click', () => $scope.onTabClick(tabName))
                        tab.clickInjected = true
                    }
                })
            }

            $scope.onTabClick = (tabName: string) => {
                $scope.setTabNameOnUrl(tabName)
            }

            $scope.getTabNameOnUrl = (): string | null => {
                // must end and begin with a / (or some other symbol) to delimiter variables
                // /Tab/billing/
                const path = $location.path() || ''
                const regex = new RegExp(`\/${$scope.options.urlLabel}\/(.*?)\/`)
                const matches = regex.exec(path)
                let tabName
                if (
                    matches !== null &&
                    matches[1] // option 1 is the first selection group
                ) {
                    // Save the variable
                    tabName = matches[1]
                }
                return tabName
            }

            $scope.selectTabName = (tabName: string): boolean => {
                if (
                    $scope.tabIndexes &&
                    $scope.tabIndexes.hasOwnProperty(tabName)
                ) {
                    $scope.mdTabController.select($scope.tabIndexes[tabName])
                    return true
                }
                return false
            }

            $scope.setTabNameOnUrl = (tabName: string) => {
                // grab the full url path
                let path = $location.path() || ''
                const regex = new RegExp(`\/${$scope.options.urlLabel}\/(.*?)\/`)
                // Only get the Tab option if it even exists
                const matches = regex.exec(path)
                if (
                    matches !== null &&
                    matches[0] // option 0 is the whole /Tab/xxx/ selection if it exists
                ) {
                    // Save the variable
                    const removeString = matches[0]
                    path = path.replace(removeString, '')
                }
                if (!path.endsWith('/')) {
                    // Ensure we always start with a / for delimiting.
                    path += '/'
                }
                path += `${$scope.options.urlLabel}/${tabName}/`

                // Set the new url options
                $rootScope.$applyAsync(() => {
                    $location.path(path).replace()
                })
            }

            $scope.init().then()
        }
    }
}
