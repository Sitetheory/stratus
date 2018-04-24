// ValidateUrl Directive
// ---------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Directives.ValidateUrl = function () {
    return {
      require: 'ngModel',
      scope: {
        service: '@'
      },
      link: function (scope, element, attr, ngModel) {
        element.keyup(function (event) {
          setTimeout(function () {
            ngModel.$validators.validateUrl = function (modelValue) {
              var urlRegex
              switch (scope.service) {
                case 'youtube':
                  urlRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/g
                  break
                case 'vimeo':
                  urlRegex = /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|)\/(video\/)?([A-Za-z0-9._%-]*)/gm
                  break
                case 'directlink':
                  urlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g
                  break

                // case 'googledrive':
                //   urlRegex = '';
                //   break;
                // case 'dropbox':
                //   urlRegex = '';
                //   break;
              }

              return modelValue.match(urlRegex)
            }
            ngModel.$validate()
          }, 500)
        })
      }
    }
  }
}))
