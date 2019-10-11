// IdxMemberSearch Component
// @stratusjs/idx/member/search.component
// <stratus-idx-member-search>
// --------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Angular 1 Modules
// import 'angular-material'

// Services
import '@stratusjs/idx/idx'

// Component Preload
import '@stratusjs/idx/member/list.component'

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'
import {camelToSnake} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'member'
const componentName = 'search'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.IdxMemberSearch = {  // FIXME should be just MemberSearch or IdxMemberSearch
    bindings: {
        elementId: '@',
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
        $scope: object | any, // angular.IScope breaks references so far
        $timeout: angular.ITimeoutService,
        $window: angular.IWindowService,
        Idx: any,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(packageName) + '_' + camelToSnake(moduleName) + '_' + camelToSnake(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
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
                $scope.refreshSearchWidgetOptions()
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
            Idx.registerSearchInstance($scope.elementId, $scope, $scope.listId, 'Member')

            // $scope.variableSync()
        }

        /**
         * Update a scope nest variable from a given string path.
         * Works with updateNestedPathValue
         */
        $scope.updateScopeValuePath = async (scopeVarPath: string, value: any): Promise<string | any> => {
            // console.log('Update', scopeVarPath, 'to', value, typeof value)
            const scopePieces = scopeVarPath.split('.')
            return $scope.updateNestedPathValue($scope, scopePieces, value)
        }

        /**
         * Nests further into a string path to update a value
         * Works from updateScopeValuePath
         */
        $scope.updateNestedPathValue = async (currentNest: object | any, pathPieces: any[], value: any): Promise<string | any> => {
            const currentPiece = pathPieces.shift()
            if (
                currentPiece &&
                Object.prototype.hasOwnProperty.call(currentNest, currentPiece)
            ) {
                if (pathPieces[0]) {
                    return $scope.updateNestedPathValue(currentNest[currentPiece], pathPieces, value)
                } else {
                    if (_.isArray(currentNest[currentPiece]) && !_.isArray(value)) {
                        value = value === '' ? [] : value.split(',')
                    }
                    // console.log(currentPiece, 'updated to ', value)
                    currentNest[currentPiece] = value
                    return value
                }
            } else {
                return null
            }
        }

        /**
         * Get the Input element of a specified ID
         */
        $scope.getInput = (elementId: string): any => angular.element(document.getElementById(elementId))

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
                        const varElement = $scope.getInput(elementId)
                        if (varElement) {
                            // Form Input exists
                            const scopeVarPath = $scope.variableSyncing[elementId]
                            // convert into a real var path and set the intial value from the exiting form value
                            await $scope.updateScopeValuePath(scopeVarPath, varElement.val())

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
        $scope.searchMembers = (): void => {
            let listScope
            if ($scope.listId) {
                listScope = Idx.getListInstance($scope.listId, 'Member')
            }
            if (listScope) {
                $scope.options.query.Page = 1
                listScope.searchMembers($scope.options.query, true)
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
                    office_id: 'OfficeKey'
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
            _.each(templateOptions, (optionValue, optionKey) => {
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

    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`

}
