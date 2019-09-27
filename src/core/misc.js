System.register(["lodash"], function (exports_1, context_1) {
    "use strict";
    var _;
    var __moduleName = context_1 && context_1.id;
    function functionName(code) {
        if (_.isEmpty(code)) {
            return null;
        }
        if (!_.isString(code)) {
            code = code.toString();
        }
        code = code.substr('function '.length);
        return code.substr(0, code.indexOf('('));
    }
    exports_1("functionName", functionName);
    function ucfirst(str) {
        if (typeof str !== 'string' || !str) {
            return '';
        }
        return str.charAt(0).toUpperCase() + str.substring(1);
    }
    exports_1("ucfirst", ucfirst);
    function lcfirst(str) {
        if (typeof str !== 'string' || !str) {
            return '';
        }
        return str.charAt(0).toLowerCase() + str.substring(1);
    }
    exports_1("lcfirst", lcfirst);
    function converge(list, method) {
        if (typeof method !== 'string') {
            method = 'min';
        }
        if (method === 'min') {
            const lowest = _.min(list);
            return _.findKey(list, (element) => (element === lowest));
        }
        else if (method === 'radial') {
        }
        else if (method === 'gauss') {
        }
        else {
            return list;
        }
    }
    exports_1("converge", converge);
    function repeat(fn, times) {
        if (typeof fn === 'function' && typeof times === 'number') {
            let i;
            for (i = 0; i < times; i++) {
                fn();
            }
        }
        else {
            console.warn('Underscore cannot repeat function:', fn, 'with number of times:', times);
        }
    }
    exports_1("repeat", repeat);
    function dehydrate(value) {
        return typeof value === 'string' ? value : JSON.stringify(value);
    }
    exports_1("dehydrate", dehydrate);
    function hydrate(str) {
        return isJSON(str) ? JSON.parse(str) : str;
    }
    exports_1("hydrate", hydrate);
    function hydrateString(str) {
        return hydrate(str);
    }
    exports_1("hydrateString", hydrateString);
    function cloneDeep(obj) {
        if (typeof obj !== 'object') {
            return obj;
        }
        const shallow = _.clone(obj);
        _.each(shallow, (value, key) => {
            shallow[key] = _.cloneDeep(value);
        });
        return shallow;
    }
    exports_1("cloneDeep", cloneDeep);
    function extendDeep(target, merger) {
        let shallow = _.clone(target);
        if (merger && typeof merger === 'object') {
            _.each(merger, (value, key) => {
                if (shallow && typeof shallow === 'object') {
                    shallow[key] = (key in shallow) ? extendDeep(shallow[key], merger[key]) : merger[key];
                }
            });
        }
        else {
            shallow = merger;
        }
        return shallow;
    }
    exports_1("extendDeep", extendDeep);
    function getAnchorParams(key, url) {
        const vars = {};
        const tail = window.location.hash;
        if (_.isEmpty(tail)) {
            return vars;
        }
        const digest = /([a-zA-Z]+)(?:\/([0-9]+))?/g;
        let match;
        while (match) {
            match = digest.exec(tail);
            vars[match[1]] = hydrate(match[2]);
        }
        return (typeof key !== 'undefined' && key) ? vars[key] : vars;
    }
    exports_1("getAnchorParams", getAnchorParams);
    function getUrlParams(key, url) {
        const vars = {};
        if (url === undefined) {
            url = window.location.href;
        }
        const anchor = url.indexOf('#');
        if (anchor >= 0) {
            url = url.substring(0, anchor);
        }
        url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, keyChild, value) => {
            vars[keyChild] = hydrate(value);
        });
        return (typeof key !== 'undefined' && key) ? vars[key] : vars;
    }
    exports_1("getUrlParams", getUrlParams);
    function setUrlParams(params, url) {
        if (url === undefined) {
            url = window.location.href;
        }
        if (params === undefined) {
            return url;
        }
        let vars = {};
        const glue = url.indexOf('?');
        const anchor = url.indexOf('#');
        let tail = '';
        if (anchor >= 0) {
            tail = url.substring(anchor, url.length);
            url = url.substring(0, anchor);
        }
        url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
            vars[key] = value;
        });
        vars = _.extend(vars, params);
        return ((glue >= 0 ? url.substring(0, glue) : url) + '?' +
            _.map(vars, (value, key) => key + '=' + dehydrate(value))
                .reduce((memo, value) => memo + '&' + value) + tail);
    }
    exports_1("setUrlParams", setUrlParams);
    function allTrue(values) {
        return (typeof values === 'object') ? _.every(values, (value) => value) : false;
    }
    exports_1("allTrue", allTrue);
    function isJSON(str) {
        try {
            JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        return true;
    }
    exports_1("isJSON", isJSON);
    function isjQuery(element) {
        return typeof jQuery === 'function' && element instanceof jQuery;
    }
    exports_1("isjQuery", isjQuery);
    function startsWith(target, search) {
        return (typeof target === 'string' && typeof search === 'string' &&
            target.substr(0, search.length).toLowerCase() === search.toLowerCase());
    }
    exports_1("startsWith", startsWith);
    function endsWith(target, search) {
        return (typeof target === 'string' && typeof search === 'string' &&
            target.substr(target.length - search.length, target.length).toLowerCase() === search.toLowerCase());
    }
    exports_1("endsWith", endsWith);
    function patch(newData, priorData) {
        if (!_.isObject(newData) || !_.size(newData)) {
            return null;
        }
        const data = {};
        const processor = {};
        if (!_.isObject(priorData) || !_.size(priorData)) {
            console.error('bad prior:', priorData);
        }
        else {
            const detect = (value, key) => {
                processor.eax = processor.ecx ? processor.ecx + '.' + key : key;
                if (_.isObject(value)) {
                    processor.ecx = processor.eax;
                    _.each(value, detect);
                    processor.ecx = processor.ecx === key
                        ? undefined
                        : processor.ecx.substring(0, processor.ecx.lastIndexOf('.'));
                }
                else {
                    processor.ebx = _.reduce(processor.eax.split('.'), (x, a) => x && x[a], priorData);
                    if (processor.ebx !== value) {
                        processor.edx = value;
                    }
                }
                if (processor.edx !== undefined) {
                    data[processor.eax] = value;
                    processor.edx = undefined;
                }
            };
            _.each(newData, detect);
        }
        return (!data || !_.size(data)) ? null : data;
    }
    exports_1("patch", patch);
    function poll(fn, timeout, interval) {
        timeout = timeout || 2000;
        interval = interval || 100;
        const threshold = Number(new Date()) + timeout;
        const check = (resolve, reject) => {
            const cond = fn();
            if (cond) {
                resolve(cond);
            }
            else if (Number(new Date()) < threshold) {
                setTimeout(check, interval, resolve, reject);
            }
            else {
                reject(new Error('Timeout ' + fn));
            }
        };
        return new Promise(check);
    }
    exports_1("poll", poll);
    function strcmp(a, b) {
        if (!a) {
            return 1;
        }
        if (!b) {
            return -1;
        }
        a = a.toString();
        b = b.toString();
        let i;
        let n;
        for (i = 0, n = Math.max(a.length, b.length); i < n && a.charAt(i) === b.charAt(i); ++i) {
        }
        if (i === n) {
            return 0;
        }
        return a.charAt(i) > b.charAt(i) ? -1 : 1;
    }
    exports_1("strcmp", strcmp);
    function truncate(target, limit, suffix) {
        limit = limit || 100;
        suffix = suffix || '...';
        const arr = target.replace(/</g, '\n<')
            .replace(/>/g, '>\n')
            .replace(/\n\n/g, '\n')
            .replace(/^\n/g, '')
            .replace(/\n$/g, '')
            .split('\n');
        let sum = 0;
        let row;
        let cut;
        let add;
        let tagMatch;
        let tagName;
        const tagStack = [];
        for (let i = 0; i < arr.length; i++) {
            row = arr[i];
            const rowCut = row.replace(/[ ]+/g, ' ');
            if (!row.length) {
                continue;
            }
            if (row[0] !== '<') {
                if (sum >= limit) {
                    row = '';
                }
                else if ((sum + rowCut.length) >= limit) {
                    cut = limit - sum;
                    if (row[cut - 1] === ' ') {
                        while (cut) {
                            cut -= 1;
                            if (row[cut - 1] !== ' ') {
                                break;
                            }
                        }
                    }
                    else {
                        add = row.substring(cut).split('').indexOf(' ');
                        if (add !== -1) {
                            cut += add;
                        }
                        else {
                            cut = row.length;
                        }
                    }
                    row = row.substring(0, cut) + suffix;
                    sum = limit;
                }
                else {
                    sum += rowCut.length;
                }
            }
            else if (sum >= limit) {
                tagMatch = row.match(/[a-zA-Z]+/);
                tagName = tagMatch ? tagMatch[0] : '';
                if (tagName) {
                    if (row.substring(0, 2) !== '</') {
                        tagStack.push(tagName);
                        row = '';
                    }
                    else {
                        while (tagStack[tagStack.length - 1] !== tagName &&
                            tagStack.length) {
                            tagStack.pop();
                        }
                        if (tagStack.length) {
                            row = '';
                        }
                        tagStack.pop();
                    }
                }
                else {
                    row = '';
                }
            }
            arr[i] = row;
        }
        return arr.join('\n').replace(/\n/g, '');
    }
    exports_1("truncate", truncate);
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
