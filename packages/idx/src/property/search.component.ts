/**
 * @file IdxPropertySearch Component @stratusjs/idx/property/search.component
 * @example <stratus-idx-property-search>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Property-Search-Widget
 */

// Runtime
import _, {
    clone,
    cloneDeep,
    extend,
    includes,
    intersection,
    isArray,
    isEmpty,
    isEqual,
    isNumber,
    isString,
    isUndefined,
    map,
    throttle
} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {element, material, IAttributes, ITimeoutService, IQService, IWindowService} from 'angular'
import 'angular-material'
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
import {isJSON, LooseObject, safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Stratus Preload
import '@stratusjs/angularjs-extras/directives/stringToNumber'
import '@stratusjs/angularjs-extras/filters/numeral'
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/idx'
import '@stratusjs/idx/office/list.component' // Office needs to load for the office selector
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/office/search.component' // Office needs to load for the office selector

type NameValuePair = {
    name: string
    value: string | number | string[]
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'search'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

type ListingTypeSelectionSetting = {
    name: string
    value: string
    group: string
    lease: boolean
}

export type IdxPropertySearchScope = IdxSearchScope & {
    widgetName: string
    initialized: boolean
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
        selection: { // object | any // TODO need to specify
            Bedrooms?: NameValuePair[]
            Bathrooms?: NameValuePair[]
            order?: NameValuePair[]
            Status?: LooseObject<LooseObject<string[]>>
            ListingType?: {
                group?: {
                    [propertyCategory: string]: boolean
                }
                list?: {
                    Residential: string[]
                    Commercial: string[]
                    Lease: string[]
                }
                default?: {
                    Sale: {
                        [propertyCategory: string]: string[]
                    }
                    Lease: {
                        [propertyCategory: string]: string[]
                    }
                }
                All?: ListingTypeSelectionSetting[]
            }
        }
        forRent: boolean
        agentGroups: SelectionGroup[]
        officeGroups: SelectionGroup[]
    }
    displayFilterFullHeight: boolean
    variableSyncing: object | any
    filterMenu?: material.IPanelRef & any // material.IPanelRef // disabled because we need to set reposition()
    _: typeof _

    // Functions
    canDisplayListingTypeButton(listType: ListingTypeSelectionSetting): boolean
    displayOfficeGroupSelector(searchTerm?: string, editIndex?: number, ev?: any): void
    getMLSVariables(reset?: boolean): MLSService[]
    hasQueryChanged(): boolean
    /** @deprecated use _.includes */
    inArray(item: any, array: any[]): boolean
    isIntersecting(itemArray: any[], array: any[]): boolean
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
        /**
         * Type: string
         * Default: 'advanced'
         * Options: 'simple' (only a location field), 'basic' (location plus beds/baths/price), 'advanced' (everything)
         */
        searchType: '@',
        /**
         * Type: string
         * A link to another dedicated advanced search page (used when this is a module). NOTE: this should generally be
         * the same as linkListUrl and if not set it will set this to match.
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
         * Additional advanced parameters that may control what the Search interface displays. Only parameter used at
         * this time is selection
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
        $attrs: IAttributes,
        $q: IQService,
        $mdConstant: any, // mdChips item
        $mdDialog: material.IDialogService,
        $mdPanel: material.IPanelService,
        $scope: IdxPropertySearchScope,
        $timeout: ITimeoutService,
        $window: IWindowService,
        Idx: IdxService,
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope._ = _
        Stratus.Instances[$scope.elementId] = $scope
        $scope.localDir = localDir
        $scope.initialized = false
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }

        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`).then()

        // Default values
        let defaultQuery: LooseObject
        let lastQuery: CompileFilterOptions
        let mlsVariables: {[serviceId: number]: MLSService}
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
            $scope.listLinkUrl = $attrs.listLinkUrl || $attrs.advancedSearchUrl || '/property/list'
            $scope.listLinkTarget = $attrs.listLinkTarget || '_self'
            $scope.searchType = $attrs.searchType || 'advanced'
            // NOTE: this does not default to listLinkUrl in case they don't want an advanced search button they leave blank
            $scope.advancedSearchUrl = $attrs.advancedSearchUrl ||  $scope.advancedSearchUrl
            $scope.advancedSearchLinkName = $attrs.advancedSearchLinkName || $scope.advancedSearchLinkName
            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            $scope.displayFilterFullHeight = $attrs.displayFilterFullHeight && isJSON($attrs.displayFilterFullHeight) ?
                JSON.parse($attrs.displayFilterFullHeight) : false
            $scope.filterMenu = null
            $scope.options.forRent ||= false
            $scope.options.agentGroups ??= []
            // $scope.options.officeGroups ??= []

            $scope.options.officeGroups =
                ($scope.options.officeGroups && isString($scope.options.officeGroups) && isJSON($scope.options.officeGroups)
                    ? JSON.parse($scope.options.officeGroups)
                    : ($attrs.optionsOfficeGroups && isJSON($attrs.optionsOfficeGroups)
                        ? JSON.parse($attrs.optionsOfficeGroups)
                        : $scope.options.officeGroups)
                    ) || []

            // Set default queries
            $scope.options.query ??= {}
            $scope.options.query.where ??= {}
            $scope.options.query.service ??= []

            // $scope.setQuery($scope.options.query)
            $scope.setWhere($scope.options.query.where)
            defaultQuery = JSON.parse(JSON.stringify(cloneDeep($scope.options.query.where)))
            if ($scope.options.query.order) {
                defaultQuery.Order = $scope.options.query.order
            }

            // console.log('$scope.options.query is starting at ', clone($scope.options.query))

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
            $scope.options.selection ??= {}
            $scope.options.selection.Bedrooms ??= [
                {name: '1+', value: 1},
                {name: '2+', value: 2},
                {name: '3+', value: 3},
                {name: '4+', value: 4},
                {name: '5+', value: 5}
            ]
            $scope.options.selection.Bathrooms ??= [
                {name: '1+', value: 1},
                {name: '2+', value: 2},
                {name: '3+', value: 3},
                {name: '4+', value: 4},
                {name: '5+', value: 5}
            ]
            $scope.options.selection.order ??= [
                {name: 'Highest Price', value: '-BestPrice'},
                {name: 'Lowest Price', value: 'BestPrice'},
                {name: 'Recently Updated', value: '-ModificationTimestamp'},
                {name: 'Recently Sold', value: '-CloseDate'},
                {name: 'Status', value: ['Status', '-BestPrice']}
            ]
            $scope.options.selection.Status ??= {}
            $scope.options.selection.Status.default ??= {
                Sale: ['Active', 'Contract'],
                Lease: ['Active']
            }
            $scope.options.selection.ListingType ??= {}
            // These determine what ListingTypes options that should currently be 'shown' based on selections.
            // Automatically updated with a watcher
            $scope.options.selection.ListingType.group ??= {
                Residential: true,
                Commercial: false
            }
            // TODO These values need to be supplied by the MLS' to ensure we dont show ones that don't exist
            $scope.options.selection.ListingType.list ??= {
                Residential: ['House', 'Condo', 'Townhouse', 'MultiFamily', 'Manufactured', 'Land', 'LeaseHouse', 'LeaseCondo', 'LeaseTownhouse', 'LeaseOther'],
                Commercial: ['Commercial', 'CommercialBusinessOp', 'CommercialResidential', 'CommercialLand', 'LeaseCommercial'],
                Lease: ['LeaseHouse', 'LeaseCondo', 'LeaseTownhouse', 'LeaseOther', 'LeaseCommercial']
            }
            // These are the default selections and should be updated by the page on load(if needed)
            $scope.options.selection.ListingType.default ??= {
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
            $scope.options.selection.ListingType.All ??= [
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

            $scope.$applyAsync(() => {
                $scope.initialized = true
            })
            // await $scope.variableSync() sync is moved to teh timeout above so it can still work with List widgets
            Idx.emit('init', $scope)
        }

        // Initialization by Event
        this.$onInit = () => {
            $scope.Idx = Idx

            let initNow = true
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                // TODO: This needs better logic to determine what is acceptably initialized
                initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
            }

            if (initNow) {
                init().then()
                return
            }

            const stopWatchingInitNow = $scope.$watch('$ctrl.initNow', (initNowCtrl: boolean) => {
                // console.log('CAROUSEL initNow called later')
                if (initNowCtrl !== true) {
                    return
                }
                if (!$scope.initialized) {
                    init().then()
                }
                stopWatchingInitNow()
            })
        }

        $scope.$watch('options.query.where.ListingType', () => {
            if ($scope.options?.query?.where && $scope.options?.selection?.ListingType?.list) {
                if (!$scope.options?.query?.where?.ListingType) {
                    $scope.options.query.where.ListingType = []
                }

                if (!isArray($scope.options.query.where.ListingType)) {
                    $scope.options.query.where.ListingType = [$scope.options.query.where.ListingType]
                }
                $scope.options.selection.ListingType.group.Residential =
                    $scope.isIntersecting($scope.options.selection.ListingType.list.Residential, $scope.options.query.where.ListingType)
                $scope.options.selection.ListingType.group.Commercial =
                    $scope.isIntersecting($scope.options.selection.ListingType.list.Commercial, $scope.options.query.where.ListingType)

                $scope.options.forRent =
                    $scope.isIntersecting($scope.options.selection.ListingType.list.Lease, $scope.options.query.where.ListingType)
                // console.log('watched ListingType', $scope.options.query.ListingType, $scope.options.selection.ListingType.group)
            }
        })

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         */
        $scope.variableSync = async (): Promise<void> => {
            $scope.variableSyncing = $attrs.variableSync && isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}
            // console.log('variables syncing: ', clone($scope.variableSyncing))
            const promises: any[] = []
            Object.keys($scope.variableSyncing).forEach((elementId: string) => {
                promises.push(
                    $q(async (resolve: void | any) => {
                        const varElement = Idx.getInput(elementId)
                        if (varElement) {
                            // console.log('got input', varElement, clone(varElement.val()))
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
                                        isString(value) ||
                                        isNumber(value) ||
                                        isUndefined(value) ||
                                        value == null
                                    ) {
                                        if (isUndefined(value)) {
                                            // elements can't process undefined... treat as null
                                            value = null
                                        }
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

        $scope.canDisplayListingTypeButton = (listType: ListingTypeSelectionSetting): boolean => {
            return $scope.options.forRent === listType.lease && $scope.options.selection.ListingType.group[listType.group]
        }

        /** @deprecated use _.includes */
        $scope.inArray = (item: any, array: any[]) => includes(array, item)

        $scope.isIntersecting = (itemArray: any[], array: any[]): boolean => {
            if (!isArray(array) || !isArray(itemArray)) {
                console.warn('Array undefined, cannot search for', itemArray, 'in', array)
                // return []
                return false
            }
            return intersection(itemArray, array).length > 0
        }

        /**
         * Add or remove a certain element from an array
         * TODO move to global reference
         */
        $scope.toggleArrayElement = (item: any, array: any[]): void => {
            array ??= []
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
                const position: material.IPanelPosition | any = $mdPanel.newPanelPosition()
                    .relativeTo(ev.srcElement)
                    .addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.BELOW)

                const animation = $mdPanel.newPanelAnimation()
                animation.openFrom(position)
                animation.closeTo(position)
                animation.withAnimation($mdPanel.animation.FADE)

                const config: material.IPanelConfig & {
                    contentElement: string,
                    openFrom: any
                } = {
                    animation,
                    attachTo: element(document.body),
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
            if (!mlsVariables || reset) {
                // mlsVariables = Idx.getMLSVariables()
                mlsVariables = {}
                Idx.getMLSVariables().forEach((service: MLSService) => {
                    mlsVariables[service.id] = service
                })
            }
            return Object.values(mlsVariables)
        }

        /**
         * Update the entirety options.query in a safe manner to ensure undefined references are not produced
         */
        $scope.setQuery = (newQuery?: CompileFilterOptions): void => {
            newQuery ??= {}
            newQuery.where ??= {}
            // getDefaultWhereOptions returns the set a required WhereOptions with initialized arrays
            // $scope.options.query = extend(Idx.getDefaultWhereOptions(), newQuery)
            $scope.options.query = cloneDeep(newQuery)
            $scope.setWhere($scope.options.query.where)
            // console.log('setQuery $scope.options.query to ', clone($scope.options.query))
        }

        /**
         * Update the entirety options.query.where in a safe manner to ensure undefined references are not produced
         */
        $scope.setWhere = (newWhere?: WhereOptions): void => {
            // console.log('setWhere', clone(newWhere))
            newWhere ??= {}
            // getDefaultWhereOptions returns the set a required WhereOptions with initialized arrays
            $scope.options.query.where = extend(Idx.getDefaultWhereOptions(), newWhere)
            // find the objects that aren't arrays and convert to arrays as require to prevent future and current errors
            map(Idx.getDefaultWhereOptions(), (value, key: string) => {
                if (
                    isArray(value) &&
                    Object.prototype.hasOwnProperty.call($scope.options.query.where, key) &&
                    !isArray($scope.options.query.where[key])
                ) {
                    $scope.options.query.where[key] = [$scope.options.query.where[key]]
                }
            })
            // console.log('setWhere', clone($scope.options.query.where))
        }

        $scope.setWhereDefaults = (): void => {
            $scope.$applyAsync(() => {
                if ($scope.options.query.where.ListingType.length < 1) {
                    $scope.options.query.where.ListingType = $scope.options.selection.ListingType.default.Sale.Residential
                    // console.log('updating', $scope.options.query.where.ListingType)
                    $scope.selectDefaultListingType()
                }
                // console.log('setting lastQuery setWhereDefaults', cloneDeep($scope.options.query))
                lastQuery = cloneDeep($scope.options.query)
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
        $scope.search = (force?: boolean): void => {
            if (!$scope.initialized) {
                console.warn($scope.uid, 'has not initialized and may not search yet')
                return
            }
            let listScope: IdxPropertyListScope | IdxComponentScope
            if ($scope.listId) {
                listScope = Idx.getListInstance($scope.listId)
            }
            if (listScope) {
                // $scope.options.query.service = [1]
                // $scope.options.query.where.Page = 1 // just a fall back, as it gets 'Page 2'
                // $scope.options.query.page = 1 // just a fall back, as it gets 'Page 2'
                // console.log('sending search', clone($scope.options.query))

                /* const searchQuery: CompileFilterOptions = {
                    where: clone($scope.options.query.where)
                }*/
                // FIXME need to ensure only where options
                // console.log('but suppose to send', clone($scope.options.query))
                // listScope.search($scope.options.query, true)
                // only allow a query every second
                if (!$scope.throttledSearch) {
                    $scope.throttledSearch =
                        throttle(() => {listScope.search($scope.options.query, true)}, 600, { trailing: false })
                }
                $scope.throttledSearch()
            } else {
                // console.log('comparing last', cloneDeep(lastQuery))
                // console.log('comparing current', cloneDeep($scope.options.query))
                if ($scope.hasQueryChanged() || force) {
                    lastQuery = cloneDeep($scope.options.query)
                    // console.warn('there was a change')
                    Idx.setUrlOptions('Search', $scope.options.query.where)
                    $window.open($scope.listLinkUrl + '#!/' + Idx.getUrlOptionsPath(defaultQuery), $scope.listLinkTarget)
                }
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
            if (!isEmpty(searchTerm) && isString(searchTerm)) {
                options.query.where = {
                    OfficeName: searchTerm
                }
                searchOnLoad = true
            }
            if (!isNumber(editIndex)) {
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
                parent: element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: true, // Only for -xs, -sm breakpoints.
                // bindToController: true,
                controllerAs: 'ctrl',
                // tslint:disable-next-line:no-shadowed-variable
                controller: ($scope: any, $mdDialog: material.IDialogService) => { // shadowing is needed for inline controllers
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
                    // IDX.refreshUrlOptions(defaultOptions)
                    // Revery page title back to what it was
                    // IDX.setPageTitle()
                    // Let's destroy it to save memory
                    // $timeout(IDX.unregisterDetailsInstance('property_member_detail_popup'), 10)
                })
        }

        $scope.validateOfficeGroups = (search?: boolean): void => {
            $scope.options.officeGroups = $scope.options.officeGroups.filter((selection) => {
                return (!isEmpty(selection.name) && !isEmpty(selection.group))
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
                lastQuery = cloneDeep($scope.options.query)
                $scope.listInitialized = true
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.hasQueryChanged = (): boolean => !isEqual(clone(lastQuery), clone($scope.options.query))
        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
            // TODO need to kill any attached slideshows
        }
    },
    templateUrl: ($attrs: IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
