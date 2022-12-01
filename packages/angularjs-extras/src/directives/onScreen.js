System.register(["lodash", "@stratusjs/runtime/stratus", "jquery", "@stratusjs/core/misc"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, stratus_1, jquery_1, misc_1, name;
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
            },
            function (misc_1_1) {
                misc_1 = misc_1_1;
            }
        ],
        execute: function () {
            name = 'onScreen';
            stratus_1.Stratus.Directives.OnScreen = () => ({
                restrict: 'A',
                scope: {
                    onScreen: '@onScreen',
                    stratusOnScreen: '@stratusOnScreen',
                    offScreen: '@offScreen',
                    spy: '@spy',
                    target: '@target',
                    partial: '@partial',
                    update: '@update',
                    animation: '@animation',
                    event: '@event',
                    offset: '@offset',
                    reset: '@reset'
                },
                link: ($attrs, $element, $scope) => {
                    $scope.uid = lodash_1.uniqueId(lodash_1.snakeCase(name) + '_');
                    stratus_1.Stratus.Instances[$scope.uid] = $scope;
                    $scope.elementId = $attrs.elementId || $scope.uid;
                    $scope.initialized = false;
                    const event = $attrs.event ? $attrs.event.split(' ') : [];
                    const target = $attrs.target ? jquery_1.default($attrs.target) : $element;
                    let spy = $attrs.spy ? jquery_1.default($attrs.spy) : $element;
                    if (!spy.length) {
                        spy = $element;
                    }
                    let partial = misc_1.hydrate($attrs.partial);
                    if (typeof partial !== 'boolean') {
                        partial = true;
                    }
                    let update = misc_1.hydrate($attrs.update);
                    if (typeof update !== 'number') {
                        update = 100;
                    }
                    let animation = misc_1.hydrate($attrs.animation);
                    if (typeof animation !== 'number') {
                        animation = false;
                    }
                    let lastUpdate = 0;
                    let isWaiting = false;
                    let wasOnScreen = false;
                    let wipeJob = null;
                    const offset = misc_1.hydrate($attrs.offset) || 0;
                    const reset = misc_1.hydrate($attrs.reset) || 0;
                    const onScreen = () => $attrs.onScreen && typeof $attrs.onScreen === 'function' ? $attrs.onScreen() : true;
                    const offScreen = () => $attrs.offScreen && typeof $attrs.offScreen === 'function' ? $attrs.offScreen() : true;
                    const isOnScreen = () => {
                        if (isWaiting) {
                            return wasOnScreen;
                        }
                        const calculation = (new Date()).getTime();
                        if (calculation - lastUpdate > update) {
                            lastUpdate = calculation;
                            wasOnScreen = stratus_1.Stratus.Internals.IsOnScreen(spy, offset, partial);
                        }
                        else {
                            isWaiting = true;
                            setTimeout(() => {
                                isWaiting = false;
                                calculate();
                            }, ((lastUpdate + update) - calculation) + 1);
                        }
                        return wasOnScreen;
                    };
                    const wipe = (request) => {
                        if (!animation) {
                            return;
                        }
                        if (lodash_1.isUndefined(request)) {
                            if (lodash_1.isNumber(wipeJob)) {
                                clearTimeout(wipeJob);
                            }
                            wipeJob = setTimeout(() => {
                                wipe(true);
                            }, animation);
                        }
                        else {
                            target.removeClass('reveal conceal');
                        }
                    };
                    const calculate = () => {
                        if (event.indexOf('reset') !== -1 &&
                            ((reset > 0 && $element.offset().top <= reset) ||
                                jquery_1.default(stratus_1.Stratus.Environment.get('viewPort') || window).scrollTop() <= 0)) {
                            target.removeClass('on-screen off-screen scroll-up scroll-down reveal conceal');
                            target.addClass('reset');
                            return;
                        }
                        if (isOnScreen()) {
                            if (!target.hasClass('on-screen')) {
                                target.addClass('on-screen on-screen-init');
                            }
                            if (target.hasClass('off-screen')) {
                                target.removeClass('off-screen');
                            }
                            onScreen();
                            return true;
                        }
                        else {
                            if (target.hasClass('on-screen')) {
                                target.removeClass('on-screen');
                            }
                            if (!target.hasClass('off-screen')) {
                                target.addClass('off-screen');
                            }
                            offScreen();
                            return false;
                        }
                    };
                    stratus_1.Stratus.Internals.OnScroll();
                    stratus_1.Stratus.Environment.on('change:viewPortChange', calculate);
                    stratus_1.Stratus.Environment.on('change:lastScroll', () => {
                        const lastScroll = stratus_1.Stratus.Environment.get('lastScroll');
                        if (lastScroll === 'down' && !target.hasClass('reset')) {
                            if (!target.hasClass('scroll-down')) {
                                target.addClass('scroll-down');
                            }
                            if (target.hasClass('scroll-up')) {
                                target.removeClass('scroll-up');
                            }
                            if (animation && stratus_1.Stratus.Internals.IsOnScreen(spy, offset, partial)) {
                                if (target.hasClass('reveal')) {
                                    target.removeClass('reveal');
                                }
                                if (!target.hasClass('conceal')) {
                                    target.addClass('conceal');
                                }
                                wipe();
                            }
                        }
                        if (lastScroll === 'up') {
                            if (!target.hasClass('scroll-up')) {
                                target.addClass('scroll-up');
                            }
                            if (target.hasClass('scroll-down')) {
                                target.removeClass('scroll-down');
                            }
                            if (target.hasClass('reset')) {
                                target.removeClass('reset');
                            }
                            if (animation) {
                                if (!target.hasClass('reveal')) {
                                    target.addClass('reveal');
                                }
                                if (target.hasClass('conceal')) {
                                    target.removeClass('conceal');
                                }
                                wipe();
                            }
                        }
                    });
                    const limit = 8;
                    let i = 0;
                    const delayed = () => {
                        if (++i > limit) {
                            return;
                        }
                        if (calculate()) {
                            return;
                        }
                        setTimeout(delayed, 250);
                    };
                    delayed();
                }
            });
        }
    };
});

//# sourceMappingURL=onScreen.js.map
