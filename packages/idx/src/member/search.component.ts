/**
 * @file IdxMemberSearch Component @stratusjs/idx/member/search.component
 * @example <stratus-idx-member-search>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Member-Search-Widget
 */

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
// import 'angular-material'

// Services
import '@stratusjs/idx/idx'
// tslint:disable-next-line:no-duplicate-imports
import {IdxEmitter, IdxSearchScope, IdxService} from '@stratusjs/idx/idx'

// Stratus Dependencies
import {isJSON, LooseObject} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {IdxMemberListScope} from '@stratusjs/idx/member/list.component'

// Component Preload
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/member/list.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'member'
const componentName = 'search'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxMemberSearchScope = IdxSearchScope & {
    options: object | any // FIXME
    variableSyncing: LooseObject

    displayMemberSelector(): void
    variableSync(): Promise<void>
}

Stratus.Components.IdxMemberSearch = {
    bindings: {
        // TODO doc
        elementId: '@',
        tokenUrl: '@',
        listId: '@',
        listLinkUrl: '@',
        listLinkTarget: '@',
        options: '@',
        template: '@',
        variableSync: '@'
    },
    controller(
        $attrs: angular.IAttributes,
        $q: angular.IQService,
        $mdDialog: angular.material.IDialogService,
        $mdPanel: angular.material.IPanelService,
        $scope: IdxMemberSearchScope,
        $timeout: angular.ITimeoutService,
        $window: angular.IWindowService,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Instances[$scope.elementId] = $scope
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        $ctrl.$onInit = () => {
            $scope.listId = $attrs.listId || null
            $scope.listInitialized = false
            $scope.listLinkUrl = $attrs.listLinkUrl || '/property/member/list'
            $scope.listLinkTarget = $attrs.listLinkTarget || '_self'

            // If the List hasn't updated this widget after 2 seconds, make sure it's checked again.
            // A workaround for the race condition for now, up for suggestions
            /* $timeout(function () {
              if (!$scope.listInitialized) {
                // $scope.refreshSearchWidgetOptions()
              }
            }, 2000) */

            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

            // Set default queries
            $scope.options.query = $scope.options.query || {}

            if ($scope.options.tokenUrl) {
                /// ajax/request?class=property.token_auth&method=getToken
                Idx.setTokenURL($scope.options.tokenUrl)
            }

            // Register this Search with the Property service
            Idx.registerSearchInstance($scope.elementId, moduleName, $scope, $scope.listId)
            if ($scope.listId) {
                // When the List loads, we need to update our settings with the list's
                Idx.on($scope.listId, 'init', $scope.refreshSearchWidgetOptions)
                Idx.on($scope.listId, 'searching', $scope.refreshSearchWidgetOptions)
            }

            // $scope.variableSync()
            Idx.emit('init', $scope)
        }

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         */
        $scope.variableSync = async (): Promise<void> => {
            $scope.variableSyncing = $attrs.variableSync && isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}

            // console.log('variables syncing: ', $scope.variableSyncing)
            const promises: any[] = []
            Object.keys($scope.variableSyncing).forEach((elementId: string) => {
                promises.push(
                    $q(async (resolve: void | any) => {
                        const varElement = Idx.getInput(elementId)
                        if (varElement) {
                            // Form Input exists
                            const scopeVarPath = $scope.variableSyncing[elementId]
                            // convert into a real var path and set the intial value from the exiting form value
                            await Idx.updateScopeValuePath($scope, scopeVarPath, varElement.val())

                            // Creating watcher to update the input when the scope changes
                            $scope.$watch(
                                scopeVarPath,
                                (value: any) => {
                                    // console.log('updating', scopeVarPath, 'value to', value, 'was', varElement.val())
                                    varElement.val(value)
                                },
                                true
                            )
                        }
                        resolve()
                    })
                )
            })
            await $q.all(promises)
        }

        /**
         * Call a List widget to perform a search
         * TODO await until complete?
         */
        $scope.search = $scope.searchMembers = (): void => {
            let listScope: IdxMemberListScope
            if ($scope.listId) {
                listScope = Idx.getListInstance($scope.listId, 'member') as IdxMemberListScope
            }
            if (listScope) {
                $scope.options.query.Page = 1
                listScope.search($scope.options.query, true)
                // TODO open popup
            } else {
                // IDX.setUrlOptions('Search', $scope.options.query)
                // $window.open($scope.listLinkUrl + '#!/' + IDX.getUrlOptionsPath(), $scope.listLinkTarget)
                console.log('displaying popup')
                $scope.displayMemberSelector()
            }
        }

        /**
         * Either popup or load a new page with the
         */
        $scope.displayMemberSelector = (): void => {
            // Opening a popup will load the propertyDetails and adjust the hashbang URL
            const templateOptions: {
                options: string,
                template: string,
                'variable-sync': string,
            } = {
                // 'element_id': 'property_member_detail_popup',
                options: '', // JSON.stringify($scope.options),
                template: 'mothership/list.selector', // TODO attributes need to be able to select a template
                'variable-sync': JSON.stringify({
                    agent_fname: 'MemberFirstName',
                    agent_lname: 'MemberLastName',
                    agent_license: 'MemberStateLicense',
                    office_name: 'OfficeName',
                    // office_id: 'OfficeKey'
                    office_id: 'OfficeNumber'
                })
                // 'page-title': true,//update the page title
            }
            if ($scope.options.query) {
                const options = {
                    service: [$scope.options.service || 0], // TODO update service
                    where: $scope.options.query
                }
                templateOptions.options = JSON.stringify(options)
            }

            let template =
                '<md-dialog aria-label="Property Member Selector" class="transparent">' +
                '<md-button style="text-align: center" ng-click="ctrl.close()">Close and Accept</md-button>' +
                '<stratus-idx-member-list '
            /*Object.keys(templateOptions).forEach(function (optionKey) {
                if (Object.prototype.hasOwnProperty.call(templateOptions, optionKey)) {
                    template += optionKey + '=\'' + templateOptions[optionKey] + '\' '
                }
            })*/
            _.forEach(templateOptions, (optionValue, optionKey) => {
                template += `${optionKey}='${optionValue}'`
            })
            template +=
                '></stratus-idx-member-list>' +
                '</md-dialog>'

            $mdDialog.show({
                template,
                parent: angular.element(document.body),
                // targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: true, // Only for -xs, -sm breakpoints.
                // bindToController: true,
                controllerAs: 'ctrl',
                // tslint:disable-next-line:no-shadowed-variable
                controller: ($scope: any, $mdDialog: any) => { // shadowing is needed for inline controllers
                    const dc = this

                    dc.$onInit = () => {
                        dc.close = close
                    }

                    function close() {
                        if ($mdDialog) {
                            $mdDialog.hide()
                        }
                    }
                }
            })
                .then(() => {
                }, () => {
                    // IDX.setUrlOptions('Listing', {})
                    // IDX.refreshUrlOptions($ctrl.defaultOptions)
                    // Revery page title back to what it was
                    // IDX.setPageTitle()
                    // Let's destroy it to save memory
                    // $timeout(IDX.unregisterDetailsInstance('property_member_detail_popup'), 10)
                })
        }

        /**
         * Have the widget options refreshed form the Widget's end
         */
        $scope.refreshSearchWidgetOptions = async (listScope?: IdxMemberListScope): Promise<void> => {
            if (
                !listScope &&
                $scope.listId
            ) {
                listScope = Idx.getListInstance($scope.listId, 'Member') as IdxMemberListScope
            }
            if (listScope) {
                // $scope.setQuery(listScope.query)
                $scope.listInitialized = true
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
            // TODO remove this instance
        }

    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`

}
