//     Stratus.Services.Model.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // Angular Model Service
    // ---------------------

    // This Model Service handles data binding for a single object with the $http Service
    Stratus.Services.Model = ['$provide', function ($provide) {
        $provide.factory('model', ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
            return function (options, attributes) {

                // Environment
                this.target = null;
                this.manifest = false;
                this.stagger = false;
                if (!options || typeof options !== 'object') options = {};
                angular.extend(this, options);

                // Infrastructure
                this.urlRoot = '/Api';
                this.data = {};
                this.dataDetails = {};

                // Handle Collections & Meta
                this.meta = new Stratus.Prototypes.Model();
                if (_.has(this, 'collection')) {
                    if (this.collection.target) this.target = this.collection.target;
                    if (this.collection.meta.has('api')) this.meta.set('api', this.collection.meta.get('api'));
                }

                // Handle Attributes (Typically from Collection Hydration)
                if (attributes && typeof attributes === 'object') {
                    angular.extend(this.data, attributes);
                }

                // Generate URL
                if (this.target) {
                    this.urlRoot += '/' + _.ucfirst(this.target);
                }

                // XHR Flags
                this.pending = false;
                this.error = false;
                this.completed = false;

                // Auto-Saving Flags
                this.changing = false;
                this.changed = 0;
                this.saving = false;
                this.watching = false;

                // Auto-Saving Logic
                this.patch = {};

                // Contextual Hoisting
                var that = this;

                // Watch for Data Changes
                this.watcher = function () {
                    //alert("I am ");
                    
                    that.getDetails();
                    //console.log(that.dataDetails);

                    if (that.watching) return true;
                    that.watching = true;
                    $rootScope.$watch(function () {
                        return that.data;
                    }, function (newData, priorData) {
                        var patch = _.patch(newData, priorData);
                        if (patch) {
                            if (newData.id && newData.id !== priorData.id) {
                                window.location.replace(
                                    Stratus.Internals.SetUrlParams({ id: newData.id })
                                );
                            }
                            that.patch = _.extend(that.patch, patch);
                            that.changing = true;
                            that.changed = 1;
                        }
                    }, true);
                };

                /**
                 * @returns {*}
                 */
                this.url = function () {
                    return that.get('id') ? that.urlRoot + '/' + that.get('id') : that.urlRoot;
                };

                /**
                 * @param obj
                 * @param chain
                 * @returns {string}
                 */
                this.serialize = function (obj, chain) {
                    var str = [];
                    obj = obj || {};
                    angular.forEach(obj, function (value, key) {
                        if (angular.isObject(value)) {
                            str.push(that.serialize(value, key));
                        } else {
                            var encoded = '';
                            if (chain) encoded += chain + '[';
                            encoded += key;
                            if (chain) encoded += ']';
                            str.push(encoded + '=' + value);
                        }
                    });
                    return str.join('&');
                };

                this.getDetails = function(){
                    var get_version = that.data.version;
                    if(typeof get_version !== 'undefined'){
                        var template_type = that.data.version.template;
                        var layout_type = that.data.version.layout;
                        if(typeof template_type !== 'undefined'){
                            var data_url = "/Api/Template/"+that.data.version.template.id
                        }
                        if(typeof layout_type !== 'undefined'){

                            var data_url = "/Api/Layout/"+that.data.version.layout.id
                            //alert(data_url);
                        }
                        if(typeof template_type !== 'undefined' || typeof layout_type !== 'undefined'){
                           that.dataDetails = {};
                           action =  'GET';
                            var prototype1 = {
                                method: action,
                                url: data_url,
                                headers: {}
                            };
                            $http(prototype1).then(function (response) {
                                if (response.status === 200 && angular.isObject(response.data)) {
                                    var convoyDetails =  response.data.payload || response.data;
                                    console.log(convoyDetails);
                                    that.dataDetails.name = convoyDetails.name;
                                    that.dataDetails.description = convoyDetails.description;
                                          
                                } 
                            }); 
                        }
                    }
                }

                // TODO: Abstract this deeper
                /**
                 * @param action
                 * @param data
                 * @returns {*}
                 */
                this.sync = function (action, data) {
                    this.pending = true;
                    return $q(function (resolve, reject) {
                        action = action || 'GET';
                        var prototype = {
                            method: action,
                            url: that.url(),
                            headers: {}
                        };
                        if (angular.isDefined(data)) {
                            if (action === 'GET') {
                                if (angular.isObject(data) && Object.keys(data).length) {
                                    prototype.url += '?' + that.serialize(data);
                                }
                            } else {
                                prototype.headers['Content-Type'] = 'application/json';
                                prototype.data = JSON.stringify(data);
                            }
                        }
                        $http(prototype).then(function (response) {
                            if (response.status === 200 && angular.isObject(response.data)) {
                                // TODO: Make this into an over-writable function
                                // Data
                                that.meta.set(response.data.meta || {});
                                var convoy = response.data.payload || response.data;
                                if (angular.isArray(convoy) && convoy.length) {
                                    that.data = _.first(that.data);
                                    that.error = false;
                                } else if (angular.isObject(convoy)) {
                                    that.data = convoy;
                                    that.error = false;
                                } else {
                                    that.error = true;
                                }

                                if (!that.error) {
                                    // XHR Flags
                                    that.pending = false;
                                    that.completed = true;

                                    // Auto-Saving Settings
                                    that.saving = false;
                                    that.patch = {};

                                    // Begin Watching
                                    that.watcher();
                                }

                                // Promise
                                resolve(that.data);
                            } else {
                                // XHR Flags
                                that.pending = false;
                                that.error = true;

                                // Promise
                                reject((response.statusText && response.statusText !== 'OK') ? response.statusText : (
                                    angular.isObject(response.data) ? response.data : (
                                    'Invalid Payload: ' + prototype.method + ' ' + prototype.url)
                                ));
                            }
                        }).catch(reject);
                    });
                };

                /**
                 * @param action
                 * @param data
                 * @returns {*}
                 */
                this.fetch = function (action, data) {
                    return that.sync(action, data || that.meta.get('api')).catch(function (message) {
                        console.error('FETCH:', message);
                    });
                };

                /**
                 * @returns {*}
                 */
                this.save = function () {
                    that.changing = false;
                    that.saving = true;
                    return that.sync(that.get('id') ? 'PUT' : 'POST', that.toJSON({
                        patch: true
                    })).catch(function (message) {
                        console.error('SAVE:', message);
                    });
                };

                // Attribute Functions

                /**
                 * @param options
                 * @returns {{meta, payload}}
                 */
                this.toJSON = function (options) {
                    /* *
                    options = _.extend(options || {}, {
                        patch: false
                    });
                    /* */
                    var data;

                    // options.patch ? that.toPatch() :
                    data = that.data;
                    data = that.meta.has('api') ? {
                        meta: that.meta.get('api'),
                        payload: data
                    } : data;
                    if (that.meta.size() > 0) {
                        that.meta.clearTemp();
                    }
                    return data;
                };

                /**
                 * @returns {null}
                 */
                that.toPatch = function () {
                    return that.patch;
                };

                /**
                 * @param attribute
                 * @returns {*}
                 */
                this.get = function (attribute) {

                    if (typeof attribute !== 'string' || !that.data || typeof that.data !== 'object') {
                        return undefined;
                    } else {
                        return attribute.split('.').reduce(function (attributes, a) {
                            return attributes && attributes[a];
                        }, that.data);
                    }
                };

                /**
                 * @param attr
                 * @param value
                 */
                this.set = function (attr, value) {
                    if (attr && typeof attr === 'object') {
                        _.each(attr, function (value, attr) {
                            that.setAttribute(attr, value);
                        }, this);
                    } else {
                        that.setAttribute(attr, value);
                    }
                };

                /**
                 * @param attr
                 * @param value
                 */
                this.setAttribute = function (attr, value) {
                    if (typeof attr === 'string' && attr.indexOf('.') !== -1) {
                        var reference = that.data;
                        var chain = attr.split('.');
                        _.find(_.initial(chain), function (link) {
                            if (!_.has(reference, link) || !reference[link]) reference[link] = {};
                            if (typeof reference !== 'undefined' && reference && typeof reference === 'object') {
                                reference = reference[link];
                            } else {
                                reference = that.data;
                                return true;
                            }
                        }, this);
                        if (!_.isEqual(reference, that.data)) {
                            var link = _.last(chain);
                            if (reference && typeof reference === 'object') {
                                reference[link] = value;
                            }
                        }
                    } else {
                        that.data[attr] = value;
                    }
                    /* TODO: that.trigger('change:' + attr, value); */
                };

                /**
                 * @param attribute
                 * @param item
                 * @param options
                 * @returns {*}
                 */
                this.toggle = function (attribute, item, options) {

                    if (angular.isObject(options) && angular.isDefined(options.multiple) && angular.isUndefined(options.strict)) {
                        options.strict = true;
                    }
                    options = _.extend({
                        multiple: true
                    }, angular.isObject(options) ? options : {});
                    /* After plucking has been tested, remove this log *
                    console.log('toggle:', attribute, item, options);
                    /* */
                    var request = attribute.split('[].');
                    var target = that.get(request.length > 1 ? request[0] : attribute);
                    if (angular.isUndefined(target) || (options.strict && angular.isArray(target) !== options.multiple)) {
                        target = options.multiple ? [] : null;
                        that.set(request.length > 1 ? request[0] : attribute, target);
                    }
                    if (angular.isUndefined(item)) {
                        that.set(attribute, !target);
                    } else if (angular.isArray(target)) {
                        /* This is disabled, since hydration should not be forced by default *
                        var hydrate = {};
                        if (request.length > 1) {
                            hydrate[request[1]] = { id: item };
                        } else {
                            hydrate.id = item;
                        }
                        /* */
                        if (!that.exists(attribute, item)) {
                            target.push(item);
                        } else {
                            _.each(target, function (element, key) {
                                var child = (request.length > 1 && angular.isObject(element) && request[1] in element) ? element[request[1]] : element;
                                var childId = (angular.isObject(child) && child.id) ? child.id : child;
                                var itemId = (angular.isObject(item) && item.id) ? item.id : item;
                                if (childId === itemId || (angular.isString(childId) && angular.isString(itemId) && _.strcmp(childId, itemId) === 0)) {
                                    target.splice(key, 1);
                                }
                            });
                        }
                    } else if (typeof target === 'object' || typeof target === 'number') {
                        // (item && typeof item !== 'object') ? { id: item } : item
                        that.set(attribute, !that.exists(attribute, item) ? item : null);
                    }
                    if(attribute == "version.template" || attribute == "version.layout"){
                        that.dataDetails = {};
                        that.dataDetails.name = item.name;
                        that.dataDetails.description = item.description;
                    }
                    
                    return that.get(attribute);
                };

                /**
                 * @param attribute
                 * @returns {*}
                 */
                this.pluck = function (attribute) {
                    if (typeof attribute === 'string' && attribute.indexOf('[].') > -1) {
                        var request = attribute.split('[].');
                        if (request.length > 1) {
                            attribute = that.get(request[0]);
                            if (attribute && angular.isArray(attribute)) {
                                var list = [];
                                attribute.forEach(function (element) {
                                    if (angular.isObject(element) && request[1] in element) {
                                        list.push(element[request[1]]);
                                    }
                                });
                                if (list.length) {
                                    return list;
                                }
                            }
                        }
                    } else {
                        return that.get(attribute);
                    }
                    return undefined;
                };

                /**
                 * @param attribute
                 * @param item
                 * @returns {boolean}
                 */
                this.exists = function (attribute, item) {
                    if (!item) {
                        attribute = that.get(attribute);
                        return typeof attribute !== 'undefined' && attribute;
                    } else if (typeof attribute === 'string' && item) {
                        attribute = that.pluck(attribute);
                        if (angular.isArray(attribute)) {
                            return typeof attribute.find(function (element) {
                                    return element === item || (
                                        angular.isObject(element) && element.id && element.id === item || _.isEqual(element, item)
                                    );
                                }) !== 'undefined';
                        } else {
                            return attribute === item || (
                                    angular.isObject(attribute) && attribute.id && (
                                        _.isEqual(attribute, item) || attribute.id === item
                                    )
                                );
                        }
                    }
                    return false;
                };

                /**
                 * @type {Function}
                 */
                this.destroy = function () {
                    if (that.collection) {
                        that.collection.remove(that);
                    }
                    if (that.get('id')) {
                        that.sync('DELETE', {}).catch(function (message) {
                            console.error('DESTROY:', message);
                        });
                    }
                };

                /**
                 * @type {Function}
                 */
                this.initialize = _.once(this.initialize || function () {
                        if (that.manifest && !that.get('id')) {
                            that.sync('POST', that.meta.has('api') ? {
                                meta: that.meta.get('api'),
                                payload: {}
                            } : {}).catch(function (message) {
                                console.error('MANIFEST:', message);
                            });
                        }
                    });
                if (!that.stagger) {
                    this.initialize();
                }
            };
        }]);
    }];

}));
