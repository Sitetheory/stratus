// Drag Directive
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'lodash', 'angular', 'stratus.directives.drop'],
      factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.Drag = function ($parse, $log) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=ngModel'
      },
      link: function ($scope, $element, $attrs) {
        Stratus.Instances[_.uniqueId('drag_')] = $scope

        $element.bind('dragstart', function (event) {
          console.log('dragstart:', event)
          event.dataTransfer.effectAllowed = 'copy' // only dropEffect='copy'
          // will be droppable
          event.dataTransfer.setData('Text', this.id) // required otherwise
          // doesn't work
        })

        $element.bind('dragenter', function (event) {
          console.log('dragenter:', event)
          return false
        })

        $element.bind('dragover', function (event) {
          console.log('dragover:', event)
          if (event.preventDefault) {
            event.preventDefault()
          }
          event.dataTransfer.dropEffect = 'move' // or 'copy'
          return false
        })

        $element.bind('dragleave', function (event) {
          console.log('dragleave:', event)
        })

        $element.bind('drop', function (event) {
          console.log('drop:', event)
          if (event.stopPropagation) {
            event.stopPropagation()
          } // stops the browser from redirecting... why???
          let el = document.getElementById(event.dataTransfer.getData('Text'))
          el.parentNode.removeChild(el)
          return false
        })
      }
    }
  }
}))
