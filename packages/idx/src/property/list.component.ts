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

// Services
import '@stratusjs/idx/idx'


// Stratus Dependencies
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class
import {CompileFilterOptions, MLSService, WhereOptions} from '@stratusjs/idx/idx'
import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Stratus Directives
import 'stratus.directives.src'

// Component Preload
import '@stratusjs/idx/property/details.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'list'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.IdxPropertyList = {
    bindings: {
        elementId: '@',
        tokenUrl: '@',
        detailsLinkPopup: '@',
        detailsLinkUrl: '@',
        detailsLinkTarget: '@',
        detailsTemplate: '@',
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
        $attrs: angular.IAttributes,
        $q: angular.IQService,
        $mdDialog: angular.material.IDialogService,
        $scope: object | any, // angular.IScope breaks references so far
        $timeout: angular.ITimeoutService,
        $window: angular.IWindowService,
        $sce: angular.ISCEService,
        Idx: any,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
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
            $scope.collection = new Collection({}) as Collection // set a default collection for variable safety
            /**
             * Allow query to be loaded initially from the URL
             * type {boolean}
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.searchOnLoad = $attrs.searchOnLoad && isJSON($attrs.searchOnLoad) ? JSON.parse($attrs.searchOnLoad) : true
            /** type {boolean} */
            $scope.detailsLinkPopup = $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ?
                JSON.parse($attrs.detailsLinkPopup) : true
            /** type {string} */
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/details'
            /** type {string} */
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'
            /** type {string|null} */
            $scope.detailsTemplate = $attrs.detailsTemplate || null

            // TODO added backwards compatible options <--> query parameter until the next version
            $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) :
                $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            // $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) : {}

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
            $scope.query.where = $scope.query.where || {}
            $scope.query.where.ListingId = $scope.query.where.ListingId || ''
            $scope.query.where.City = $scope.query.where.City || ''
            $scope.query.where.CityRegion = $scope.query.where.CityRegion || ''
            $scope.query.where.MLSAreaMajor = $scope.query.where.MLSAreaMajor || '' // Not setup
            $scope.query.where.Neighborhood = $scope.query.where.Neighborhood || ''
            $scope.query.where.Location = $scope.query.where.Location || ''
            $scope.query.where.PostalCode = $scope.query.where.PostalCode || []
            $scope.query.where.AreaId = $scope.query.where.AreaId || []
            $scope.query.where.Status = $scope.query.where.Status || ['Active', 'Contract']
            $scope.query.where.ListingType = $scope.query.where.ListingType || ['House', 'Condo']
            $scope.query.where.AgentLicense = $scope.query.where.AgentLicense || []


            $ctrl.defaultQuery = JSON.parse(JSON.stringify($scope.query.where)) // Extend/clone doesn't work for arrays

            $scope.orderOptions = $scope.orderOptions || {
                'Price (high to low)': '-ListPrice',
                'Price (low to high)': 'ListPrice'
            }

            $scope.googleApiKey = $attrs.googleApiKey || null
            $scope.contactName = $attrs.contactName || null
            $scope.contactEmail = $attrs.contactEmail || null
            $scope.contactPhone = $attrs.contactPhone || null

            $scope.disclaimerString = 'Loading...'
            $scope.disclaimerHTML = $sce.trustAsHtml(`<span>${$scope.disclaimerString}</span>`)

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, $scope)

            let urlQuery: object | any = {} // TODO idx needs to exports urlQuery interface
            if ($scope.urlLoad) {
                // first set the UrlQuery via defaults (cloning so it can't be altered)
                Idx.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultQuery)))
                // Load Query from the provided URL settings
                urlQuery = Idx.getOptionsFromUrl()
                // If a specific listing is provided, be sure to pop it up as well
                if (
                    // urlQuery.hasOwnProperty('Listing') &&
                    urlQuery.Listing.service &&
                    urlQuery.Listing.ListingKey
                ) {
                    $scope.displayPropertyDetails(urlQuery.Listing)
                }
            }

            if ($scope.searchOnLoad) {
                await $scope.searchProperties(urlQuery.Search, true, false)
            }
        }

        $scope.$watch('collection.models', (models?: []) => {
            if ($scope.collection.completed) {
                $ctrl.processMLSDisclaimer() // TODO force reset with true?
            }
        })

        /**
         * Inject the current URL settings into any attached Search widget
         * Due to race conditions, sometimes the List made load before the Search, so the Search will also check if it's missing any values
         */
        $scope.refreshSearchWidgetOptions = async (): Promise<void> => {
            const searchScopes: any[] = Idx.getListInstanceLinks($scope.elementId)
            searchScopes.forEach((searchScope) => {
                if (Object.prototype.hasOwnProperty.call(searchScope, 'setQuery')) {
                    // FIXME search widgets may only hold certain values. Later this needs to be adjusted
                    //  to only update the values in which a user can see/control
                    // console.log('refreshSearchWidgetOptions Idx.getUrlOptions', _.clone(Idx.getUrlOptions('Search')))
                    searchScope.setQuery(Idx.getUrlOptions('Search'))
                    searchScope.listInitialized = true
                }
            })
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL query, so it may not be ideal to use on page load
         * TODO Idx needs to export search query interface
         * Returns Collection
         */
        $scope.searchProperties = async (
            query?: CompileFilterOptions | object | any,
            refresh?: boolean,
            updateUrl?: boolean
        ): Promise<Collection> =>
            $q((resolve: any) => {
                query = query || {}
                // updateUrl = updateUrl === false ? updateUrl : true
                updateUrl = updateUrl === false ? updateUrl : $scope.urlLoad === false ? $scope.urlLoad : true

                // If refreshing, reset to page 1
                if (refresh) {
                    $scope.query.page = 1
                }
                // If search query sent, update the Widget. Otherwise use the widgets current where settings
                if (Object.keys(query).length > 0) {
                    delete ($scope.query.where)
                    $scope.query.where = query
                    if ($scope.query.where.Page) {
                        $scope.query.page = $scope.query.where.Page
                        delete ($scope.query.where.Page)
                    }
                    if ($scope.query.where.Order) {
                        $scope.query.order = $scope.query.where.Order
                        delete ($scope.query.where.Order)
                    }
                } else {
                    query = $scope.query.where || {}
                }
                // If a different page, set it in the URL
                if ($scope.query.page) {
                    query.Page = $scope.query.page
                }
                // Don't add Page/1 to the URL
                if (query.Page <= 1) {
                    delete (query.Page)
                }
                if ($scope.query.order && $scope.query.order.length > 0) {
                    query.Order = $scope.query.order
                }

                // Set the URL query
                Idx.setUrlOptions('Search', query)
                // TODO need to avoid adding default variables to URL (Status/order/etc)

                if (updateUrl) {
                    // console.log('$ctrl.defaultQuery being set', $ctrl.defaultQuery)
                    // Display the URL query in the address bar
                    Idx.refreshUrlOptions($ctrl.defaultQuery)
                }

                // Keep the Search widgets up to date
                $scope.refreshSearchWidgetOptions()

                // Grab the new property listings
                resolve(Idx.fetchProperties($scope, 'collection', $scope.query, refresh))
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - The page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.page = pageNumber
            await $scope.searchProperties()
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
                const prev = parseInt($scope.query.page, 10) - 1 || 1
                await $scope.pageChange(prev, ev)
            }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param order -
         * @param ev - Click event
         */
        $scope.orderChange = async (order: string | string[], ev?: any): Promise<void> => {
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.order = order
            await $scope.searchProperties(null, true, true)
        }

        /**
         * Return a string path to a particular property listing
         * TODO Idx needs a Property interface
         */
        $scope.getDetailsURL = (property: object | any): string =>
            $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/'

        /**
         * Returns the processed street address
         * (StreetNumberNumeric / StreetNumber) + StreetDirPrefix + StreetName + StreetSuffix +  StreetSuffixModifier
         * +  StreetDirSuffix + 'Unit' + UnitNumber
         */
        $scope.getStreetAddress = (property: object | any): string => {
            let address = ''
            if (
                Object.prototype.hasOwnProperty.call(property, 'UnparsedAddress') &&
                property.UnparsedAddress !== ''
            ) {
                address = property.UnparsedAddress
                // console.log('using unparsed ')
            } else {
                const addressParts: string[] = []
                if (
                    Object.prototype.hasOwnProperty.call(property, 'StreetNumberNumeric') &&
                    _.isNumber(property.StreetNumberNumeric) &&
                    property.StreetNumberNumeric > 0
                ) {
                    addressParts.push(property.StreetNumberNumeric)
                } else if (
                    Object.prototype.hasOwnProperty.call(property, 'StreetNumber') &&
                    property.StreetNumber !== ''
                ) {
                    addressParts.push(property.StreetNumber)
                }
                [
                    'StreetDirPrefix',
                    'StreetName',
                    'StreetSuffix',
                    'StreetSuffixModifier',
                    'StreetDirSuffix',
                    'UnitNumber'
                ]
                    .forEach((addressPart) => {
                        if (Object.prototype.hasOwnProperty.call(property, addressPart)) {
                            if (addressPart === 'UnitNumber') {
                                addressParts.push('Unit')
                            }
                            addressParts.push(property[addressPart])
                        }
                    })
                address = addressParts.join(' ')
            }
            // console.log('address',  address)
            return address
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            // TODO this might need to be reset at some point
            if (!$ctrl.mlsVariables || reset) {
                $ctrl.mlsVariables = Idx.getMLSVariables()
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

        /**
         * Either popup or load a new page with the
         * @param property property object
         * @param ev - Click event
         */
        $scope.displayPropertyDetails = (property: object | any, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            if ($scope.detailsLinkPopup === true) {
                // Opening a popup will load the propertyDetails and adjust the hashbang URL
                const templateOptions: {
                    'element-id': string,
                    service: number,
                    'listing-key': string,
                    'default-list-options': string,
                    'page-title': boolean,
                    'google-api-key'?: string,
                    'contact-name'?: string,
                    'contact-email'?: string,
                    'contact-phone'?: string,
                    template?: string,
                    'url-load'?: boolean,
                } = {
                    'element-id': 'property_detail_popup_' + property.ListingKey,
                    service: property._ServiceId,
                    'listing-key': property.ListingKey,
                    'default-list-options': JSON.stringify($ctrl.defaultQuery),
                    'page-title': true, // update the page title
                    'url-load': $scope.urlLoad
                }
                if ($scope.googleApiKey) {
                    templateOptions['google-api-key'] = $scope.googleApiKey
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
                if ($scope.detailsTemplate) {
                    templateOptions.template = $scope.detailsTemplate
                }

                let template =
                    `<md-dialog aria-label="${property.ListingKey}" class="stratus-idx-property-list-dialog">` +
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
                                $timeout(Idx.unregisterDetailsInstance('property_detail_popup'), 10)
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
                        $timeout(Idx.unregisterDetailsInstance('property_detail_popup'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(property), $scope.detailsLinkTarget)
            }
        }

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
