(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'stratus.services.commonMethods',
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This controler is used to handle small things need to custom.
  Stratus.Controllers.Utilities = [
    '$scope',
    '$element',
    'commonMethods',
    function ($scope, $element, commonMethods) {
      // Store Instance
      Stratus.Instances[_.uniqueId('utilities_')] = $scope;

      // Wrappers
      $scope.Stratus = Stratus;
      $scope._ = _;
      var $ctrl = this;

      // the model is showing
      $scope.model = null;

      // Data Connectivity
      if ($element.attr('ng-model')) {
        $scope.$parent.$watch($element.attr('ng-model'), function (model) {
          if (model) {
            $scope.model = model;
          }
        });
      }

      // *************HANDLE SIBARMENU LINK************************************
      // src/Sitetheory/TemplateAdminBundle/Resources/views/shell/shell.html.twig
      /*
      * Adjust sidebar link
      * redirect to a link
      */
      $scope.linkToSidebar = function (link) {
        link = compileString(link);
        if ((link.indexOf('Versions') == -1) && !_.isEmpty(commonMethods.moreParams())) {
          link += '#';
          angular.forEach(commonMethods.moreParams(), function (value, key) {
            link += key + '/' + value;
          });
        };

        window.location.replace(window.location.origin + link);
      };

      /**
      * Find block {{ model.data.id }} and compile it;
      * @return /Abc/102
      */
      function compileString(link) {
        var newLink = '';
        var startBlock = 0;
        for (var i = 0; i < link.length; i++) {
          var character = link.charAt(i);

          // find block {{ model.data.id }}
          if (character == '{') {
            startBlock++;
            if (startBlock == 2) {
              var endChart = 0; // '}'
              for (var j = i; j < link.length; j++) {
                if (link.charAt(j) == '}') endChart++;
                if (endChart == 2) { // }}
                  var block = link.substring(i + 1, j - 1);
                  newLink += proccessValue(block.trim());
                  endChart = 0; i = j;
                  break;
                }
              }
              startBlock = 0;
            }
          }else {
            newLink += character;
          }
        }
        return newLink;
      };

      /*
      * Get value from block. ex:{{ model.data.id }} -> 111
      * @return @string
      */
      function proccessValue(block) {
        var value = null;
        angular.forEach(block.split('.'), function (attribute) {
          value = (attribute !== 'model') ? value[attribute] : $scope.model;
        });

        return value;
      }

      // *************END HANDLE SIBARMENU LINK********************************
    }];
}));
