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
              const youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/g
              const vimeoRegex = /(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([a-z0-9]{1,11})[?]?.*/gm
              switch (scope.service) {
                case 'youtube':
                  urlRegex = youtubeRegex
                  break
                case 'vimeo':
                  urlRegex = vimeoRegex
                  break
                case 'directlink':
                  urlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g
                  break
                case 'youtube-vimeo':
                  return modelValue.match(youtubeRegex) || modelValue.match(vimeoRegex)
                case 'embed':
                  urlRegex = /<iframe(.+)<\/iframe>/g
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
