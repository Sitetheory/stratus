// PropertyList Component
// ------------------
/*
Copyright (c) 2019 by Sitetheory, All Rights Reserved

All information contained herein is, and remains the
property of Sitetheory and its suppliers, if any.
The intellectual and technical concepts contained herein
are proprietary to Sitetheory and its suppliers and may be
covered by U.S. and Foreign Patents, patents in process,
and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this
material is strictly forbidden unless prior written
permission is obtained from Sitetheory.

For full details and documentation:
http://docs.sitetheory.io
 */

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular',
      'moment',
      'angular-sanitize',
      'angular-material',

      'stratus.services.idx',

      'stratus.components.propertyDetails'// requires to preload this...hmmm...stratus should handle this automatically...
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.moment)
  }
}(this, function (Stratus, _, angular, moment) {
  const min = Stratus.Environment.get('production') ? '.min' : ''

  Stratus.Components.PropertyList = {
    bindings: {
      elementId: '@',
      detailsLinkPopup: '@',
      detailsLinkUrl: '@',
      detailsLinkTarget: '@',
      detailsTemplate: '@',
      orderOptions: '@',
      googleApiKey: '@',
      options: '@',
      template: '@'
    },
    controller: [
      '$scope',
      '$attrs',
      '$mdDialog',
      '$window',
      '$timeout',
      '$q',
      '$sce',
      'Idx',
      function ($scope, $attrs, $mdDialog, $window, $timeout, $q, $sce, Idx) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId('property_list_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
          Stratus.BaseUrl +
          'content/property/stratus/components/' +
          // 'propertyList' +
          ($attrs.template || 'propertyList') +
          min + '.css'
        )

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        $ctrl.$onInit = function () {
          /**
           * Allow options to be loaded initially from the URL
           * @type {boolean}
           */
          $scope.urlLoad = $attrs.urlLoad && _.isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
          /** @type {boolean} */
          $scope.detailsLinkPopup = $attrs.detailsLinkPopup && _.isJSON($attrs.detailsLinkPopup) ? JSON.parse($attrs.detailsLinkPopup) : true
          /** @type {string} */
          $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/details'
          /** @type {string} */
          $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'
          /** @type {string|null} */
          $scope.detailsTemplate = $attrs.detailsTemplate || null

          $scope.options = $attrs.options && _.isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

          $scope.options.order = $scope.options.order || null // will be set by Service
          $scope.options.page = $scope.options.page || null // will be set by Service
          $scope.options.perPage = $scope.options.perPage || 25
          $scope.options.images = $scope.options.images || { limit: 1 }

          $scope.options.where = $scope.options.where || {}
          $scope.options.where.City = $scope.options.where.City || ''
          $scope.options.where.Status = $scope.options.where.Status || ['Active', 'Contract']
          $scope.options.where.ListingType = $scope.options.where.ListingType || ['House', 'Condo']
          $scope.options.where.AgentLicense = $scope.options.where.AgentLicense || []

          $ctrl.defaultOptions = JSON.parse(JSON.stringify($scope.options.where)) // Extend/clone doesn't work for arrays

          $scope.orderOptions = $scope.orderOptions || {
            'Price (high to low)': '-ListPrice',
            'Price (low to high)': 'ListPrice'
          }

          $scope.googleApiKey = $attrs.googleApiKey || null

          // Register this List with the Property service
          Idx.registerListInstance($scope.elementId, $scope)

          let urlOptions = {}
          if ($scope.urlLoad) {
            // first set the UrlOptions via defaults (cloning so it can't be altered)
            Idx.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultOptions)))
            // Load Options from the provided URL settings
            urlOptions = Idx.getOptionsFromUrl()
            // If a specific listing is provided, be sure to pop it up as well
            if (
              urlOptions.Listing.service &&
              urlOptions.Listing.ListingKey
            ) {
              $scope.displayPropertyDetails(urlOptions.Listing)
            }
          }

          $scope.searchProperties(urlOptions.Search, true, false)
        }

        /**
         * Inject the current URL settings into any attached Search widget
         * Due to race conditions, sometimes the List made load before the Search, so the Search will also check if it's missing any values
         */
        $scope.refreshSearchWidgetOptions = function refreshSearchWidgetOptions () {
          const searchScopes = Idx.getListInstanceLinks($scope.elementId)
          searchScopes.forEach(function (searchScope) {
            // FIXME search widgets may only hold certain values. Later this needs to be adjust to only update the values in which a user can see/control
            searchScope.setQuery(Idx.getUrlOptions('Search'))
            searchScope.listInitialized = true
          })
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL options, so it may not be ideal to use on page load
         * @param {Object} options
         * @param {Boolean} refresh
         * @param {Boolean} updateUrl
         * @returns {Promise<Collection>}
         */
        $scope.searchProperties = async function searchProperties (options, refresh, updateUrl) {
          return $q(function (resolve, reject) {
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
            Idx.setUrlOptions('Search', options)
            // TODO need to avoid adding default variables to URL (Status/order/etc)

            // Display the URL options in the address bar
            if (updateUrl) {
              Idx.refreshUrlOptions($ctrl.defaultOptions)
            }

            // Keep the Search widgets up to date
            $scope.refreshSearchWidgetOptions()

            // Grab the new property listings
            resolve(Idx.fetchProperties($scope, 'collection', $scope.options, refresh))
          })
        }

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param {Number} pageNumber
         * @param {*=} ev - Click event
         */
        $scope.pageChange = function changePage (pageNumber, ev) {
          if (ev) {
            ev.preventDefault()
          }
          $scope.options.page = pageNumber
          $scope.searchProperties()
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param {*=} ev - Click event
         */
        $scope.pageNext = function pageNext (ev) {
          if (!$scope.options.page) {
            $scope.options.page = 1
          }
          if ($scope.collection.completed && $scope.options.page < $scope.collection.meta.data.totalPages) {
            $scope.pageChange($scope.options.page + 1, ev)
          }
        }

        /**
         * Move the displayed listings to the previous page, keeping the current query
         * @param {*=} ev - Click event
         */
        $scope.pagePrevious = function pagePrevious (ev) {
          if (!$scope.options.page) {
            $scope.options.page = 1
          }
          if ($scope.collection.completed && $scope.options.page > 1) {
            const prev = parseInt($scope.options.page) - 1 || 1
            $scope.pageChange(prev, ev)
          }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param {String || [String]} order
         * @param {*=} ev - Click event
         */
        $scope.orderChange = function changePage (order, ev) {
          if (ev) {
            ev.preventDefault()
          }
          $scope.options.order = order
          $scope.searchProperties(null, true, true)
        }

        /**
         * Return a string path to a particular property listing
         * @param {ListingProperty} property
         * @returns {string}
         */
        $scope.getDetailsURL = function getDetailsURLPath (property) {
          return $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/'
        }

        /**
         * Returns the processed street address
         * @param {ListingProperty} property
         * @returns {string}
         */
        $scope.getStreetAddress = function getStreetAddress (property) {
          let address = ''
          if (
            Object.prototype.hasOwnProperty.call(property, 'UnparsedAddress') &&
            property.UnparsedAddress !== ''
          ) {
            address = property.UnparsedAddress
            // console.log('using unparsed ')
          } else {
            const addressParts = [];
            [
              'StreetNumberNumeric',
              'StreetName',
              'StreetSuffix',
              'UnitNumber' // Added Unit string?
            ]
              .forEach(function (addressPart) {
                if (Object.prototype.hasOwnProperty.call(property, addressPart)) {
                  if (addressPart === 'UnitNumber') {
                    addressParts.push('Unit')
                  }
                  addressParts.push(property[addressPart])
                }
              })
            address = addressParts.join(' ')
          }
          // console.log('adress',  address)
          return address
        }

        $scope.getMLSVariables = function getMLSVariables () {
          // TODO this might need to be reset at some point
          if (!$ctrl.mlsVariables) {
            $ctrl.mlsVariables = Idx.getMLSVariables()
          }
          return $ctrl.mlsVariables
        }

        /**
         * Display an MLS' Name
         * @returns {String}
         */
        $scope.getMLSName = function getMLSName (serviceId) {
          const services = $scope.getMLSVariables()
          let name = 'MLS'
          if (services[serviceId]) {
            name = services[serviceId].name
          }
          return name
        }

        /**
         * Process an MLS' required legal disclaimer to later display
         * @param {Boolean} html - if output should be HTML safe
         * @returns {String}
         */
        $scope.processMLSDisclaimer = function processMLSDisclaimer (html) {
          const services = $scope.getMLSVariables()
          let disclaimer = ''
          services.forEach(function (service) {
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
         * Display an MLS' required legal disclaimer
         * @param {Boolean} html - if output should be HTML safe
         * @returns {String}
         */
        $scope.getMLSDisclaimer = function getMLSDisclaimer (html) {
          if (!$ctrl.disclaimerHTML) {
            $ctrl.disclaimerHTML = $scope.processMLSDisclaimer(true)
          }
          if (!$ctrl.disclaimerString) {
            $ctrl.disclaimerString = $scope.processMLSDisclaimer(false)
          }
          return html ? $ctrl.disclaimerHTML : $ctrl.disclaimerString
        }

        /**
         * Either popup or load a new page with the
         * @param {ListingProperty} property
         * @param {*=} ev - Click event
         */
        $scope.displayPropertyDetails = function displayPropertyDetails (property, ev) {
          if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
          }
          if ($scope.detailsLinkPopup === true) {
            // Opening a popup will load the propertyDetails and adjust the hashbang URL
            const templateOptions = {
              element_id: 'property_detail_popup_' + property.ListingKey,
              service: property._ServiceId,
              'listing-key': property.ListingKey,
              'default-list-options': JSON.stringify($ctrl.defaultOptions),
              'page-title': true// update the page title
            }
            if ($scope.googleApiKey) {
              templateOptions['google-api-key'] = $scope.googleApiKey
            }
            if ($scope.detailsTemplate) {
              templateOptions['template'] = $scope.detailsTemplate
            }

            let template =
              '<md-dialog aria-label="' + property.ListingKey + '">' +
              '<stratus-property-details '
            Object.keys(templateOptions).forEach(function (optionKey) {
              if (Object.prototype.hasOwnProperty.call(templateOptions, optionKey)) {
                template += optionKey + '=\'' + templateOptions[optionKey] + '\' '
              }
            })
            template +=
              '></stratus-property-details>' +
              '</md-dialog>'

            $mdDialog.show({
              template: template,
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose: true,
              fullscreen: true // Only for -xs, -sm breakpoints.
            })
              .then(function () {
              }, function () {
                Idx.setUrlOptions('Listing', {})
                Idx.refreshUrlOptions($ctrl.defaultOptions)
                // Revery page title back to what it was
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
        $scope.remove = function remove () {

        }
      }],
    templateUrl:
      function ($element, $attrs) {
        // let templateMin = $attrs.templateMin && _.isJSON($attrs.templateMin) ? JSON.parse($attrs.templateMin) : true
        return Stratus.BaseUrl +
          'content/property/stratus/components/' +
          ($attrs.template || 'propertyList') +
          min + '.html'
      }
  }
}))
