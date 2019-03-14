// Permission Controller
// -----------------

/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.collection',
      'stratus.services.utility'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles member role filter
  Stratus.Controllers.Permission = [
    '$scope',
    '$log',
    'Collection',
    'utility',
    function ($scope, $log, Collection, utility) {
      // Store Instance
      Stratus.Instances[_.uniqueId('permission_')] = $scope

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      $scope.permissionSelected = $scope.permissionToBePersisted = []

      // List of allowed permissions
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

      /* $scope.$watchGroup(['model.contentSelected', 'model.permissionSelected'], function (data) {
        console.log(data)    
      }) */

      $scope.$watch('model.summary', function(summary) {
        //console.log(summary)
        angular.forEach(summary, function (permission, index) {
          //console.log($scope.$parent.permissions)
          index = $scope.permissions.findIndex(function (x) {
            return x.name === permission
          })

          if (index > -1) {
            $scope.permissionSelected.push(
              $scope.permissions[index].value)
          }
        })
        //console.log($scope.permissionSelected)
        //$ctrl.ngModel.permissions = $scope.permissionSelected
      })


      $scope.$watch('model', function (data) {
        //console.log(data)
        $scope.model = data
        // Set asset name
        if(data) {
          $scope.updateContent = {
            name: data.assetContent,
            assetType: data.asset,
            id: data.assetId
          }
        }
      })

      /**
       * @param content
       */
      $scope.selectedContentChange = function (content) {
        //$scope.contentSelected = content
        if (content.type === 'Content') {
          $scope.model.assetId = content.version.meta.id
          $scope.model.assetContent = content.version.title
        } else {
          $scope.model.assetId = content.id
          $scope.model.assetContent = content.name
        }
        $scope.model.asset = content.assetType
      }

      /**
       * @param item
       * @returns {*}
       */
      $scope.selectedContent = function (item) {
        let data = null
        if (item.version) {
          data = item.version.title + ' - ' + item.version.meta.id
        } else if (item.name) {
          data = item.name + ' - ' + item.id
        }
        return data
      }

      /**
       * If user selected the master Action, the other action selected will be
       * ignored. If user selected all of actions except the master action, the
       * action Selected will be converted to only contain master.
       */
      $scope.processSelectAction = function () {
        //console.log($scope)
        /* if(!$scope.model.permissions) {
          $scope.model.permissions = null
        } */
        var masterIndex = $scope.permissionSelected.indexOf(128)
        if ((masterIndex !== -1) 
        // || ($scope.permissionSelected.length === $scope.permissions.length - 1)
        ) {
            $scope.permissionSelected = _.pluck($scope.permissions, 'value')
            $scope.permissionToBePersisted = [$scope.permissions[$scope.permissions.length - 1].value]
        } else if($scope.permissionSelected.length === $scope.permissions.length - 1) {
          $scope.permissionToBePersisted = [$scope.permissions[$scope.permissions.length - 1].value]
        } else {
          $scope.permissionToBePersisted = $scope.permissionSelected
        }
        if ($scope.permissionToBePersisted.length > 0) {
          $scope.model.permissions = null
          angular.forEach($scope.permissionToBePersisted, function (permission) {
            $scope.model.permissions |= permission
          })
        }
      }

    }]
}))