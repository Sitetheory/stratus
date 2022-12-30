/**
 * @file IdxOfficeList Component @stratusjs/idx/office/list.component
 * @example <stratus-idx-office-list>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Office-List-Widget
 */

// Runtime
import {clone, cloneDeep, forEach, isNil, isNumber, isString} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    element,
    material,
    IAnchorScrollService,
    IAttributes,
    ISCEService,
    ITimeoutService,
    IQService,
    IWindowService
} from 'angular'
import 'angular-material'
import 'angular-sanitize'
import {
    CompileFilterOptions,
    IdxEmitter,
    IdxListScope,
    IdxService,
    Office,
    WhereOptions
} from '@stratusjs/idx/idx'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {isJSON, LooseObject, safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Stratus Preload
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/idx/idx'
import '@stratusjs/idx/disclaimer/disclaimer.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'office'
const componentName = 'list'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxOfficeListScope = IdxListScope<Office> & {
    // options: CompileFilterOptions // FIXME rename to query
    initialized: boolean
    urlLoad: boolean
    searchOnLoad: boolean
    query: CompileFilterOptions

    detailsLinkPopup: boolean
    detailsLinkUrl: string
    detailsLinkTarget: 'popup' | '_self' | '_blank'
    googleApiKey?: string

    variableSyncing?: LooseObject

    displayModelDetails(model: Office, ev?: any): void
    variableInject(member: Office): Promise<void>
}

Stratus.Components.IdxOfficeList = {
    bindings: {
        // TODO wiki docs
        elementId: '@',
        tokenUrl: '@',
        urlLoad: '@',
        searchOnLoad: '@',
        detailsLinkPopup: '@',
        detailsLinkUrl: '@',
        detailsLinkTarget: '@',
        orderOptions: '@',
        query: '@',
        /** Type: number[] */
        queryService: '@',
        template: '@',
        variableSync: '@'
    },
    controller(
        $anchorScroll: IAnchorScrollService,
        $attrs: IAttributes,
        $q: IQService,
        $mdDialog: material.IDialogService,
        $timeout: ITimeoutService,
        $sce: ISCEService,
        $scope: IdxOfficeListScope,
        $window: IWindowService,
        Idx: IdxService,
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        $scope.elementId = $attrs.elementId || $scope.uid
        Stratus.Instances[$scope.elementId] = $scope
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
        // Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        let defaultOptions: WhereOptions
        let defaultQuery: WhereOptions
        let lastQuery: CompileFilterOptions

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        const init = async () => {
            /**
             * Allow options to be loaded initially from the URL
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : false
            $scope.searchOnLoad = $attrs.searchOnLoad && isJSON($attrs.searchOnLoad) ? JSON.parse($attrs.searchOnLoad) : false
            $scope.detailsLinkPopup = $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ?
                JSON.parse($attrs.detailsLinkPopup) : true
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/office/details'
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'

            $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) : {}
            $scope.query.service = $attrs.queryService && isJSON($attrs.queryService) ?
                JSON.parse($attrs.queryService) : $scope.query.service || []

            $scope.query.order =
                $scope.query.order && isString($scope.query.order) && isJSON($scope.query.order) ? JSON.parse($scope.query.order) :
                    $attrs.queryOrder && isJSON($attrs.queryOrder) ? JSON.parse($attrs.queryOrder) : $scope.query.order || null
            $scope.query.page ??= null// will be set by Service
            $scope.query.perPage ??=
                ($attrs.queryPerPage && isString($attrs.queryPerPage) ? parseInt($attrs.queryPerPage, 10) : null) ||
                ($attrs.queryPerPage && isNumber($attrs.queryPerPage) ? $attrs.queryPerPage : null) ||
                25

            $scope.query.where = $attrs.queryWhere && isJSON($attrs.queryWhere) ? JSON.parse($attrs.queryWhere) : $scope.query.where || []
            // Fixme, sometimes it's just MemberMlsAccessYN ....
            // $scope.query.where.MemberStatus = $scope.query.where.MemberStatus || {inq: ['Active', 'Yes', 'TRUE']}

            // $scope.query.where.MemberKey = $scope.query.where.MemberKey || '91045'
            // $scope.query.where.AgentLicense = $scope.query.where.AgentLicense || []*/

            defaultOptions = JSON.parse(JSON.stringify($scope.query.where))// Extend/clone doesn't work for arrays
            defaultQuery = JSON.parse(JSON.stringify($scope.query.where)) // Extend/clone doesn't work for arrays
            // lastQuery = {}

            /* $scope.orderOptions ??= {
              'Price (high to low)': '-ListPrice',
              'Price (low to high)': 'ListPrice'
            } */

            // $scope.googleApiKey = $attrs.googleApiKey || null

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, moduleName, $scope)

            // const urlOptions: { Search?: any } = {}
            // const urlQuery: { Search?: any } = {}
            /* if ($scope.urlLoad) {
              // first set the UrlOptions via defaults (cloning so it can't be altered)
              Idx.setUrlOptions('Search', JSON.parse(JSON.stringify(defaultQuery)))
              // Load Options from the provided URL settings
              urlOptions = Idx.getOptionsFromUrl()
              // If a specific listing is provided, be sure to pop it up as well
              if (
                urlOptions.Listing.service
                && urlOptions.Listing.ListingKey
              ) {
                $scope.displayPropertyDetails(urlOptions.Listing)
              }
            } */

            // if ($scope.urlLoad) {
            // await $scope.search(urlQuery.Search, true, false)
            // }

            if ($scope.searchOnLoad) {
                await $scope.search($scope.query, false, false)
            }

            $scope.$applyAsync(() => {
                $scope.initialized = true
                Idx.emit('init', $scope)
            })
        }

        // Initialization by Event
        this.$onInit = () => {
            $scope.Idx = Idx
            $scope.collection = new Collection<Office>({})

            let initNow = true
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                // TODO: This needs better logic to determine what is acceptably initialized
                initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
            }

            if (initNow) {
                init().then()
                return
            }

            const stopWatchingInitNow = $scope.$watch('initNow', (initNowCtrl: boolean) => {
                if (initNowCtrl !== true) {
                    return
                }
                if (!$scope.initialized) {
                    init().then()
                }
                stopWatchingInitNow()
            })
        }

        $scope.$watch('collection.models', () => { // models?: []
            if ($scope.collection.completed) {
                Idx.emit('collectionUpdated', $scope, clone($scope.collection))
            }
        })

        $scope.getPageModels = (): Office[] => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const offices: Office[] = []
            // only get the page's models, not every single model in collection
            const models = $scope.collection.models as Office[]
            models.slice(
                ($scope.query.perPage * ($scope.query.page - 1)), // 20 * (1 - 1) = 0. 20 * (2 - 1) = 20
                ($scope.query.perPage * $scope.query.page) // e.g. 20 * 1 = 20. 20 * 2 = 40
            ).forEach((member) => {
                offices.push(member)
            })
            return offices
        }

        $scope.scrollToModel = (model: Office): void => {
            $anchorScroll(`${$scope.elementId}_${model._id}`)
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL options, so it may not be ideal to use on page load
         * TODO Idx needs to export search options interface
         */
        $scope.search = async (
            query?: CompileFilterOptions, // FIXME rename to query
            refresh?: boolean,
            updateUrl?: boolean
        ): Promise<Collection<Office>> =>
            $q(async (resolve: any) => {
                query ??= {}
                updateUrl = updateUrl === false ? updateUrl : true
                // console.log('searching for', clone(query))

                // If refreshing, reset to page 1
                /*if (refresh) {
                    $scope.query.page = 1
                }*/
                // If search query sent, update the Widget. Otherwise use the widgets current where settings
                if (Object.keys(query.where).length > 0) {
                    // delete ($scope.query.where)
                    $scope.query.where = query.where
                    /*if ($scope.query.where.Page) {
                        $scope.query.page = $scope.query.where.Page
                        delete ($scope.query.where.Page)
                    }
                    if ($scope.query.where.Order) {
                        $scope.query.order = $scope.query.where.Order
                        delete ($scope.query.where.Order)
                    }*/
                } /*else {
                    urlWhere = $scope.query.where || {}
                }*/
                /* If a different page, set it in the URL
                if ($scope.query.page) {
                    query.Page = $scope.query.page
                }
                // Don't add Page/1 to the URL
                if (query.Page <= 1) {
                    delete (query.Page)
                }*/
                // console.log('searching now for', clone(query))

                // Page checks
                // If a different page, set it in the URL
                // If Page was placed in the where query, let's move it
                if (query.where.page) {
                    query.page = query.where.page
                    delete query.where.page
                }
                if (query.where.Page) {
                    query.page = query.where.Page
                    delete query.where.Page
                }
                if (query.page) {
                    $scope.query.page = query.page
                }
                // If refreshing, reset to page 1
                if (refresh) {
                    $scope.query.page = 1
                }
                /*if ($scope.query.page) {
                    urlWhere.Page = $scope.query.page
                }
                // Don't add Page/1 to the URL
                if (urlWhere.Page <= 1) {
                    delete (urlWhere.Page)
                }*/

                // If Order was placed in the where query, let's move it
                if (query.where.order) {
                    query.order = query.where.order
                    delete query.where.order
                }
                if (query.where.Order) {
                    query.order = query.where.Order
                    delete query.where.Order
                }
                if (query.order) {
                    $scope.query.order = query.order
                    // delete ($scope.query.where.Order)
                }
                /*if ($scope.query.order && $scope.query.order.length > 0) {
                    query.Order = $scope.query.order
                }*/

                // Set the URL options
                // Idx.setUrlOptions('Search', options)

                // Display the URL options in the address bar
                /* if (updateUrl) {
                  Idx.refreshUrlOptions(defaultQuery)
                } */

                if (
                    query.hasOwnProperty('service') &&
                    !isNil(query.service)
                ) {
                    // service does not affect URLs as it's a page specific thing
                    $scope.query.service = query.service
                }
                Idx.emit('searching', $scope, clone($scope.query))

                // Grab the new member listings
                // console.log('fetching members:', $scope.query)
                try {
                    // resolve(Idx.fetchProperties($scope, 'collection', $scope.query, refresh))
                    // Grab the new property listings
                    const results = await Idx.fetchOffices($scope, 'collection', $scope.query, refresh)
                    lastQuery = cloneDeep($scope.query)
                    Idx.emit('searched', $scope, clone($scope.query))
                    resolve(results)
                } catch (e) {
                    console.error('Unable to fetchMembers:', e)
                }
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            // Idx.emit('pageChanging', $scope, clone($scope.query.page))
            Idx.emit('pageChanging', $scope, clone($scope.query.page))
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.page = pageNumber
            await $scope.search()
            // Idx.emit('pageChanged', $scope, clone($scope.query.page))
            Idx.emit('pageChanged', $scope, clone($scope.query.page))
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param ev - Click event
         */
        $scope.pageNext = async (ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            if (!$scope.query.page) {
                $scope.query.page = 1
            }
            if ($scope.collection.completed && $scope.query.page < $scope.collection.meta.data.totalPages) {
                if (isString($scope.query.page)) {
                    $scope.query.page = parseInt($scope.query.page, 10)
                }
                await $scope.pageChange($scope.query.page + 1, ev)
            }
        }

        /**
         * Move the displayed listings to the previous page, keeping the current query
         * @param ev - Click event
         */
        $scope.pagePrevious = async (ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            if (!$scope.query.page) {
                $scope.query.page = 1
            }
            if ($scope.collection.completed && $scope.query.page > 1) {
                if (isString($scope.query.page)) {
                    $scope.query.page = parseInt($scope.query.page, 10)
                }
                const prev = $scope.query.page - 1 || 1
                await $scope.pageChange(prev, ev)
            }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param order - string and strings
         * @param ev - Click event
         */
        $scope.orderChange = async (order: string | string[], ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                // TODO set old Order back?
                return
            }
            Idx.emit('orderChanging', $scope, clone(order))
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.order = order
            await $scope.search(null, true, true)
            Idx.emit('orderChanged', $scope, clone(order))
        }

        $scope.highlightModel = (model: Office, timeout?: number): void => {
            timeout ??= 0
            model._unmapped ??= {}
            $scope.$applyAsync(() => {
                model._unmapped._highlight = true
            })
            if (timeout > 0) {
                $timeout(() => {
                    $scope.unhighlightModel(model)
                }, timeout)
            }
        }

        $scope.unhighlightModel = (model: Office): void => {
            if (model) {
                model._unmapped ??= {}
                $scope.$applyAsync(() => {
                    model._unmapped._highlight = false
                })
            }
        }

        /**
         * Either popup or load a new page with the
         * @param model - details object
         * @param ev - Click event
         */
        $scope.displayModelDetails = (model: Office, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            if ($scope.detailsLinkPopup === true) {
                // Opening a popup will load the propertyDetails and adjust the hashbang URL
                const templateOptions: {
                    element_id: string,
                    service: number,
                    'member-key': string,
                    'page-title': boolean,
                    'google-api-key'?: string,
                } = {
                    element_id: 'property_member_detail_popup',
                    service: model._ServiceId,
                    'member-key': model.MemberKey,
                    'page-title': true// update the page title
                }
                if ($scope.googleApiKey) {
                    templateOptions['google-api-key'] = $scope.googleApiKey
                }

                let template =
                    '<md-dialog aria-label="' + model.MemberKey + '">' +
                    '<stratus-idx-member-details '
                forEach(templateOptions, (optionValue, optionKey) => {
                    template += `${optionKey}='${optionValue}'`
                })
                template +=
                    '></stratus-idx-member-details>' +
                    '</md-dialog>'

                $mdDialog.show({
                    template,
                    parent: element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true // Only for -xs, -sm breakpoints.
                })
                    .then(() => {
                    }, () => {
                        // Idx.setUrlOptions('Listing', {})
                        // Idx.refreshUrlOptions(defaultQuery)
                        // Revery page title back to what it was
                        Idx.setPageTitle()
                        // Let's destroy it to save memory
                        $timeout(() => Idx.unregisterDetailsInstance('property_member_detail_popup', 'member'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(model), $scope.detailsLinkTarget)
            }
        }

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         */
        $scope.variableInject =
            async (member: Office): Promise<void> => {
                $scope.variableSyncing = $attrs.variableSync && isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}
                Object.keys($scope.variableSyncing).forEach(elementId => {
                    // promises.push(
                    // $q(async function (resolve, reject) {
                    const varElement = Idx.getInput(elementId)
                    if (varElement) {
                        // Form Input exists

                        if (Object.prototype.hasOwnProperty.call(member, $scope.variableSyncing[elementId])) {
                            varElement.val(member[$scope.variableSyncing[elementId]])
                        } else if (
                            $scope.variableSyncing[elementId] === 'MemberFullName' &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberFirstName') &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberLastName')
                        ) {
                            varElement.val(member.MemberFirstName + ' ' + member.MemberLastName)
                        } else if (
                            $scope.variableSyncing[elementId] === 'MemberFirstName' &&
                            !Object.prototype.hasOwnProperty.call(member, 'MemberFirstName') &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberFullName')
                        ) {
                            const nameArray = member.MemberFullName.split(' ')
                            const firstName = nameArray.shift()
                            // let lastName = nameArray.join(' ')
                            varElement.val(firstName)
                        } else if (
                            $scope.variableSyncing[elementId] === 'MemberLastName' &&
                            !Object.prototype.hasOwnProperty.call(member, 'MemberLastName') &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberFullName')
                        ) {
                            const nameArray = member.MemberFullName.split(' ')
                            // let firstName = nameArray.shift()
                            const lastName = nameArray.join(' ')
                            varElement.val(lastName)
                        } else if ($scope.variableSyncing[elementId] === 'OfficeNumber') {
                            if (Object.prototype.hasOwnProperty.call(member, 'OfficeMlsId')) {
                                varElement.val(member.OfficeMlsId)
                            } else if (Object.prototype.hasOwnProperty.call(member, 'OfficeKey')) {
                                varElement.val(member.OfficeKey)
                            }
                        }

                        // varElement.val(member.MemberFullName)

                        // let scopeVarPath = $scope.variableSyncing[elementId]
                        // convert into a real var path and set the intial value from the exiting form value
                        // await $scope.updateScopeValuePath(scopeVarPath, varElement.val())

                        // Creating watcher to update the input when the scope changes
                        // $scope.$watch(
                        // scopeVarPath,
                        // function (value) {
                        // console.log('updating', scopeVarPath, 'value to', value, 'was', varElement.val())
                        // varElement.val(value)
                        // },
                        // true
                        // )
                    }
                })
                // await $q.all(promises)
            }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
