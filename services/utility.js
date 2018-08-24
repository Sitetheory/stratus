/* global define, location */

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
          var RESPONSE_CODE = {
            verify: 'VERIFY',
            success: 'SUCCESS'
          }

          /**
           * @param element
           * @param scope
           * @param attrs
           * @param componentName
           * @param loadCss
           * @returns {*}
           */
          function componentInitializer (element, scope, attrs, componentName, loadCss) {
            element.uid = _.uniqueId(componentName + '_')
            Stratus.Instances[element.uid] = scope
            scope.elementId = attrs.elementId || element.uid
            return loadCss ? Stratus.Internals.CssLoader(buildCssUrl(componentName)) : null
          }

          /**
           * @param response
           * @returns {*}
           */
          function getStatus (response) {
            return response.data.meta.status['0']
          }

          /**
           * @param componentName
           * @returns {string}
           */
          function buildCssUrl (componentName) {
            var componentUrl = Stratus.BundlePath + 'components/' + underscoreToCamel(componentName)
            return Stratus.BaseUrl + componentUrl + (Stratus.Environment.get('production') ? '.min' : '') + '.css'
          }

          /**
           * @param inputString
           * @returns {*}
           */
          function underscoreToCamel (inputString) {
            return inputString.replace(/_([a-z])/g, function (g) {
              return g[1].toUpperCase()
            })
          }

          /**
           * @param password
           * @returns {boolean}
           */
          function validPassword (password) {
            var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,}|^.{20,}$/
            return passwordRegex.test(password)
          }

          /**
           * @param password
           * @param zxcvbn
           * @returns {{progressBarClass: string, progressBarValue: number}}
           */
          function generateStrengthBar (password, zxcvbn) {
            var data = {
              progressBarClass: '',
              progressBarValue: 0
            }

            switch (zxcvbn(password).score) {
              case 0:
                data.progressBarClass = 'risky'
                data.progressBarValue = 20
                break
              case 1:
                data.progressBarClass = 'guessable'
                data.progressBarValue = 40
                break
              case 2:
                data.progressBarClass = 'safe'
                data.progressBarValue = 60
                break
              case 3:
                data.progressBarClass = 'moderate'
                data.progressBarValue = 80
                break
              case 4:
                data.progressBarClass = 'strong'
                data.progressBarValue = 100
                break
            }

            return data
          }

          /**
           * @returns {{type: null, email: null, token: null}}
           */
          function getUrlParams () {
            var params = _.getUrlParams()
            return {
              type: _.has(params, 'type') ? params.type : null,
              email: _.has(params, 'email') ? params.email : null,
              token: _.has(params, 'token') ? params.token : null
            }
          }

          /**
           * @param phoneNumber
           * @returns {*}
           */
          function cleanedPhoneNumber (phoneNumber) {
            var keepNumberOnlyRegex = /\D+/g
            return phoneNumber.replace(keepNumberOnlyRegex, '')
          }

          /**
           * Get more params which is shown after '#' symbol in url.
           * @return {*}
           */
          function moreParams () {
            var params = {}
            angular.forEach(location.hash.split('#'), function (param) {
              if (param) {
                var digest = param.split('/')
                if (digest.length > 1) {
                  params[digest[0]] = digest[1]
                }
              }
            })
            return params
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
            underscoreToCamel: underscoreToCamel,
            validPassword: validPassword,
            generateStrengthBar: generateStrengthBar,
            getUrlParams: getUrlParams,
            cleanedPhoneNumber: cleanedPhoneNumber,
            moreParams: moreParams,
            RESPONSE_CODE: RESPONSE_CODE,
            copyToClipboard: copyToClipboard,
            sendRequest: sendRequest,
            safeMessage: safeMessage
          }
        }])
    }]
}))
