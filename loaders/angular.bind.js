/* global Stratus, _, jQuery, angular, boot */

/**
 * @constructor
 */
Stratus.Loaders.Angular = function () {
  let requirement
  let nodes
  let injection

  // This contains references for the auto-loader below
  let container = {
    requirement: [],
    module: [],
    stylesheet: []
  }

  // TODO: Add references to this prototype in the tree builder, accordingly
  let injector = function (injection) {
    injection = injection || {}
    _.each(injection, function (element, attribute) {
      container[attribute] = container[attribute] || []
      if (_.isArray(element)) {
        _.each(element, function (value) {
          container[attribute].push(value)
        })
      } else {
        container[attribute].push(element)
      }
    })
  }

  _.each(Stratus.Roster, function (element, key) {
    if (typeof element === 'object' && element) {
      // sanitize roster fields without selector attribute
      if (_.isUndefined(element.selector) && element.namespace) {
        element.selector = _.filter(
          _.map(boot.configuration.paths, function (path, key) {
            // if (_.isString(key)) console.log(key.match(/([a-zA-Z]+)/g));
            return _.startsWith(key, element.namespace) ? (element.type === 'attribute' ? '[' : '') + _.camelToKebab(key.replace(element.namespace, 'stratus-')) + (element.type === 'attribute' ? ']' : '') : null
          })
        )
      }

      // digest roster
      if (_.isArray(element.selector)) {
        element.length = 0
        _.each(element.selector, function (selector) {
          nodes = document.querySelectorAll(selector)
          element.length += nodes.length
          if (nodes.length) {
            let name = selector.replace(/^\[/, '').replace(/]$/, '')
            requirement = element.namespace + _.lcfirst(_.kebabToCamel(name.replace(/^stratus/, '').replace(/^ng/, '')))
            if (_.has(boot.configuration.paths, requirement)) {
              injection = {
                requirement: requirement
              }
              if (element.module) {
                injection.module = _.isString(element.module) ? element.module : _.lcfirst(_.kebabToCamel(name + (element.suffix || '')))
              }
              injector(injection)
            }
          }
        })
      } else if (_.isString(element.selector)) {
        nodes = document.querySelectorAll(element.selector)
        element.length = nodes.length
        if (nodes.length) {
          let attribute = element.selector.replace(/^\[/, '').replace(/]$/, '')
          if (attribute && element.namespace) {
            _.each(nodes, function (node) {
              let name = node.getAttribute(attribute)
              if (name) {
                requirement = element.namespace + _.lcfirst(_.kebabToCamel(name.replace('Stratus', '')))
                if (_.has(boot.configuration.paths, requirement)) {
                  injector({
                    requirement: requirement
                  })
                }
              }
            })
          } else if (element.require) {
            // TODO: add an injector to the container
            container.requirement = _.union(container.requirement, element.require)
            injection = {}
            if (element.module) {
              injection.module = _.isString(element.module) ? element.module : _.lcfirst(_.kebabToCamel(attribute + (element.suffix || '')))
            }
            if (element.stylesheet) {
              injection.stylesheet = element.stylesheet
            }
            injector(injection)
          }
        }
      }
    }
  })

  // Ensure Modules enabled are in the requirements
  container.requirement.push('angular-material')
  _.each(container, function (element, key) {
    container[key] = _.uniq(element)
  })
  window.container = container

  // Angular Injector
  if (container.requirement.length) {
    // Deprecated the use of the 'froala' directive for stratus-froala
    /* *
    if (_.contains(container.requirement, 'angular-froala')) {
      [
        'codemirror/mode/htmlmixed/htmlmixed',
        'codemirror/addon/edit/matchbrackets',
        'codemirror',
        'froala-align',
        'froala-code-beautifier',
        'froala-code-view',
        'froala-draggable',
        'froala-entities',
        'froala-file',
        'froala-forms',
        'froala-fullscreen',
        'froala-help',
        'froala-image',
        'froala-image-manager',
        'froala-inline-style',
        'froala-link',
        'froala-lists',
        'froala-paragraph-format',
        'froala-paragraph-style',
        'froala-quick-insert',
        'froala-quote',
        'froala-table',
        'froala-url',
        'froala-video',
        'froala-word-paste'
      ].forEach(function (requirement) {
        container.requirement.push(requirement);
      });
    }
    /* */

    // We are currently forcing all filters to load because we don't have a selector to find them on the DOM, yet.
    Object.keys(boot.configuration.paths).filter(function (path) {
      return _.startsWith(path, 'stratus.filters.')
    }).forEach(function (requirement) {
      container.requirement.push(requirement)
    })

    // console.log('requirements:', container.requirement)

    require(container.requirement, function () {
      // App Reference
      angular.module('stratusApp', _.union(Object.keys(Stratus.Modules), container.module)).config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        let whitelist = [
          'self',
          'http://*.sitetheory.io/**',
          'https://*.sitetheory.io/**'
        ]
        if (boot.host) {
          if (_.startsWith(boot.host, '//')) {
            _.each(['https:', 'http:'], function (proto) {
              whitelist.push(proto + boot.host + '/**')
            })
          } else {
            whitelist.push(boot.host + '/**')
          }
        }
        $sceDelegateProvider.resourceUrlWhitelist(whitelist)
      }])

      // TODO: Make Dynamic
      // Froala Configuration
      if (typeof jQuery === 'function' && jQuery.fn && jQuery.FroalaEditor) {
        jQuery.FroalaEditor.DEFAULTS.key = Stratus.Api.Froala

        // 'insertOrderedList', 'insertUnorderedList', 'createLink', 'table'
        let buttons = [
          'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'formatBlock',
          'blockStyle', 'inlineStyle', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL',
          'formatUL', 'outdent', 'indent', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile',
          'insertTable', '|', 'undo', 'redo', 'removeFormat', 'wordPaste', 'help', 'html', 'fullscreen'
        ]
        angular.module('stratusApp').value('froalaConfig', {
          codeBeautifierOptions: {
            end_with_newline: true,
            indent_inner_html: true,
            extra_liners: "['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'table', 'dl']",
            brace_style: 'expand',
            indent_char: ' ',
            indent_size: 4,
            wrap_line_length: 0
          },
          codeMirror: true,
          codeMirrorOptions: {
            indentWithTabs: false,
            lineNumbers: true,
            lineWrapping: true,
            mode: 'text/html',
            tabMode: 'space',
            tabSize: 4
          },
          fileUploadURL: 'https://app.sitetheory.io:3000/?session=' + _.cookie('SITETHEORY'),
          htmlAllowedAttrs: ['.*'],
          htmlAllowedEmptyTags: [
            'textarea', 'a', '.fa',
            'iframe', 'object', 'video',
            'style', 'script', 'div'
          ],
          htmlAllowedTags: ['.*'],
          htmlRemoveTags: [''],
          htmlUntouched: true,
          imageManagerPageSize: 20,
          imageManagerScrollOffset: 10,
          imageManagerLoadURL: '/Api/Media?payload-only=true',
          imageManagerLoadMethod: 'GET',
          imageManagerDeleteMethod: 'DELETE',
          multiLine: true,
          pasteDeniedAttrs: [''],
          pasteDeniedTags: [''],
          pastePlain: false,
          toolbarSticky: false,
          toolbarButtons: buttons,
          toolbarButtonsMD: buttons,
          toolbarButtonsSM: buttons,
          toolbarButtonsXS: buttons
        })
      }

      // Services
      _.each(Stratus.Services, function (service) {
        angular.module('stratusApp').config(service)
      })

      // Components
      _.each(Stratus.Components, function (component, name) {
        angular.module('stratusApp').component('stratus' + _.ucfirst(name), component)
      })

      // Directives
      _.each(Stratus.Directives, function (directive, name) {
        angular.module('stratusApp').directive('stratus' + _.ucfirst(name), directive)
      })

      // Filters
      _.each(Stratus.Filters, function (filter, name) {
        angular.module('stratusApp').filter(_.lcfirst(name), filter)
      })

      // Controllers
      _.each(Stratus.Controllers, function (controller, name) {
        angular.module('stratusApp').controller(name, controller)
      })

      // Load CSS
      // TODO: Move this reference to the stylesheets block above
      let css = container.stylesheet
      let cssLoaded = Stratus('link[satisfies]').map(function (node) {
        return node.getAttribute('satisfies')
      })
      if (!_.contains(cssLoaded, 'angular-material.css')) {
        css.push(
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/angular-material/angular-material' + (Stratus.Environment.get('production') ? '.min' : '') + '.css'
        )
      }
      if (Stratus.Directives.Froala || Stratus('[froala]').length) {
        [
          // FIXME this is sitetheory only
          Stratus.BaseUrl + 'sitetheorycore/css/sitetheory.codemirror.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/codemirror/lib/codemirror.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/froala_editor.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/froala_style.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/code_view.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/draggable.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/file.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/fullscreen.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/help.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/image.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/image_manager.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/quick_insert.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/special_characters.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/table.min.css',
          Stratus.BaseUrl + Stratus.BundlePath + 'node_modules/froala-editor/css/plugins/video.min.css'
        ].forEach(function (stylesheet) {
          css.push(stylesheet)
        })
      }

      // FIXME: What is above this line is total crap

      if (css.length) {
        let counter = 0
        css.forEach(function (url) {
          Stratus.Internals.CssLoader(url)
            .then(function () {
              if (++counter !== css.length) {
                return
              }
              angular.bootstrap(document.querySelector('html'), ['stratusApp'])
            })
        })
      } else {
        angular.bootstrap(document.querySelector('html'), ['stratusApp'])
      }
    })
  }
}
