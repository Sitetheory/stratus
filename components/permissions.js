// Permissions Component
// ----------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'jquery',
      'angular',

      // Modules
      'angular-material',
      'stratus.services.utility',
      'stratus.controllers.permission'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'permissions'

  // Permissions
  Stratus.Components.Permissions = {
    bindings: {
      permissionId: '<',
      ngModel: '=',
      identityUser: '=',
      multiple: '<',
    },
    controller: function ($scope, $attrs, utility) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Data References
      $scope.models = []

      // mock up list permissions
      $scope.permissionSelected = $scope.permissionToBePersisted = []
      $scope.complete = false

      // new permission
      $scope.newPermission = {
        timeEdit: new Date().getTime()
      }

      // specific the identityUser who is grated permissions
      $scope.allowSelectUser = !$ctrl.identityUser

      // mock up list roles
      $scope.userRoleSelected = null
      $scope.updateUserRole = null

      // mock up list contents
      $scope.contentSelected = null
      $scope.updateContent = null

      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data && data !== $scope.models) {
          if($ctrl.multiple) {
            $scope.models = data
          } else {
            $scope.models = []
            $scope.models.push(data)
          }
          $scope.updateUserRole = data.identityRole || data.identityUser || null
        }
        if (!angular.isArray($scope.models)) {
          $scope.models = []
        }
        if (!$scope.models.length) {
          $scope.models.push({})
        }
        if ($ctrl.identityUser && $ctrl.ngModel) {
          $scope.allowSelectUser = false
        }
      })

      $scope.$watch('models', function (data) {
        if($ctrl.multiple) {
          $ctrl.ngModel = data
        } else {
          $ctrl.ngModel = _.first(data)
        }
      },true)

      /**
       * Retrieve data from server
       */
      $scope.identityQuery = function (query) {
        return utility.sendRequest(null,
          'GET', '/Api/User?options[type]=collection&options[limitContext]=false&p=1&q=' + query).then(
          function (response) {
            if (response.hasOwnProperty('data') &&
              response.data.hasOwnProperty('payload')) {
              let value = response.data.payload
              let results = []

              // Prepare data
              if (value.User) {
                value.User.name += ' - ' + value.User.id
                results = results.concat(value.User)
              }
              if (value.Role) {
                value.Role.bestName += ' - ' + value.Role.id
                results = results.concat(value.Role)
              }
              if (!(value.User) && !(value.Role)) {
                if (value.name) {
                  value.name += ' - ' + value.id
                } else if (value.bestName) {
                  value.bestName += ' - ' + value.id
                }
                results = results.concat(value)
              }

              console.log('results', results)
              return results
            }
          },
          function (error) {
            console.error(error)
          })
      }

      /**
       * @param query
       * @returns {*}
       */
      $scope.contentQuery = function (query) {
        return utility.sendRequest(null,
          'GET', '/Api/Content?options[type]=collection&options[showContentInfo]=true&p=1&q=' + query).then(
          function (response) {
            if (response.hasOwnProperty('data') &&
              response.data.hasOwnProperty('payload')) {
              let value = response.data.payload
              let results = []

              if (value.Bundle) {
                angular.forEach(value.Bundle, function (bundle, index) {
                  value.Bundle[index].type = 'Bundle'
                  value.Bundle[index].assetType = 'SitetheoryContentBundle:Bundle'
                })

                results = results.concat(value.Bundle)
              }
              if (value.Content) {
                angular.forEach(value.Content, function (content, index) {
                  value.Content[index].type = 'Content'
                  if (content.hasOwnProperty('contentType') &&
                    content.contentType.hasOwnProperty('bundle') &&
                    content.contentType.bundle.hasOwnProperty('name')) {
                    value.Content[index].assetType = 'Sitetheory' +
                      content.contentType.bundle.name + 'Bundle:' +
                      content.contentType.entity
                  }
                })
                results = results.concat(value.Content)
              }
              if (value.ContentType) {
                angular.forEach(value.ContentType,
                  function (contentType, index) {
                    value.ContentType[index].type = 'ContentType'
                    value.ContentType[index].assetType = 'SitetheoryContentBundle:ContentType'
                  })
                results = results.concat(value.ContentType)
              }

              if (!value.Bundle && !value.Content && !value.ContentType) {
                results = results.concat(value)
              }
              console.log('results', results)
              return results
            }
          },
          function (error) {
            console.error(error)
          })
      }

      /**
       * @param item
       * @returns {string}
       */
      $scope.selectedIdentify = function (item) {
        return (item.name || item.bestName) + ' - ' + item.id
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
