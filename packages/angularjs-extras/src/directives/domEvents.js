// Dom Events Extras Directive
// -----------------
// Intended to add the DOM events that https://github.com/angular/angular.js/blob/master/src/ng/directive/ngEventDirs.js has missed
// Such as:
// focusin: stratus-focusin (different than ng-focus) You can focus any element directly so long as you add tabindex="-1"
//          Otherwise, this will always detect inner children being focused or directly on just input fields
// focusout: stratus-focusout (different than ng-blur)

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'lodash', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _) {

  /**
   * List of DOM events that will be converted into Directives
   * @type {string[]}
   */
  const directiveEvents = [
    'focusin',
    'focusout'
  ]
  /**
   * For events that might fire synchronously during DOM manipulation
   * we need to execute their event handlers asynchronously using $evalAsync,
   * so that they are not executed in an inconsistent state.
   */
  const forceAsyncEvents = {
    'blur': true,
    'focus': true
  }

  directiveEvents.forEach(function (eventName) {
    const directiveName = _.capitalize(eventName)
    const attributeName = 'stratus' + directiveName
    /*console.log({
      'eventName': eventName,
      'directiveName': directiveName,
      'attributeName': attributeName
    })*/

    Stratus.Directives[directiveName] = function ($parse, $rootScope, $exceptionHandler) {
      return {
        restrict: 'A',
        compile: function ($element, $attrs) {
          const fn = $parse($attrs[attributeName])
          // console.log('initied', attributeName, $attrs[attributeName], $attrs)
          return function ngEventHandler (scope, element) {
            element.on(eventName, function (event) {
              // console.log(eventName, 'hit')
              const callback = function () {
                fn(scope, { $event: event })
              }

              if (!$rootScope.$$phase) {
                scope.$apply(callback)
              } else if (forceAsyncEvents[eventName]) {
                scope.$evalAsync(callback)
              } else {
                try {
                  callback()
                } catch (error) {
                  $exceptionHandler(error)
                }
              }
            })
          }

        }

      }
    }
    // End Direction Additions loop
  })
}))
