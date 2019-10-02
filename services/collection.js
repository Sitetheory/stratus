System.register(["lodash", "stratus", "angular", "angular-material", "stratus.services.model", "@stratusjs/core/misc"], function (exports_1, context_1) {
    "use strict";
    var _, Stratus, angular, stratus_services_model_1, misc_1, http, mdToast, Collection;
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
            function (stratus_services_model_1_1) {
                stratus_services_model_1 = stratus_services_model_1_1;
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
            Collection = class Collection extends Stratus.Prototypes.EventManager {
                constructor(options) {
                    super();
                    this.name = 'Collection';
                    this.target = null;
                    this.direct = false;
                    this.infinite = false;
                    this.threshold = 0.5;
                    this.qualifier = '';
                    this.decay = 0;
                    this.urlRoot = '/Api';
                    this.header = new Stratus.Prototypes.Model();
                    this.meta = new Stratus.Prototypes.Model();
                    this.model = stratus_services_model_1.Model;
                    this.models = [];
                    this.types = [];
                    this.cache = {};
                    this.pending = false;
                    this.error = false;
                    this.completed = false;
                    this.filtering = false;
                    this.paginate = false;
                    this.throttle = _.throttle(this.fetch, 1000);
                    if (options && typeof options === 'object') {
                        angular.extend(this, options);
                    }
                    if (this.target) {
                        this.urlRoot += '/' + misc_1.ucfirst(this.target);
                    }
                    this.serialize = this.serialize.bind(this);
                    this.url = this.url.bind(this);
                    this.inject = this.inject.bind(this);
                    this.sync = this.sync.bind(this);
                    this.fetch = this.fetch.bind(this);
                    this.filter = this.filter.bind(this);
                    this.throttleFilter = this.throttleFilter.bind(this);
                    this.page = this.page.bind(this);
                    this.toJSON = this.toJSON.bind(this);
                    this.add = this.add.bind(this);
                    this.remove = this.remove.bind(this);
                    this.find = this.find.bind(this);
                    this.pluck = this.pluck.bind(this);
                    this.exists = this.exists.bind(this);
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
                url() {
                    const that = this;
                    return that.urlRoot + (that.targetSuffix || '');
                }
                inject(data, type) {
                    if (!_.isArray(data)) {
                        return;
                    }
                    if (this.types && this.types.indexOf(type) === -1) {
                        this.types.push(type);
                    }
                    data.forEach((target) => {
                        this.models.push(new stratus_services_model_1.Model({
                            collection: this,
                            type: type || null
                        }, target));
                    });
                }
                sync(action, data, options) {
                    const that = this;
                    this.pending = true;
                    this.completed = false;
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
                        if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
                            Object.keys(options.headers).forEach((headerKey) => {
                                prototype.headers[headerKey] = options.headers[headerKey];
                            });
                        }
                        const queryHash = `${prototype.method}:${prototype.url}`;
                        const handler = (response) => {
                            if (response.status === 200 && angular.isObject(response.data)) {
                                if (prototype.method === 'GET' && !(queryHash in that.cache)) {
                                    that.cache[queryHash] = response;
                                }
                                that.header.set(response.headers() || {});
                                that.meta.set(response.data.meta || {});
                                that.models = [];
                                const recv = response.data.payload || response.data;
                                if (that.direct) {
                                    that.models = recv;
                                }
                                else if (_.isArray(recv)) {
                                    that.inject(recv);
                                }
                                else if (_.isObject(recv)) {
                                    _.each(recv, that.inject);
                                }
                                else {
                                    console.error('malformed payload:', recv);
                                }
                                that.pending = false;
                                that.completed = true;
                                that.filtering = false;
                                that.paginate = false;
                                that.throttleTrigger('change');
                                resolve(that.models);
                            }
                            else {
                                that.pending = false;
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
                                    error.message = 'Unknown AngularCollection error!';
                                }
                                that.throttleTrigger('change');
                                reject(error);
                            }
                            that.throttleTrigger('change');
                        };
                        if (prototype.method === 'GET' && queryHash in that.cache) {
                            handler(that.cache[queryHash]);
                            return;
                        }
                        http(prototype)
                            .then(handler)
                            .catch((error) => {
                            console.error(`XHR: ${prototype.method} ${prototype.url}`);
                            that.throttleTrigger('change');
                            reject(error);
                            throw error;
                        });
                    });
                }
                fetch(action, data, options) {
                    const that = this;
                    return that.sync(action, data || that.meta.get('api'), options).catch((error) => {
                        mdToast.show(mdToast.simple()
                            .textContent('Failure to Fetch!')
                            .toastClass('errorMessage')
                            .position('top right')
                            .hideDelay(3000));
                        console.error('FETCH:', error);
                    });
                }
                filter(query) {
                    this.filtering = true;
                    this.meta.set('api.q', angular.isDefined(query) ? query : '');
                    this.meta.set('api.p', 1);
                    return this.fetch();
                }
                throttleFilter(query) {
                    this.meta.set('api.q', angular.isDefined(query) ? query : '');
                    const that = this;
                    return new Promise((resolve, reject) => {
                        const request = that.throttle();
                        if (!Stratus.Environment.get('production')) {
                            console.log('request:', request);
                        }
                        request.then((models) => {
                            if (!Stratus.Environment.get('production')) {
                            }
                            resolve(models);
                        }).catch(reject);
                    });
                }
                page(page) {
                    this.paginate = true;
                    this.meta.set('api.p', page);
                    this.fetch();
                    delete this.meta.get('api').p;
                }
                toJSON() {
                    return this.models.map((model) => model.toJSON());
                }
                add(target, options) {
                    if (!angular.isObject(target)) {
                        return;
                    }
                    if (!options || typeof options !== 'object') {
                        options = {};
                    }
                    const that = this;
                    target = (target instanceof stratus_services_model_1.Model) ? target : new stratus_services_model_1.Model({
                        collection: that
                    }, target);
                    that.models.push(target);
                    that.throttleTrigger('change');
                    if (options.save) {
                        target.save();
                    }
                }
                remove(target) {
                    this.models.splice(this.models.indexOf(target), 1);
                    this.throttleTrigger('change');
                    return this;
                }
                find(predicate) {
                    return _.find(this.models, _.isFunction(predicate) ? predicate : (model) => model.get('id') === predicate);
                }
                pluck(attribute) {
                    return _.map(this.models, element => element instanceof stratus_services_model_1.Model ? element.pluck(attribute) : null);
                }
                exists(attribute) {
                    return !!_.reduce(this.pluck(attribute) || [], (memo, data) => memo || angular.isDefined(data));
                }
            };
            exports_1("Collection", Collection);
            Stratus.Services.Collection = [
                '$provide',
                ($provide) => {
                    $provide.factory('Collection', [
                        '$http',
                        '$mdToast',
                        ($http, $mdToast) => {
                            http = $http;
                            mdToast = $mdToast;
                            return Collection;
                        }
                    ]);
                }
            ];
            Stratus.Data.Collection = Collection;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWtCSSxJQUFJLEdBQVEsR0FBRyxFQUFFO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7WUFDdkMsQ0FBQyxDQUFBO1lBQ0csT0FBTyxHQUFRLEdBQUcsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1lBQzFDLENBQUMsQ0FBQTtZQVNELGFBQUEsTUFBYSxVQUFXLFNBQVEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZO2dCQWlDM0QsWUFBWSxPQUFZO29CQUNwQixLQUFLLEVBQUUsQ0FBQTtvQkFoQ1gsU0FBSSxHQUFHLFlBQVksQ0FBQTtvQkFHbkIsV0FBTSxHQUFTLElBQUksQ0FBQTtvQkFDbkIsV0FBTSxHQUFHLEtBQUssQ0FBQTtvQkFDZCxhQUFRLEdBQUcsS0FBSyxDQUFBO29CQUNoQixjQUFTLEdBQUcsR0FBRyxDQUFBO29CQUNmLGNBQVMsR0FBRyxFQUFFLENBQUE7b0JBQ2QsVUFBSyxHQUFHLENBQUMsQ0FBQTtvQkFDVCxZQUFPLEdBQUcsTUFBTSxDQUFBO29CQUdoQixXQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFBO29CQUN2QyxTQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFBO29CQUNyQyxVQUFLLEdBQUcsOEJBQUssQ0FBQTtvQkFDYixXQUFNLEdBQVEsRUFBRSxDQUFBO29CQUNoQixVQUFLLEdBQVEsRUFBRSxDQUFBO29CQUNmLFVBQUssR0FBUSxFQUFFLENBQUE7b0JBR2YsWUFBTyxHQUFHLEtBQUssQ0FBQTtvQkFDZixVQUFLLEdBQUcsS0FBSyxDQUFBO29CQUNiLGNBQVMsR0FBRyxLQUFLLENBQUE7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