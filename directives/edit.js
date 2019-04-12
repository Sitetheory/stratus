// Edit Directive
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'jquery',

      // Modules
      'angular-material',

      // Services
      'stratus.services.model'

      // Components
      // 'stratus.components.mediaSelector',

      // Directives
      // 'stratus.directives.froala',
      // 'stratus.directives.editInlineFroala',
      // 'stratus.directives.src'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.jQuery)
  }
}(this, function (Stratus, _, angular, jQuery) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'edit'

  // Temporarily disable Stratus-Edit Directives
  if (name === 'edit') {
    return
  }

  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.Edit = function ($timeout, Model) {
    return {
      restrict: 'AE', // Element is required to transclude inner elements
      transclude: {
        view: '?stratusEditView',
        input: '?stratusEditInput'
      },
      scope: {
        elementId: '@',
        ngModel: '=',
        property: '@',
        type: '@', // Editor / DateTime
        prefix: '@', // A value to prepend to the front of the value
        suffix: '@', // A value to append to the back of the value
        stratusEditable: '@', // A value to define if the element can currently
        // be editable
        alwaysEdit: '@', // A bool/string to define if the element will always
        // be in editable mode
        autoSave: '@', // A bool/string to define if the model will auto save
        // on focus out or Enter presses. Defaults to true
        froalaOptions: '=' // Expects JSON. Options pushed to froala need to be
        // initialized, so it will be a one time push
      },
      link: function ($scope, $element, $attrs) {
        // Initialize
        const $ctrl = this
        $scope.uid = $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
          Stratus.BaseUrl + Stratus.BundlePath + 'components/' + name + min + '.css'
        )
        $scope.initialized = false

        // Scope Globals
        $scope.Stratus = Stratus

        // Hoist Attributes
        $scope.elementId = $attrs.elementId || $ctrl.uid

        // Elements
        $scope.edit_input_container = $element[0].getElementsByClassName('stratus_edit_input_container')[0]

        // Settings
        $scope.edit = false

        // Data Connectivity
        $scope.model = null
        $scope.value = null

        if (!$scope.ngModel || !$scope.property) {
          console.warn($scope.uid + ' has no model or property!')
          return
        }

        $scope.ctrl = {
          initialized: false
        }

        // METHODS
        // -------

        $scope.liveEditStatus = function () {
          if ($scope.ctrl.initialized) {
            if ($scope.stratusEditable !== undefined) {
              return $scope.stratusEditable
            } else if (Stratus.Environment.data.liveEdit !== undefined) {
              return Stratus.Environment.data.liveEdit
            }
            console.warn($scope.uid +
              ' has no variable to track edit toggle! ($scope.stratusEditable)')
          }
          return false
        }

        $scope.setEdit = function (bool) {
          // Only allow Edit mode if liveedit is enabled.
          if (bool && ($scope.liveEditStatus() || $scope.alwaysEdit)) {
            $scope.edit = bool
            $scope.focusOnEditable()
          } else {
            $scope.edit = false
          }
        }

        $scope.focusOnEditable = function () {
          $timeout(function () {
            if ($scope.edit_input_container.getElementsByTagName('input').length > 0) {
              // Focus on the input field
              $scope.edit_input_container.getElementsByTagName('input')[0].focus()
            } else if (jQuery($scope.edit_input_container).find('[contenteditable]').length > 0) {
              // Focus on any contenteditable (including froala)
              jQuery($scope.edit_input_container).find('[contenteditable]').focus()
            } else {
              // No known edit location, so try to focus on the entire container
              $scope.edit_input_container.focus()
            }
          }, 0)
        }

        $scope.accept = function () {
          if ($scope.model instanceof Model && $scope.property) {
            $scope.model.set($scope.property, $scope.value)
            $scope.model.save()
          }
        }

        $scope.cancel = function () {
          if ($scope.model instanceof Model && $scope.property) {
            $scope.value = $scope.model.get($scope.property)
          }
          $scope.setEdit(false)
        }

        // WATCHERS
        // --------

        $scope.$watch('ngModel', function (data) {
          if (data instanceof Model && !_.isEqual(data, $scope.model)) {
            $scope.model = data
            let unwatch = $scope.$watch('model.data', function (dataCheck) {
              if (dataCheck !== undefined) {
                unwatch() // Remove this watch as soon as it's run once
                $scope.ctrl.init() // Initialize only after there is a model
                // to work with
              }
            })
          }
        })

        // Init() will have data rendered from the model rather than the
        // element and allows for editing.
        $scope.ctrl.init = function () {
          if (!$scope.ctrl.initialized) {
            if (!Stratus.Environment.get('production')) {
              console.log('initializing stratusEdit directive...')
            }
            $scope.ctrl.initialized = true
          } else {
            if (!Stratus.Environment.get('production')) {
              console.log('initializing repeatedly...')
            }
            return null
          }

          // WATCHERS
          /* *
          $scope.$watch('model.data.' + $scope.property, function (data) {
            if (data) {
              $scope.value = data
            }
          })
          /* */

          // TRIGGERS

          // Save / Cancel value on key press
          // FIXME: saving with key press with cause two saves (due to focus
          // out). We need a save throttle to prevent errors
          jQuery($scope.edit_input_container)
            .on('keydown keypress', function (event) {
              switch (event.which) {
                case Stratus.Key.Enter:
                  if ($scope.autoSave !== false &&
                    $scope.autoSave !== 'false' &&
                    $scope.type !== 'Editor' // a quick fix. Stratus-Froala
                  // handles it's own auto saving
                  ) {
                    $scope.$apply($scope.accept)
                  }
                  $scope.setEdit(false)
                  break
                case Stratus.Key.Escape:
                  $scope.$apply($scope.cancel)
                  break
              }
            })

          // FIXME: save of focus out does not work on the media selector
          // correctly Update value on change, save value on blur
          jQuery($scope.edit_input_container).on('focusout', function () {
            if ($scope.autoSave !== false && $scope.autoSave !== 'false') {
              $scope.$apply($scope.accept)
            }
            $scope.setEdit(false)
          })
        }
      },
      templateUrl: function (elements, $scope) {
        let template = $scope.type || name
        return Stratus.BaseUrl + Stratus.BundlePath + 'directives/edit' + template + min + '.html'
      }
    }
  }
}))
