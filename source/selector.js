// Native Selector
// ---------------

// This function intends to allow native jQuery-Type chaining and plugins.
/**
 * @param selector
 * @param context
 * @returns {NodeList|Node}
 * @constructor
 */
Stratus.Select = function (selector, context) {
    if (!context) context = document;
    var selection = selector;
    if (typeof selector === 'string') {
        var target;
        if (_.startsWith(selector, '.') || _.contains(selector, '[')) {
            target = 'querySelectorAll';
        } else if (_.contains(['html', 'head', 'body'], selector) || _.startsWith(selector, '#')) {
            target = 'querySelector';
        } else {
            target = 'querySelectorAll';
        }
        selection = context[target](selector);
    }
    if (selection && typeof selection === 'object') {
        if (_.isAngular(selection) || _.isjQuery(selection)) {
            selection = selection.length ? _.first(selection) : {};
        }
        selection = _.extend({}, Stratus.Selector, {
            context: this,
            length: _.size(selection),
            selection: selection,
            selector: selector
        });
    }
    return selection;
};
Stratus = _.extend(function (selector, context) {
    // The function is a basic shortcut to the Stratus.Select
    // function for native jQuery-like chaining and plugins.
    return Stratus.Select(selector, context);
}, Stratus);

// Selector Plugins
// ----------------

/**
 * @param attr
 * @param value
 * @returns {*}
 * @constructor
 */
Stratus.Selector.attr = function (attr, value) {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) {
            console.log('List:', that);
        }
    } else if (attr) {
        if (typeof value === 'undefined') {
            value = that.selection.getAttribute(attr);
            return _.isJSON(value) ? JSON.parse(value) : value;
        } else {
            that.selection.setAttribute(attr, typeof value === 'string' ? value : JSON.stringify(value));
        }
    }
    return that;
};

/**
 * @param callable
 * @returns {*}
 */
Stratus.Selector.each = function (callable) {
    var that = this;
    if (typeof callable !== 'function') {
        callable = function (element) {
            console.warn('each running on element:', element);
        };
    }
    if (that.selection instanceof NodeList) {
        _.each(that.selection, callable);
    }
    return that;
};

/**
 * @param selector
 * @returns {*}
 */
Stratus.Selector.find = function (selector) {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) console.log('List:', that);
    } else if (selector) {
        return Stratus(selector, that.selection);
    }
    return that;
};

/**
 * @param callable
 * @returns {*}
 */
Stratus.Selector.map = function (callable) {
    var that = this;
    if (typeof callable !== 'function') {
        callable = function (element) {
            console.warn('map running on element:', element);
        };
    }
    if (that.selection instanceof NodeList) {
        return _.map(that.selection, callable);
    }
    return that;
};

/**
 * TODO: Merge with prepend
 *
 * @param child
 * @returns {*}
 */
Stratus.Selector.append = function (child) {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) console.log('List:', that);
    } else if (child) {
        that.selection.insertBefore(child, that.selection.lastChild);
    }
    return that;
};

/**
 * TODO: Merge with append
 *
 * @param child
 * @returns {*}
 */
Stratus.Selector.prepend = function (child) {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) console.log('List:', that);
    } else if (child) {
        that.selection.insertBefore(child, that.selection.firstChild);
    }
    return that;
};

// Design Plugins
/**
 * @param className
 * @returns {*}
 * @constructor
 */
Stratus.Selector.addClass = function (className) {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) console.log('List:', that);
    } else {
        _.each(className.split(' '), function (name) {
            if (that.selection.classList) {
                that.selection.classList.add(name);
            } else {
                that.selection.className += ' ' + name;
            }
        });
    }
    return that;
};

/**
 * @param className
 * @returns {*}
 * @constructor
 */
Stratus.Selector.removeClass = function (className) {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) {
            console.log('List:', that);
        }
    } else {
        if (that.selection.classList) {
            _.each(className.split(' '), function (name) {
                that.selection.classList.remove(name);
            });
        } else {
            that.selection.className = that.selection.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }
    return that;
};

/**
 * @returns {CSSStyleDeclaration|*}
 */
Stratus.Selector.style = function () {
    var that = this;
    if (that.selection instanceof NodeList) {
        if (!Stratus.Environment.get('production')) console.log('List:', that);
    } else if (that.selection instanceof Node) {
        return getComputedStyle(that.selection);
    }
    return that;
};

// Positioning Plugins
/**
 * @returns {number|*}
 */
Stratus.Selector.height = function () {
    var that = this;
    if (that.selection instanceof NodeList) {
        console.error('Unable to find height for element:', that.selection);
    } else {
        return that.selection.offsetHeight || 0;
    }
    return that;
};

/**
 * @returns {number|*}
 */
Stratus.Selector.width = function () {
    var that = this;
    if (that.selection instanceof NodeList) {
        console.error('Unable to find width for element:', that.selection);
    } else {
        return that.selection.offsetWidth || 0;
    }
    return that;
};

/**
 * @returns {{top: number, left: number}|*}
 */
Stratus.Selector.offset = function () {
    var that = this;
    if (that.selection instanceof NodeList) {
        console.error('Unable to find offset for element:', that.selection);
    } else if (that.selection.getBoundingClientRect) {
        var rect = that.selection.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }
    return that;
};

/**
 * @returns {*}
 */
Stratus.Selector.parent = function () {
    var that = this;
    if (that.selection instanceof NodeList) {
        console.error('Unable to find offset for element:', that.selection);
    } else {
        return Stratus(that.selection.parentNode);
    }
    return that;
};