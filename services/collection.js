System.register(["lodash", "stratus", "angular", "angular-material", "stratus.services.model", "@stratus/core/misc"], function (exports_1, context_1) {
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
                        http(prototype).then((response) => {
                            if (response.status === 200 && angular.isObject(response.data)) {
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
                        }).catch((error) => {
                            console.error('XHR: ' + prototype.method + ' ' + prototype.url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWlCSSxJQUFJLEdBQVEsR0FBRyxFQUFFO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7WUFDdkMsQ0FBQyxDQUFBO1lBQ0csT0FBTyxHQUFRLEdBQUcsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1lBQzFDLENBQUMsQ0FBQTtZQUVELGFBQUEsTUFBYSxVQUFXLFNBQVEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZO2dCQWdDM0QsWUFBWSxPQUFZO29CQUNwQixLQUFLLEVBQUUsQ0FBQTtvQkEvQlgsU0FBSSxHQUFHLFlBQVksQ0FBQTtvQkFHbkIsV0FBTSxHQUFTLElBQUksQ0FBQTtvQkFDbkIsV0FBTSxHQUFHLEtBQUssQ0FBQTtvQkFDZCxhQUFRLEdBQUcsS0FBSyxDQUFBO29CQUNoQixjQUFTLEdBQUcsR0FBRyxDQUFBO29CQUNmLGNBQVMsR0FBRyxFQUFFLENBQUE7b0JBQ2QsVUFBSyxHQUFHLENBQUMsQ0FBQTtvQkFDVCxZQUFPLEdBQUcsTUFBTSxDQUFBO29CQUdoQixXQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFBO29CQUN2QyxTQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFBO29CQUNyQyxVQUFLLEdBQUcsOEJBQUssQ0FBQTtvQkFDYixXQUFNLEdBQVEsRUFBRSxDQUFBO29CQUNoQixVQUFLLEdBQVEsRUFBRSxDQUFBO29CQUdmLFlBQU8sR0FBRyxLQUFLLENBQUE7b0JBQ2YsVUFBSyxHQUFHLEtBQUssQ0FBQTtvQkFDYixjQUFTLEdBQUcsS0FBSyxDQUFBO29CQUdqQixjQUFTLEdBQUcsS0FBSyxDQUFB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