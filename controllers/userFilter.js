// Product Filter Controller
// -----------------

/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.collection',
      'stratus.services.commonMethods'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles member role filter
  Stratus.Controllers.UserFilter = [
    '$scope',
    '$log',
    'Collection',
    'commonMethods',
    function ($scope, $log, Collection, commonMethods) {
      // Store Instance
      Stratus.Instances[_.uniqueId('user_filter_')] = $scope

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      // *************************************FOR FILTER USER IN MEMBERS PAGES
      // status selected
      $scope.userRoles = []
      $scope.showOnly = []

      // show more
      $scope.more = false

      /**
       * get status of member
       */

      $scope.getStatus = function (member) {
        var status = ''
        if (member.flags) {
          if (!$scope.isVerified(member)) {
            status = 'unverified'
          }
        }
        return status
      }

      /**
       * return true if user verified
       */
      $scope.isVerified = function (member) {
        if (!member || !member.flags) {
          return false
        }
        return member.flags.findIndex(
          function (x) {
            return (x.flagType && x.flagType.title === 'verify')
          }
        ) !== -1
      }

      /**
       * Load the roles for filter
       */
      $scope.init = function () {
        $scope.initRoles()
      }

      // get roles for filter list
      $scope.initRoles = function () {
        Promise.resolve($scope.queryRole()).then(function (value) {
          $scope.userRoles = value
        })
      }

      // handle click action
      $scope.toggle = function (roleId) {
        var index = $scope.showOnly.indexOf(roleId);
        (index !== -1)
          ? $scope.showOnly.splice(index, 1)
          : $scope.showOnly.push(roleId)
        filter()
      }

      /**
       * Add filter and Request to api.
       */
      function filter (type, data) {
        $scope.collection.meta.set('api.options.identityRoles',
          $scope.showOnly)
        $scope.collection.fetch().then(function (response) {
          $log.log('users', response)
        })
        removeFilter()
      }

      /**
       * Remove the filter condition after filter request
       */
      function removeFilter () {
        delete $scope.collection.meta.get('api').options
      }

      $scope.moreFilter = function () {
        $scope.more = !$scope.more
      }
      // *********************************END FOR FILTER USER IN MEMBERS PAGES

      // *********************************FOR EDIT MEMBER*********************

      // Custom md-chip of location
      $scope.locationCustom = function (chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
          return chip
        }

        // Otherwise, create a new one
        return {address: chip}
      }

      // Retrieve data from server
      $scope.queryRole = function (query) {
        return retrieveData('/Api/Role?p=1&q=', query)
      }

      $scope.queryMailList = function (query) {
        return retrieveData('/Api/MailList?p=1&q=', query)
      }

      $scope.queryLocation = function (query) {
        return retrieveData('/Api/Location?p=1&q=', query)
      }

      // Call API to retrieve data
      function retrieveData (url, query) {
        query = (angular.isUndefined(query) || query == null) ? '' : query

        return commonMethods.sendRequest(null, 'GET', url + query).then(
          function (response) {
            if (response.hasOwnProperty('data') &&
              response.data.hasOwnProperty('payload')) {
              return response.data.payload
            }
            return []
          },
          function (error) {
            console.error(error)
          })
      }
      // ******************************END FOR EDIT MEMBER********************
    }]
}))
