/**
 * @file IdxPropertySearch Component @stratusjs/idx/property/search.component
 * @example <stratus-idx-property-search>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Property-Search-Widget
 */

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Services
import '@stratusjs/idx/idx'
// tslint:disable-next-line:no-duplicate-imports
import {
    CompileFilterOptions,
    IdxComponentScope,
    IdxEmitter,
    IdxSearchScope,
    IdxService,
    MLSService,
    SelectionGroup,
    WhereOptions
} from '@stratusjs/idx/idx'
import {IdxPropertyListScope} from '@stratusjs/idx/property/list.component'

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
// FIXME should we be renaming the old 'stratus.directives' variables to something else now that we're @stratusjs?
import 'stratus.directives.stringToNumber'
import 'stratus.filters.numeral'

// Component Preload
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/office/search.component'
import '@stratusjs/idx/office/list.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'search'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxPropertySearchScope = IdxSearchScope & {
    widgetName: string
    listId: string
    listInitialized: boolean
    listLinkUrl: string
    // Can be 'simple' (location only), 'basic' (beds/baths, price, etc), 'advanced' (dropdown filters)
    searchType: 'simple' | 'basic' | 'advanced'
    // Href to a url
    advancedSearchUrl: string
    advancedSearchLinkName: string
    advancedFiltersStatus: boolean
    openPrice: boolean
    listLinkTarget: string
    // options: object | any // TODO need to specify
    options: {
        // [key: string]: object | any
        query: CompileFilterOptions
        selection: object | any // TODO need to specify
        forRent: boolean
        agentGroups: SelectionGroup[]
        officeGroups: SelectionGroup[]
    }
    displayFilterFullHeight: boolean
    variableSyncing: object | any
    filterMenu?: any // angular.material.IPanelRef // disabled because we need to set reposition()

    // Functions
    arrayIntersect(itemArray: any[], array: any[]): boolean
    displayOfficeGroupSelector(searchTerm?: string, editIndex?: number, ev?: any): void
    getMLSVariables(reset?: boolean): MLSService[]
    inArray(item: any, array: any[]): boolean
    selectDefaultListingType(listingGroup?: string): void
    setQuery(newQuery?: CompileFilterOptions): void
    setWhere(newWhere?: WhereOptions): void
    setWhereDefaults(): void
    showInlinePopup(ev: any, menuElement: string): void
    throttledSearch(): void
    toggleArrayElement(item: any, array: any[]): void
    variableSync(): Promise<void>
}

Stratus.Components.IdxPropertySearch = {
    /** @see https://github.com/Sitetheory/stratus/wiki/Idx-Property-Search-Widget#Widget_Parameters */
    bindings: {
        // TODO doc
        elementId: '@',
        /**
         * Type: boolean
         * Two-way bound option. When needing to provide data/options to this widget in an async environment, this
         * initialization can be delayed by supplying a bound variable to notify when the data is ready.
         * @example `init-now="model.completed"`
         */
        initNow: '=',
        /**
         * Type: string
         * To determine what datasources the Idx widgets are able to pull from and their temporary credentials, a
         * `token-url` directs to the location that manages this widget's subscription and provides what Idx servers it
         * has access to.
         */
        tokenUrl: '@',
        // TODO doc
        tokenOnLoad: '@',
        /**
         * Type: string
         * Id of Property List widget to attach and control. The counterpart Property List widget's `element-id` must be
         * defined and the same as this `list-id` (See Property List). Multiple Search widgets may attach to the same
         * List widget but, a Search widget may only control a single List widget.
         */
        listId: '@',
        /**
         * Type: string
         * Default: '/property/list'
         * If a List widget does not share the same page as this Search widget or they are not connected via
         * `list-id`/`element-id`, searching will instead load a new page to where ever the List widget may be found
         * (Url provided here).
         */
        listLinkUrl: '@',
        /**
         * Type: string
         * Default: '_self'
         * Combined with `list-link-url`, if ever searching on another page, this will define how to open the page as a
         * normal link. Any usable HTML <b>'_target'</b> attribute such as '_self' or '_blank'.
         */
        listLinkTarget: '@',
        // TODO
        searchType: '@',
        /**
         * Type: string
         * A link to another dedicated advanced search page (used when this is a module)
         */
        advancedSearchUrl: '@',
        /**
         * Type: string
         * Default: 'Advanced Search'
         * An alternative name for the advanced search button.
         */
        advancedSearchLinkName: '@',
        /**
         * Type: string
         * Default: 'search'
         * The file name in which is loaded for the view of the widget. The name will automatically be appended with
         * '.component.min.html'. The default is 'search.component.html'.
         * @TODO Will need to allow setting a custom path of views outside the library directory.
         */
        template: '@',
        /**
         * Type: json
         * Additional advanced parameters that may control what the Search interface displays. Only parameter used at this time is selection
         * @TODO
         */
        options: '@',
        /** Type: SelectionGroup[] */
        optionsAgentGroups: '@',
        /** Type: SelectionGroup[] */
        optionsOfficeGroups: '@',
        /**
         * Type: boolean
         * Whether to ensure the Filter menu is full height. Only Available if template allows and set to advanced
         * @TODO add to wiki
         */
        displayFilterFullHeight: '@',
        // TODO
        variableSync: '@',
        // TODO
        widgetName: '@'
    },
    controller(
        $attrs: angular.IAttributes,
        $q: angular.IQService,
        $mdConstant: any, // mdChips item
        $mdDialog: angular.material.IDialogService,
        $mdPanel: angular.material.IPanelService,
        // $scope: object | any, // angular.IScope breaks references so far
        $scope: IdxPropertySearchScope,
        $timeout: angular.ITimeoutService,
        $window: angular.IWindowService,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope._ = _
        Stratus.Instances[$scope.elementId] = $scope
        $scope.localDir = localDir
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }

        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        // Default values
        $scope.openPrice = false
        $scope.advancedFiltersStatus = false
        $scope.advancedSearchUrl = ''
        $scope.advancedSearchLinkName = 'Advanced Search'
        // Used by template
        $scope.$mdConstant = $mdConstant

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        const init = async () => {
            $scope.widgetName = $attrs.widgetName || ''
            $scope.listId = $attrs.listId || null
            $scope.listInitialized = false
            $scope.listLinkUrl = $attrs.listLinkUrl || '/property/list'
            $scope.listLinkTarget = $attrs.listLinkTarget || '_self'
            $scope.searchType = $attrs.searchType || 'advanced'
            $scope.advancedSearchUrl = $attrs.advancedSearchUrl ||  $scope.advancedSearchUrl
            $scope.advancedSearchLinkName = $attrs.advancedSearchLinkName || $scope.advancedSearchLinkName
            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            $scope.displayFilterFullHeight = $attrs.displayFilterFullHeight && isJSON($attrs.displayFilterFullHeight) ?
                JSON.parse($attrs.displayFilterFullHeight) : false
            $scope.filterMenu = null
            $scope.options.forRent = $scope.options.forRent || false
            $scope.options.agentGroups = $scope.options.agentGroups || []
            // $scope.options.officeGroups = $scope.options.officeGroups || []

            $scope.options.officeGroups =
                $scope.options.officeGroups && _.isString($scope.options.officeGroups) && isJSON($scope.options.officeGroups)
                    ? JSON.parse($scope.options.officeGroups) :
                    $attrs.optionsOfficeGroups && isJSON($attrs.optionsOfficeGroups) ?
                        JSON.parse($attrs.optionsOfficeGroups) : $scope.options.officeGroups || []

            // Set default queries
            $scope.options.query = $scope.options.query || {}
            $scope.options.query.where = $scope.options.query.where || {}
            $scope.options.query.service = $scope.options.query.service || []

            // $scope.setQuery($scope.options.query)
            $scope.setWhere($scope.options.query.where)

            // console.log('$scope.options.query is starting at ', _.clone($scope.options.query))

            // If the List hasn't updated this widget after 1 second, make sure it's checked again. A workaround for
            // the race condition for now, up for suggestions
            $timeout(async () => {
                /*if (!$scope.listInitialized) {
                    await $scope.refreshSearchWidgetOptions()
                }*/
                // Sync needs to happen here so that the List and still connect with the Search widget
                await $scope.variableSync()
            }, 1000)

            // Set default selections TODO may need some more universally set options to be able to use
            $scope.options.selection = $scope.options.selection || {}
            $scope.options.selection.Bedrooms = $scope.options.selection.Bedrooms || [
                {name: '1+', value: 1},
                {name: '2+', value: 2},
                {name: '3+', value: 3},
                {name: '4+', value: 4},
                {name: '5+', value: 5}
            ]
            $scope.options.selection.Bathrooms = $scope.options.selection.Bathrooms || [
                {name: '1+', value: 1},
                {name: '2+', value: 2},
                {name: '3+', value: 3},
                {name: '4+', value: 4},
                {name: '5+', value: 5}
            ]
            $scope.options.selection.order = $scope.options.selection.order || [
                {name: 'Highest Price', value: '-BestPrice'},
                {name: 'Lowest Price', value: 'BestPrice'},
                {name: 'Recently Updated', value: '-ModificationTimestamp'},
                {name: 'Recently Sold', value: '-CloseDate'},
                {name: 'Status', value: ['Status', '-BestPrice']}
            ]
            $scope.options.selection.Status = $scope.options.selection.Status || {}
            $scope.options.selection.Status.default = $scope.options.selection.Status.default || {
                Sale: ['Active', 'Contract'],
                Lease: ['Active']
            }
            $scope.options.selection.ListingType = $scope.options.selection.ListingType || {}
            // These determine what ListingTypes options that should currently be 'shown' based on selections.
            // Automatically updated with a watcher
            $scope.options.selection.ListingType.group = $scope.options.selection.ListingType.group || {
                Residential: true,
                Commercial: false
            }
            // TODO These values need to be supplied by the MLS' to ensure we dont show ones that don't exist
            $scope.options.selection.ListingType.list = $scope.options.selection.ListingType.list || {
                Residential: ['House', 'Condo', 'Townhouse', 'MultiFamily', 'Manufactured', 'Land', 'LeaseHouse', 'LeaseCondo', 'LeaseTownhouse', 'LeaseOther'],
                Commercial: ['Commercial', 'CommercialBusinessOp', 'CommercialResidential', 'CommercialLand', 'LeaseCommercial'],
                Lease: ['LeaseHouse', 'LeaseCondo', 'LeaseTownhouse', 'LeaseOther', 'LeaseCommercial']
            }
            // These are the default selections and should be updated by the page on load(if needed)
            $scope.options.selection.ListingType.default = $scope.options.selection.ListingType.default || {
                Sale: {
                    Residential: ['House', 'Condo', 'Townhouse'],
                    Commercial: ['Commercial', 'CommercialBusinessOp']
                },
                Lease: {
                    Residential: ['LeaseHouse', 'LeaseCondo', 'LeaseTownhouse'],
                    Commercial: ['LeaseCommercial']
                }
            }
            // These are static and never change. merely map correct values
            $scope.options.selection.ListingType.All = $scope.options.selection.ListingType.All || [
                {name: 'House', value: 'House', group: 'Residential', lease: false},
                {name: 'Condo', value: 'Condo', group: 'Residential', lease: false},
                {name: 'Townhouse', value: 'Townhouse', group: 'Residential', lease: false},
                {name: 'Multi-Family', value: 'MultiFamily', group: 'Residential', lease: false},
                {name: 'Manufactured', value: 'Manufactured', group: 'Residential', lease: false},
                {name: 'Land', value: 'Land', group: 'Residential', lease: false},
                {name: 'Other', value: 'Other', group: 'Residential', lease: false},
                {name: 'Commercial', value: 'Commercial', group: 'Commercial', lease: false},
                {name: 'Commercial Business Op', value: 'CommercialBusinessOp', group: 'Commercial', lease: false},
                {name: 'Commercial Residential', value: 'CommercialResidential', group: 'Commercial', lease: false},
                {name: 'Commercial Land', value: 'CommercialLand', group: 'Commercial', lease: false},
                {name: 'House', value: 'LeaseHouse', group: 'Residential', lease: true},
                {name: 'Condo', value: 'LeaseCondo', group: 'Residential', lease: true},
                {name: 'Townhouse', value: 'LeaseTownhouse', group: 'Residential', lease: true},
                {name: 'Other', value: 'LeaseOther', group: 'Residential', lease: true},
                {name: 'Commercial', value: 'LeaseCommercial', group: 'Commercial', lease: true}
            ]

            $scope.setWhereDefaults()

            // Register this Search with the Property service
            Idx.registerSearchInstance($scope.elementId, moduleName, $scope, $scope.listId) // May be deprecating
            if ($scope.listId) {
                // When the List loads, we need to update our settings with the list's
                Idx.on($scope.listId, 'init', $scope.refreshSearchWidgetOptions)
                Idx.on($scope.listId, 'searching', $scope.refreshSearchWidgetOptions)
            }

            // FIXME testing emitters
            /*Idx.on($scope.listId, 'collectionUpdated', (source, collection: Collection) => {
                console.log('collectionUpdated!!!!', source, collection)
            })*/

            if ($attrs.tokenOnLoad) {
                try {
                    await Idx.tokenKeepAuth()
                    $scope.getMLSVariables(true)
                } catch(e) {
                    console.error('Search is unable to load in token data', e)
                }
            }

            // await $scope.variableSync() sync is moved to teh timeout above so it can still work with List widgets
            Idx.emit('init', $scope)
        }

        // Initialization by Event
        $ctrl.$onInit = () => {
            $scope.Idx = Idx

            let initNow = true
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                // TODO: This needs better logic to determine what is acceptably initialized
                initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
            }

            if (initNow) {
                init()
                return
            }

            $ctrl.stopWatchingInitNow = $scope.$watch('$ctrl.initNow', (initNowCtrl: boolean) => {
                // console.log('CAROUSEL initNow called later')
                if (initNowCtrl !== true) {
                    return
                }
                if (!$scope.initialized) {
                    init()
                }
                $ctrl.stopWatchingInitNow()
            })
        }

        $scope.$watch('options.query.where.ListingType', () => {
            // TODO: Consider Better solution? I just added the check to see if $scope.options.query is set
            // because there are cases where $scope.options.query is not defined (null). This happens on admin
            // edit page load  for a new record where nothing has been set on a page yet.
            // Davis: removed check for $scope.options.query.ListingType as if it's not an Array will create it
            if ($scope.options.query && $scope.options.query.where && $scope.options.selection.ListingType.list) {
                if (!Object.prototype.hasOwnProperty.call($scope.options.query.where, 'ListingType')) {
                    $scope.options.query.where.ListingType = []
                }

                if (!_.isArray($scope.options.query.where.ListingType)) {
                    $scope.options.query.where.ListingType = [$scope.options.query.where.ListingType]
                }
                $scope.options.selection.ListingType.group.Residential =
                    $scope.arrayIntersect($scope.options.selection.ListingType.list.Residential, $scope.options.query.where.ListingType)
                $scope.options.selection.ListingType.group.Commercial =
                    $scope.arrayIntersect($scope.options.selection.ListingType.list.Commercial, $scope.options.query.where.ListingType)

                $scope.options.forRent =
                    $scope.arrayIntersect($scope.options.selection.ListingType.list.Lease, $scope.options.query.where.ListingType)
                // console.log('watched ListingType', $scope.options.query.ListingType, $scope.options.selection.ListingType.group)
            }
        })

        /**
         * Create filter function for a query string
         * TODO whats this used for?
         */
        /* *
        const createFilterFor = (query: string) => {
            const lowercaseQuery = query.toLowerCase()

            return (hay: any) => {
                return (hay.value.indexOf(lowercaseQuery) === 0)
            }

        }

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         */
        $scope.variableSync = async (): Promise<void> => {
            $scope.variableSyncing = $attrs.variableSync && isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}
            // console.log('variables syncing: ', _.clone($scope.variableSyncing))
            const promises: any[] = []
            Object.keys($scope.variableSyncing).forEach((elementId: string) => {
                promises.push(
                    $q(async (resolve: void | any) => {
                        const varElement = Idx.getInput(elementId)
                        if (varElement) {
                            // console.log('got input', varElement, _.clone(varElement.val()))
                            // Form Input exists
                            const scopeVarPath = $scope.variableSyncing[elementId]
                            // convert into a real var path and set the initial value from the exiting form value
                            await Idx.updateScopeValuePath($scope, scopeVarPath, varElement.val())
                            $scope.setWhere($scope.options.query.where) // ensure the basic items are always set

                            // Creating watcher to update the input when the scope changes
                            $scope.$watch(
                                scopeVarPath,
                                (value: any) => {
                                    // console.log('detecting', scopeVarPath, 'as', value)
                                    if (
                                        _.isString(value) ||
                                        _.isNumber(value) ||
                                        value == null
                                    ) {
                                        // console.log('updating', scopeVarPath, 'value to', value, 'was', varElement.val())
                                        varElement.val(value)
                                    } else {
                                        // console.log('updating json', scopeVarPath, 'value to', value, 'was', varElement.val())
                                        varElement.val(JSON.stringify(value))
                                    }
                                    // varElement.fireEvent('onchange') // deprecated and no longer works
                                    varElement[0].dispatchEvent(new Event('change'))
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
         * If element exists in Array shortcut helper
         * TODO move to global reference
         */
        $scope.inArray = (item: any, array: any[]): boolean => {
            if (!_.isArray(array)) {
                // console.warn('Array undefined, cannot search for', item)
                return false
            }
            return (array.indexOf(item) !== -1)
        }

        /**
         * TODO move to global reference
         */
        $scope.arrayIntersect = (itemArray: any[], array: any[]): boolean => {
            if (
                !_.isArray(array) ||
                !_.isArray(itemArray)
            ) {
                console.warn('Array undefined, cannot search for', itemArray, 'in', array)
                // return []
                return false
            }
            return itemArray.filter(value => array.indexOf(value) !== -1).length > 0
        }

        /**
         * Add or remove a certain element from an array
         * TODO move to global reference
         */
        $scope.toggleArrayElement = (item: any, array: any[]): void => {
            array = array || []
            const arrayIndex = array.indexOf(item)
            if (arrayIndex >= 0) {
                array.splice(arrayIndex, 1)
            } else {
                array.push(item)
            }
        }

        /**
         * Add a popup on screen using an existing element
         * TODO could use more options
         * @param ev - Click Event
         * @param menuElement id or class of element to grab
         */
        $scope.showInlinePopup = (ev: any, menuElement: string): void => {
            if (!$scope.filterMenu) {
                const position: angular.material.IPanelPosition | any = $mdPanel.newPanelPosition()
                    .relativeTo(ev.srcElement)
                    .addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.BELOW)

                const animation = $mdPanel.newPanelAnimation()
                animation.openFrom(position)
                animation.closeTo(position)
                animation.withAnimation($mdPanel.animation.FADE)

                const config: angular.material.IPanelConfig & {
                    contentElement: string,
                    openFrom: any
                } = {
                    animation,
                    attachTo: angular.element(document.body),
                    contentElement: menuElement,
                    position,
                    openFrom: ev,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    focusOnOpen: false,
                    zIndex: 2
                }

                $scope.filterMenu = $mdPanel.create(config)

                $scope.filterMenu.reposition = function reposition() {
                    $timeout(() => {
                        $scope.filterMenu.updatePosition(position)
                    }, 100)
                }
            }

            $scope.filterMenu.open()
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            if (!$ctrl.mlsVariables || reset) {
                $ctrl.mlsVariables = Idx.getMLSVariables()
            }
            return $ctrl.mlsVariables
        }

        /**
         * Update the entirety options.query in a safe manner to ensure undefined references are not produced
         */
        $scope.setQuery = (newQuery?: CompileFilterOptions): void => {
            newQuery = newQuery || {}
            newQuery.where = newQuery.where || {}
            // getDefaultWhereOptions returns the set a required WhereOptions with initialized arrays
            // $scope.options.query = _.extend(Idx.getDefaultWhereOptions(), newQuery)
            $scope.options.query = _.cloneDeep(newQuery)
            $scope.setWhere($scope.options.query.where)
            // console.log('setQuery $scope.options.query to ', _.clone($scope.options.query))
        }

        /**
         * Update the entirety options.query.where in a safe manner to ensure undefined references are not produced
         */
        $scope.setWhere = (newWhere?: WhereOptions): void => {
            // console.log('setWhere', _.clone(newWhere))
            newWhere = newWhere || {}
            // getDefaultWhereOptions returns the set a required WhereOptions with initialized arrays
            $scope.options.query.where = _.extend(Idx.getDefaultWhereOptions(), newWhere)
            // find the objects that aren't arrays and convert to arrays as require to prevent future and current errors
            _.map(Idx.getDefaultWhereOptions(), (value, key: string) => {
                if (
                    _.isArray(value) &&
                    Object.prototype.hasOwnProperty.call($scope.options.query.where, key) &&
                    !_.isArray($scope.options.query.where[key])
                ) {
                    $scope.options.query.where[key] = [$scope.options.query.where[key]]
                }
            })
            // console.log('setWhere', _.clone($scope.options.query.where))
        }

        $scope.setWhereDefaults = (): void => {
            $scope.$applyAsync(() => {
                if ($scope.options.query.where.ListingType.length < 1) {
                    $scope.options.query.where.ListingType = $scope.options.selection.ListingType.default.Sale.Residential
                    // console.log('updating', $scope.options.query.where.ListingType)
                    $scope.selectDefaultListingType()
                }
            })
        }

        $scope.selectDefaultListingType = (listingGroup?: string): void => {
            if (!listingGroup) {
                listingGroup = 'Commercial'
                if (!$scope.options.selection.ListingType.group.Commercial) {
                    listingGroup = 'Residential'
                }
            }
            $scope.options.query.where.ListingType = $scope.options.forRent ?
                $scope.options.selection.ListingType.default.Lease[listingGroup] :
                $scope.options.selection.ListingType.default.Sale[listingGroup]
            if ($scope.filterMenu) {
                $scope.filterMenu.reposition()
            }
            if ($scope.options.forRent) {
                $scope.options.query.where.Status = $scope.options.selection.Status.default.Lease
            } else {
                $scope.options.query.where.Status = ($scope.options.query.where.Status && $scope.options.query.where.Status.length > 0) ?
                    $scope.options.query.where.Status : $scope.options.selection.Status.default.Lease
            }
        }

        /**
         * Call a List widget to perform a search
         * TODO await until search is complete?
         */
        $scope.search = $scope.searchProperties = (): void => {
            let listScope: IdxPropertyListScope | IdxComponentScope
            if ($scope.listId) {
                listScope = Idx.getListInstance($scope.listId)
            }
            if (listScope) {
                // $scope.options.query.service = [1]
                // $scope.options.query.where.Page = 1 // just a fall back, as it gets 'Page 2'
                // $scope.options.query.page = 1 // just a fall back, as it gets 'Page 2'
                // console.log('sending search', _.clone($scope.options.query))

                /* const searchQuery: CompileFilterOptions = {
                    where: _.clone($scope.options.query.where)
                }*/
                // FIXME need to ensure only where options
                // console.log('but suppose to send', _.clone($scope.options.query))
                // listScope.search($scope.options.query, true)
                // only allow a query every second
                if (!$scope.throttledSearch) {
                    $scope.throttledSearch =
                        _.throttle(() => {listScope.search($scope.options.query, true)}, 600, { trailing: false })
                }
                $scope.throttledSearch()
            } else {
                Idx.setUrlOptions('Search', $scope.options.query.where) // TODO may need to set Page and stuff?
                $window.open($scope.listLinkUrl + '#!/' + Idx.getUrlOptionsPath(), $scope.listLinkTarget)
            }
        }

        /**
         * Either popup or load a new page with the
         */
        $scope.displayOfficeGroupSelector = (searchTerm?: string, editIndex?: number, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            // console.log('displayOfficeGroupSelector', searchTerm, editIndex)
            let searchOnLoad = false
            const options: {
                query: CompileFilterOptions
            } = {
                query: {
                    perPage: 100
                }
            }
            if (!_.isEmpty(searchTerm) && _.isString(searchTerm)) {
                options.query.where = {
                    OfficeName: searchTerm
                }
                searchOnLoad = true
            }
            if (!_.isNumber(editIndex)) {
                editIndex = $scope.options.officeGroups.length
            }

            const template =
                '<md-dialog aria-label="Property Office Group Selector" class="transparent">' +
                '<md-button style="text-align: center" data-ng-click="close()">Close and Accept</md-button>' +
                '<stratus-idx-office-search' +
                ' data-template="search.group-selector"' +
                ` data-list-id="office-group-selector-${$scope.elementId}"` +
                ` data-options='${JSON.stringify(options)}'` +
                ` data-sync-instance="${$scope.elementId}"` + // search needs to update this scope
                ` data-sync-instance-variable="options.officeGroups"` + // search needs find this variable in this scope to update
                ` data-sync-instance-variable-index="${editIndex}"` +
                '></stratus-idx-office-search>' +
                '<stratus-idx-office-list' +
                ` data-element-id="office-group-selector-${$scope.elementId}"` +
                ' data-template="list.empty"' +
                ` data-search-on-load="${searchOnLoad}"` +
                ` data-query='${JSON.stringify(options.query)}'` +
                ` data-query-service="${$scope.options.query.service}"` +
                '></stratus-idx-office-list>' +
                '</md-dialog>'

            $mdDialog.show({
                template,
                parent: angular.element(document.body),
                targetEvent: ev,
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
                        // console.log('closing mdPanel')
                        if ($mdDialog) {
                            $mdDialog.hide()
                        }
                    }

                    $scope.close = close
                }
            })
                .then(() => {
                }, () => {
                    $scope.validateOfficeGroups()
                    // IDX.setUrlOptions('Listing', {})
                    // IDX.refreshUrlOptions($ctrl.defaultOptions)
                    // Revery page title back to what it was
                    // IDX.setPageTitle()
                    // Let's destroy it to save memory
                    // $timeout(IDX.unregisterDetailsInstance('property_member_detail_popup'), 10)
                })
        }

        $scope.validateOfficeGroups = (search?: boolean): void => {
            $scope.options.officeGroups = $scope.options.officeGroups.filter((selection) => {
                return (!_.isEmpty(selection.name) && !_.isEmpty(selection.group))
            })
            const officeNumbers: string[] = []
            $scope.options.query.where.OfficeNumber = [] as string[]
            $scope.options.officeGroups.forEach((selection) => {
                officeNumbers.push(...selection.group)
            })
            $scope.options.query.where.OfficeNumber = officeNumbers
            if (search) {
                $scope.search()
            }
        }


        /**
         * Have the widget options refreshed form the Widget's end
         */
        $scope.refreshSearchWidgetOptions = async (listScope?: IdxPropertyListScope): Promise<void> => {
            if (
                !listScope &&
                $scope.listId
            ) {
                listScope = Idx.getListInstance($scope.listId) as IdxPropertyListScope
            }
            if (listScope) {
                $scope.setQuery(listScope.query)
                $scope.listInitialized = true
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
            // TODO need to kill any attached slideshows
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
