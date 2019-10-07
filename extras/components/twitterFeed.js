System.register(["lodash", "stratus", "angular", "angular-material", "@stratusjs/core/conversion"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var _, Stratus, conversion_1, min, name, localPath;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_2) {
            },
            function (_3) {
            },
            function (conversion_1_1) {
                conversion_1 = conversion_1_1;
            }
        ],
        execute: function () {
            min = Stratus.Environment.get('production') ? '.min' : '';
            name = 'twitterFeed';
            localPath = 'extras/components';
            Stratus.Components.TwitterFeed = {
                bindings: {
                    elementId: '@',
                    type: '=',
                    screenName: '=',
                    limit: '=',
                    lang: '=',
                    width: '=',
                    height: '=',
                    theme: '=',
                    linkColor: '=',
                    borderColor: '=',
                    ariaPolite: '=',
                    dnt: '=',
                },
                controller($scope, $attrs, $element) {
                    const $ctrl = this;
                    $ctrl.uid = _.uniqueId(conversion_1.camelToSnake(name) + '_');
                    Stratus.Instances[$ctrl.uid] = $scope;
                    $scope.elementId = $attrs.elementId || $ctrl.uid;
                    $scope.initialized = false;
                    $scope.feedOptions = {};
                    $scope.initialize = () => __awaiter(this, void 0, void 0, function* () {
                        if ($scope.initialized) {
                            return;
                        }
                        $scope.initialized = true;
                        _.each(Stratus.Components.TwitterFeed.bindings, (value, key) => {
                            _.set($scope.feedOptions, key, _.get($ctrl, key) || _.get($attrs, key));
                        });
                        console.log('feedOptions:', conversion_1.sanitize($scope.feedOptions));
                        const timeline = yield twttr.widgets.createTimeline({
                            sourceType: $scope.feedOptions.type || 'profile',
                            screenName: $scope.feedOptions.screenName,
                        }, $element[0], conversion_1.sanitize($scope.feedOptions) || {});
                    });
                    if (!_.isEmpty($ctrl.screenName || $attrs.screenName)) {
                        $scope.initialize();
                        return;
                    }
                    $scope.$watch('$ctrl.screenName', (newVal, oldVal) => {
                        if (!newVal) {
                            return;
                        }
                        $scope.initialize();
                    });
                },
                template: '<div id="{{ elementId }}"></div>'
            };
        }
    };
});
