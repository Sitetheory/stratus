// Permission Controller
// -----------------

/* global define */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define([
        'stratus',
        'underscore',
        'angular',
        'stratus.services.utility'
      ], factory)
    } else {
      factory(root.Stratus, root._, root.angular)
    }
  }(this, function (Stratus, _, angular) {
    // This Controller handles simple element binding
    // for a single scope to an API Object Reference.
    Stratus.Controllers.Permission = [
      '$scope',
      '$log',
      'utility',
      function ($scope, $log, utility) {
        // Store Instance
        Stratus.Instances[_.uniqueId('permission_')] = $scope
  
        // Wrappers
        $scope.Stratus = Stratus
        $scope._ = _
  
        $scope.$watchGroup(['model.contentSelected', 'model.permissionSelected'], function (data) {
          //console.log(data)    
        })
  
        $scope.$watch('model', function (data) {
          console.log(data)
          
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
          $scope.contentSelected = content
          /* if ($ctrl.identityUser) {
            persistContentData($scope.newPermission, content)
          } else {
            persistContentData($ctrl.ngModel, content)
          } */
        }
  
        /**
         * @param item
         * @returns {*}
         */
        $scope.selectedContent = function (item) {
          let data = null
          console.log(item)
          if (item.version) {
            data = item.version.title + ' - ' + item.version.meta.id
          } else if (item.name) {
            data = item.name + ' - ' + item.id
          }
          return data
        }

      }]
  }))
  