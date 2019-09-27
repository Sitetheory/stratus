// PropertyDetailsSubSection Component
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
      // 'underscore',
      'lodash',
      'angular',

      'stratus.services.model'

    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  const min = Stratus.Environment.get('production') ? '.min' : ''

  Stratus.Components.PropertyDetailsSubSection = {
    bindings: {
      ngModel: '=',
      items: '@',
      sectionName: '@',
      className: '@'

    },
    controller: [
      '$scope',
      '$attrs',
      'Model',
      function ($scope, $attrs, Model) {
        // Initialize
        const $ctrl = this

        // $scope.className = 'sub-detail-section'
        $scope.className = $attrs.className || 'sub-detail-section'
        $scope.sectionName = $attrs.sectionName || ''
        $scope.items = $attrs.items && _.isJSON($attrs.items) ? JSON.parse($attrs.items) : []

        $scope.visibleFields = false
        $scope.model = null

        if ($scope.sectionName.startsWith('{')) {
          $scope.stopWatchingSectionName = $scope.$watch('$ctrl.sectionName', function (data) {
            $scope.sectionName = data
            $scope.stopWatchingSectionName()
          })
        }
        if ($scope.items.length === 0) {
          $scope.stopWatchingItems = $scope.$watch('$ctrl.items', function (data) {
            if ($scope.items.length === 0) {
              $scope.items = data && _.isJSON(data) ? JSON.parse(data) : []
              $scope.convertItemsToObject()
            }
            $scope.stopWatchingItems()
          })
        }

        $scope.stopWatchingModel = $scope.$watch('$ctrl.ngModel', function (data) {
          // TODO might wanna check something else just to not import Model
          if (data instanceof Model && data !== $scope.model) {
            $scope.model = data
            Object.keys($scope.items).forEach(function (item) {
              if (
                Object.prototype.hasOwnProperty.call($scope.model.data, item) &&
                $scope.model.data[item] !== 0 && // ensure we skip 0 or empty sections can appear
                $scope.model.data[item] !== '' // ensure we skip blanks or empty sections can appear
              ) {
                $scope.visibleFields = true
              }
            })
            $scope.stopWatchingModel()
          }
        })

        $ctrl.$onInit = function () {
          $scope.convertItemsToObject()
        }

        $scope.convertItemsToObject = function () {
          Object.keys($scope.items).forEach(function (item) {
            if (typeof $scope.items[item] === 'string') {
              $scope.items[item] = {
                name: $scope.items[item]
              }
            }
          })
        }

        $scope.typeOf = function (item) {
          if (_.isArray(item)) {
            return 'array'
          } else {
            return typeof item
          }
        }

        $scope.isArray = function (item) {
          return _.isArray(item)
        }
      }],
    templateUrl:
      Stratus.BaseUrl +
      'content/property/stratus/components/' +
      'propertyDetailsSubSection' +
      min + '.html'
  }
}))
