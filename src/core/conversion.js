System.register(["lodash"], function (exports_1, context_1) {
    "use strict";
    var _;
    var __moduleName = context_1 && context_1.id;
    function camelToSnake(target) {
        return target.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }
    exports_1("camelToSnake", camelToSnake);
    function snakeToCamel(target) {
        return target.replace(/(_\w)/g, (m) => m[1].toUpperCase());
    }
    exports_1("snakeToCamel", snakeToCamel);
    function camelToKebab(target) {
        return target.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    exports_1("camelToKebab", camelToKebab);
    function kebabToCamel(target) {
        return target.replace(/(-\w)/g, (m) => m[1].toUpperCase());
    }
    exports_1("kebabToCamel", kebabToCamel);
    function sanitize(data) {
        if (!_.isObject(data)) {
            return data;
        }
        _.each(data, (value, key, list) => {
            if (_.size(value) > 0) {
                return;
            }
            delete list[key];
        });
        return data;
    }
    exports_1("sanitize", sanitize);
    function seconds(str) {
        if (typeof str === 'number') {
            return str;
        }
        if (typeof str !== 'string') {
            return null;
        }
        const timePairs = str.match(/([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/gi);
        if (!_.size(timePairs)) {
            return null;
        }
        const digest = /([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/i;
        let time;
        let unit;
        let value;
        let data = 0;
        _.each(timePairs, (timePair) => {
            time = digest.exec(timePair);
            value = parseFloat(time[1]);
            unit = time[2];
            if (isNaN(value)) {
                return;
            }
            switch (time[2]) {
                case 's':
                    unit = 1;
                    break;
                case 'm':
                    unit = 60;
                    break;
                case 'h':
                    unit = 3.6e+3;
                    break;
                case 'd':
                    unit = 8.64e+4;
                    break;
                case 'w':
                    unit = 6.048e+5;
                    break;
                case 'y':
                    unit = 3.1558149504e+7;
                    break;
                default:
                    unit = 0;
            }
            data += value * unit;
        });
        return data;
    }
    exports_1("seconds", seconds);
    return {
        setters: [
            function (_1) {
                _ = _1;
            }
        ],
        execute: function () {
        }
    };
});
