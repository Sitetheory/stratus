System.register(["lodash", "@stratusjs/runtime/stratus", "jquery"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, stratus_1, jquery_1, name;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (stratus_1_1) {
                stratus_1 = stratus_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {
            name = 'src';
            stratus_1.Stratus.Directives.Src = () => ({
                restrict: 'A',
                scope: {
                    src: '@src',
                    stratusSrc: '@stratusSrc',
                    stratusSrcVersion: '@stratusSrcVersion',
                    style: '@style'
                },
                link: ($attrs, $element, $scope) => {
                    stratus_1.Stratus.Instances[lodash_1.uniqueId(name + '_')] = $scope;
                    $scope.whitelist = [
                        'jpg',
                        'jpeg',
                        'png',
                        'gif'
                    ];
                    $scope.filter = null;
                    $scope.$watch(() => {
                        return $attrs.stratusSrc || $attrs.src || $attrs.style;
                    }, (newVal, _oldVal, _scope) => {
                        if (newVal && $element.attr('data-size')) {
                            $scope.registered = false;
                        }
                        $scope.register();
                    });
                    $scope.setSrc = (tagType, src) => {
                        if (tagType === 'img') {
                            $element.attr('src', src);
                        }
                        else {
                            $element.css('background-image', `url(${src})`);
                        }
                    };
                    $scope.registered = false;
                    $scope.register = () => {
                        let backgroundImage = null;
                        const type = $element.prop('tagName').toLowerCase();
                        if (type !== 'img') {
                            backgroundImage = $element.css('background-image') || null;
                            if (backgroundImage) {
                                backgroundImage = backgroundImage.slice(4, -1).replace(/"/g, '');
                            }
                        }
                        if ($attrs.stratusSrcVersion === 'false' ||
                            $attrs.stratusSrcVersion === false) {
                            $scope.setSrc(type, $attrs.stratusSrc || $attrs.src || backgroundImage);
                            return true;
                        }
                        if ($attrs.stratusSrc === 'false' ||
                            $attrs.stratusSrc === false) {
                            return true;
                        }
                        if ($attrs.stratusSrc === 'true' ||
                            $attrs.stratusSrc === true) {
                            $attrs.stratusSrc = null;
                        }
                        const src = $attrs.stratusSrc || $attrs.src || backgroundImage;
                        let ext = src ? src.match(/\.([0-9a-z]+)(\?.*)?$/i) : null;
                        if (ext) {
                            ext = ext[1] ? ext[1].toLowerCase() : null;
                        }
                        $scope.filter = lodash_1.filter($scope.whitelist, value => ext === value);
                        if (!lodash_1.size($scope.filter)) {
                            $scope.setSrc(type, src);
                            return true;
                        }
                        if (!src) {
                            return false;
                        }
                        if ($scope.registered) {
                            return true;
                        }
                        $scope.registered = true;
                        $element.attr('data-src', src);
                        $scope.group = {
                            method: stratus_1.Stratus.Internals.LoadImage,
                            el: $element,
                            spy: $element.data('spy') ? jquery_1.default($element.data('spy')) : $element
                        };
                        stratus_1.Stratus.RegisterGroup.add('OnScroll', $scope.group);
                        stratus_1.Stratus.Internals.LoadImage($scope.group);
                        stratus_1.Stratus.Internals.OnScroll();
                    };
                }
            });
        }
    };
});

//# sourceMappingURL=src.js.map
