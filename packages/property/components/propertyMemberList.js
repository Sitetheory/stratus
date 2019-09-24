// PropertyMemberList Component
// ------------------
//
// Copyright (c) 2019 by Sitetheory, All Rights Reserved
//
// All information contained herein is, and remains the
// property of Sitetheory and its suppliers, if any.
// The intellectual and technical concepts contained herein
// are proprietary to Sitetheory and its suppliers and may be
// covered by U.S. and Foreign Patents, patents in process,
// and are protected by trade secret or copyright law.
// Dissemination of this information or reproduction of this
// material is strictly forbidden unless prior written
// permission is obtained from Sitetheory.
//
// For full details and documentation:
// http://docs.sitetheory.io

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      // 'underscore',
      'lodash',
      'angular',
      'moment',
      'angular-sanitize',
      'angular-material',

      'stratus.services.propertyLoopback',

      'stratus.components.propertyMemberDetails'// requires to preload this...hmmm...stratus should handle this automatically...
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.moment)
  }
}(this, function (Stratus, _, angular, moment) {
  const min = Stratus.Environment.get('production') ? '.min' : ''

  Stratus.Components.PropertyMemberList = {
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
    controller: [
      '$scope',
      '$attrs',
      '$mdDialog',
      '$window',
      '$timeout',
      '$q',
      '$sce',
      'propertyLoopback',
      function ($scope, $attrs, $mdDialog, $window, $timeout, $q, $sce, propertyLoopback) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId('property_member_list_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
          Stratus.BaseUrl +
          'content/property/stratus/components/' +
          'propertyMemberList' +
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
          $scope.detailsLinkPopup = $attrs.detailsLinkPopup && _.isJSON($attrs.detailsLinkPopup) ? JSON.parse($attrs.detailsLinkPopup) : true
          $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/member/details'
          $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'

          $scope.options = $attrs.options && _.isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

          $scope.options.order = $scope.options.order || null// will be set by Service
          $scope.options.page = $scope.options.page || null// will be set by Service
          $scope.options.perPage = $scope.options.perPage || 25
          $scope.options.images = $scope.options.images || { limit: 1 }

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
          propertyLoopback.registerListInstance($scope.elementId, $scope, 'Member')

          const urlOptions = {}
          /* if ($scope.urlLoad) {
            // first set the UrlOptions via defaults (cloning so it can't be altered)
            propertyLoopback.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultOptions)))
            // Load Options from the provided URL settings
            urlOptions = propertyLoopback.getOptionsFromUrl()
            // If a specific listing is provided, be sure to pop it up as well
            if (
              urlOptions.Listing.service
              && urlOptions.Listing.ListingKey
            ) {
              $scope.displayPropertyDetails(urlOptions.Listing)
            }
          } */

          $scope.searchMembers(urlOptions.Search, true, false)
        }

        /**
         * Inject the current URL settings into any attached Search widget
         * Due to race conditions, sometimes the List made load before the Search, so the Search will also check if it's missing any values
         */
        $scope.refreshSearchWidgetOptions = function refreshSearchWidgetOptions () {
          const searchScopes = propertyLoopback.getListInstanceLinks($scope.elementId, 'Member')
          searchScopes.forEach(function (searchScope) {
            // FIXME search widgets may only hold certain values. Later this needs to be adjust to only update the values in which a user can see/control
            // searchScope.setQuery(propertyLoopback.getUrlOptions('Search'))
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
        $scope.searchMembers = async function searchMembers (options, refresh, updateUrl) {
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
            // propertyLoopback.setUrlOptions('Search', options)

            // Display the URL options in the address bar
            /* if (updateUrl) {
              propertyLoopback.refreshUrlOptions($ctrl.defaultOptions)
            } */

            // Keep the Search widgets up to date
            // $scope.refreshSearchWidgetOptions()

            // Grab the new property listings
            console.log('fetching members:', $scope.options)
            resolve(propertyLoopback.fetchMembers($scope, 'collection', $scope.options, refresh))
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
          $scope.searchMembers()
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
          $scope.searchMembers(null, true, true)
        }

        /**
         * Return a string path to a particular property listing
         * @param {ListingProperty} property
         * @returns {string}
         */
        /* $scope.getDetailsURL = function getDetailsURLPath(property) {
          return $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/'
        } */

        /**
         * Display an MLS' required legal disclaimer
         * @param {Boolean} html - if output should be HTML safe
         * @returns {String || *}
         */
        $scope.getMLSDisclaimer = function getMLSDisclaimer (html) {
          let disclaimer = ''
          propertyLoopback.getMLSVariables($scope.options.service || null).forEach(function (service) {
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
         * @param {ListingMember} member
         * @param {*=} ev - Click event
         */
        $scope.displayMemberDetails = function displayMemberDetails (member, ev) {
          if (ev) {
            ev.preventDefault()
            // ev.stopPropagation()
          }
          if ($scope.detailsLinkPopup === true) {
            // Opening a popup will load the propertyDetails and adjust the hashbang URL
            const templateOptions = {
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
              '<stratus-property-member-details '
            Object.keys(templateOptions).forEach(function (optionKey) {
              if (Object.prototype.hasOwnProperty.call(templateOptions, optionKey)) {
                template += optionKey + '=\'' + templateOptions[optionKey] + '\' '
              }
            })
            template +=
              '></stratus-property-member-details>' +
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
                // propertyLoopback.setUrlOptions('Listing', {})
                // propertyLoopback.refreshUrlOptions($ctrl.defaultOptions)
                // Revery page title back to what it was
                propertyLoopback.setPageTitle()
                // Let's destroy it to save memory
                $timeout(propertyLoopback.unregisterDetailsInstance('property_member_detail_popup'), 10)
              })
          } else {
            $window.open($scope.getDetailsURL(member), $scope.detailsLinkTarget)
          }
        }

        $scope.injectMemberDetails = function injectMemberDetails (member, ev) {
          console.log('will add these details to a form', member)
          $scope.variableInject(member)
        }

        /**
         * Get the Input element of a specified ID
         * @param elementId
         * @returns {*}
         */
        $scope.getInput = function (elementId) {
          return angular.element(document.getElementById(elementId))
        }

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         * @returns {Promise<void>}
         */
        $scope.variableInject = async function (member) {
          $scope.variableSyncing = $attrs.variableSync && _.isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}

          // console.log('variables syncing: ', $scope.variableSyncing)
          // let promises = []
          Object.keys($scope.variableSyncing).forEach(function (elementId) {
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
                varElement.val(member['MemberFirstName'] + ' ' + member['MemberLastName'])
              } else if (
                $scope.variableSyncing[elementId] === 'MemberFirstName' &&
                !Object.prototype.hasOwnProperty.call(member, 'MemberFirstName') &&
                Object.prototype.hasOwnProperty.call(member, 'MemberFullName')
              ) {
                const nameArray = member['MemberFullName'].split(' ')
                const firstName = nameArray.shift()
                // let lastName = nameArray.join(' ')
                varElement.val(firstName)
              } else if (
                $scope.variableSyncing[elementId] === 'MemberLastName' &&
                !Object.prototype.hasOwnProperty.call(member, 'MemberLastName') &&
                Object.prototype.hasOwnProperty.call(member, 'MemberFullName')
              ) {
                const nameArray = member['MemberFullName'].split(' ')
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
            // resolve()
            // })
            // )
          })
          // await $q.all(promises)
        }

        /**
         * Destroy this widget
         */
        $scope.remove = function remove () {

        }
      }],
    templateUrl:
      function ($element, $attrs) {
        const templateMin = $attrs.templateMin && _.isJSON($attrs.templateMin) ? JSON.parse($attrs.templateMin) : true
        return Stratus.BaseUrl +
          'content/property/stratus/components/' +
          ($attrs.template || 'propertyMemberList') +
          (templateMin && min) + '.html'
      }
  }
}))
