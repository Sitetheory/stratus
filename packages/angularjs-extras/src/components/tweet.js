// Tweet Component
// ---------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular',
      'https://platform.twitter.com/widgets.js'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This component is just a simple base.
  Stratus.Components.Tweet = {
    bindings: {
      ngModel: '='
    },
    controller: function ($scope, $element, $attrs, $parse, $window, $log) {
      this.uid = _.uniqueId('tweet_')
      Stratus.Instances[this.uid] = $scope
      $scope.model = $parse($attrs.ngModel)
      $scope.tweet = $scope.model($scope.$parent)
      $scope.render = function () {
        if (typeof $scope.tweet === 'string' && $scope.tweet.length) {
          $window.twttr.widgets.createTweet($scope.tweet, $element[0], {
            conversation: 'all', // or none
            cards: 'visible', // or hidden
            linkColor: '#cc0000', // default is blue
            theme: 'light' // or dark
          })
        }
      }
      if ($scope.tweet) {
        $scope.render()
      }
      $scope.$parent.$watch($attrs.ngModel, function (tweet) {
        if (tweet && _.strcmp(tweet, $scope.tweet) !== 0) {
          $scope.tweet = tweet
          $scope.render()
        }
      })
    }
  }
}))
