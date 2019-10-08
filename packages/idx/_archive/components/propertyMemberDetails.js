// PropertyMemberDetails Component
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

/**
 * @typedef {Object} Model
 * @property {ListingProperty} data
 */

/**
 * @typedef {Model} $scope.model
 */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular',
      'moment',
      'angular-sanitize',

      'stratus.services.idx',

      'stratus.filters.math',
      'stratus.filters.moment'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.moment)
  }
}(this, function (Stratus, _, angular, moment) {
  const min = Stratus.Environment.get('production') ? '.min' : ''

  Stratus.Components.PropertyMemberDetails = {
    bindings: {
      elementId: '@',
      urlLoad: '@',
      pageTitle: '@',
      service: '@',
      memberKey: '@',
      memberStateLicense: '@',
      images: '@',
      openhouses: '@',
      googleApiKey: '@',
      options: '@',
      defaultListOptions: '@'
    },
    controller: [
      '$scope',
      '$attrs',
      '$sce',
      '$location',
      'Model',
      'Idx',
      function ($scope, $attrs, $sce, $location, Model, Idx) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId('property_member_details_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
          Stratus.BaseUrl +
          'content/property/stratus/components/' +
          'propertyMemberDetails' +
          min + '.css'
        )

        $ctrl.$onInit = function () {
          // console.log('loaded!')
          $scope.options = $attrs.options && _.isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
          $scope.options.urlLoad = $attrs.urlLoad && _.isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
          $scope.options.pageTitle = $attrs.pageTitle && _.isJSON($attrs.pageTitle) ? JSON.parse($attrs.pageTitle) : false
          $scope.options.service = $attrs.service ? $attrs.service : null
          $scope.options.MemberKey = $attrs.memberKey ? $attrs.memberKey : null
          $scope.options.MemberStateLicense = $attrs.memberStateLicense ? $attrs.memberStateLicense : null
          // Set default images and fields
          $scope.options.images = $attrs.images && _.isJSON($attrs.images) ? JSON.parse($attrs.images) : {
            fields: [
              'Order',
              'MediaURL',
              'LongDescription'
            ]
          }

          $scope.googleApiKey = $attrs.googleApiKey || null

          $scope.defaultListOptions = $attrs.defaultListOptions && _.isJSON($attrs.defaultListOptions) ? JSON.parse($attrs.defaultListOptions) : {}
          $scope.memberMerged = {}
          $scope.memberCombined = {}

          // Register this List with the Property service
          Idx.registerListInstance($scope.elementId, $scope, 'MemberDetails')
          // console.log(this.uid)

          console.log('options', $scope.options, $attrs)
          $scope.fetchMember()
        }

        $scope.$watch('collection.models', async function (models) {
          $scope.devLog('Loaded Member Data:', models)

          await $scope.individualMember()

          if (
            $scope.options.pageTitle &&
            (
              Object.prototype.hasOwnProperty.call($scope.memberMerged, 'MemberFullName') ||
              Object.prototype.hasOwnProperty.call($scope.memberMerged, 'MemberFirstName')
            )
          ) {
            // Update the page title
            Idx.setPageTitle($scope.memberMerged.MemberFullName || ($scope.memberMerged.MemberFirstName + ' ' + $scope.memberMerged.MemberLastName))
          }
        })

        $scope.getUid = function getUid () {
          return $ctrl.uid
        }

        $scope.fetchMember = function fetchMember () {
          const memberQuery = {
            listName: 'MemberDetailsList',
            service: [$scope.options.service],
            where: {}
          }
          if ($scope.options.MemberKey) {
            memberQuery.where.MemberKey = $scope.options.MemberKey
          } else if ($scope.options.MemberStateLicense) {
            memberQuery.where.MemberStateLicense = $scope.options.MemberStateLicense
          }
          if ($scope.options.images) {
            memberQuery.images = $scope.options.images
          }
          if (
            memberQuery.service &&
            (memberQuery.where.MemberKey || memberQuery.where.MemberStateLicense)
          ) {
            Idx.fetchMembers($scope, 'collection', memberQuery, true)
          } else {
            console.error('No Service Id or Member Key/License is fetch from')
          }
        }

        /**
         * With the current collection results, parse $scope.memberMerged and $scope.memberCombined by joining the
         * Member object together for easier to read results. Note it may not always be ideal to use this data.
         */
        $scope.individualMember = function individualMember () {
          return new Promise(function (resolve) {
            if ($scope.collection && $scope.collection.completed && $scope.collection.models.length > 0) {
              $scope.memberMerged = {}
              const tempCollection = [].concat($scope.collection.models).reverse()
              tempCollection.forEach(function (agent) {
                _.extend($scope.memberMerged, agent)
              })

              $scope.memberCombined = {}
              $scope.collection.models.map(function (agent) {
                Object.keys(agent).forEach(function (key) {
                  // If not an empty array
                  if (
                    !_.isArray(agent[key]) ||
                    (_.isArray(agent[key]) && agent[key].length > 0)
                  ) {
                    $scope.memberCombined[key] = $scope.memberCombined[key] || []
                    // If not already in the agentCombined
                    if (!$scope.memberCombined[key].includes(agent[key])) {
                      $scope.memberCombined[key].push(agent[key])
                    }
                  }
                })
              })
            }
            resolve()
          })
        }

        /**
         * Display an MLS' Name
         * @returns {String|}
         */
        $scope.getMLSName = function getMLSName () {
          return Idx.getMLSVariables($scope.model.data._ServiceId).name
        }

        /**
         * Display an MLS' required legal disclaimer
         * @param {Boolean} html - if output should be HTML safe
         * @returns {String|}
         */
        $scope.getMLSDisclaimer = function getMLSDisclaimer (html) {
          let disclaimer = Idx.getMLSVariables($scope.collection.models[0]._ServiceId).disclaimer
          if ($scope.collection.models[0].ModificationTimestamp) {
            disclaimer = `Member last updated ${moment($scope.collection.models[0].ModificationTimestamp).format('M/D/YY HH:mm a')}. ${disclaimer}`
          }
          if ($scope.collection.models[0].fetchDate) {
            disclaimer = `Last checked ${moment($scope.model.meta.data.fetchDate).format('M/D/YY')}. ${disclaimer}`
          }

          return html ? $sce.trustAsHtml(disclaimer) : disclaimer
        }

        /**
         * Function that runs when widget is destroyed
         */
        $scope.remove = function remove () {
        }

        /**
         * Output console if not in production
         * @param {*} item1
         * @param {*} item2
         */
        $scope.devLog = function (item1, item2) {
          if (!Stratus.Environment.get('production')) {
            console.log(item1, item2)
          }
        }
      }],
    templateUrl:
      Stratus.BaseUrl +
      'content/property/stratus/components/' +
      'propertyMemberDetails' +
      min + '.html'
  }
}))
