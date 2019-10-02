System.register(["lodash", "stratus", "angular", "angular-material", "@stratusjs/core/misc"], function (exports_1, context_1) {
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
                    this.isNew = this.isNew.bind(this);
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
                isNew() {
                    return !this.getIdentifier();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBY0ksSUFBSSxHQUFRLEdBQUcsRUFBRTtnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3ZDLENBQUMsQ0FBQTtZQUNHLE9BQU8sR0FBUSxHQUFHLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtZQUMxQyxDQUFDLENBQUE7WUFDRyxTQUFTLEdBQVEsR0FBRyxFQUFFO2dCQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7WUFDM0MsQ0FBQyxDQUFBO1lBRUQsUUFBQSxNQUFhLEtBQU0sU0FBUSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUs7Z0JBQy9DLFlBQVksT0FBWSxFQUFFLFVBQWU7b0JBQ3JDLEtBQUssRUFBRSxDQUFBO29CQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO29CQUduQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtvQkFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7b0JBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO29CQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtvQkFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7b0JBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO29CQUd0QixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO29CQUd4RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtvQkFD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LENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNsRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUMxQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMs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