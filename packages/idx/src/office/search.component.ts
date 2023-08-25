/**
 * @file IdxOfficeSearch Component @stratusjs/idx/office/search.component
 * @example <stratus-idx-office-search>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Office-Search-Widget
 */

// Compile Stylesheets
import './search.group-selector.component.less'

// Runtime
import {isArray, isEmpty, isNumber, isString, trim} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    material,
    IAttributes,
    ITimeoutService,
    IQService,
    IWindowService
} from 'angular'
import {
    IdxEmitter,
    IdxSearchScope,
    IdxService,
    Office,
    SelectionGroup
} from '@stratusjs/idx/idx'
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {IdxOfficeListScope} from '@stratusjs/idx/office/list.component'

// Stratus Preload
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/idx'
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/office/list.component'
import '@stratusjs/idx/disclaimer/disclaimer.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'office'
const componentName = 'search'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
const localDistStyle = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/dist/${packageName}.bundle.min.css`

type OfficeSelectable = {
    id: string
    listing: Office
    selected: boolean
}

export type IdxOfficeSearchScope = IdxSearchScope & {
    initialized: boolean
    options: object | any // FIXME
    variableSyncing: object | any // FIXME

    // test
    syncInstance?: string
    syncInstanceVariable?: string
    syncInstanceVariableIndex: number
    selectionGroup: SelectionGroup
    // itemsSelected: string[]
    itemsSelectable: OfficeSelectable[]

    collectionUpdated(_listScope: IdxOfficeListScope, collection: Collection<Office>): Promise<void>
    displayOfficeSelector(): void
    toggleSelected(itemId: string, remove?: boolean) : void
    updateSyncedGroupSelection(initialize?: boolean): void
}

Stratus.Components.IdxOfficeSearch = {
    bindings: {
        // TODO doc
        elementId: '@',
        tokenUrl: '@',
        listId: '@',
        listLinkUrl: '@',
        listLinkTarget: '@',
        options: '@',
        template: '@',
        variableSync: '@',

        // TODO need to process these to sync
        syncInstance: '@',
        syncInstanceVariable: '@',
        syncInstanceVariableIndex: '@'
    },
    controller(
        $attrs: IAttributes,
        $q: IQService,
        $mdDialog: material.IDialogService,
        $mdPanel: material.IPanelService,
        $scope: IdxOfficeSearchScope,
        $timeout: ITimeoutService,
        $window: IWindowService,
        Idx: IdxService,
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        $scope.elementId = $attrs.elementId || $scope.uid
        Stratus.Instances[$scope.elementId] = $scope
        $scope.selectionGroup = {
            name: '',
            group: []
        }
        // $scope.itemsSelected = []
        $scope.itemsSelectable = []
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
        // Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`).then()
        Stratus.Internals.CssLoader(localDistStyle).then()

        // FIXME need to add sync-instance
        // FIXME need to add sync-instance-variable

        this.$onInit = () => {
            $scope.listId = $attrs.listId || null
            $scope.listInitialized = false
            $scope.listLinkUrl = $attrs.listLinkUrl || '/property/office/list'
            $scope.listLinkTarget = $attrs.listLinkTarget || '_self'
            $scope.syncInstance = $attrs.syncInstance || null
            // console.log('will update syncInstance', $scope.syncInstance)
            $scope.syncInstanceVariable = $attrs.syncInstanceVariable || null
            // console.log('will update field', $scope.syncInstanceVariable)
            // syncInstanceVariableIndex will always be a number
            $scope.syncInstanceVariableIndex = (
                $attrs.syncInstanceVariableIndex && isString($attrs.syncInstanceVariableIndex) ?
                    parseInt($attrs.syncInstanceVariableIndex, 10) : null
                ) || (
                    $attrs.syncInstanceVariableIndex && isNumber($attrs.syncInstanceVariableIndex) ?
                        $attrs.syncInstanceVariableIndex : null
                ) || 0
            // console.log('will update index', $scope.syncInstanceVariableIndex)
            $scope.updateSyncedGroupSelection(true)

            // If the List hasn't updated this widget after 2 seconds, make sure it's checked again.
            // A workaround for the race condition for now, up for suggestions
            /* $timeout(function () {
              if (!$scope.listInitialized) {
                // $scope.refreshSearchWidgetOptions()
              }
            }, 2000) */

            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

            // Set default queries
            $scope.options.query ??= {}
            $scope.options.query.where ??= {}

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
                Idx.on($scope.listId, 'collectionUpdated', $scope.collectionUpdated)
            }

            // $scope.variableSync()
            $scope.$applyAsync(() => {
                $scope.initialized = true
                Idx.emit('init', $scope)
            })
        }

        /**
         * Call a List widget to perform a search
         */
        $scope.search = async (): Promise<void> => {
            let listScope: IdxOfficeListScope
            if ($scope.listId) {
                listScope = Idx.getListInstance($scope.listId, 'office') as IdxOfficeListScope
            }
            if (listScope) {
                // $scope.options.query.Page = 1
                await listScope.search($scope.options.query, true)
                // TODO open popup
            } /*else {
                // IDX.setUrlOptions('Search', $scope.options.query)
                // $window.open($scope.listLinkUrl + '#!/' + IDX.getUrlOptionsPath(), $scope.listLinkTarget)
                console.log('displaying popup')
                $scope.displayOfficeSelector()
            }*/
        }

        // TODO should only use this if in 'selector mode'
        $scope.collectionUpdated = async (_listScope: IdxOfficeListScope, collection: Collection<Office>): Promise<void> => {
            // TODO only update if handling a selector?
            // Give the group a default name
            if (
                isEmpty(trim($scope.selectionGroup.name)) &&
                !isEmpty(trim($scope.options.query.where.OfficeName))
            ) {
                $scope.selectionGroup.name = $scope.options.query.where.OfficeName
            }

            $scope.itemsSelectable = []
            collection.models.forEach((office: any) => {
                $scope.itemsSelectable.push({
                    id: office._OfficeNumber,
                    listing: office,
                    selected: $scope.selectionGroup.group.includes(office._OfficeNumber)
                })
            })
            // console.log('collection updated with', $scope.itemsSelectable)
        }

        $scope.toggleSelected = (itemId: string, remove?: boolean) => {
            const selectedIndex = $scope.selectionGroup.group.indexOf(itemId)
            const nowSelected = remove ? false : (selectedIndex === -1)
            if (nowSelected) {
                // add to $scope.selectionGroup.group
                // $scope.selectionGroup.group.push(itemId)
                $scope.selectionGroup.group.push(itemId)
                // check box $scope.itemsSelectable
                $scope.itemsSelectable.forEach((officeSelectable) => {
                    if (officeSelectable.id === itemId) {
                        officeSelectable.selected = true
                    }
                })
            } else {
                // remove from $scope.selectionGroup.group
                if (selectedIndex > -1) {
                    // $scope.selectionGroup.group.splice(selectedIndex, 1)
                    $scope.selectionGroup.group.splice(selectedIndex, 1)
                }
                // uncheck box $scope.itemsSelectable
                $scope.itemsSelectable.forEach((officeSelectable) => {
                    if (officeSelectable.id === itemId) {
                        officeSelectable.selected = false
                    }
                })
            }

            $scope.updateSyncedGroupSelection()
        }

        $scope.updateSyncedGroupSelection = (initialize?: boolean) => {
            if (
                // check that a parent exists and wants to sync
                $scope.syncInstance &&
                Stratus.Instances[$scope.syncInstance] &&
                $scope.syncInstanceVariable
                // check if we have anything to add/edit (not empty)
                // !isEmpty($scope.selectionGroup.name) &&
                // !isEmpty($scope.selectionGroup.group)
            ) {
                // console.log('updating parent with', $scope.selectionGroup)
                // need to fetch the existing array first and only update the one being editted/addign a new one
                const parentVariable = Idx.getScopeValuePath(Stratus.Instances[$scope.syncInstance], $scope.syncInstanceVariable)
                let updatedValue
                if (isArray(parentVariable)) {
                    if (
                        initialize &&
                        !isEmpty(parentVariable[$scope.syncInstanceVariableIndex]) &&
                        !isString(parentVariable[$scope.syncInstanceVariableIndex]) &&
                        Object.prototype.hasOwnProperty.call(parentVariable[$scope.syncInstanceVariableIndex], 'name')
                    ) {
                        $scope.selectionGroup = parentVariable[$scope.syncInstanceVariableIndex]
                    }
                    updatedValue = parentVariable
                    updatedValue[$scope.syncInstanceVariableIndex] = $scope.selectionGroup
                } else {
                    updatedValue = $scope.selectionGroup
                }
                // update parent PropertySearch
                Idx.updateScopeValuePath(Stratus.Instances[$scope.syncInstance], $scope.syncInstanceVariable, updatedValue).then()
            }
        }

        /**
         * Either popup or load a new page with the
         */
        /*$scope.displayOfficeSelector = (): void => {
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
                '<md-dialog aria-label="Property Office Selector" class="transparent">' +
                '<md-button style="text-align: center" data-ng-click="ctrl.close()">Close and Accept</md-button>' +
                '<stratus-idx-office-list '
            // Object.keys(templateOptions).forEach(function (optionKey) {
            //    if (Object.prototype.hasOwnProperty.call(templateOptions, optionKey)) {
            //        template += optionKey + '=\'' + templateOptions[optionKey] + '\' '
            //    }
            // })
            forEach(templateOptions, (optionValue, optionKey) => {
                template += `${optionKey}='${optionValue}'`
            })
            template +=
                '></stratus-idx-office-list>' +
                '</md-dialog>'

            $mdDialog.show({
                template,
                parent: element(document.body),
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
                    // TODO check officeGroups and agentGroups for changes
                    // IDX.setUrlOptions('Listing', {})
                    // IDX.refreshUrlOptions(defaultOptions)
                    // Revery page title back to what it was
                    // IDX.setPageTitle()
                    // Let's destroy it to save memory
                    // $timeout(IDX.unregisterDetailsInstance('property_member_detail_popup'), 10)
                })
        }*/

        /**
         * Have the widget options refreshed form the Widget's end
         */
        $scope.refreshSearchWidgetOptions = async (listScope?: IdxOfficeListScope): Promise<void> => {
            if (
                !listScope &&
                $scope.listId
            ) {
                listScope = Idx.getListInstance($scope.listId) as IdxOfficeListScope
            }
            if (listScope) {
                // $scope.setQuery(listScope.query)
                $scope.listInitialized = true
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }

    },
    templateUrl: ($attrs: IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`

}
