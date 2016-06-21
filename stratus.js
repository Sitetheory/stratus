//     Stratus.js 1.0

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

// Overview
// --------

// Using a mixture of synchronous and asynchronous code, which begins my organizing and ordering
// tasks through a forest->tree building process, fragmenting each tree into its own asynchronous
// routines, which query the API and use a passive, event-driven infrastructure to maintain
// responsiveness and speed in correlation with a user's input.

// Require.js
// -------------

// We use this function factory to ensure that the Stratus Layer can work outside of a
// Require.js environment.  This function needs to exist on every module defined within
// the Stratus environment to ensure its acceptance regardless of page context.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['text', 'jquery', 'underscore', 'backbone', 'bowser', 'bootbox', 'promise', 'backbone.relational', 'jquery-cookie', 'jquery-toaster'], function (text, $, _, Backbone, bowser, bootbox) {
            return (root.Stratus = factory(text, $, _, Backbone, bowser, bootbox));
        });
    } else {
        root.Stratus = factory(root.text, root.$, root._, root.Backbone, root.bowser, root.bootbox);
    }
}(this, function (text, $, _, Backbone, bowser, bootbox) {

    // Underscore Settings
    // -------------------

    // These template settings intend to mimic a Twig-like bracket format for internal
    // Javascript templates.  The '{% %}' tag Evaluates anything inside as if it were
    // native Javascript code.  The '{{ }}' tag Interpolates any variables inside for
    // use with String Interpolation.  The '{# #}' tag Interpolates any variables and
    // HTML Escapes the output for use with HTML Escaped String Interpolation.
    /**
     * @type {{evaluate: RegExp, interpolate: RegExp, escape: RegExp}}
     */
    _.templateSettings = {
        evaluate: /\{%(.+?)%\}/g,
        interpolate: /\{\{(.+?)\}\}/g,
        escape: /\{#(.+?)#\}/g
    };

    // Stratus Layer Prototype
    // -----------------------

    // This prototype is the only Global Object that should ever be used within the
    // Stratus layer.  Currently, all Stratus Backbone Objects (Models, Collections,
    // Views, Routers, and Events) are defined within each Stratus Property.  Each
    // individual instance of Stratus Objects are currently not maintained within
    // the Stratus Layer's Global Object.  There may be a future implementation of a
    // Stratus Property to contain these instances within the Stratus Layer as well.
    /**
     * @type {{DOM: {}, Key: {}, PostMessage: {}, Models: {}, Collections: {}, Views: {}, Routers: {}, Events: {}, Relations: {}, Client: *, CSS: {}, Environment: {}, Internals: {}, Instances: {}, Resources: {}, History: {}}}
     */
    var Stratus = {
        /* Settings */
        Settings: {
            image: {
                size: { XS: 200, S: 400, M: 600, L: 800, XL: 1200, HQ: 1600 }
            }
        },
        /* Native */
        DOM: {},
        Key: {},
        PostMessage: {},

        // TODO: Change each of these "namespaces" into Backbone.Models references so that we can easily
        // use the events of type changes to hook different initialization routines to wait for the type
        // to be created before continuing with view creation.  This will take a little finesse for the
        // initial writing of a view, since they actually are created as "Stratus.Collections.Generic"
        // inside the individual modules at runtime.

        /* Backbone */
        Collections: new Backbone.Model(),
        Models: new Backbone.Model(),
        Routers: new Backbone.Model(),
        Views: {
            Plugins: {},
            Widgets: {}
        },
        Events: {},
        Relations: {},

        /* Bowser */
        Client: bowser,

        /* Stratus */
        CSS: {},
        Chronos: null,
        Environment: new Backbone.Model({
            production: !(typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1),
            debugNest: false,
            liveEdit: false,
            viewPortChange: false,
            lastScroll: false
        }),
        History: {},
        Instances: {},
        Internals: {},
        Prototypes: {},
        Resources: {},

        // Plugins */
        PluginMethods: {},
        /* Methods that need to be called as a group later, e.g. OnScroll */
        RegisterGroup: {}
    };

    // Declare Warm Up
    if (!Stratus.Environment.get('production')) {
        console.group('Stratus Warm Up');
    }

    // Underscore Mixins
    // ------------------

    /**
     * @param string
     * @returns {*}
     * @constructor
     */
    _.mixin({
        // This function simply capitalizes the first letter of a string.
        /**
         * @param string
         * @returns {*}
         */
        ucfirst: function (string) {
            return (typeof string === 'string' && string) ? string.charAt(0).toUpperCase() + string.substring(1) : null;
        },

        // This function simply changes the first letter of a string to a lower case.
        /**
         * @param string
         * @returns {*}
         */
        lcfirst: function (string) {
            return (typeof string === 'string' && string) ? string.charAt(0).toLowerCase() + string.substring(1) : null;
        },

        // Converge a list and return the prime key through specified method.
        /**
         * @param list
         * @param method
         * @returns {*}
         */
        converge: function (list, method) {
            if (typeof method !== 'string') {
                method = 'min';
            }
            if (method === 'min') {
                var lowest = _.min(list);
                return _.findKey(list, function (element) {
                    return (element === lowest);
                });
            } else if (method === 'radial') {
                // Eccentricity
                // Radians
                // Diameter
                // Focal Point
            } else if (method === 'gauss') {
                // Usage: Node Connection or Initialization
            } else {
                return list;
            }
        },

        // This synchronously repeats a function a certain number of times
        /**
         * @param fn
         * @param times
         */
        repeat: function (fn, times) {
            if (typeof fn === 'function' && typeof times === 'number') {
                var i; for (i = 0; i < times; i++) fn();
            } else {
                console.warn('Underscore cannot repeat function:', fn, 'with number of times:', times);
            }
        },

        // This function hydrates a string into an Object, Boolean, or Null value, if applicable.
        /**
         * @param string
         * @returns {*}
         */
        hydrate: function (string) {
            return _.isJSON(string) ? JSON.parse(string) : string;
        },

        // This is an alias to the hydrate function for backwards compatibility.
        /**
         * @param string
         * @returns {*}
         */
        hydrateString: function (string) {
            return _.hydrate(string);
        },

        // This function utilizes tree building to clone an object.
        /**
         * @param obj
         * @returns {*}
         */
        cloneDeep: function (obj) {
            if (typeof obj !== 'object') return obj;
            var shallow = _.clone(obj);
            _.each(shallow, function (value, key) {
                shallow[key] = _.cloneDeep(value);
            });
            return shallow;
        },

        // Get a specific value or all values located in the URL
        /**
         * @param key
         * @param href
         * @returns {{}}
         */
        getUrlParams: function (key, href) {
            var vars = {};
            href = typeof href !== 'undefined' ? href : window.location.href;
            href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                vars[key] = value;
            });
            return (typeof key !== 'undefined' && key) ? vars[key] : vars;
        },

        // Ensure all values in an array or object are true
        /**
         * @param values
         * @returns {boolean}
         */
        allTrue: function (values) {
            return (typeof values === 'object') ? _.every(values, function (value) {
                return value;
            }) : false;
        },

        // Determines whether or not the string supplied is in a valid JSON format
        /**
         * @param str
         * @returns {boolean}
         */
        isJSON: function (str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        },
        /**
         * @param str
         * @returns {number|null}
         */
        seconds: function (str) {
            var seconds = 0;
            if (typeof str === 'string') {
                var timePairs = str.match(/([\d+\.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/gi);
                if (_.size(timePairs)) {
                    var digest = /([\d+\.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/i;
                    var time;
                    var unit;
                    var value;
                    _.each(timePairs, function (timePair) {
                        time = digest.exec(timePair);
                        value = parseFloat(time[1]);
                        unit = time[2];
                        if (!isNaN(value)) {
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
                            seconds += value * unit;
                        }
                    }, this);
                } else {
                    seconds = null;
                }
            } else if (typeof str === 'number') {
                seconds = str;
            } else {
                seconds = null;
            }
            return seconds;
        }
    });

    // jQuery Functions
    // ------------------

    /**
     * @param key
     * @param value
     * @returns {*|{class, aria-disabled}}
     */
    $.fn.dataAttr = function (key, value) {
        if (key === undefined) console.error('$().dataAttr(key, value) contains an undefined key!');
        if (value === undefined) {
            value = this.attr('data-' + key);
            return _.isJSON(value) ? JSON.parse(value) : value;
        } else {
            return this.attr('data-' + key, JSON.stringify(value));
        }
    };

    /**
     * @param event
     * @returns {boolean}
     */
    $.fn.notClicked = function (event) {
        return (!$(event.target).closest(this.selector).length && !$(event.target).parents(this.selector).length);
    };

    // Stratus Environment Initialization
    // ----------------------------------

    // This needs to run after the jQuery library is configured.
    var initialLoad = $('body').dataAttr('environment');
    if (initialLoad && typeof initialLoad === 'object' && _.size(initialLoad)) {
        Stratus.Environment.set(initialLoad);
    }

    // Backbone Relational Settings
    // ----------------------------

    // This is provides a Stratus scope for Dynamic Relations.
    Backbone.Relational.store.addModelScope(Stratus.Models.attributes);
    Backbone.Relational.store.addModelScope(Stratus.Collections.attributes);

    // Backbone Relational Functions
    // -----------------------------

    // This function gathers data from a model within a model.
    // This should only occur when using Backbone Relations to
    // display data from parent or child objects.
    /**
     * @param model
     * @param scope
     * @param property
     * @returns {*}
     * @constructor
     */
    Stratus.Relations.Sanitize = function (model, scope, property) {
        var data = null;
        if (typeof model.get(scope) !== 'undefined') {
            if (typeof model.get(scope) === 'object' && model.get(scope) !== null) {
                if (typeof model.get(scope).get(property) !== 'undefined') {
                    if (model.get(scope).get(property).length === 0) {
                        /* do nothing */
                    } else if (model.get(scope).get(property).length === 1) {
                        data = model.get(scope).get(property)[0];
                    } else {
                        data = model.get(scope).get(property);
                    }
                }
            } else {
                data = model.get(scope);
            }
        }
        return data;
    };

    // Instance Clean
    // --------------

    // This function is meant to delete instances by their unique id for Garbage Collection.
    /**
     * @param instances
     * @returns {boolean}
     * @constructor
     */
    Stratus.Instances.Clean = function (instances) {
        if (typeof instances === 'undefined') {
            console.error('Stratus.Instances.Clean() requires a string or array containing Unique ID(s).');
        } else if (typeof instances === 'string') {
            instances = [instances];
        }

        if (typeof instances === 'object' && Array.isArray(instances)) {
            _.each(instances, function (value) {
                Stratus.Instances[value].remove();
                delete Stratus.Instances[value];
            });
        } else {
            return false;
        }
    };

    // Error Prototype
    // ---------------

    /**
     * @param error
     * @param chain
     * @constructor
     */
    Stratus.Prototypes.Error = function (error, chain) {
        this.code = 'Internal';
        this.message = 'No discernible data received.';
        this.chain = [];

        if (typeof error === 'string') {
            this.message = error;
        } else if (error && typeof error === 'object') {
            _.extend(this, error);
        }

        this.chain.push(chain);
    };

    // Dispatch Prototype
    // ----------------

    /**
     * @returns {Stratus.Prototypes.Dispatch}
     * @constructor
     */
    Stratus.Prototypes.Dispatch = function () {
        return _.extend(this, Backbone.Events);
    };

    // Chronos System
    // --------------
    Stratus.Prototypes.Chronos = Backbone.Model.extend({
        /**
         * @param options
         */
        initialize: function (options) {
            if (!Stratus.Environment.get('production')) console.info('Chronos Invoked!');
            this.on('change', this.synchronize, this);
        },
        synchronize: function () {
            _.each(this.changed, function (job, key) {
                if (typeof key === 'string' && key.indexOf('.') !== -1) {
                    key = _.first(key.split('.'));
                    job = this.get(key);
                }
                if (!job.code && job.enabled) {
                    job.code = setInterval(function (job) {
                        job.func.call(job.scope);
                    }, job.time * 1000, job);
                } else if (job.code && !job.enabled) {
                    clearInterval(job.code);
                    job.code = 0;
                }
            }, this);
        },
        /**
         * @param time
         * @param func
         * @param scope
         * @returns {string}
         */
        add: function (time, func, scope) {
            var uid = null;
            time = _.seconds(time);
            if (time !== null && typeof func === 'function') {
                uid = _.uniqueId('job_');
                scope = scope || window;
                this.set(uid, {
                    time: time,
                    func: func,
                    scope: scope,
                    code: 0,
                    enabled: false
                });
            }
            return uid;
        },
        /**
         * @param uid
         * @returns {boolean|*}
         */
        enable: function (uid) {
            var success = this.has(uid);
            if (success) this.set(uid + '.enabled', true);
            return success;
        },
        /**
         * @param uid
         * @returns {boolean|*}
         */
        disable: function (uid) {
            var success = this.has(uid);
            if (success) this.set(uid + '.enabled', false);
            return success;
        },
        /**
         * @param uid
         * @param value
         * @returns {boolean|*}
         */
        toggle: function (uid, value) {
            var success = this.has(uid);
            if (success) this.set(uid + '.enabled', (typeof value === 'boolean') ?  value : !this.get(uid + '.enabled'));
            return success;
        }
    });
    Stratus.Chronos = new Stratus.Prototypes.Chronos();

    // Internal Collections
    // --------------------

    // This function is meant to be extended for collections, models, etc, that want to use internal attributes in a Backbone way, without having to make an actual collection with an API and such.
    // TODO: Add Backbone.Events into this Collection
    /**
     * @param attributes
     * @returns {Stratus.Prototypes.Collection}
     * @constructor
     */
    Stratus.Prototypes.Collection = function (attributes) {
        /**
         * @type {{}}
         */
        this.attributes = {};
        /**
         * @type {{}}
         */
        this.temps = {};
        /**
         * @param options
         * @returns {*}
         */
        this.toObject = function (options) {
            return _.clone(this.attributes);
        };
        /**
         * @param options
         * @returns {{meta: (*|string|{type, data}), payload: *}}
         */
        this.toJSON = function (options) {
            return _.clone(this.attributes);
        };
        /**
         * @param callback
         * @param scope
         */
        this.each = function (callback, scope) {
            _.each.apply((scope === undefined) ? this : scope, _.union([this.attributes], arguments));
        };
        /**
         * @param attr
         * @returns {*}
         */
        this.get = function (attr) {
            if (typeof attr === 'string' && attr.indexOf('.') !== -1) {
                var reference = this.attributes;
                var chain = attr.split('.');
                _.find(chain, function (link) {
                    if (typeof reference !== 'undefined' && reference && typeof reference === 'object') {
                        reference = reference[link];
                    } else {
                        reference = this.attributes[attr];
                        return true;
                    }
                }, this);
                if (!_.isEqual(reference, this.attributes)) {
                    return reference;
                }
            }
            return this.attributes[attr];
        };
        /**
         * @param attr
         * @returns {boolean}
         */
        this.has = function (attr) {
            return (typeof this.get(attr) !== 'undefined');
        };
        /**
         * @returns {number}
         */
        this.size = function () {
            return _.size(this.attributes);
        };
        /**
         * @param attr
         * @param value
         */
        this.set = function (attr, value) {
            if (attr && typeof attr === 'object') {
                _.each(attr, function (value, attr) {
                    this.setAttribute(attr, value);
                }, this);
            } else {
                this.setAttribute(attr, value);
            }
        };
        /**
         * @param attr
         * @param value
         */
        this.setAttribute = function (attr, value) {
            if (typeof attr === 'string' && attr.indexOf('.') !== -1) {
                var reference = this.attributes;
                var chain = attr.split('.');
                _.find(_.initial(chain), function (link) {
                    if (!_.has(reference, link) || !reference[link]) reference[link] = {};
                    if (typeof reference !== 'undefined' && reference && typeof reference === 'object') {
                        reference = reference[link];
                    } else {
                        reference = this.attributes;
                        return true;
                    }
                }, this);
                if (!_.isEqual(reference, this.attributes)) {
                    var link = _.last(chain);
                    if (reference && typeof reference === 'object') {
                        reference[link] = value;
                    }
                }
            } else {
                this.attributes[attr] = value;
            }
            /* TODO: this.trigger('change:' + attr, value); */
        };
        /**
         * @param attr
         * @param value
         */
        this.temp = function (attr, value) {
            this.set(attr, value);
            if (attr && typeof attr === 'object') {
                _.each(attr, function (value, attr) {
                    this.temps[attr] = value;
                }, this);
            } else {
                this.temps[attr] = value;
            }
        };
        /**
         * @param attr
         * @param value
         * @returns {*}
         */
        this.add = function (attr, value) {
            // Ensure a placeholder exists
            if (!this.has(attr)) this.set(attr, []);

            // only add value if it's supplied (sometimes we want to create an empty placeholder first)
            if (typeof value !== 'undefined' && !_.contains(this.attributes[attr], value)) {
                this.attributes[attr].push(value);
                return value;
            }
        };
        /**
         * @param attr
         * @param value
         * @returns {*}
         */
        this.remove = function (attr, value) {
            if (value === undefined) {
                //delete this.attributes[attr];
            } else {
                // TODO: use dot notation for nested removal or _.without for array values (these should be separate functions)
                this.attributes[attr] = _.without(this.attributes[attr], value);
            }
            return this.attributes[attr];
        };
        /**
         * @param attr
         * @returns {number}
         */
        this.iterate = function (attr) {
            if (!this.has(attr)) this.set(attr, 0);
            return ++this.attributes[attr];
        };
        /**
         * Clear all internal attributes
         */
        this.clear = function () {
            for (var attribute in this.attributes) {
                if (this.attributes.hasOwnProperty(attribute)) {
                    delete this.attributes[attribute];
                }
            }
        };
        /**
         * Clear all temporary attributes
         */
        this.clearTemp = function () {
            for (var attribute in this.temps) {
                if (this.temps.hasOwnProperty(attribute)) {
                    //delete this.attributes[attribute];
                    // this.remove(attribute);
                    delete this.temps[attribute];
                }
            }
        };

        /**
         * @returns {boolean}
         */
        this.initialize = function () {
            return true;
        };

        // Evaluate object or array
        if (attributes) {
            // TODO: Evaluate object or array into a string of sets
            /*
             attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
             this.set(attrs, options);
             */
        }

        // Add Events
        //_.extend(this, Backbone.Events);

        // Initialize
        this.initialize.apply(this, arguments);

        return this;
    };

    // Internal CSS Loader
    // -------------------

    // This function allows asynchronous CSS Loading and returns a promise.
    // It Prepends CSS files to the top of the list, so that it
    // doesn't overwrite the site.css. So we reverse the order of the list of urls so they load the order specified.
    /**
     * TODO: Determine relative or CDN based URLs
     * @param urls
     * @returns {Promise}
     * @constructor
     */
    Stratus.Internals.LoadCss = function (urls) {
        return new Promise(function (fulfill, reject) {
            if (typeof urls === 'undefined' || typeof urls === 'function') {
                reject(new Stratus.Prototypes.Error({
                    code: 'LoadCSS',
                    message: 'CSS Resource URLs must be defined as a String, Array, or Object.'
                }, this));
            }
            if (typeof urls === 'string') urls = [urls];
            var cssEntries = {
                total: urls.length,
                iteration: 0
            };
            if (cssEntries.total > 0) {
                _.each(urls.reverse(), function (url) {
                    cssEntries.iteration++;
                    var cssEntry = _.uniqueId('css_');
                    cssEntries[cssEntry] = false;
                    if (typeof url === 'undefined' || !url) {
                        cssEntries[cssEntry] = true;
                        if (cssEntries.total === cssEntries.iteration && _.allTrue(cssEntries)) {
                            fulfill(cssEntries);
                        }
                    } else {
                        Stratus.Internals.CssLoader(url).done(function (entry) {
                            cssEntries[cssEntry] = true;
                            if (cssEntries.total === cssEntries.iteration && _.allTrue(cssEntries)) {
                                fulfill(cssEntries);
                            }
                        }, reject);
                    }
                });
            } else {
                reject(new Stratus.Prototypes.Error({ code: 'LoadCSS', message: 'No CSS Resource URLs found!' }, this));
            }
        });
    };

    // OnScroll()
    // -----------
    // Since different plugins or methods may need to listen to the Scroll, we don't want lots of different listeners on the scroll event, so we register them and then execute them all at once
    // Each element must include:
    // method: the function to callback
    // options: an object of options that the function uses
    // TODO: Move this somewhere.
    /**
     * @param elements
     * @returns {boolean}
     * @constructor
     */
    Stratus.Internals.OnScroll = function (elements) {

        // Reset Elements:
        if (!elements || elements.length === 0) return false;

        // Execute the methods for every registered object ONLY when there is a change to the viewPort
        Stratus.Environment.on('change:viewPortChange', function (model) {
            if (model.get('viewPortChange')) {
                model.set('lastScroll', Stratus.Internals.GetScrollDir());

                // Cycle through all the registered objects an execute their function
                // We must use the registered onScroll objects, because they get removed in some cases (e.g. lazy load)
                var elements = Stratus.RegisterGroup.get('OnScroll');

                _.each(elements, function (obj) {
                    if (typeof obj !== 'undefined' && _.has(obj, 'method')) {
                        obj.method(obj);
                    }
                });
                model.set('viewPortChange', false);
                model.set('windowTop', $(window).scrollTop());
            }
        });
        $(window).scroll(function () {
            if (Stratus.Environment.get('viewPortChange') === false) {
                Stratus.Environment.set('viewPortChange', true);
            }
        });

        // Resizing can change what's on screen so we need to check the scrolling
        $(window).resize(function () {
            if (Stratus.Environment.get('viewPortChange') === false) {
                Stratus.Environment.set('viewPortChange', true);
            }
        });

        // Run Once initially
        Stratus.Environment.set('viewPortChange', true);
    };

    // GetScrollDir()
    // --------------
    // Checks whether there has been any scroll yet, and returns down, up, or false
    /**
     * @returns {string}
     * @constructor
     */
    Stratus.Internals.GetScrollDir = function () {
        var wt = $(window).scrollTop();
        var lwt = Stratus.Environment.get('windowTop');
        var wh = $(window).height();
        var dh = $(document).height();

        // return NULL if there is no scroll, otherwise up or down
        var down = lwt ? (wt > lwt) : false;
        var up = lwt ? (wt < lwt && (wt + wh) < dh) : false;
        return down ? 'down' : (up ? 'up' : false);
    };

    // IsOnScreen()
    // ---------------
    // Check whether an element is on screen, returns true or false.
    /**
     * @param el
     * @param offset
     * @returns {boolean}
     * @constructor
     */
    Stratus.Internals.IsOnScreen = function (el, offset) {
        offset = offset || 0;
        var wt = $(window).scrollTop();
        var wb = wt + $(window).height();
        var et = el.offset().top;
        var eb = et + el.height();
        return (eb >= wt + offset && et <= wb - offset);
    };

    // Internal Anchor Capture
    // -----------------------

    // This function allows anchor capture for smooth scrolling before propagation.
    /**
     * @type {*|Function|void}
     */
    Stratus.Internals.Anchor = Backbone.View.extend({
        el: 'a[href*=\\#]:not([href=\\#]):not([data-scroll="false"])',
        events: {
            click: 'clickAction'
        },
        clickAction: function (event) {
            if (location.pathname.replace(/^\//, '') === event.currentTarget.pathname.replace(/^\//, '') && location.hostname === event.currentTarget.hostname) {
                var $target = $(event.currentTarget.hash);
                var anchor = event.currentTarget.hash.slice(1);
                $target = ($target.length) ? $target : $('[name=' + anchor + ']');
                /* TODO: Ensure that this animation only stops propagation of click event son anchors that are confirmed to exist on the page */
                if ($target.length) {
                    $('html,body').animate({
                        scrollTop: $target.offset().top
                    }, 1000, function () {
                        Backbone.history.navigate(anchor);
                    });
                    return false;
                }
            }
        }
    });

    // LazyLoad Images
    // -----------
    // Find all images that have data-src and lazy load the "best" size version that will fit
    // inside the container.
    // If they have a src already, that's okay, it was just a placeholder image to allow us to have
    // the correct ratio of the image for reserving space in the design, and it will be replaced.
    // But if you set a src, you don't need to redundantly set the full path in the data-src, you can just enter data-src="lazy"
    // If you need the image to be a specific size (e.g. a small version) and you want to load the
    // right size image for the hard coded size (and not let it fetch the larger or smaller version that fits in the container), you can specify the width in CSS.
    // If you want to specify the size to load, you can add an attribute for data-size and specify
    // HQ, XL, L, M, S, XS
    // By default images will NOT be refetched at a larger size when the browser is made larger,
    // because that it's rare that people will resize their browser, and if the images get a little
    // blurry that's better than everything reloading on the page (next page load will fix this
    // automatically). But on mobile, we will listen for resize of window because
    Stratus.Internals.LazyLoad = Backbone.View.extend({
        el: 'img[data-src]',
        initialize: function () {
            if (this.$el.length === 0) return false;

            // allow watching a different element to trigger when this image is lazy loaded (needed for carousels)
            var $el;
            _.each(this.$el, function (el) {
                $el = $(el);
                Stratus.RegisterGroup.add('OnScroll', {
                    method: Stratus.Internals.LoadImage,
                    el: $el,
                    spy: $(el).data('spy') ? $($(el).data('spy')) : $(el)
                });
            });
        }
    });

    // Load Image
    /**
     * @param obj
     * @returns {boolean}
     * @constructor
     */
    Stratus.Internals.LoadImage = function (obj) {
        obj.el.addClass('placeholder');
        if (Stratus.Internals.IsOnScreen(obj.spy)) {

            // Don't Get the Width, until it's "onScreen" (in case it was collapsed offscreen originally)
            var src = obj.el.data('src');

            // If a src is provided already, us that
            if (src === 'lazy') src = obj.el.attr('src');

            var size = null;

            // if a specific valid size is requested, use that
            if (obj.el.data('size') && size.indexOf(obj.el.data('size')) !== false) {
                size = obj.el.data('size');
            } else {
                var width = null;

                // Check if there is CSS width hard coded on the element
                if (obj.el.prop('style').width) {
                    width = obj.el.prop('style').width;

                    // Check if there is a width attribute
                } else if (obj.el.attr('width')) {
                    width = obj.el.attr('width');

                    // If there is no CSS width, calculate the parent container's width
                } else {
                    // The image may be inside an element that is invisible (e.g. Carousel has items display:none)
                    // So we need to find the first parent that is visible and use that width
                    var $visibleParent = $(_.first(obj.el.parents(':visible')));
                    width = $visibleParent.width();

                    // If one of parents of the image (and child of the found parent) has a bootstrap col-*-* set
                    // divide width by that in anticipation (e.g. Carousel that has items grouped)
                    var $col = $(_.first($visibleParent.find('[class*="col-"]')));

                    if ($col.length > 0) {
                        var colWidth = Stratus.Internals.GetColWidth($col);
                        if (colWidth) {
                            width = Math.round(width / colWidth);
                        }
                    }

                }

                // If no appropriate width was found, abort
                if (width <= 0) return false;

                // Return the first size that is bigger than container width
                size = _.findKey(Stratus.Settings.image.size, function (s, k) {
                    return (s > width);
                });

                // default to largest size if the container is larger and it didn't find a size
                size = size ? size : 'HQ';
            }

            // Change Source to right size (get the base and extension and ignore size)
            var srcRegex = /^(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)/gi;
            var srcMatch = srcRegex.exec(src);
            src = srcMatch[1] + '-' + size + '.' + srcMatch[3];

            // Change the Source to be the desired path
            obj.el.attr('src', src);
            obj.el.addClass('loading');
            obj.el.load(function () {
                $(this).addClass('loaded').removeClass('placeholder loading');
            });

            // Remove from registration
            Stratus.RegisterGroup.remove('OnScroll', obj);
        }
    };

    /**
     * TODO: Move this to an underscore mixin
     * @param el
     * @returns {boolean}
     * @constructor
     */
    Stratus.Internals.GetColWidth = function (el) {
        var classes = el.attr('class');
        var regexp = /col-.{2}-([0-9]*)/g;
        var match = regexp.exec(classes);
        return (typeof match[1] !== 'undefined') ? match[1] : false;
    };

    /**
     * @param url
     * @returns {Promise}
     * @constructor
     */
    Stratus.Internals.CssLoader = function (url) {
        return new Promise(function (fulfill, reject) {
            /* Verify Identical Calls */
            if (url in Stratus.CSS) {
                if (Stratus.CSS[url]) {
                    fulfill();
                } else {
                    Stratus.Events.once('onload:' + url, fulfill);
                }
            } else {
                /* Set CSS State */
                Stratus.CSS[url] = false;

                /* Create Link */
                var link = document.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';
                link.href = url;

                /* Track Fulfillment */
                Stratus.Events.once('onload:' + url, function () {
                    Stratus.CSS[url] = true;
                    fulfill();
                });

                /* Capture OnLoad or Fallback */
                if ('onload' in link && !Stratus.Client.android) {
                    link.onload = function () {
                        Stratus.Events.trigger('onload:' + url);
                    };
                } else {
                    Stratus.CSS[url] = true;
                    Stratus.Events.trigger('onload:' + url);
                }

                /* Inject Link into Head */
                $('head').prepend(link);
            }
        });
    };

    // Internal Convoy Dispatcher
    // --------------------------

    // This function allows Stratus to make SOAP-like API calls for
    // very specific, decoupled, data sets.
    /**
     * @param convoy
     * @param query
     * @returns {Promise}
     * @constructor
     */
    Stratus.Internals.Convoy = function (convoy, query) {
        return new Promise(function (fulfill, reject) {
            if (convoy === undefined) {
                reject(new Stratus.Prototypes.Error({
                    code: 'Convoy',
                    message: 'No Convoy defined for dispatch.'
                }, this));
            }
            $.ajax({
                type: 'POST',
                url: '/Api' + encodeURIComponent(query || ''),
                data: { convoy: JSON.stringify(convoy) },
                dataType: (_.has(convoy, 'meta') && _.has(convoy.meta, 'dataType')) ? convoy.meta.dataType : 'json',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                success: function (response) {
                    fulfill(response);
                    return response;
                },
                error: function (response) {
                    reject(new Stratus.Prototypes.Error({ code: 'Convoy', message: response }, this));
                    return response;
                }
            });
        });
    };

    // Internal Convoy Builder
    // -----------------------

    // This function is simply a convoy builder for a SOAP-like API call.
    /**
     * @param route
     * @param meta
     * @param payload
     * @returns {*}
     * @constructor
     */
    Stratus.Internals.Api = function (route, meta, payload) {
        if (route === undefined) route = 'Default';
        if (meta === undefined || meta === null) meta = {};
        if (payload === undefined) payload = {};

        if (typeof meta !== 'object') meta = { method: meta };
        if (!_.has(meta, 'method')) meta.method = 'GET';

        return Stratus.Internals.Convoy({
            route: {
                controller: route
            },
            meta: meta,
            payload: payload
        });
    };

    // Internal Resource Loader
    // ------------------------

    // This will either retrieve a resource from a URL and cache it for future reference.
    /**
     * @param path
     * @param elementId
     * @returns {Promise}
     * @constructor
     */
    Stratus.Internals.Resource = function (path, elementId) {
        return new Promise(function (fulfill, reject) {
            if (typeof path === 'undefined') {
                reject(new Stratus.Prototypes.Error({
                    code: 'Resource',
                    message: 'Resource path is not defined.'
                }, this));
            }
            if (_.has(Stratus.Resources, path)) {
                if (Stratus.Resources[path].success) {
                    fulfill(Stratus.Resources[path].data);
                } else {
                    Stratus.Events.once('resource:' + path, fulfill);
                }
            } else {
                Stratus.Resources[path] = {
                    success: false,
                    data: null
                };
                Stratus.Events.once('resource:' + path, fulfill);
                var meta = { path: path, dataType: 'text' };
                if (elementId !== undefined) {
                    meta.elementId = elementId;
                }
                Stratus.Internals.Api('Resource', meta, {}).done(function (data) {
                    Stratus.Resources[path].success = true;
                    Stratus.Resources[path].data = data;
                    Stratus.Events.trigger('resource:' + path, data);
                }, reject);
            }
        });
    };

    // Internal Browser Compatibility
    // ------------------------------

    // This function gathers information about the Client's Browser
    // and respectively adds informational classes to the DOM's Body.
    /**
     * @constructor
     */
    Stratus.Internals.Compatibility = function () {
        var profile = [];

        if (Stratus.Client.android) {
            profile.push('android');
        } else if (Stratus.Client.ios) {
            profile.push('ios');
        } else if (Stratus.Client.mac) {
            profile.push('mac');
        } else if (Stratus.Client.windows) {
            profile.push('windows');
        } else if (Stratus.Client.linux) {
            profile.push('linux');
        } else {
            profile.push('os');
        }

        if (Stratus.Client.chrome) {
            profile.push('chrome');
        } else if (Stratus.Client.firefox) {
            profile.push('firefox');
        } else if (Stratus.Client.safari) {
            profile.push('safari');
        } else if (Stratus.Client.opera) {
            profile.push('opera');
        } else if (Stratus.Client.msie) {
            profile.push('msie');
        } else if (Stratus.Client.iphone) {
            profile.push('iphone');
        } else {
            profile.push('browser');
        }

        if (Stratus.Client.version) {
            profile.push('version' + Stratus.Client.version.split('.')[0]);
        }

        if (Stratus.Client.mobile) {
            profile.push('mobile');
        } else {
            profile.push('desktop');
        }

        /*Stratus.Events.trigger('alert', profile + JSON.stringify(Stratus.Client));*/
        $('body').addClass(profile.join(' '));
    };

    // Internal View Model
    // ---------------------

    // This non-relational model is instantiated every time a Stratus Loader
    // finds a Stratus DOM element.
    /**
     * @type {void|*}
     */
    Stratus.Internals.View = Backbone.Model.extend({
        toObject: function () {
            return _.clone(this.attributes);
        },

        // TODO: This function's documentation needs to be moved to the Sitetheory-Docs repo
        hydrate: function () {
            var selector = this.get('el');
            this.set({
                // Unique IDs
                // -----------

                // This is set as the widgets are gathered
                uid: _.uniqueId('view_'),

                // This is set as a widget is created to ensure duplicates don't exist
                guid: (typeof selector.dataAttr('guid') !== 'undefined') ? selector.dataAttr('guid') : null,

                // Model or Collection
                // -----------

                // Entity Type (i.e. 'View' which would correlate to a Restful /Api/View Request)
                entity: (typeof selector.dataAttr('entity') !== 'undefined') ? _.ucfirst(selector.dataAttr('entity')) : null,

                // Entity ID (Determines Model or Collection)
                id: (typeof selector.dataAttr('id') !== 'undefined') ? selector.dataAttr('id') : null,

                // Determines whether or not we should create an Entity Stub to render the dependent widgets
                manifest: (typeof selector.dataAttr('manifest') !== 'undefined') ? selector.dataAttr('manifest') : null,

                // API Options are added to the Request URL
                api: (typeof selector.dataAttr('api') !== 'undefined') ? selector.dataAttr('api') : null,

                // Determine whether this widget will fetch
                fetch: (typeof selector.dataAttr('fetch') !== 'undefined') ? selector.dataAttr('fetch') : true,

                // Specify Target
                target: (typeof selector.dataAttr('target') !== 'undefined') ? selector.dataAttr('target') : null,

                // This is determines what a new Entity's settings would be on creation
                prototype: (typeof selector.dataAttr('prototype') !== 'undefined') ? selector.dataAttr('prototype') : null,

                // Stuff
                autoSave: (typeof selector.dataAttr('autoSave') !== 'undefined') ? selector.dataAttr('autoSave') : null,

                // View
                // -----------

                type: (typeof selector.dataAttr('type') !== 'undefined') ? selector.dataAttr('type') : null,
                types: (typeof selector.dataAttr('types') !== 'undefined') ? selector.dataAttr('types') : null,
                template: (typeof selector.dataAttr('template') !== 'undefined') ? selector.dataAttr('template') : null,
                templates: (typeof selector.dataAttr('templates') !== 'undefined') ? selector.dataAttr('templates') : null,
                dialogue: (typeof selector.dataAttr('dialogue') !== 'undefined') ? selector.dataAttr('dialogue') : null,
                pagination: (typeof selector.dataAttr('pagination') !== 'undefined') ? selector.dataAttr('pagination') : null,
                property: (typeof selector.dataAttr('property') !== 'undefined') ? selector.dataAttr('property') : null,
                field: (typeof selector.dataAttr('field') !== 'undefined') ? selector.dataAttr('field') : null,
                load: (typeof selector.dataAttr('load') !== 'undefined') ? selector.dataAttr('load') : null,
                options: (typeof selector.dataAttr('options') !== 'undefined') ? selector.dataAttr('options') : null,

                // Versioning
                // -----------

                versionEntity: (typeof selector.dataAttr('versionentity') !== 'undefined') ? selector.dataAttr('versionentity') : null,
                versionRouter: (typeof selector.dataAttr('versionrouter') !== 'undefined') ? selector.dataAttr('versionrouter') : null,
                versionId: (typeof selector.dataAttr('versionid') !== 'undefined') ? selector.dataAttr('versionid') : null,

                // Plugins
                // -----------

                plugin: (typeof selector.dataAttr('plugin') !== 'undefined') ? selector.dataAttr('plugin') : null,
                plugins: []
            });

            if (this.get('plugin') !== null) {
                var plugins = this.get('plugin').split(' ');
                if (this.get('type') !== null) {
                    this.set('plugins', (plugins.length > 1) ? plugins : [this.get('plugin')]);
                } else if (plugins.length > 1) {
                    this.set('plugin', _.first(plugins));

                    // Add additional plugins
                    this.set('plugins', _.rest(plugins));
                }
            }
            var id = this.get('id');
            var type = (this.get('type') !== null) ? this.get('type') : this.get('plugin');
            var loaderType = (this.get('type') !== null) ? 'widgets' : 'plugins';
            this.set({
                scope: (id !== null) ? 'model' : 'collection',
                alias: (type !== null) ? 'stratus.views.' + loaderType + '.' + type.toLowerCase() : null,
                path: (type !== null) ? type : null
            });
            if (this.isNew() && this.get('entity') !== null && this.get('manifest') !== null) {
                this.set('scope', 'model');
            }
        },
        clean: function () {
            if (!this.has('entity') || this.get('entity').toLowerCase() === 'none') {
                this.set({ entity: null, scope: null });
            }
        },

        // Give Nested Attributes for Child Views
        /**
         * @returns {{entity: *, id: *, versionEntity: *, versionRouter: *, versionId: *, scope: *, manifest: *}}
         */
        nest: function () {
            var nest = {
                entity: this.get('entity'),
                id: this.get('id'),
                versionEntity: this.get('versionEntity'),
                versionRouter: this.get('versionRouter'),
                versionId: this.get('versionId'),
                scope: this.get('scope'),
                manifest: this.get('manifest')
            };

            // Add Model or Collection to Nest
            if (this.has(nest.scope)) {
                nest[nest.scope] = this.get(nest.scope);
            }
            return nest;
        },
        /**
         * @returns {{id: *}}
         */
        modelAttributes: function () {
            return {
                id: this.get('id')
            };
        }
    });

    // Internal View Loader
    // ----------------------

    // This will hydrate every entity data attribute into a model or
    // collection either by reference or instantiation and attach said
    // 'scope' to a view instance.
    /**
     * Events:
     *
     * Editable
     * Manipulate
     * Container Overlay (View)
     * Container Inlay (View)
     *
     * @param selector
     * @param view
     * @param requirements
     * @returns {Promise}
     * @constructor
     */
    Stratus.Internals.Loader = function (selector, view, requirements) {
        if (typeof selector === 'undefined') {
            var $body = $('body');
            selector = (!$body.dataAttr('loaded')) ? '[data-entity],[data-plugin]' : null;
            if (selector) {
                $body.dataAttr('loaded', true);
            } else {
                console.warn('Attempting to load Stratus root repeatedly!');
            }
        }
        /*
         if (typeof selector === 'string') selector = $(selector);
         if (view && selector) selector.find('[data-type],[data-plugin]');
         */
        /* We check view, selector, and type in this order to save a small amount of power */
        if (selector) {
            selector = (view && selector && typeof selector === 'object') ? $(selector).find('[data-type],[data-plugin]') : $(selector);
        }
        return new Promise(function (fulfill, reject) {
            var entries = {
                total: (selector && typeof selector === 'object') ? selector.length : 0,
                iteration: 0,
                views: {}
            };
            if (entries.total > 0) {
                selector.each(function (index, el) {
                    entries.iteration++;
                    var entry = _.uniqueId('entry_');
                    entries.views[entry] = false;
                    Stratus.Internals.ViewLoader(el, view, requirements).done(function (view) {
                        entries.views[entry] = view;
                        if (entries.total === entries.iteration && _.allTrue(entries.views)) {
                            fulfill(entries);
                        }
                    }, reject);
                });
            } else {
                fulfill(entries);
            }
        });
    };

    // This function creates and hydrates a view from the DOM,
    // then either references or creates a Model or Collection
    // instance (if present), then, upon View instantiation, calls
    // the Internal Loader on that element to build the nested
    // view tree.
    /**
     * @param el
     * @param view
     * @param requirements
     * @returns {Promise}
     * @constructor
     */
    Stratus.Internals.ViewLoader = function (el, view, requirements) {
        var parentView = (view) ? view : null;
        var parentChild = false;

        var $el = $(el);
        view = new Stratus.Internals.View({ el: $el });
        view.hydrate();
        if (parentView) {
            if (!view.has('entity')) {
                view.set(parentView.nest());
            } else {
                parentChild = true;
            }
        }
        view.clean();

        if (!parentChild) {

            // TODO: Add Previous Requirements Here!
            if (typeof requirements === 'undefined') requirements = ['stratus'];
            var template = view.get('template');
            var templates = view.get('templates');
            var dialogue = view.get('dialogue');
            var templateMap = [];

            // Add Scope
            if (view.get('scope') !== null) {
                requirements.push('stratus.' + view.get('scope') + 's.generic');
            }

            // Handle Alias or External Link
            if (view.get('alias') && _.has(requirejs.s.contexts._.config.paths, view.get('alias'))) {
                requirements.push(view.get('alias'));
            } else if (view.get('path')) {
                requirements.push(view.get('path'));
                var srcRegex = /(?=[^\/]*$)([a-zA-Z]+)/i;
                var srcMatch = srcRegex.exec(view.get('path'));
                view.set('type', _.ucfirst(srcMatch[1]));
            } else {
                view.set({
                    type: null,
                    alias: null,
                    path: null
                });
            }

            // Aggregate Template
            if (template !== null) {
                templates = _.extend((templates !== null) ? templates : {}, { combined: template });
            }

            // Aggregate Dialogue
            if (dialogue !== null) {
                templates = _.extend((templates !== null) ? templates : {}, { dialogue: dialogue });
            }

            // Gather All Templates
            if (templates !== null) {
                for (var key in templates) {
                    if (!templates.hasOwnProperty(key) || typeof templates[key] === 'function') continue;
                    if (templates[key].indexOf('#') === 0) {
                        var $domTemplate = $(templates[key]);
                        if ($domTemplate.length > 0) {
                            templates[key] = $domTemplate.html();
                        }
                    } else if (templates[key] in requirejs.s.contexts._.config.paths) {
                        requirements.push('text!' + templates[key]);
                        templateMap.push(key);
                    } else {
                        requirements.push('text!' + templates[key]);
                        templateMap.push(key);
                    }
                }
                view.set('templates', templates);
                templates = view.get('templates');
            }
        }

        return new Promise(function (fulfill, reject) {
            if (view.get('guid')) {
                if (!Stratus.Environment.get('production')) console.error('View hydration halted on', view.get('guid'), 'due to repeat calls on the same element.', view.toObject());
                fulfill(true);
                return true;
            }
            if (parentChild) {
                /* if (!Stratus.Environment.get('production')) console.warn('Parent Child Detected:', view.toObject()); */
                fulfill(true);
                return true;
            }
            require(requirements, function (Stratus) {
                if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.group('Stratus View');
                var hydrationKey = 0;
                if (templates && templateMap.length > 0) {
                    for (var i = 0; i < arguments.length; i++) {
                        if (typeof arguments[i] === 'string') {
                            if (arguments[i].indexOf('<html') === -1) {
                                templates[templateMap[hydrationKey]] = arguments[i];
                            } else {
                                console.error('Template', templates[templateMap[hydrationKey]], 'failed to load.');
                            }
                            hydrationKey++;
                        }
                    }
                }

                /* Refresh Template HTML on View */
                view.set('templates', templates);
                templates = view.get('templates');

                var subRequirements = [];

                /* Handle Custom Templates */
                if (_.size(templates) > 0) {
                    var re = /<.+?data-type=["|'](.+?)["|'].*>/gi;

                    /* Hydrate Underscore Templates */
                    _.each(templates, function (value, key) {
                        if (typeof value === 'string') {
                            if (value.search(re) !== -1) {
                                var match = re.exec(value);
                                while (match !== null) {
                                    var subRequirement = 'stratus.views.' + (view.get('plugin') ? 'plugins' : 'widgets') + '.' + match[1].toLowerCase();
                                    if (subRequirement && !_.has(requirejs.s.contexts._.config.paths, subRequirement)) {
                                        if (!Stratus.Environment.get('production')) console.warn('Sub Type:', subRequirement, 'not configured in require.js');
                                    }
                                    subRequirements.push(subRequirement);
                                    match = re.exec(value);
                                }
                            }
                            templates[key] = _.template(value);
                        }
                    });

                    /* Refresh Template Functions on View */
                    view.set('templates', templates);
                    templates = view.get('templates');
                }

                // Gather subRequirements
                if (view.get('plugins').length) {
                    _.each(view.get('plugins'), function (plugin) {
                        subRequirements.push('stratus.views.plugins.' + plugin.toLowerCase());
                    });
                }

                // Detect Loader Types
                var loaderTypes = [];
                if (view.get('plugin') !== null) loaderTypes.push('PluginLoader');
                if (view.get('type') !== null) loaderTypes.push('WidgetLoader');

                // Set Default Path
                if (!loaderTypes.length) loaderTypes.push('WidgetLoader');

                // Start Loader for each type detected
                _.each(loaderTypes, function (loaderType) {
                    /* If subRequirements are detected in Custom Template, load their types before the View is instantiated. */
                    if (_.size(subRequirements) === 0) {
                        Stratus.Internals[loaderType](fulfill, reject, view, requirements);
                    } else {
                        requirements = _.union(requirements, subRequirements);
                        new Promise(function (fulfill, reject) {
                            require(requirements, function (Stratus) {
                                Stratus.Internals[loaderType](fulfill, reject, view, requirements);
                            });
                        }).done(fulfill, reject);
                    }
                });
            });
        });
    };

    // Load Widgets
    /**
     * @param fulfill
     * @param reject
     * @param view
     * @param requirements
     * @constructor
     */
    Stratus.Internals.WidgetLoader = function (fulfill, reject, view, requirements) {
        /* TODO: In the a model scope, we are more likely to want a collection of the View to create the original reference, since it will be able to determine the model's relational data at runtime */
        if (view.get('scope') === 'model') {
            if (!Stratus.Models.has(view.get('entity'))) {
                /* TODO: Add Relations */
                Stratus.Models.set(view.get('entity'), Stratus.Models.Generic.extend({}));
            }

            var modelReference;
            var modelInstance;
            var modelInit = false;
            var ModelType = Stratus.Models.has(view.get('entity')) ? Stratus.Models.get(view.get('entity')) : null;

            if (!view.get('id') && view.get('manifest')) {
                modelInstance = view.get('entity') + 'Manifest';
                modelReference = Stratus.Instances[modelInstance];
                if (!modelReference) {
                    Stratus.Instances[modelInstance] = new ModelType();
                    modelReference = Stratus.Instances[modelInstance];
                    modelInit = true;
                }
            } else {
                if (ModelType && _.has(ModelType, 'findOrCreate')) {
                    modelReference = ModelType.findOrCreate(view.get('id'));
                    if (!modelReference) {
                        modelReference = new ModelType(view.modelAttributes());
                        modelInit = true;
                    }
                } else {
                    modelInstance = view.get('entity') + view.get('id');
                    modelReference = Stratus.Instances[modelInstance];
                    if (!modelReference) {
                        Stratus.Instances[modelInstance] = new ModelType(view.modelAttributes());
                        modelReference = Stratus.Instances[modelInstance];
                        modelInit = true;
                    }
                }
            }

            if (modelInit) {
                modelReference.safeInitialize(view.toObject());
            }
            view.set({ model: modelReference });
        } else if (view.get('scope') === 'collection') {
            // Create reference, if not defined
            if (!Stratus.Collections.has(view.get('entity'))) {
                Stratus.Collections.set(view.get('entity'), new Stratus.Collections.Generic(view.toObject()));

                // TODO: Inject prototype into Dynamic, Event-Controlled Namespace
                /*
                 Stratus.Collections.set(view.get('entity'), Stratus.Prototypes.Collections.Generic);
                 */
            }

            var collectionReference = Stratus.Collections.get(view.get('entity'));

            // Run initialization when the correct settings are present
            if (!collectionReference.initialized && view.get('fetch')) {
                collectionReference.safeInitialize(view.toObject());
            }

            // Set collection reference
            view.set({ collection: collectionReference });
        }

        if (view.get('type') !== null) {
            var type = _.ucfirst(view.get('type'));
            if (typeof Stratus.Views.Widgets[type] !== 'undefined') {
                //if (!Stratus.Environment.get('production')) console.info('View:', view.toObject());
                var options = view.toObject();
                options.view = view;
                Stratus.Instances[view.get('uid')] = new Stratus.Views.Widgets[type](options);
                Stratus.Instances[view.get('uid')].$el.attr('data-guid', view.get('uid'));
                if (_.has(Stratus.Instances[view.get('uid')], 'promise')) {
                    Stratus.Instances[view.get('uid')].initializer.done(fulfill, reject);
                } else {
                    fulfill(Stratus.Instances[view.get('uid')]);
                }
            } else {
                if (!Stratus.Environment.get('production')) console.warn('Stratus.Views.Widgets.' + type + ' is not correctly configured.');
                reject(new Stratus.Prototypes.Error({
                    code: 'WidgetLoader',
                    message: 'Stratus.Views.Widgets.' + type + ' is not correctly configured.'
                }, view.toObject()));
            }
            if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.groupEnd();
        } else {
            var nest = view.get('el').find('[data-type],[data-plugin]');
            if (nest.length > 0) {
                Stratus.Internals.Loader(view.get('el'), view, requirements).done(function (fulfillment) {
                    if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.groupEnd();
                    fulfill(fulfillment);
                }, function (rejection) {
                    if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.groupEnd();
                    reject(new Stratus.Prototypes.Error(rejection, nest));
                });
            } else {
                if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) {
                    console.warn('No Innate or Nested Type Found:', view.toObject());
                    fulfill(view.toObject());
                    console.groupEnd();
                } else {
                    fulfill(view.toObject());
                }
            }
        }
    };

    // Load Plugins Like we Load Views
    /**
     * @param fulfill
     * @param reject
     * @param view
     * @param requirements
     * @constructor
     */
    Stratus.Internals.PluginLoader = function (fulfill, reject, view, requirements) {
        var types = _.union([view.get('plugin')], view.get('plugins'));
        _.each(types, function (type) {
            type = _.ucfirst(type);
            if (typeof Stratus.Views.Plugins[type] !== 'undefined') {
                var options = view.toObject();
                options.view = view;
                Stratus.Instances[view.get('uid')] = new Stratus.Views.Plugins[type](options);
                Stratus.Instances[view.get('uid')].$el.attr('data-guid', view.get('uid'));
                if (_.has(Stratus.Instances[view.get('uid')], 'promise')) {
                    Stratus.Instances[view.get('uid')].initializer.done(fulfill, reject);
                } else {
                    fulfill(Stratus.Instances[view.get('uid')]);
                }
            } else {
                if (!Stratus.Environment.get('production')) console.warn('Stratus.Views.Plugins.' + type + ' is not correctly configured.');
                reject(new Stratus.Prototypes.Error({
                    code: 'PluginLoader',
                    message: 'Stratus.Views.Plugins.' + type + ' is not correctly configured.'
                }, view.toObject()));
            }
        });
    };

    // Internal URL Handling
    // ---------------------

    // This function digests URLs into an object containing their respective
    // values, which will be merged with requested parameters and formulated
    // into a new URL. TODO: Move this into underscore as a mixin.
    /**
     * @param params
     * @param url
     * @returns {string|*}
     * @constructor
     */
    Stratus.Internals.SetUrlParams = function (params, url) {
        if (typeof url === 'undefined') url = window.location.href;
        var vars = {};
        var glue = url.indexOf('?');
        url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        vars = _.extend(vars, params);
        url = (glue >= 0) ? url.substring(0, glue) : url;
        url += '?' + $.param(vars);
        return url;
    };

    // AddClose
    // --------
    // TODO: I'm not sure if this is the best way of doing this... currently used in the Drawer
    // Add a standard close button to any element.
    Stratus.PluginMethods.AddClose = function (el) {
        el.prepend('<button type="button" class="btnClose"><span class="sr-only">Toggle Navigation</span><svg viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g id="close-' + el.attr('id') + '" fill="none" transform="translate(1.000000, 2.000000)"><g id="closeX" transform="translate(16.271267, 15.687500)" stroke-linecap="square" stroke="#666"><g id="lineLeft"><path d="M1.63636364,0.5875 L16.3737342,16.4608762"></path></g><g id="lineRight"><path d="M15.8181818,0.5875 L1.08081124,16.4608762"></path></g></g><circle class="oval" stroke="#555" cx="24.7258128" cy="24" r="24"></circle></g></svg></button>');
    };

    // Post Message Handling
    // ---------------------

    // This function executes when the window receives a Post Message
    // Convoy from another source as a (i.e. Window, iFrame, etc.)
    /**
     * @param fn
     * @constructor
     */
    Stratus.PostMessage.Convoy = function (fn) {
        window.addEventListener('message', fn, false);
    };

    // When a message arrives from another source, handle the Convoy
    // appropriately.
    Stratus.PostMessage.Convoy(function (event) {

        /*if (event.origin !== "https://auth.sitetheory.io/" || event.origin !== "https://admin.sitetheory.io/") return;*/
        var convoy = JSON.parse(event.data);

        /*
         Stratus.Events.trigger("alert", JSON.stringify(convoy));
         Stratus.Events.trigger("alert", 'mobile: '+Stratus.Client.mobile);
         console.log('Session:', $.cookie("SITETHEORY"));
         console.log(($.cookie("SITETHEORY") !== convoy.meta.session) ? 'Changed:' : 'No Changes:', $.cookie("SITETHEORY"), convoy.meta.session);
         console.log('PostMessage', event, convoy);
         */

        if ($.cookie('SITETHEORY') !== convoy.meta.session) {
            $.cookie('SITETHEORY', convoy.meta.session);
            if (!Stratus.Client.safari) location.reload(true);
        }
        /*event.source.postMessage()*/
    });

    // DOM Listeners
    // -------------

    // This function executes when the DOM is Ready, which means
    // the DOM is fully parsed, but still loading sub-resources
    // (CSS, Images, Frames, etc).
    /**
     * @param fn
     */
    Stratus.DOM.ready = function (fn) {
        (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn);
    };

    // This function executes when the DOM is Complete, which means
    // the DOM is fully parsed and all resources are rendered.
    /**
     * @param fn
     */
    Stratus.DOM.complete = function (fn) {
        (document.readyState === 'complete') ? fn() : window.addEventListener('load', fn);
    };

    // This function executes before the DOM has completely Unloaded,
    // which means the window/tab has been closed or the user has
    // navigated from the current page.
    /**
     * @param fn
     */
    Stratus.DOM.unload = function (fn) {
        window.addEventListener('beforeunload', fn);
    };

    // Key Maps
    // --------

    // These constants intend to map keys for most browsers.
    Stratus.Key.Enter = 13;
    Stratus.Key.Escape = 27;

    // Stratus Layer Events
    // --------------------

    // When these events are triggered, all functions attached to the event name
    // will execute in order of initial creation.  This becomes supremely useful
    // when adding to the Initialization and Exit Routines as AMD Modules, views
    // and custom script(s) progressively add Objects within the Stratus Layer.

    _.extend(Stratus.Events, Backbone.Events);

    Stratus.Events.on('initialize', function () {
        if (!Stratus.Environment.get('production')) {
            console.groupEnd();
            console.group('Stratus Initialize');
        }
        Stratus.Internals.Compatibility();
        Stratus.RegisterGroup = new Stratus.Prototypes.Collection();

        // Start Generic Router
        require(['stratus.routers.generic'], function () {
            Stratus.Routers.set('generic', new Stratus.Routers.Generic());
            Stratus.Instances[_.uniqueId('router.generic_')] = Stratus.Routers.get('generic');
        });

        // Load Views
        Stratus.Internals.Loader().done(function (views) {
            if (!Stratus.Environment.get('production')) console.info('Views:', views);
            Stratus.Events.on('finalize', function (views) {
                if (!Backbone.History.started) Backbone.history.start();
                Stratus.Events.trigger('finalized', views);
            });
            Stratus.Events.trigger('finalize', views);
        }, function (error) {
            console.error('Stratus Loader:', error);
        });

    });
    Stratus.Events.on('finalize', function () {
        if (!Stratus.Environment.get('production')) {
            console.groupEnd();
            console.group('Stratus Finalize');
        }

        // Load Internals after Widgets and Plugins
        new Stratus.Internals.Anchor();
        new Stratus.Internals.LazyLoad();

        // Call Any Registered Group Methods that plugins might use, e.g. OnScroll
        if (Stratus.RegisterGroup.size) {
            Stratus.RegisterGroup.each(function (objs, key) {
                // for each different type of registered plugin, pass all the registered elements
                if (_.has(Stratus.Internals, key)) {
                    Stratus.Internals[key](objs);
                }
            });
        }
    });
    Stratus.Events.on('terminate', function () {
        if (!Stratus.Environment.get('production')) {
            console.groupEnd();
            console.group('Stratus Terminate');
        }
    });

    // This is the prototype for a bootbox event, in which one could be
    // supplied for any bootbox message (i.e. confirm or delete), or one
    // will automatically be created at runtime using current arguments.
    /**
     * @param message
     * @param handler
     * @constructor
     */
    Stratus.Prototypes.Bootbox = function (message, handler) {
        if (message && typeof message === 'object') {
            _.extend(this, message);
            this.message = this.message || 'Message';
        } else {
            this.message = message || 'Message';
        }
        this.handler = this.handler || handler;
        if (typeof this.handler !== 'function') {
            this.handler = function (result) {
                console.info('Client ' + (result === undefined ? 'closed' : (result ? 'confirmed' : 'cancelled')) + ' dialog.');
            };
        }
    };

    // This event supports both Native and Bootbox styling to generate
    // an alert box with an optional message and handler callback.
    Stratus.Events.on('alert', function (message, handler) {
        if (!(message instanceof Stratus.Prototypes.Bootbox)) {
            message = new Stratus.Prototypes.Bootbox(message, handler);
        }
        /*if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') {*/
        if (typeof bootbox !== 'undefined') {
            bootbox.alert(message.message, message.handler);
        } else {
            alert(message.message);
            message.handler();
        }
    });

    // This event supports both Native and Bootbox styling to generate
    // a confirmation box with an optional message and handler callback.
    Stratus.Events.on('confirm', function (message, handler) {
        if (!(message instanceof Stratus.Prototypes.Bootbox)) {
            message = new Stratus.Prototypes.Bootbox(message, handler);
        }
        /*if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') {*/
        if (typeof bootbox !== 'undefined') {
            bootbox.confirm(message.message, message.handler);
        } else {
            handler(confirm(message.message));
        }
    });

    // This is the prototype for the toaster, in which one could be supplied
    // for a toast message, or one will automatically be created at runtime
    // using current arguments.
    /**
     * @param message
     * @param title
     * @param priority
     * @param settings
     * @constructor
     */
    Stratus.Prototypes.Toast = function (message, title, priority, settings) {
        if (message && typeof message === 'object') {
            _.extend(this, message);
            this.message = this.message || 'Message';
        } else {
            this.message = message || 'Message';
        }
        this.title = this.title || title || 'Toast';
        this.priority = this.priority || priority || 'danger';
        this.settings = this.settings || settings;
        if (!this.settings || typeof this.settings !== 'object') {
            this.settings = {};
        }
        this.settings.timeout = this.settings.timeout || 10000;
    };

    // This event only supports Toaster styling to generate a message
    // with either a Bootbox or Native Alert as a fallback, respectively.
    Stratus.Events.on('toast', function (message, title, priority, settings) {
        if (!(message instanceof Stratus.Prototypes.Toast)) {
            message = new Stratus.Prototypes.Toast(message, title, priority, settings);
        }
        /*if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') {*/
        if (typeof $ !== 'undefined' && $.toaster) {
            $.toaster(message);
        } else {
            Stratus.Events.trigger('alert', message.message);
        }
    });

    // DOM Ready Routines
    // ------------------
    // TODO: DOM.ready and DOM.complete is redundant from version above. Remove?
    // On DOM Ready, add browser compatible CSS classes and digest DOM data-entity attributes.
    Stratus.DOM.ready(function () {
        $('body').removeClass('loaded unloaded').addClass('loading');
        Stratus.Events.trigger('initialize');
    });

    // DOM Complete Routines
    // ---------------------

    // Stratus Events are more accurate than the DOM, so nothing is added to this stub.
    Stratus.DOM.complete(function () {
        $('body').removeClass('loading unloaded').addClass('loaded');
    });

    // DOM Unload Routines
    // -------------------

    // On DOM Unload, all inherent Stratus functions will cleanly
    // break any open connections or currently operating routines,
    // while providing the user with a confirmation box, if necessary,
    // before close routines are triggered.
    Stratus.DOM.unload(function (event) {
        $('body').removeClass('loading loaded').addClass('unloaded');
        Stratus.Events.trigger('terminate', event);
        /*
        if (event.cancelable === true) {
            // TODO: Check if any unsaved changes exist on any Stratus Models then request confirmation of navigation
            event.preventDefault();
            var confirmationMessage = 'You have pending changes, if you leave now, they may not be saved.';
            (event || window.event).returnValue = confirmationMessage;
            return confirmationMessage;
        }
        */
    });

    // Handle Scope
    // -------------------

    // Return the Stratus Object so it can be attached in the correct context as either a Global Variable or Object Reference
    return Stratus;

}));
