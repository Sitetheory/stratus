//     Stratus.Components.Tweet.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Stratus Tweet Component
// -----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular', 'https://platform.twitter.com/widgets.js'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This component is just a simple base.
    Stratus.Components.Tweet = {
        bindings: {
            ngModel: '='
        },
        controller: function ($scope, $element, $attrs, $parse, $window, $log) {
            this.uid = _.uniqueId('tweet_');
            Stratus.Instances[this.uid] = $scope;
            $scope.model = $parse($attrs.ngModel);
            $scope.tweet = $scope.model($scope.$parent);
            $scope.render = function () {
                if (typeof $scope.tweet === 'string' && $scope.tweet.length) {
                    $window.twttr.widgets.createTweet($scope.tweet, $element[0], {
                        conversation: 'all', // or none
                        cards: 'visible', // or hidden
                        linkColor: '#cc0000', // default is blue
                        theme: 'light' // or dark
                    });
                }
            };
            if ($scope.tweet) {
                $scope.render();
            }
            $scope.$parent.$watch($attrs.ngModel, function (tweet) {
                if (tweet && _.strcmp(tweet, $scope.tweet) !== 0) {
                    $scope.tweet = tweet;
                    $scope.render();
                }
            });
        }
    };
}));
