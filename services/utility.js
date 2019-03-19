/* global define */

// TODO: Separate these functions out, into more narrow services
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  Stratus.Services.utility = [
    '$provide', function ($provide) {
      $provide.factory('utility', [
        '$q',
        '$http',
        '$window',
        '$sce',
        '$log',
        function ($q, $http, $window, $sce, $log) {
          /**
           * @param element
           * @param scope
           * @param attrs
           * @param componentName
           * @param loadCss
           * @returns {*}
           */
          function componentInitializer (element, scope, attrs, componentName, loadCss) {
            console.warn('Deprecated initializer:', element)
            element.uid = _.uniqueId(componentName + '_')
            Stratus.Instances[element.uid] = scope
            scope.elementId = attrs.elementId || element.uid
            return loadCss ? Stratus.Internals.CssLoader(buildCssUrl(componentName)) : null
          }

          /**
           * @deprecated
           * @param response
           * @returns {*}
           */
          function getStatus (response) {
            console.trace('Deprecated getStatus call!')
            return response.data.meta.status['0']
          }

          /**
           * @param componentName
           * @returns {string}
           */
          function buildCssUrl (componentName) {
            var componentUrl = Stratus.BundlePath + 'components/' + _.snakeToCamel(componentName)
            return Stratus.BaseUrl + componentUrl + (Stratus.Environment.get('production') ? '.min' : '') + '.css'
          }

          /**
           * @param value
           * @returns {boolean}
           */
          function copyToClipboard (value) {
            var temp = document.createElement('input')
            document.body.appendChild(temp)
            temp.setAttribute('value', value)
            temp.select()
            var result = document.execCommand('copy')
            document.body.removeChild(temp)
            return result
          }

          /**
           * @deprecated
           * @param data
           * @param method
           * @param url
           * @param headers
           * @returns {*}
           */
          function sendRequest (data, method, url, headers) {
            $log.warn('sendRequest is deprecated and will be removed in future versions!')
            return $http({
              url: url,
              method: method,
              data: data,
              headers: headers
            }).then(
              function (response) { // success
                return $q.resolve(response)
              },
              function (response) { // something went wrong
                return $q.reject(response)
              })
          }

          /**
           * @param message
           * @returns {*}
           */
          function safeMessage (message) {
            return $sce.trustAsHtml(message)
          }

          return {
            componentInitializer: componentInitializer,
            getStatus: getStatus,
            buildCssUrl: buildCssUrl,
            copyToClipboard: copyToClipboard,
            sendRequest: sendRequest,
            safeMessage: safeMessage
          }
        }])
    }]
}))
