/* global define */

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

      // Services
      'stratus.services.registry',
      'stratus.services.model',
      'stratus.services.collection',

      // Components
      'stratus.components.pagination',
      'stratus.components.search'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
})(this, function (Stratus, _, jQuery, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'tag'

  // This component intends to allow editing of various tags
  Stratus.Components.Tag = {
    transclude: {
      model: '?stratusBaseModel'
    },
    bindings: {
      // Basic Control for Designers
      elementId: '@',

      // ngModel Logic for a Symbiotic Controller Relationship
      ngModel: '=',
      property: '@',

      // Registry Elements
      target: '@',
      id: '@',
      manifest: '@',
      decouple: '@',
      direct: '@',
      api: '@',
      urlRoot: '@',

      // Collection Options
      limit: '@',
      options: '<'
    },
    controller: function (
      $scope,
      $attrs,
      Registry,
      Model,
      Collection
    ) {
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl +
        Stratus.BundlePath +
        'components/' +
        name +
        min +
        '.css'
      )

      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(
        Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
      )
      $scope.initialized = false

      // Bind Init
      $ctrl.$onInit = function () {
        // Variables
        $ctrl.selectedChips = []
        $ctrl.queryText = ''

        // fetch Tag collection and hydrate to $scope.collection
        $ctrl.registry = new Registry()
        $ctrl.registry.fetch({
          target: $attrs.target || 'Tag',
          id: null,
          manifest: false,
          decouple: true,
          direct: true
        }, $scope)
      }

      // Symbiotic Data Connectivity
      $scope.$watch('$ctrl.ngModel', function (data) {
        $ctrl.selectedChips = data || []
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        } else if (data instanceof Collection && data !== $scope.collection) {
          $scope.collection = data
        }
      })

      // add chip
      $ctrl.addChip = function (chip) {
        $scope.$parent.model.save()
      }

      $ctrl.removeChip = function (chip) {
        $scope.$parent.model.save()
      }

      $ctrl.isDisabled = function (chip) {
        let index = $ctrl.selectedChips.findIndex(function (x) {
          return x.name.toLowerCase() === chip.name.toLowerCase()
        })
        if (index !== -1) {
          return true
        } else {
          return false
        }
      }

      $ctrl.disableTag = function ($event) {
        $event.stopPropagation()
        $event.preventDefault()
      }

      /**
       * Init value for search list
       */
      $ctrl.queryData = function () {
        let results = $scope.collection.filter($ctrl.queryText)
        $scope.status = true
        let query = $ctrl.queryText.toLowerCase()
        return Promise.resolve(results).then(function (value) {
          let returnArr = value.filter(function (item) {
            let lower = item.name.toLowerCase()
            if ($ctrl.queryText === '' || lower.indexOf(query) !== -1) {
              return $scope.status
            }
          })
          return returnArr
        })
      }

      /**
       * Return the proper object when the append is called.
       * @return {name: 'value'}
       */
      $ctrl.transformChip = function (chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
          return chip
        }

        // Otherwise, create a new one
        return {
          name: chip
        }
      }

      /**
       * Add an object when it isn't match with the exists list;
       */
      $ctrl.createTag = function (query) {
        let model = new Model({
          'target': 'Tag'
        }, {
          name: query
        })
        model.save()
          .then(function (response) {
            $ctrl.selectedChips.push(response)
            $scope.$parent.model.save()
          })
          .catch(function (error, response) {
            console.error(error)
          })
        $ctrl.queryText = ''
        jQuery('input').blur()
      }
    },
    templateUrl: Stratus.BaseUrl +
      Stratus.BundlePath +
      'components/tag' +
      (Stratus.Environment.get('production') ? '.min' : '') +
      '.html'
  }
})
