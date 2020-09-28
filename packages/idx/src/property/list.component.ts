// IdxPropertyList Component
// @stratusjs/idx/property/list.component
// <stratus-idx-property-list>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
import moment from 'moment'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Angular+ Modules
import {MarkerSettings} from '@stratusjs/map/map.component'

// Services
import '@stratusjs/idx/idx'
// tslint:disable-next-line:no-duplicate-imports
import {
    CompileFilterOptions,
    IdxListScope,
    IdxService,
    MLSService,
    Property,
    WhereOptions,
    UrlWhereOptions,
    UrlsOptionsObject, IdxEmitter
} from '@stratusjs/idx/idx'

// Stratus Dependencies
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class

import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Stratus Directives
import 'stratus.directives.src'

// Component Preload
import '@stratusjs/idx/property/details.component'
import '@stratusjs/idx/map.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'list'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxPropertyListScope = IdxListScope<Property> & {
    urlLoad: boolean
    searchOnLoad: boolean
    detailsLinkPopup: boolean
    detailsLinkUrl: string
    detailsLinkTarget: '_self' | '_blank'
    detailsHideVariables?: string[]
    preferredStatus: 'Closed' | 'Leased' | 'Rented'
    detailsTemplate?: string
    query: CompileFilterOptions
    orderOptions: object | any // TODO need to specify
    googleApiKey?: string
    contactName: string
    contactEmail?: string
    contactPhone: string
    disclaimerString: string
    disclaimerHTML: any
    instancePath: string
    mapMarkers: MarkerSettings[]

    getStreetAddress(property: Property): string
    pageChange(pageNumber: number, ev?: any): Promise<void>
    pageNext(ev?: any): Promise<void>
    pagePrevious(ev?: any): Promise<void>
    orderChange(order: string | string[], ev?: any): Promise<void>
    searchProperties(
        query?: CompileFilterOptions,
        refresh?: boolean,
        updateUrl?: boolean
    ): Promise<Collection<Property>>
}

Stratus.Components.IdxPropertyList = {
    bindings: {
        uid: '@',
        elementId: '@',
        tokenUrl: '@',
        detailsLinkPopup: '@',
        detailsLinkUrl: '@',
        detailsLinkTarget: '@',
        detailsHideVariables: '@',
        detailsTemplate: '@',
        preferredStatus: '@',
        contactEmail: '@',
        contactName: '@',
        contactPhone: '@',
        googleApiKey: '@',
        orderOptions: '@',
        query: '@',
        searchOnLoad: '@',
        template: '@',
        urlLoad: '@'
    },
    controller(
        $anchorScroll: angular.IAnchorScrollService,
        $attrs: angular.IAttributes,
        $q: angular.IQService,
        $mdDialog: angular.material.IDialogService,
        $scope: IdxPropertyListScope,
        $timeout: angular.ITimeoutService,
        $window: angular.IWindowService,
        $sce: angular.ISCEService,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        /*$ctrl.uid = $attrs.uid && !_.isEmpty($attrs.uid) ? $attrs.uid :
            _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
         */
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Instances[$scope.elementId] = $scope
        $scope.instancePath = `Stratus.Instances.${$scope.elementId}`
        $scope.localDir = localDir
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        $ctrl.$onInit = async () => {
            $scope.Idx = Idx
            $scope.collection = new Collection<Property>({})
            /**
             * Allow query to be loaded initially from the URL
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.searchOnLoad = $attrs.searchOnLoad && isJSON($attrs.searchOnLoad) ? JSON.parse($attrs.searchOnLoad) : true
            $scope.detailsLinkPopup = $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ?
                JSON.parse($attrs.detailsLinkPopup) : true
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || ''
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'
            $scope.detailsHideVariables = $attrs.detailsHideVariables && isJSON($attrs.detailsHideVariables) ?
                JSON.parse($attrs.detailsHideVariables) : []
            $scope.detailsTemplate = $attrs.detailsTemplate || null
            $scope.preferredStatus = $attrs.preferredStatus || 'Closed' // Closed is most compatible

            // TODO added backwards compatible options <--> query parameter until the next version
            $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) :
                $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            // $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) : {}

            $scope.query.service = $scope.query.service || []
            $scope.query.order = $scope.query.order || null // will be set by Service
            $scope.query.page = $scope.query.page || null // will be set by Service
            $scope.query.perPage = $scope.query.perPage || 25
            $scope.query.images = $scope.query.images || {limit: 1}

            // Remove invalid variable types to prevent breaking formating
            if (_.isArray($scope.query.order)) {
                delete $scope.query.order
            }
            if (_.isArray($scope.query.where)) {
                delete $scope.query.where
            }
            /* List of default or blank values */
            const startingQuery: WhereOptions = $scope.query.where || {}
            // If these are blank, set some defaults
            startingQuery.Status = startingQuery.Status || ['Active', 'Contract']
            startingQuery.ListingType = startingQuery.ListingType || ['House', 'Condo']
            $scope.query.where = _.extend(Idx.getDefaultWhereOptions(), startingQuery || {})

            $ctrl.defaultQuery = JSON.parse(JSON.stringify($scope.query.where)) // Extend/clone doesn't work for arrays

            // TODO need to make an additional section to only include ''Recently Sold' when solds are selected (low priority)
            $scope.orderOptions = $scope.orderOptions || {
                'Price (high to low)': ['-ClosePrice', '-ListPrice'],
                'Price (low to high)': ['ClosePrice', 'ListPrice'],
                'Recently Updated': '-ModificationTimestamp',
                'Recently Sold': '-CloseDate'
            }

            $scope.googleApiKey = $attrs.googleApiKey || null
            $scope.contactName = $attrs.contactName || null
            $scope.contactEmail = $attrs.contactEmail || null
            $scope.contactPhone = $attrs.contactPhone || null

            $scope.disclaimerString = 'Loading...'
            $scope.disclaimerHTML = $sce.trustAsHtml(`<span>${$scope.disclaimerString}</span>`)

            $scope.mapMarkers = []

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, moduleName, $scope)

            let urlQuery: UrlsOptionsObject = {
                Listing: {},
                Search: {}
            }

            if ($scope.urlLoad) {
                // first set the UrlQuery via defaults (cloning so it can't be altered)
                Idx.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultQuery)))
                // Load Query from the provided URL settings
                urlQuery = Idx.getOptionsFromUrl()
                // If a specific listing is provided, be sure to pop it up as well
                // console.log('urlQuery', _.clone(urlQuery))
                if (
                    // urlQuery.hasOwnProperty('Listing') &&
                    // urlQuery.Listing.service &&
                    urlQuery.hasOwnProperty('service') &&
                    urlQuery.Listing.ListingKey
                ) {
                    $scope.displayModelDetails((urlQuery.Listing as Property)) // FIXME a quick fix as this contains ListingKey
                }
            }

            if ($scope.searchOnLoad) {
                // console.log('at $scope.searchOnLoad', _.clone(urlQuery.Search))
                const searchQuery: CompileFilterOptions = {
                    where: _.clone(urlQuery.Search) as WhereOptions
                }
                // delete searchQuery.where.Page
                // delete searchQuery.where.Order
                // console.log('about to searchProperties for', _.clone(searchQuery))
                await $scope.searchProperties(searchQuery, false, false)
            }

            Idx.emit('init', $scope)
        }

        $scope.$watch('collection.models', () => { // models?: []
            if ($scope.collection.completed) {
                $ctrl.processMLSDisclaimer() // TODO force reset with true?

                Idx.emit('collectionUpdated', $scope, $scope.collection)
            }
        })

        $scope.getPageModels = (): Property[] => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const listings: Property[] = []
            // only get the page's models, not every single model in collection
            const models = $scope.collection.models as Property[]
            models.slice(
                ($scope.query.perPage * ($scope.query.page - 1)), // 20 * (1 - 1) = 0. 20 * (2 - 1) = 20
                ($scope.query.perPage * $scope.query.page) // e.g. 20 * 1 = 20. 20 * 2 = 40
            ).forEach((listing) => {
                listings.push(listing)
            })
            return listings
        }

        $scope.scrollToModel = (model: Property): void => {
            $anchorScroll(`${$scope.elementId}_${model._id}`)
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL query, so it may not be ideal to use on page load
         * TODO Idx needs to export search query interface
         * Returns Collection<Property>
         */
        $scope.searchProperties = async (
            query?: CompileFilterOptions,
            refresh?: boolean,
            updateUrl?: boolean
        ): Promise<Collection<Property>> =>
            $q(async (resolve: any) => {
                query = query || _.clone($scope.query) || {}
                query.where = query.where || {}
                // console.log('searchProperties has query', _.clone(query))

                let where: UrlWhereOptions = _.clone(query.where) || {}
                // updateUrl = updateUrl === false ? updateUrl : true
                updateUrl = updateUrl === false ? updateUrl : $scope.urlLoad === false ? $scope.urlLoad : true

                // If search query sent, update the Widget. Otherwise use the widgets current where settings
                if (Object.keys(query.where).length > 0) {
                    delete ($scope.query.where) // Remove the current settings
                    // console.log('searchProperties had a query.where with keys')
                    // console.log('searchProperties $scope.query', _.clone($scope.query))
                    // console.log('searchProperties query.where', _.clone(query.where))
                    $scope.query.where = query.where // Add the new settings
                    // FIXME ensure Page doesn't get added here anymore
                    /* if ($scope.query.where.Page) { // removing
                        $scope.query.page = $scope.query.where.Page
                        delete ($scope.query.where.Page)
                    } */

                    // FIXME ensure Order doesn't get added here anymore
                    /* if ($scope.query.where.Order) {
                        $scope.query.order = $scope.query.where.Order
                        delete ($scope.query.where.Order)
                    } */
                } else {
                    // console.log('query.where is blank, so loading', _.clone($scope.query.where))
                    where = _.clone($scope.query.where) || {}
                }

                // Page checks
                // If a different page, set it in the URL
                if (query.where.Page) {
                    // console.log('there was a query.where.Page of ', _.clone(query.where.Page))
                    // If Page was placed in the where query, let's move it
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
                if ($scope.query.page) {
                    where.Page = $scope.query.page
                }
                // Don't add Page/1 to the URL
                if (where.Page <= 1) {
                    delete (where.Page)
                }

                if (query.where.Order) {
                    // If Order was placed in the where query, let's move it
                    query.order = query.where.Order
                    delete query.where.Order
                }
                if (query.order) {
                    $scope.query.order = query.order
                    // delete ($scope.query.where.Order)
                }
                if ($scope.query.order && $scope.query.order.length > 0) {
                    // console.log('setting where to', _.clone($scope.query.order), 'from', _.clone(where.Order))
                    where.Order = $scope.query.order
                }

                if (
                    query.hasOwnProperty('service') &&
                    !_.isNil(query.service)
                ) {
                    // service does not affect URLs as it's a page specific thing
                    $scope.query.service = query.service
                }

                // console.log('setting this URL', _.clone(where))
                // console.log('$scope.query.where ending with', _.clone($scope.query.where))
                // Set the URL query
                Idx.setUrlOptions('Search', where)
                // TODO need to avoid adding default variables to URL (Status/order/etc)

                if (updateUrl) {
                    // console.log('$ctrl.defaultQuery being set', $ctrl.defaultQuery)
                    // Display the URL query in the address bar
                    Idx.refreshUrlOptions($ctrl.defaultQuery)
                }

                Idx.emit('searching', $scope, _.clone($scope.query))

                try {
                    // resolve(Idx.fetchProperties($scope, 'collection', $scope.query, refresh))
                    // Grab the new property listings
                    const results = await Idx.fetchProperties($scope, 'collection', $scope.query, refresh)
                    Idx.emit('searched', $scope, _.clone($scope.query))
                    resolve(results)
                } catch (e) {
                    console.error('Unable to fetchProperties:', e)
                }
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - The page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            Idx.emit('pageChanging', $scope, _.clone($scope.query.page))
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.page = pageNumber
            $anchorScroll($scope.elementId) // Scroll to the top again
            await $scope.searchProperties()
            Idx.emit('pageChanged', $scope, _.clone($scope.query.page))
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param ev - Click event
         */
        $scope.pageNext = async (ev?: any): Promise<void> => {
            if (!$scope.query.page) {
                $scope.query.page = 1
            }
            if ($scope.collection.completed && $scope.query.page < $scope.collection.meta.data.totalPages) {
                if (_.isString($scope.query.page)) {
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
            if (!$scope.query.page) {
                $scope.query.page = 1
            }
            if ($scope.collection.completed && $scope.query.page > 1) {
                if (_.isString($scope.query.page)) {
                    $scope.query.page = parseInt($scope.query.page, 10)
                }
                const prev = $scope.query.page - 1 || 1
                await $scope.pageChange(prev, ev)
            }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param order -
         * @param ev - Click event
         */
        $scope.orderChange = async (order: string | string[], ev?: any): Promise<void> => {
            Idx.emit('orderChanging', $scope, _.clone(order))
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.order = order
            await $scope.searchProperties(null, true, true)
            Idx.emit('orderChanged', $scope, _.clone(order))
        }

        /**
         * Return a string path to a particular property listing
         * TODO Idx needs a Property interface
         */
        $scope.getDetailsURL = (property: Property): string =>
            $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/'


        $scope.getStreetAddress = (property: Property): string => $scope.Idx.getStreetAddress(property)

        $scope.getGoogleMapsKey = (): string | null => {
            return $scope.googleApiKey || Idx.getGoogleMapsKey()
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            if (!$ctrl.mlsVariables || reset) {
                $ctrl.mlsVariables = []
                Idx.getMLSVariables().forEach((service: MLSService) => {
                    $ctrl.mlsVariables[service.id] = service
                })
            }
            return $ctrl.mlsVariables
        }

        /**
         * Display an MLS' Name
         */
        $scope.getMLSName = (serviceId: number): string => {
            const services = $scope.getMLSVariables()
            let name = 'MLS'
            if (services[serviceId]) {
                name = services[serviceId].name
            }
            return name
        }

        /**
         * Process an MLS' required legal disclaimer to later display
         * @param reset - set true to force reset
         * TODO Idx needs to supply MLSVariables interface
         */
        $ctrl.processMLSDisclaimer = (reset?: boolean): void => {
            const services: MLSService[] = $scope.getMLSVariables(reset)
            let disclaimer = ''
            services.forEach(service => {
                if (disclaimer) {
                    disclaimer += '<br>'
                }
                if (service.fetchTime.Property) {
                    disclaimer += `Last checked ${moment(service.fetchTime.Property).format('M/D/YY h:mm a')}. `
                } else if ($scope.collection.meta.data.fetchDate) {
                    disclaimer += `Last checked ${moment($scope.collection.meta.data.fetchDate).format('M/D/YY')}. `
                }
                disclaimer += service.disclaimer
            })

            $scope.disclaimerString = disclaimer
            $scope.disclaimerHTML = $sce.trustAsHtml(disclaimer)
        }

        /**
         * Display an MLS' required legal disclaimer
         * @param html - if output should be HTML safe
         */
        $scope.getMLSDisclaimer = (html?: boolean): string => html ? $ctrl.disclaimerHTML : $ctrl.disclaimerString

        $scope.highlightModel = (model: Property, timeout?: number): void => {
            timeout = timeout || 0
            model._unmapped = model._unmapped || {}
            $scope.$applyAsync(() => {
                model._unmapped._highlight = true
            })
            if (timeout > 0) {
                $timeout(() => {
                    $scope.unhighlightModel(model)
                }, timeout)
            }
        }

        $scope.unhighlightModel = (model: Property): void => {
            if (model) {
                model._unmapped = model._unmapped || {}
                $scope.$applyAsync(() => {
                    model._unmapped._highlight = false
                })
            }
        }

        /**
         * Either popup or load a new page with the
         * @param model property object
         * @param ev - Click event
         */
        $scope.displayModelDetails = (model: Property, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            if ($scope.detailsLinkPopup === true) {
                // Opening a popup will load the propertyDetails and adjust the hashbang URL
                const templateOptions: {
                    'element-id': string,
                    service: string | number,
                    'listing-key': string,
                    'default-list-options': string,
                    'page-title': boolean,
                    'google-api-key'?: string,
                    'contact-name'?: string,
                    'contact-email'?: string,
                    'contact-phone'?: string,
                    'hide-variables'?: string, // a string array
                    'preferred-status'?: string,
                    template?: string,
                    'url-load'?: boolean,
                } = {
                    'element-id': 'property_detail_popup_' + model.ListingKey,
                    service: model._ServiceId,
                    'listing-key': model.ListingKey,
                    'default-list-options': JSON.stringify($ctrl.defaultQuery),
                    'page-title': true, // update the page title
                    'url-load': $scope.urlLoad
                }
                if ($scope.getGoogleMapsKey()) {
                    templateOptions['google-api-key'] = $scope.getGoogleMapsKey()
                }
                if ($scope.contactName) {
                    templateOptions['contact-name'] = $scope.contactName
                }
                if ($scope.contactEmail) {
                    templateOptions['contact-email'] = $scope.contactEmail
                }
                if ($scope.contactPhone) {
                    templateOptions['contact-phone'] = $scope.contactPhone
                }
                if ($scope.detailsHideVariables.length > 0) {
                    templateOptions['hide-variables'] = JSON.stringify($scope.detailsHideVariables)
                }
                if ($scope.preferredStatus) {
                    templateOptions['preferred-status'] = $scope.preferredStatus
                }
                if ($scope.detailsTemplate) {
                    templateOptions.template = $scope.detailsTemplate
                }

                let template =
                    `<md-dialog aria-label="${model.ListingKey}" class="stratus-idx-property-list-dialog">` +
                    `<div class="popup-close-button-container">` +
                    `<div aria-label="Close Popup" class="close-button" data-ng-click="closePopup()" aria-label="Close Details Popup"></div>` +
                    `</div>` +
                    '<stratus-idx-property-details '
                _.forEach(templateOptions, (optionValue, optionKey) => {
                    template += `data-${optionKey}='${optionValue}'`
                })
                template +=
                    '></stratus-idx-property-details>' +
                    '</md-dialog>'

                $mdDialog.show({
                    template, // equates to `template: template`
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true, // Only for -xs, -sm breakpoints.
                    scope: $scope,
                    preserveScope: true,
                    // tslint:disable-next-line:no-shadowed-variable
                    controller: ($scope: object | any, $mdDialog: angular.material.IDialogService) => {
                        $scope.closePopup = () => {
                            if ($mdDialog) {
                                $mdDialog.hide()
                                Idx.setUrlOptions('Listing', {})
                                if ($scope.urlLoad) {
                                    Idx.refreshUrlOptions($ctrl.defaultQuery)
                                }
                                // Revert page title back to what it was
                                Idx.setPageTitle()
                                // Let's destroy it to save memory
                                $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup', 'property'), 10)
                            }
                        }
                    }
                })
                    .then(() => {
                    }, () => {
                        Idx.setUrlOptions('Listing', {})
                        if ($scope.urlLoad) {
                            Idx.refreshUrlOptions($ctrl.defaultQuery)
                        }
                        // Revert page title back to what it was
                        Idx.setPageTitle()
                        // Let's destroy it to save memory
                        $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup', 'property'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(model), $scope.detailsLinkTarget)
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter): void => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
