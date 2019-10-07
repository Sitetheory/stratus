System.register(["lodash", "stratus", "angular", "https://platform.twitter.com/widgets", "angular-material", "@stratusjs/core/conversion"], function (exports_1, context_1) {
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
    var _, Stratus, twitter, conversion_1, min, name, localPath;
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
            function (twitter_1) {
                twitter = twitter_1;
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
                    type: '<',
                    screenName: '<',
                    limit: '<',
                    lang: '<',
                    width: '<',
                    height: '<',
                    theme: '<',
                    linkColor: '<',
                    borderColor: '<',
                    ariaPolite: '<',
                    dnt: '<',
                },
                controller($scope, $attrs) {
                    const $ctrl = this;
                    $ctrl.uid = _.uniqueId(conversion_1.camelToSnake(name) + '_');
                    Stratus.Instances[$ctrl.uid] = $scope;
                    $scope.elementId = $attrs.elementId || $ctrl.uid;
                    $scope.initialized = false;
                    $scope.initialize = () => __awaiter(this, void 0, void 0, function* () {
                        if ($scope.initialized) {
                            return;
                        }
                        $scope.initialized = true;
                        twitter.widgets.createTimeline({
                            sourceType: 'list',
                            ownerScreenName: $scope.screenName
                        }, document.getElementById($scope.elementId), conversion_1.sanitize($attrs));
                    });
                },
                template: '<div id="{{ elementId }}"></div>'
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpdHRlckZlZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0d2l0dGVyRmVlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFtQk0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtZQUN6RCxJQUFJLEdBQUcsYUFBYSxDQUFBO1lBQ3BCLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQTtZQUdyQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRztnQkFDN0IsUUFBUSxFQUFFO29CQUVOLFNBQVMsRUFBRSxHQUFHO29CQUlkLElBQUksRUFBRSxHQUFHO29CQUNULFVBQVUsRUFBRSxHQUFHO29CQUNmLEtBQUssRUFBRSxHQUFHO29CQUNWLElBQUksRUFBRSxHQUFHO29CQUNULEtBQUssRUFBRSxHQUFHO29CQUNWLE1BQU0sRUFBRSxHQUFHO29CQUNYLEtBQUssRUFBRSxHQUFHO29CQUNWLFNBQVMsRUFBRSxHQUFHO29CQUNkLFdBQVcsRUFBRSxHQUFHO29CQUNoQixVQUFVLEVBQUUsR0FBRztvQkFDZixHQUFHLEVBQUUsR0FBRztpQkFDWDtnQkFDRCxVQUFVLENBQ04sTUFBVyxFQUNYLE1BQVc7b0JBR1gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFBO29CQUNsQixLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMseUJBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTtvQkFDaEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFBO29CQUNyQyxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQTtvQkFDaEQsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUE7b0JBRzFCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsR0FBUyxFQUFFO3dCQUMzQixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7NEJBQ3BCLE9BQU07eUJBQ1Q7d0JBQ0QsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7d0JBQ3pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUMxQjs0QkFDSSxVQUFVLEVBQUUsTUFBTTs0QkFDbEIsZUFBZSxFQUFFLE1BQU0sQ0FBQyxVQUFVO3lCQUNyQyxFQUNELFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUN6QyxxQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUNuQixDQUFBO29CQUNMLENBQUMsQ0FBQSxDQUFBO2dCQUVMLENBQUM7Z0JBQ0QsUUFBUSxFQUFFLGtDQUFrQzthQUMvQyxDQUFBO1FBQ0QsQ0FBQyJ9