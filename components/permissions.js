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
      'stratus.services.utility'
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
      identityUser: '='
    },
    controller: function ($scope, $timeout, $attrs, $http, utility) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // mock up list permissions
      $scope.permissionSelected = []
      $scope.complete = false

      // new permission
      $scope.newPermission = {
        timeEdit: new Date().getTime()
      }

      // specific the identityUser who is grated permissions
      $scope.allowSelectUser = !$ctrl.identityUser

      $scope.permissions = [
        { value: 1, name: 'View' },
        { value: 2, name: 'Create' },
        { value: 4, name: 'Edit' },
        { value: 8, name: 'Delete' },
        { value: 16, name: 'Publish' },
        { value: 32, name: 'Design' },
        { value: 64, name: 'Dev' },
        { value: 128, name: 'Master' }
      ]

      // mock up list roles
      $scope.userRoleSelected = null
      $scope.updateUserRole = null

      // mock up list contents
      $scope.contentSelected = null
      $scope.updateContent = null

      $scope.$watch('$ctrl.permissionId', function (permissionId) {
        if (typeof permissionId !== 'undefined') {
          $scope.getPermission(permissionId)
        }
      })

      $scope.$watch('$ctrl.ngModel', function () {
        if ($ctrl.identityUser && $ctrl.ngModel) {
          $scope.allowSelectUser = false
          $scope.newPermission.identityUser = {
            id: $ctrl.ngModel.id,
            bestName: $ctrl.ngModel.bestName
          }
          $scope.userRoleSelected = $scope.newPermission.identityUser
          if (!$ctrl.ngModel.permissions) {
            $ctrl.ngModel.permissions = []
          }
        }
      })

      $scope.$watchGroup(['contentSelected', 'permissionSelected'],
        function () {
          if ($ctrl.identityUser && $scope.userRoleSelected && $ctrl.ngModel &&
            $ctrl.ngModel.permissions) {
            if (_.last($ctrl.ngModel.permissions) &&
              !_.last($ctrl.ngModel.permissions).hasOwnProperty('id')) {
              $ctrl.ngModel.permissions.splice($ctrl.ngModel.permissions.length -
                1, 1)
            }
            if ($scope.contentSelected &&
              $scope.permissionSelected.length > 0) {
              $ctrl.ngModel.permissions.push($scope.newPermission)
            }
          }
        })

      /**
       * @param permissionId
       * @returns {*}
       */
      $scope.getPermission = function (permissionId) {
        return utility.sendRequest(null, 'GET', '/Api/Permission/' +
          permissionId).then(
          function (response) {
            // success
            if (response) {
              let data = response.data.payload

              // Set permission selected
              let permissions = data.summary
              angular.forEach(permissions, function (permission, index) {
                index = $scope.permissions.findIndex(function (x) {
                  return x.name === permission
                })

                if (index > -1) {
                  $scope.permissionSelected.push(
                    $scope.permissions[index].value)
                }
              })

              $ctrl.ngModel.permissions = $scope.permissionSelected

              // Set identity name
              $scope.userRoleSelected = data.identityRole
                ? data.identityRole
                : data.identityUser
              $scope.updateUserRole = data.identityRole
                ? data.identityRole
                : data.identityUser

              // Set asset name
              $scope.updateContent = {
                name: data.assetContent,
                assetType: data.asset,
                id: data.assetId
              }
            }
          },
          function (response) {
            // something went wrong
            console.log('response error', response)
          })
      }

      /**
       * Retrieve data from server
       */
      $scope.identityQuery = function (query) {
        return utility.sendRequest(null,
          'GET', '/Api/User?options[type]=collection&p=1&q=' + query).then(
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
          'GET', '/Api/Content?options[type]=collection&p=1&q=' + query).then(
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
       */
      $scope.selectedUserRoleChange = function (item) {
        $scope.userRoleSelected = item
        if (!$ctrl.identityUser) {
          if ($scope.userRoleSelected && $scope.userRoleSelected.name) {
            $ctrl.ngModel.identityRole = item
            $ctrl.ngModel.identityUser = null
          } else {
            $ctrl.ngModel.identityRole = null
            $ctrl.ngModel.identityUser = item
          }
        }
      }

      /**
       * @param content
       */
      $scope.selectedContentChange = function (content) {
        $scope.contentSelected = content
        if ($ctrl.identityUser) {
          persistContentData($scope.newPermission, content)
        } else {
          persistContentData($ctrl.ngModel, content)
        }
      }

      /**
       * persist the content data into model.
       *
       * @param data
       * @param contentSelected
       */
      function persistContentData (data, contentSelected) {
        if ($scope.contentSelected.type === 'Content') {
          data.assetId = $scope.contentSelected.version.meta.id
        } else {
          data.assetId = $scope.contentSelected.id
        }

        data.asset = $scope.contentSelected.assetType
      }

      /**
       * If user selected the master Action, the other action selected will be
       * ignored. If user selected all of actions except the master action, the
       * action Selected will be converted to only contain master.
       */
      $scope.processSelectAction = function () {
        let masterIndex = $scope.permissionSelected.indexOf(128)
        if ((masterIndex !== -1) ||
          ($scope.permissionSelected.length === $scope.permissions.length - 1)) {
          $scope.permissionSelected = [
            $scope.permissions[$scope.permissions.length - 1].value]
        }

        persistActionData($ctrl.identityUser ? $scope.newPermission : $ctrl.ngModel)
      }

      /**
       * persist the action data into model.
       *
       * @param data
       */
      function persistActionData (data) {
        if ($scope.permissionSelected.length > 0) {
          angular.forEach($scope.permissionSelected, function (permission) {
            data.permissions |= permission
          })
        }
      }

      /**
       * @param item
       * @returns {string}
       */
      $scope.selectedIdentify = function (item) {
        return (item.name || item.bestName) + ' - ' + item.id
      }

      /**
       * @param item
       * @returns {*}
       */
      $scope.selectedContent = function (item) {
        let data = null
        if (item.version) {
          data = item.version + ' - ' + item.version.meta.id
        } else if (item.name) {
          data = item.name + ' - ' + item.id
        }
        return data
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.html'
  }
}))
