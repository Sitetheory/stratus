/* global define */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Controllers.AddRoutingAlias = [
    '$scope',
    '$mdDialog',
    '$rootScope',
    function ($scope, $mdDialog, $rootScope) {
      // Store Instance
      Stratus.Instances[_.uniqueId('add_routing_alias_')] = $scope
      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      $scope.routeEmptyMessage = false
      $scope.routeUniqueMessage = false
      $scope.routeRegularEmpMessage = false
      $scope.selectedId = 0
      $scope.duplecateArr = []

      $scope.checkValid = function (model, $event, $index) {
        let lastUrl = $event.$parent.route.url
        let isMain = model.data.main
        if (lastUrl === '' && isMain === true) {
          $scope.routeEmptyMessage = true
        } else if ($event.$parent.route.url === '') {
          $event.$parent.route.url.$validate()
        }
      }

      $scope.removeEmptyRoute = function (model, $event, $index) {
        let alias = ''
        if (model.data.routing[$index] !== undefined && model.data.routing[$index].url && model.data.routing[$index].url !== undefined) {
          alias = model.data.routing[$index].url
        } else {
          alias = ''
        }
        let confirm = $mdDialog.confirm()
          .title('Delete Route')
          .textContent("Are you sure you want to remove the friendly URL alias  '/" + alias + "'  from this page? ")
          .targetEvent($event)
          .ok('Confirm')
          .cancel('Cancel')
        $mdDialog.show(confirm).then(function () {
          $scope.routeMessage = false
          model.data.routing.splice($index, 1)
        }, function () {
          return false
        })
      }

      /* Validation of urls */
      $scope.checkEmptyRoute = function (model, $event) {
        console.log(model)
        let lastUrl = $event.$parent.route.url
        let isMain = model.data.main
        if (lastUrl === '' && isMain === true) {
          $scope.routeEmptyMessage = true
        } else if ($event.$parent.route.url === '') {
          $scope.routeRegularEmpMessage = false
          $scope.selectedIds = $event.$parent.route.uid
        } else {
          $scope.routeEmptyMessage = false
          let uniqueValidation = $scope.checkUniqueRoute(model, $event)
          if (uniqueValidation === true) {
            $scope.routeUniqueMessage = true
            $scope.selectedId = $event.$parent.route.uid
          } else {
            $scope.routeUniqueMessage = false
            $scope.selectedId = $event.$parent.route.uid
            let patternValidation = $scope.checkPattern($event)
            if (patternValidation === true) {
              $scope.routeRegularEmpMessage = true
              $scope.selectedIds = $event.$parent.route.uid
            } else {
              $scope.routeRegularEmpMessage = false
              $scope.selectedIds = $event.$parent.route.uid
            }
          }
        }
      }
      $scope.checkUniqueRoute = function (model, $event) {
        let valueArr = []
        $scope.duplecateArr = []
        model.data.routing.map(function (item) {
          valueArr.push(item.url)
        })
        valueArr.some(function (item, idx) {
          if (valueArr.indexOf(item) !== idx) {
            $scope.duplecateArr[idx] = idx
            $scope.selectedIds = idx
          }
        })
        if ($scope.duplecateArr.length > 0) {
          return true
        } else {
          return false
        }
      }
      $scope.checkPattern = function ($event) {
        let patt = /^([a-z0-9]+)([a-z0-9\_\/\~\.\-])*([a-z0-9]+)$/i // eslint-disable-line
        if (patt.test($event.$parent.route.url)) {
          return false
        } else {
          return true
        }
      }
    }
  ]
}))
