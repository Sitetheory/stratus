// PropertyMemberSearch Component
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

      'stratus.services.propertyLoopback',

      'stratus.components.propertyMemberList'// requires to preload this...hmmm...stratus should handle this automatically...
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.moment)
  }
}(this, function (Stratus, _, angular) {
  const min = Stratus.Environment.get('production') ? '.min' : ''

  Stratus.Components.PropertyMemberSearch = {
    bindings: {
      elementId: '@',
      listId: '@',
      listLinkUrl: '@',
      listLinkTarget: '@',
      options: '@',
      template: '@',
      variableSync: '@'
    },
    controller: [
      '$scope',
      '$attrs',
      '$window',
      '$timeout',
      '$mdDialog',
      '$q',
      '$mdPanel',
      'propertyLoopback',
      function ($scope, $attrs, $window, $timeout, $mdDialog, $q, $mdPanel, propertyLoopback) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId('property_member_search_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
          Stratus.BaseUrl +
          'content/property/stratus/components/' +
          'propertyMemberSearch' +
          min + '.css'
        )
        // $scope.$mdConstant = $mdConstant

        $ctrl.$onInit = function () {
          $scope.listId = $attrs.listId || null
          $scope.listInitialized = false
          $scope.listLinkUrl = $attrs.listLinkUrl || '/property/member/list'
          $scope.listLinkTarget = $attrs.listLinkTarget || '_self'

          // If the List hasn't updated this widget after 2 seconds, make sure it's checked again. A workaround for the race condition for now, up for suggestions
          /* $timeout(function () {
            if (!$scope.listInitialized) {
              $scope.refreshSearchWidgetOptions()
            }
          }, 2000) */

          $scope.options = $attrs.options && _.isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

          // Set default queries
          $scope.options.query = $scope.options.query || {}

          if ($scope.options.tokenUrl) {
            /// ajax/request?class=property.token_auth&method=getToken
            propertyLoopback.setTokenURL($scope.options.tokenUrl)
          }

          // Register this Search with the Property service
          propertyLoopback.registerSearchInstance($scope.elementId, $scope, $scope.listId, 'Member')

          // $scope.variableSync()
        }

        /**
         * Update a scope nest variable from a given string path.
         * Works with updateNestedPathValue
         * @param {String} scopeVarPath
         * @param {*} value
         */
        $scope.updateScopeValuePath = async function (scopeVarPath, value) {
          // console.log('Update', scopeVarPath, 'to', value, typeof value)
          const scopePieces = scopeVarPath.split('.')
          return $scope.updateNestedPathValue($scope, scopePieces, value)
        }

        /**
         * Nests further into a string path to update a value
         * Works from updateScopeValuePath
         * @param currentNest
         * @param pathPieces
         * @param value
         */
        $scope.updateNestedPathValue = async function (currentNest, pathPieces, value) {
          const currentPiece = pathPieces.shift()
          if (
            currentPiece &&
            Object.prototype.hasOwnProperty.call(currentNest, currentPiece)
          ) {
            if (pathPieces[0]) {
              return $scope.updateNestedPathValue(currentNest[currentPiece], pathPieces, value)
            } else {
              if (_.isArray(currentNest[currentPiece]) && !_.isArray(value)) {
                value = value === '' ? [] : value.split(',')
              }
              // console.log(currentPiece, 'updated to ', value)
              currentNest[currentPiece] = value
              return value
            }
          } else {
            return null
          }
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
        $scope.variableSync = async function () {
          $scope.variableSyncing = $attrs.variableSync && _.isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}

          // console.log('variables syncing: ', $scope.variableSyncing)
          const promises = []
          Object.keys($scope.variableSyncing).forEach(function (elementId) {
            promises.push(
              $q(async function (resolve, reject) {
                const varElement = $scope.getInput(elementId)
                if (varElement) {
                  // Form Input exists
                  const scopeVarPath = $scope.variableSyncing[elementId]
                  // convert into a real var path and set the intial value from the exiting form value
                  await $scope.updateScopeValuePath(scopeVarPath, varElement.val())

                  // Creating watcher to update the input when the scope changes
                  $scope.$watch(
                    scopeVarPath,
                    function (value) {
                      // console.log('updating', scopeVarPath, 'value to', value, 'was', varElement.val())
                      varElement.val(value)
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
         * Add a popup on screen using an existing element
         * TODO could use more options
         * @param ev
         * @param {String} menuElement id or class of element to grab
         */
        /* $scope.showInlinePopup = function (ev, menuElement) {
          if (!$scope.filterMenu) {
            let position = $mdPanel.newPanelPosition()
              .relativeTo(ev.srcElement)
              .addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.BELOW)

            let animation = $mdPanel.newPanelAnimation()
            animation.openFrom(position)
            animation.closeTo(position)
            animation.withAnimation($mdPanel.animation.FADE)

            var config = {
              animation: animation,
              attachTo: angular.element(document.body),
              contentElement: menuElement,
              position: position,
              openFrom: ev,
              clickOutsideToClose: true,
              escapeToClose: true,
              focusOnOpen: false,
              zIndex: 2
            }

            $scope.filterMenu = $mdPanel.create(config)

            $scope.filterMenu.reposition = function reposition() {
              $timeout(function () {
                $scope.filterMenu.updatePosition(position)
              }, 100)
            }
          }

          $scope.filterMenu.open()
        } */

        /**
         * Call a List widget to perform a search
         */
        $scope.searchMembers = function searchMembers () {
          let listScope
          if ($scope.listId) {
            listScope = propertyLoopback.getListInstance($scope.listId, 'Member')
          }
          if (listScope) {
            $scope.options.query.Page = 1
            listScope.searchMembers($scope.options.query, true)
            // TODO open popup
          } else {
            // propertyLoopback.setUrlOptions('Search', $scope.options.query)
            // $window.open($scope.listLinkUrl + '#!/' + propertyLoopback.getUrlOptionsPath(), $scope.listLinkTarget)
            console.log('displaying popup')
            $scope.displayMemberSelector()
          }
        }

        /**
         * Either popup or load a new page with the
         * @param {ListingMember} member
         * @param {*=} ev - Click event
         */
        $scope.displayMemberSelector = function displayMemberSelector () {
          // Opening a popup will load the propertyDetails and adjust the hashbang URL
          const templateOptions = {
            // 'element_id': 'property_member_detail_popup',
            options: {}, // JSON.stringify($scope.options),
            template: 'mothership/propertyMemberSelector',
            'variable-sync': JSON.stringify({
              agent_fname: 'MemberFirstName',
              agent_lname: 'MemberLastName',
              agent_license: 'MemberStateLicense',
              office_name: 'OfficeName',
              office_id: 'OfficeKey'
            })
            // 'page-title': true,//update the page title
          }
          if ($scope.options.query) {
            const options = {
              service: [$scope.options.service || 0], // TODO update service
              where: $scope.options.query
            }
            templateOptions['options'] = JSON.stringify(options)
          }

          let template =
            '<md-dialog aria-label="Property Member Selector" class="transparent">' +
            '<md-button style="text-align: center" ng-click="ctrl.close()">Close and Accept</md-button>' +
            '<stratus-property-member-list '
          Object.keys(templateOptions).forEach(function (optionKey) {
            if (Object.prototype.hasOwnProperty.call(templateOptions, optionKey)) {
              template += optionKey + '=\'' + templateOptions[optionKey] + '\' '
            }
          })
          template +=
            '></stratus-property-member-list>' +
            '</md-dialog>'

          $mdDialog.show({
            template: template,
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true, // Only for -xs, -sm breakpoints.
            // bindToController: true,
            controllerAs: 'ctrl',
            controller: function ($scope, $mdDialog) {
              const dc = this

              dc.$onInit = function () {
                dc.close = close
              }

              function close () {
                if ($mdDialog) {
                  $mdDialog.hide()
                }
              }
            }
          })
            .then(function () {
            }, function () {
              // propertyLoopback.setUrlOptions('Listing', {})
              // propertyLoopback.refreshUrlOptions($ctrl.defaultOptions)
              // Revery page title back to what it was
              // propertyLoopback.setPageTitle()
              // Let's destroy it to save memory
              // $timeout(propertyLoopback.unregisterDetailsInstance('property_member_detail_popup'), 10)
            })
        }
      }],
    templateUrl:
      function ($element, $attrs) {
        // let templateMin = $attrs.templateMin && _.isJSON($attrs.templateMin) ? JSON.parse($attrs.templateMin) : true
        return Stratus.BaseUrl +
          'content/property/stratus/components/' +
          ($attrs.template || 'propertyMemberSearch') +
          min + '.html'
      }
  }
}))
