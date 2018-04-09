// TODO: Separate these functions out, into more narrow services
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([

      // Libraries
      'stratus',
      'underscore',
      'angular',

      // Modules
      'zxcvbn'
    ], factory);
  } else {
    // Browser globals
    factory(root.Stratus, root._, root.angular, root.zxcvbn);
  }
}(typeof self !== 'undefined' ? self : this, function (Stratus, _, angular, zxcvbn) {
  Stratus.Services.CommonMethods = ['$provide', function ($provide) {
    $provide.factory('commonMethods', ['$q', '$http', '$window', '$sce', function ($q, $http, $window, $sce) {
      var RESPONSE_CODE = {
        verify: 'VERIFY',
        success: 'SUCCESS'
      };

      // functional methods
      function componentInitializer(element, scope, attrs, componentName, loadCss) {
        element.uid = _.uniqueId(componentName + '_');
        Stratus.Instances[element.uid] = scope;
        scope.elementId = attrs.elementId || element.uid;
        if (loadCss) {
          Stratus.Internals.CssLoader(buildCssUrl(componentName));
        }
      };

      function getStatus(response) {
        return response.data.meta.status['0'];
      };

      function buildCssUrl(componentName) {
        var componentUrl = 'sitetheorystratus/stratus/components/' + underscoreToCamel(componentName);
        return Stratus.BaseUrl + componentUrl + (Stratus.Environment.get('production') ? '.min' : '') + '.css';
      };

      function underscoreToCamel(inputString) {
        return inputString.replace(/_([a-z])/g, function (g) {
          return g[1].toUpperCase();
        });
      };

      function validPassword(password) {
        var passwordRegex = /^(?:(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)$/;
        return password.length >= 8 && passwordRegex.test(password);
      };

      function generateProgressBar(password) {
        var data = {
          progressBarClass: '',
          progressBarValue: 0
        };

        switch (zxcvbn(password).score) {
          case 0:
            data.progressBarClass = 'risky';
            data.progressBarValue = 20;
            break;
          case 1:
            data.progressBarClass = 'guessable';
            data.progressBarValue = 40;
            break;
          case 2:
            data.progressBarClass = 'safely';
            data.progressBarValue = 60;
            break;
          case 3:
            data.progressBarClass = 'moderate';
            data.progressBarValue = 80;
            break;
          case 4:
            data.progressBarClass = 'strong';
            data.progressBarValue = 100;
            break;
        }

        return data;
      };

      function getUrlParams() {
        var params = _.getUrlParams();
        return {
          type: _.has(params, 'type') ? params.type : null,
          email: _.has(params, 'email') ? params.email : null,
          token: _.has(params, 'token') ? params.token : null
        };
      };

      function cleanedPhoneNumber(phoneNumber) {
        var keepNumberOnlyRegex = /\D+/g;
        return phoneNumber.replace(keepNumberOnlyRegex, '');
      };

      /**
       * Get more params which is shown after '#' symbol in url.
       * @return {*}
       */
      function moreParams() {
        var params = {};
        angular.forEach(location.hash.split('#'), function (param) {
          if (param) {
            var digest = param.split('/');
            if (digest.length > 1) {
              params[digest[0]] = digest[1];
            }
          }
        });
        return params;
      };

      function copyToClipboard(value) {
        var temp = document.createElement('input');
        document.body.appendChild(temp);
        temp.setAttribute('value', value);
        temp.select();
        var result = document.execCommand('copy');
        document.body.removeChild(temp);
        return result;
      }

      function sendRequest(data, method, url, headers) {
        return $http({
          url: url,
          method: method,
          data: data,
          headers: headers
        }).then(
          function (response) { // success
            return $q.resolve(response);
          },
          function (response) { // something went wrong
            return $q.reject(response);
          });
      }

      function safeMessage(message) {
        return $sce.trustAsHtml(message);
      }

      return {
        componentInitializer:   componentInitializer,
        getStatus:              getStatus,
        buildCssUrl:            buildCssUrl,
        underscoreToCamel:      underscoreToCamel,
        validPassword:          validPassword,
        generateProgressBar:    generateProgressBar,
        getUrlParams:           getUrlParams,
        cleanedPhoneNumber:     cleanedPhoneNumber,
        moreParams:             moreParams,
        RESPONSE_CODE:          RESPONSE_CODE,
        copyToClipboard:        copyToClipboard,
        sendRequest:            sendRequest,
        safeMessage:            safeMessage
      };
    }]);
  }];
}));
