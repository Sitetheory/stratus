// IdxMemberList Component
// @stratusjs/idx/member/list.component
// <stratus-idx-member-list>
// --------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Libraries
import moment from 'moment'

// Services
import {Collection} from 'stratus.services.collection' // Needed as Class
import '@stratusjs/idx/idx'

// Component Preload
// import 'stratus.components.propertyMemberDetails'
import '@stratusjs/idx/member/details.component'

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'
import {camelToSnake} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'member'
const componentName = 'list'
// FIXME need to get relative
const localDir = Stratus.BaseUrl + 'content/common/stratus_test/node_modules/@stratusjs/idx/src/'

Stratus.Components.IdxMemberList = {
    bindings: {
        elementId: '@',
        detailsLinkPopup: '@',
        detailsLinkUrl: '@',
        detailsLinkTarget: '@',
        orderOptions: '@',
        options: '@',
        template: '@',
        variableSync: '@'
    },
    controller(
        $scope: object | any,
        $attrs: any,
        $mdDialog: any,
        $window: any,
        $timeout: any,
        $q: any,
        $sce: any,
        Idx: any,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(packageName) + '_' + camelToSnake(moduleName) + '_' + camelToSnake(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(`${localDir}${moduleName}/${$attrs.template || componentName}.component${min}.css`)

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        $ctrl.$onInit = async () => {
            /**
             * Allow options to be loaded initially from the URL
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.detailsLinkPopup = $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ?
                JSON.parse($attrs.detailsLinkPopup) : true
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/member/details'
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'

            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

            $scope.options.order = $scope.options.order || null// will be set by Service
            $scope.options.page = $scope.options.page || null// will be set by Service
            $scope.options.perPage = $scope.options.perPage || 25
            $scope.options.images = $scope.options.images || {limit: 1}

            $scope.options.where = $scope.options.where || {}
            // Fixme, sometimes it's just MemberMlsAccessYN ....
            // $scope.options.where.MemberStatus = $scope.options.where.MemberStatus || {inq: ['Active', 'Yes', 'TRUE']}

            // $scope.options.where.MemberKey = $scope.options.where.MemberKey || '91045'
            // $scope.options.where.AgentLicense = $scope.options.where.AgentLicense || []*/

            $ctrl.defaultOptions = JSON.parse(JSON.stringify($scope.options.where))// Extend/clone doesn't work for arrays

            /* $scope.orderOptions = $scope.orderOptions || {
              'Price (high to low)': '-ListPrice',
              'Price (low to high)': 'ListPrice'
            } */

            // $scope.googleApiKey = $attrs.googleApiKey || null

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, $scope, 'Member')

            const urlOptions: { Search?: any } = {}
            /* if ($scope.urlLoad) {
              // first set the UrlOptions via defaults (cloning so it can't be altered)
              Idx.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultOptions)))
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

            await $scope.searchMembers(urlOptions.Search, true, false)
        }

        /**
         * Inject the current URL settings into any attached Search widget
         * Due to race conditions, sometimes the List made load before the Search, so the Search will also check if it's missing any values
         */
        $scope.refreshSearchWidgetOptions = (): void => {
            const searchScopes: any[] = Idx.getListInstanceLinks($scope.elementId, 'Member')
            searchScopes.forEach(searchScope => {
                // FIXME search widgets may only hold certain values.
                //  Later this needs to be adjust to only update the values in which a user can see/control
                // searchScope.setQuery(Idx.getUrlOptions('Search'))
                searchScope.listInitialized = true
            })
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL options, so it may not be ideal to use on page load
         * TODO Idx needs to export search options interface
         */
        $scope.searchMembers = async (options?: object | any, refresh?: boolean, updateUrl?: boolean): Promise<Collection> =>
            $q((resolve: any) => {
                options = options || {}
                updateUrl = updateUrl === false ? updateUrl : true

                // If refreshing, reset to page 1
                if (refresh) {
                    $scope.options.page = 1
                }
                // If search options sent, update the Widget. Otherwise use the widgets current where settings
                if (Object.keys(options).length > 0) {
                    delete ($scope.options.where)
                    $scope.options.where = options
                    if ($scope.options.where.Page) {
                        $scope.options.page = $scope.options.where.Page
                        delete ($scope.options.where.Page)
                    }
                    if ($scope.options.where.Order) {
                        $scope.options.order = $scope.options.where.Order
                        delete ($scope.options.where.Order)
                    }
                } else {
                    options = $scope.options.where || {}
                }
                // If a different page, set it in the URL
                if ($scope.options.page) {
                    options.Page = $scope.options.page
                }
                // Don't add Page/1 to the URL
                if (options.Page <= 1) {
                    delete (options.Page)
                }
                if ($scope.options.order && $scope.options.order.length > 0) {
                    options.Order = $scope.options.order
                }

                // Set the URL options
                // Idx.setUrlOptions('Search', options)

                // Display the URL options in the address bar
                /* if (updateUrl) {
                  Idx.refreshUrlOptions($ctrl.defaultOptions)
                } */

                // Keep the Search widgets up to date
                // $scope.refreshSearchWidgetOptions()

                // Grab the new member listings
                console.log('fetching members:', $scope.options)
                resolve(Idx.fetchMembers($scope, 'collection', $scope.options, refresh))
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            if (ev) {
                ev.preventDefault()
            }
            $scope.options.page = pageNumber
            await $scope.searchMembers()
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param ev - Click event
         */
        $scope.pageNext = async (ev?: any): Promise<void> => {
            if (!$scope.options.page) {
                $scope.options.page = 1
            }
            if ($scope.collection.completed && $scope.options.page < $scope.collection.meta.data.totalPages) {
                await $scope.pageChange($scope.options.page + 1, ev)
            }
        }

        /**
         * Move the displayed listings to the previous page, keeping the current query
         * @param ev - Click event
         */
        $scope.pagePrevious = async (ev?: any): Promise<void> => {
            if (!$scope.options.page) {
                $scope.options.page = 1
            }
            if ($scope.collection.completed && $scope.options.page > 1) {
                const prev = parseInt($scope.options.page, 10) - 1 || 1
                await $scope.pageChange(prev, ev)
            }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param order - string and strings
         * @param ev - Click event
         */
        $scope.orderChange = async (order: string | string[], ev?: any): Promise<void> => {
            if (ev) {
                ev.preventDefault()
            }
            $scope.options.order = order
            await $scope.searchMembers(null, true, true)
        }

        /**
         * Display an MLS' required legal disclaimer
         * @param html - if output should be HTML safe
         */
        $scope.getMLSDisclaimer = (html?: boolean): string => {
            let disclaimer = ''
            Idx.getMLSVariables($scope.options.service || null).forEach((service: { disclaimer: string }) => {
                if (disclaimer) {
                    disclaimer += '<br>'
                }
                disclaimer += service.disclaimer
            })
            if ($scope.collection.meta.data.fetchDate) {
                disclaimer = `Last checked ${moment($scope.collection.meta.data.fetchDate).format('M/D/YY')}. ${disclaimer}`
            }

            return html ? $sce.trustAsHtml(disclaimer) : disclaimer
        }

        /**
         * Either popup or load a new page with the
         * TODO Idx export Member Interface
         * @param member - details object
         * @param ev - Click event
         */
        $scope.displayMemberDetails = (member: { _ServiceId: number, MemberKey: string }, ev?: any): void => {
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
                    service: member._ServiceId,
                    'member-key': member.MemberKey,
                    'page-title': true// update the page title
                }
                if ($scope.googleApiKey) {
                    templateOptions['google-api-key'] = $scope.googleApiKey
                }

                let template =
                    '<md-dialog aria-label="' + member.MemberKey + '">' +
                    '<stratus-idx-member-details '
                _.each(templateOptions, (optionValue, optionKey) => {
                    template += `${optionKey}='${optionValue}'`
                })
                template +=
                    '></stratus-idx-member-details>' +
                    '</md-dialog>'

                $mdDialog.show({
                    template,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true // Only for -xs, -sm breakpoints.
                })
                    .then(() => {
                    }, () => {
                        // Idx.setUrlOptions('Listing', {})
                        // Idx.refreshUrlOptions($ctrl.defaultOptions)
                        // Revery page title back to what it was
                        Idx.setPageTitle()
                        // Let's destroy it to save memory
                        $timeout(Idx.unregisterDetailsInstance('property_member_detail_popup'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(member), $scope.detailsLinkTarget)
            }
        }

        $scope.injectMemberDetails = async (member: any): Promise<void> => {
            // console.log('will add these details to a form', member)
            await $scope.variableInject(member)
        }

        /**
         * Get the Input element of a specified ID
         */
        $scope.getInput = (elementId: string): any => angular.element(document.getElementById(elementId))

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         */
        $scope.variableInject =
            async (member: { MemberFullName: string, MemberFirstName: string, MemberLastName: string } | any): Promise<void> => {
                $scope.variableSyncing = $attrs.variableSync && isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}
                Object.keys($scope.variableSyncing).forEach(elementId => {
                    // promises.push(
                    // $q(async function (resolve, reject) {
                    const varElement = $scope.getInput(elementId)
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

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
        }
    },
    templateUrl: ($element: any, $attrs: any): string => `${localDir}${moduleName}/${$attrs.template || componentName}.component${min}.html`
}
