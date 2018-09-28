// Edit Inline Directive
// ---------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'jquery', 'angular', 'stratus.services.model'],
      factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular)
  }
}(this, function (Stratus, _, jQuery, angular) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.EditInline = function ($parse, $log, Model) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        ngModel: '=',
        property: '@',
        emptyValue: '@', // A value to display if it is currently empty
        prefix: '@', // A value to prepend to the front of the value
        suffix: '@', // A value to appended to the end of the value
        stratusEdit: '=', // A value to define if the element can currently be
        // editable
        alwaysEdit: '@', // A bool/string to define if the element will always
        // be in editable mode
        autoSave: '@' // A bool/string to define if the model will auto save on
        // focus out or Enter presses. Defaults to true
      },
      link: function ($scope, $element, $attrs, ngModel) {
        // Initialize
        $scope.uid = this.uid = _.uniqueId('edit_')
        Stratus.Instances[this.uid] = $scope
        $scope.value = $scope.originalValue = $element.html()
        $scope.$value = jQuery(document.createElement('span'))
        $scope.$value.html($scope.value || $scope.emptyValue || '')

        // Data Connectivity
        $scope.model = null

        if (!ngModel || !$scope.property) {
          console.warn($scope.uid + ' has no model or property!')
          return
        }

        var ctrl = {
          initialized: false,
          rendered: false
        }

        // METHODS

        ngModel.$render = function () {
          if (ctrl.rendered === false) {
            ctrl.rendered = true
            $scope.findAffix()

            $element.empty()

            if ($scope.prefix) {
              $scope.$prefix = jQuery(document.createElement('span'))
              $scope.$prefix.html($scope.prefix)
              $scope.$prefix.attr('prefix', '')

              $element.append($scope.$prefix)
            }

            $element.append($scope.$value)

            if ($scope.suffix) {
              $scope.$suffix = jQuery(document.createElement('span'))
              $scope.$suffix.html($scope.suffix)
              $scope.$suffix.attr('suffix', '')

              $element.append($scope.$suffix)
            }
          } else {
            $scope.$value.html($scope.value || $scope.emptyValue || '')
          }
        }

        $scope.findAffix = function () {
          // Note: $element.children(param) doesn't work the same in JQlite as
          // Jquery
          _.some($element.find('[prefix]'), function (el) {
            $scope.prefix = jQuery(el).html()
            return true // loop only once
          })

          _.some($element.find('[suffix]'), function (el) {
            $scope.suffix = jQuery(el).html()
            return true // loop only once
          })
        }

        $scope.liveEditStatus = function () {
          if (ctrl.initialized) {
            if ($scope.stratusEdit !== undefined) {
              return $scope.stratusEdit
            } else if (Stratus.Environment.data.liveEdit !== undefined) {
              return Stratus.Environment.data.liveEdit
            }
            console.warn($scope.uid +
              ' has no variable to track edit toggle! ($scope.stratusEdit)')
          }
          return false
        }

        $scope.read = function () {
          if (ctrl.initialized) {
            $scope.value = $scope.$value.html()
          }
        }

        $scope.moveCaret = function (moveAmount, win) {
          if (win === undefined) {
            win = window
          }
          var sel
          var range
          if (win.getSelection) {
            sel = win.getSelection()
            if (sel.rangeCount > 0) {
              var textNode = sel.focusNode

              if (textNode.length === undefined && textNode.childNodes[0]) {
                textNode = textNode.childNodes[0]
              }
              if (textNode.length === undefined) {
                console.warn('stratus-edit-inline could not grab selection')
                return false
              }

              var newOffset = sel.focusOffset + moveAmount
              range = document.createRange()
              range.setStart(textNode,
                Math.min((textNode.length || 0) + moveAmount, newOffset))
              range.setStart(textNode, moveAmount)
              range.collapse(true)
              sel.removeAllRanges()
              sel.addRange(range)
            }
          }
        }

        $scope.accept = function () {
          if (ctrl.initialized &&
            $scope.model instanceof Model &&
            $scope.property &&
            $scope.model.get($scope.property) !== $scope.value
          ) {
            // FIXME when the property is an array ( route[0].url ), model.set
            // isn't treating route[0] as an array, but rather a whole new
            // section. (fix with $scope.model.toggle? )
            $scope.model.set($scope.property, $scope.value)
            $scope.model.throttleSave()
          }
        }
        $scope.cancel = function () {
          if (ctrl.initialized &&
            $scope.model instanceof Model &&
            $scope.property) {
            $scope.value = $scope.model.get($scope.property)
          }
        }

        // WATCHERS

        $scope.$watch('ngModel', function (data) {
          if (data instanceof Model && !_.isEqual(data, $scope.model)) {
            $scope.model = data
            if (ctrl.initialized !== true) {
              var unwatch = $scope.$watch('model.data', function (dataCheck) {
                if (dataCheck !== undefined) {
                  unwatch() // Remove this watch as soon as it's run once
                  ctrl.init() // Initialize only after there is a model to
                  // work with
                }
              })
            }
          }
        })

        // Init() will have data rendered from the model rather than the
        // element and allows for editing.
        ctrl.init = function () {
          if (!ctrl.initialized) {
            ctrl.initialized = true

            // WATCHERS

            $scope.$watch('model.data.' + $scope.property, function (data) {
              $scope.value = data
              ngModel.$render() // if the value changes, show the new change
              // (since rendering doesn't always happen)
            })

            if ($scope.alwaysEdit !== true && $scope.alwaysEdit !== 'true') {
              $scope.$watch($scope.liveEditStatus, function (liveEdit) {
                $scope.$value.attr('contenteditable', liveEdit)
                if (liveEdit) {
                  $element.addClass('liveEdit')
                } else {
                  $element.removeClass('liveEdit')
                }
              })
            } else {
              $scope.$value.attr('contenteditable', true)
            }

            // TRIGGERS

            $scope.$value.on('focus', function () {
              $element.addClass('focus')
            })

            $scope.$value.on('focusout', function () {
              $element.removeClass('focus')
            })

            // Update value on change, save value on blur
            $scope.$value.on('focusout keyup change', function (event) {
              if (ctrl.initialized) {
                $scope.$apply($scope.read)
                if ($scope.autoSave !== false && $scope.autoSave !== 'false') {
                  switch (event.type) {
                    case 'focusout':
                    case 'blur':
                      /// below code will attached stratus route main if user try to create new article route
                        if($scope.model.target === 'Article'){
                            $scope.model.data.routing.push({'url':$scope.value,'main':true});
                            $scope.model.save();
                        }else{
                            $scope.$apply($scope.accept)
                        }
                      break
                  }
                }
              }
            })

            // Save / Cancel value on key press
            $scope.$value.on('keydown keypress', function (event) {
              if (ctrl.initialized) {
                switch (event.which) {
                  case Stratus.Key.Enter:
                    event.preventDefault() // Prevent Line breaks
                    if ($scope.autoSave !== false &&
                      $scope.autoSave !== 'false') { // Placed here because we still want to prevent Line breaks
                      $scope.$apply($scope.accept)
                    }
                    $scope.$value.blur()
                    break
                  case Stratus.Key.Escape:
                    $scope.$apply($scope.cancel)
                    $scope.$value.blur()
                    break
                }
              }
            })
          }
        }
      }
    }
  }
}))
