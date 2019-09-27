System.register(["lodash", "stratus", "angular", "angular-material", "@stratus/core/misc"], function (exports_1, context_1) {
    "use strict";
    var _, Stratus, angular, misc_1, http, mdToast, rootScope, Model;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
                _ = _1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (angular_1) {
                angular = angular_1;
            },
            function (_2) {
            },
            function (misc_1_1) {
                misc_1 = misc_1_1;
            }
        ],
        execute: function () {
            http = () => {
                console.error('$$http not loaded!');
            };
            mdToast = () => {
                console.error('$$mdToast not loaded!');
            };
            rootScope = () => {
                console.error('$rootScope not loaded!');
            };
            Model = class Model extends Stratus.Prototypes.Model {
                constructor(options, attributes) {
                    super();
                    this.name = 'Model';
                    this.target = null;
                    this.manifest = false;
                    this.stagger = false;
                    this.toast = false;
                    this.urlRoot = '/Api';
                    this.collection = null;
                    _.extend(this, (!options || typeof options !== 'object') ? {} : options);
                    this.identifier = null;
                    this.data = {};
                    this.header = new Stratus.Prototypes.Model();
                    this.meta = new Stratus.Prototypes.Model();
                    if (!_.isEmpty(this.collection)) {
                        if (this.collection.target) {
                            this.target = this.collection.target;
                        }
                        if (this.collection.meta.has('api')) {
                            this.meta.set('api', this.collection.meta.get('api'));
                        }
                    }
                    if (attributes && typeof attributes === 'object') {
                        angular.extend(this.data, attributes);
                    }
                    if (this.target) {
                        this.urlRoot += '/' + misc_1.ucfirst(this.target);
                    }
                    this.pending = false;
                    this.error = false;
                    this.completed = false;
                    this.status = null;
                    this.changed = false;
                    this.saving = false;
                    this.watching = false;
                    this.patch = {};
                    this.bracket = {
                        match: /\[[\d+]]/,
                        search: /\[([\d+])]/g,
                        attr: /(^[^[]+)/
                    };
                    this.watcher = this.watcher.bind(this);
                    this.getIdentifier = this.getIdentifier.bind(this);
                    this.getType = this.getType.bind(this);
                    this.getHash = this.getHash.bind(this);
                    this.url = this.url.bind(this);
                    this.serialize = this.serialize.bind(this);
                    this.sync = this.sync.bind(this);
                    this.fetch = this.fetch.bind(this);
                    this.save = this.save.bind(this);
                    this.specialAction = this.specialAction.bind(this);
                    this.throttleSave = this.throttleSave.bind(this);
                    this.toJSON = this.toJSON.bind(this);
                    this.toPatch = this.toPatch.bind(this);
                    this.buildPath = this.buildPath.bind(this);
                    this.get = this.get.bind(this);
                    this.find = this.find.bind(this);
                    this.set = this.set.bind(this);
                    this.setAttribute = this.setAttribute.bind(this);
                    this.toggle = this.toggle.bind(this);
                    this.pluck = this.pluck.bind(this);
                    this.exists = this.exists.bind(this);
                    this.destroy = this.destroy.bind(this);
                    this.throttle = _.throttle(this.save, 2000);
                    this.initialize = _.once(this.initialize || function () {
                        const that = this;
                        if (this.manifest && !this.getIdentifier()) {
                            this.sync('POST', this.meta.has('api') ? {
                                meta: this.meta.get('api'),
                                payload: {}
                            } : {}).catch((message) => {
                                if (that.toast) {
                                    mdToast.show(mdToast.simple()
                                        .textContent('Failure to Manifest!')
                                        .toastClass('errorMessage')
                                        .position('top right')
                                        .hideDelay(3000));
                                }
                                console.error('MANIFEST:', message);
                            });
                        }
                    });
                    if (!this.stagger) {
                        this.initialize();
                    }
                }
                watcher() {
                    if (this.watching) {
                        return true;
                    }
                    this.watching = true;
                    const that = this;
                    rootScope.$watch(() => that.data, (newData, priorData) => {
                        const patchData = misc_1.patch(newData, priorData);
                        _.each(_.keys(patchData), (key) => {
                            if (_.endsWith(key, '$$hashKey')) {
                                delete patchData[key];
                            }
                        });
                        if (!patchData) {
                            return true;
                        }
                        if (!Stratus.Environment.get('production')) {
                            console.log('Patch:', patchData);
                        }
                        that.changed = true;
                        const version = misc_1.getAnchorParams('version');
                        if ((newData.id && newData.id !== priorData.id) ||
                            (!_.isEmpty(version) && newData.version && parseInt(version, 10) !== newData.version.id)) {
                            window.location.replace(misc_1.setUrlParams({
                                id: newData.id
                            }));
                        }
                        that.patch = _.extend(that.patch, patchData);
                        that.throttleTrigger('change');
                    }, true);
                }
                getIdentifier() {
                    return (this.identifier = this.get('id') || this.identifier);
                }
                getType() {
                    return (this.type = this.type || this.target || 'orphan');
                }
                getHash() {
                    return this.getType() + (_.isNumber(this.getIdentifier()) ? this.getIdentifier().toString() : this.getIdentifier());
                }
                url() {
                    let url = this.getIdentifier() ? this.urlRoot + '/' + this.getIdentifier() : this.urlRoot + (this.targetSuffix || '');
                    if (misc_1.getUrlParams('version')) {
                        url += url.includes('?') ? '&' : '?';
                        url += 'options[version]=' + misc_1.getUrlParams('version');
                    }
                    return url;
                }
                serialize(obj, chain) {
                    const that = this;
                    const str = [];
                    obj = obj || {};
                    angular.forEach(obj, (value, key) => {
                        if (angular.isObject(value)) {
                            if (chain) {
                                key = chain + '[' + key + ']';
                            }
                            str.push(that.serialize(value, key));
                        }
                        else {
                            let encoded = '';
                            if (chain) {
                                encoded += chain + '[';
                            }
                            encoded += key;
                            if (chain) {
                                encoded += ']';
                            }
                            str.push(encoded + '=' + value);
                        }
                    });
                    return str.join('&');
                }
                sync(action, data, options) {
                    const that = this;
                    this.pending = true;
                    return new Promise((resolve, reject) => {
                        action = action || 'GET';
                        options = options || {};
                        const prototype = {
                            method: action,
                            url: that.url(),
                            headers: {}
                        };
                        if (angular.isDefined(data)) {
                            if (action === 'GET') {
                                if (angular.isObject(data) && Object.keys(data).length) {
                                    prototype.url += prototype.url.includes('?') ? '&' : '?';
                                    prototype.url += that.serialize(data);
                                }
                            }
                            else {
                                prototype.headers['Content-Type'] = 'application/json';
                                prototype.data = JSON.stringify(data);
                            }
                        }
                        if (!Stratus.Environment.get('production')) {
                            console.log('Prototype:', prototype);
                        }
                        if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                            Object.keys(options.headers).forEach((headerKey) => {
                                prototype.headers[headerKey] = options.headers[headerKey];
                            });
                        }
                        http(prototype).then((response) => {
                            that.pending = false;
                            that.completed = true;
                            that.status = response.status;
                            that.watcher();
                            setTimeout(() => {
                                that.changed = false;
                                that.throttleTrigger('change');
                                if (that.collection) {
                                    that.collection.throttleTrigger('change');
                                }
                            }, 100);
                            if (response.status === 200 && angular.isObject(response.data)) {
                                that.header.set(response.headers() || {});
                                that.meta.set(response.data.meta || {});
                                const convoy = response.data.payload || response.data;
                                const status = that.meta.get('status');
                                if (that.meta.has('status') && _.first(status).code !== 'SUCCESS') {
                                    that.error = true;
                                }
                                else if (angular.isArray(convoy) && convoy.length) {
                                    that.data = _.first(convoy);
                                    that.error = false;
                                }
                                else if (angular.isObject(convoy) && !angular.isArray(convoy)) {
                                    that.data = convoy;
                                    that.error = false;
                                }
                                else {
                                    that.error = true;
                                }
                                if (!that.error) {
                                    that.saving = false;
                                    that.patch = {};
                                }
                                resolve(that.data);
                            }
                            else {
                                that.error = true;
                                const error = new Stratus.Prototypes.Error();
                                error.payload = _.isObject(response.data) ? response.data : response;
                                if (response.statusText && response.statusText !== 'OK') {
                                    error.message = response.statusText;
                                }
                                else if (!_.isObject(response.data)) {
                                    error.message = `Invalid Payload: ${prototype.method} ${prototype.url}`;
                                }
                                else {
                                    error.message = 'Unknown Model error!';
                                }
                                reject(error);
                            }
                        }).catch((message) => {
                            that.status = 500;
                            that.error = true;
                            console.error(`XHR: ${prototype.method} ${prototype.url}`, message);
                            reject.call(message);
                        });
                    });
                }
                fetch(action, data, options) {
                    const that = this;
                    return this.sync(action, data || this.meta.get('api'), options)
                        .catch((message) => {
                        if (that.toast) {
                            mdToast.show(mdToast.simple()
                                .textContent('Failure to Fetch!')
                                .toastClass('errorMessage')
                                .position('top right')
                                .hideDelay(3000));
                        }
                        that.status = 500;
                        that.error = true;
                        console.error('FETCH:', message);
                    });
                }
                save() {
                    const that = this;
                    that.saving = true;
                    return that.sync(that.getIdentifier() ? 'PUT' : 'POST', that.toJSON({
                        patch: true
                    }))
                        .catch((message) => {
                        if (that.toast) {
                            mdToast.show(mdToast.simple()
                                .textContent('Failure to Save!')
                                .toastClass('errorMessage')
                                .position('top right')
                                .hideDelay(3000));
                        }
                        that.error = true;
                        console.error('SAVE:', message);
                    });
                }
                specialAction(action) {
                    const that = this;
                    that.meta.temp('api.options.apiSpecialAction', action);
                    that.save();
                    if (that.meta.get('api') &&
                        Object.prototype.hasOwnProperty.call(that.meta.get('api'), 'options') &&
                        Object.prototype.hasOwnProperty.call(that.meta.get('api').options, 'apiSpecialAction')) {
                        delete that.meta.get('api').options.apiSpecialAction;
                    }
                }
                throttleSave() {
                    const that = this;
                    return new Promise((resolve, reject) => {
                        const request = that.throttle();
                        console.log('throttle request:', request);
                        request.then((data) => {
                            console.log('throttle received:', data);
                            resolve(data);
                        }).catch(reject);
                    });
                }
                toJSON(options) {
                    let data;
                    data = this.data;
                    data = this.meta.has('api') ? {
                        meta: this.meta.get('api'),
                        payload: data
                    } : data;
                    if (this.meta.size() > 0) {
                        this.meta.clearTemp();
                    }
                    return data;
                }
                toPatch() {
                    return this.patch;
                }
                buildPath(path) {
                    const acc = [];
                    if (!_.isString(path)) {
                        return acc;
                    }
                    const that = this;
                    let cur;
                    let search;
                    _.each(path.split('.'), (link) => {
                        if (link.match(that.bracket.match)) {
                            cur = that.bracket.attr.exec(link);
                            if (cur !== null) {
                                acc.push(cur[1]);
                                cur = null;
                            }
                            else {
                                cur = false;
                            }
                            search = that.bracket.search.exec(link);
                            while (search !== null) {
                                if (cur !== false) {
                                    cur = parseInt(search[1], 10);
                                    if (!isNaN(cur)) {
                                        acc.push(cur);
                                    }
                                    else {
                                        cur = false;
                                    }
                                }
                                search = that.bracket.search.exec(link);
                            }
                        }
                        else {
                            acc.push(link);
                        }
                    });
                    return acc;
                }
                get(attr) {
                    if (typeof attr !== 'string' || !this.data || typeof this.data !== 'object') {
                        return undefined;
                    }
                    else {
                        return this.buildPath(attr).reduce((attrs, link) => attrs && attrs[link], this.data);
                    }
                }
                find(attr, key, value) {
                    if (typeof attr === 'string') {
                        attr = this.get(attr);
                    }
                    if (!(attr instanceof Array)) {
                        return attr;
                    }
                    else {
                        return attr.find((obj) => obj[key] === value);
                    }
                }
                set(attr, value) {
                    const that = this;
                    if (!attr) {
                        console.warn('No attr for model.set()!');
                        return this;
                    }
                    if (typeof attr === 'object') {
                        _.each(attr, (valueChain, attrChain) => {
                            that.setAttribute(attrChain, valueChain);
                        });
                        return this;
                    }
                    this.setAttribute(attr, value);
                    return this;
                }
                setAttribute(attr, value) {
                    if (typeof attr !== 'string') {
                        console.warn('Malformed attr for model.setAttribute()!');
                        return false;
                    }
                    if (_.includes(attr, '.') || _.includes(attr, '[')) {
                        let future;
                        this.buildPath(attr)
                            .reduce((attrs, link, index, chain) => {
                            future = index + 1;
                            if (!_.has(attrs, link)) {
                                attrs[link] = _.has(chain, future) &&
                                    _.isNumber(chain[future]) ? [] : {};
                            }
                            if (!_.has(chain, future)) {
                                attrs[link] = value;
                            }
                            return attrs && attrs[link];
                        }, this.data);
                    }
                    else {
                        this.data[attr] = value;
                    }
                    this.throttleTrigger('change', this);
                    this.throttleTrigger(`change:${attr}`, value);
                }
                toggle(attribute, item, options) {
                    const that = this;
                    if (angular.isObject(options) &&
                        angular.isDefined(options.multiple) &&
                        angular.isUndefined(options.strict)) {
                        options.strict = true;
                    }
                    options = _.extend({
                        multiple: true
                    }, angular.isObject(options) ? options : {});
                    const request = attribute.split('[].');
                    let target = that.get(request.length > 1 ? request[0] : attribute);
                    if (angular.isUndefined(target) ||
                        (options.strict && angular.isArray(target) !==
                            options.multiple)) {
                        target = options.multiple ? [] : null;
                        that.set(request.length > 1 ? request[0] : attribute, target);
                    }
                    if (angular.isArray(target)) {
                        if (angular.isUndefined(item)) {
                            that.set(attribute, null);
                        }
                        else if (!that.exists(attribute, item)) {
                            target.push(item);
                        }
                        else {
                            _.each(target, (element, key) => {
                                const child = (request.length > 1 &&
                                    angular.isObject(element) && request[1] in element)
                                    ? element[request[1]]
                                    : element;
                                const childId = (angular.isObject(child) && child.id)
                                    ? child.id
                                    : child;
                                const itemId = (angular.isObject(item) && item.id)
                                    ? item.id
                                    : item;
                                if (childId === itemId || (angular.isString(childId) && angular.isString(itemId) && misc_1.strcmp(childId, itemId) === 0)) {
                                    target.splice(key, 1);
                                }
                            });
                        }
                    }
                    else if (typeof target === 'object' || typeof target === 'number') {
                        that.set(attribute, !that.exists(attribute, item) ? item : null);
                    }
                    else if (angular.isUndefined(item)) {
                        that.set(attribute, !target);
                    }
                    return that.get(attribute);
                }
                pluck(attr) {
                    const that = this;
                    if (typeof attr !== 'string' || attr.indexOf('[].') === -1) {
                        return that.get(attr);
                    }
                    const request = attr.split('[].');
                    if (request.length <= 1) {
                        return undefined;
                    }
                    attr = that.get(request[0]);
                    if (!attr || !angular.isArray(attr)) {
                        return undefined;
                    }
                    const list = [];
                    attr.forEach((element) => {
                        if (!angular.isObject(element) || !(request[1] in element)) {
                            return;
                        }
                        list.push(element[request[1]]);
                    });
                    if (!list.length) {
                        return undefined;
                    }
                    return list;
                }
                exists(attribute, item) {
                    const that = this;
                    if (!item) {
                        attribute = that.get(attribute);
                        return typeof attribute !== 'undefined' && attribute;
                    }
                    else if (typeof attribute === 'string' && item) {
                        attribute = that.pluck(attribute);
                        if (angular.isArray(attribute)) {
                            return typeof attribute.find((element) => element === item || ((angular.isObject(element) && element.id && element.id === item) || _.isEqual(element, item))) !== 'undefined';
                        }
                        else {
                            return attribute === item || (angular.isObject(attribute) && attribute.id && (_.isEqual(attribute, item) || attribute.id === item));
                        }
                    }
                    return false;
                }
                destroy() {
                    const that = this;
                    if (this.collection) {
                        this.collection.remove(this);
                    }
                    if (this.getIdentifier()) {
                        this.sync('DELETE', {}).catch((message) => {
                            if (that.toast) {
                                mdToast.show(mdToast.simple()
                                    .textContent('Failure to Delete!')
                                    .toastClass('errorMessage')
                                    .position('top right')
                                    .hideDelay(3000));
                            }
                            console.error('DESTROY:', message);
                        });
                    }
                }
            };
            exports_1("Model", Model);
            Stratus.Services.Model = [
                '$provide', ($provide) => {
                    $provide.factory('Model', [
                        '$http',
                        '$mdToast',
                        '$rootScope',
                        ($http, $mdToast, $rootScope) => {
                            http = $http;
                            mdToast = $mdToast;
                            rootScope = $rootScope;
                            return Model;
                        }
                    ]);
                }
            ];
            Stratus.Data.Model = Model;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBY0ksSUFBSSxHQUFRLEdBQUcsRUFBRTtnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3ZDLENBQUMsQ0FBQTtZQUNHLE9BQU8sR0FBUSxHQUFHLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtZQUMxQyxDQUFDLENBQUE7WUFDRyxTQUFTLEdBQVEsR0FBRyxFQUFFO2dCQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7WUFDM0MsQ0FBQyxDQUFBO1lBRUQsUUFBQSxNQUFhLEtBQU0sU0FBUSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUs7Z0JBQy9DLFlBQVksT0FBWSxFQUFFLFVBQWU7b0JBQ3JDLEtBQUssRUFBRSxDQUFBO29CQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO29CQUduQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtvQkFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7b0JBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO29CQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtvQkFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7b0JBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO29CQUd0QixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO29CQUd4RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtvQkFD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LENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNsRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUMxQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMs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