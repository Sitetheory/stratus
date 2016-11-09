//     jQuery.Private.js 1.0

//     Copyright (c) 2015 by Sitetheory, All Rights Reserved
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

// jQuery Definition
// ------------------

// Enable noConflict to ensure this version's jQuery globals aren't set in Require.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery-core'], factory);
    } else {
        factory(root.jQuery);
    }
}(this, function () {

    // This sandboxes jquery's dollar sign
    var sandbox =  jQuery.noConflict(true);

    // Notify developers of sandbox version
    if (typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1) {
        console.log('Sandbox jQuery:', sandbox.fn.jquery);
    }

    /**
     * @param str
     * @returns {boolean}
     */
    sandbox.fn.isJSON = function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    /**
     * @param key
     * @param value
     * @returns {*}
     */
    sandbox.fn.dataAttr = function (key, value) {
        if (key === undefined) console.error('$().dataAttr(key, value) contains an undefined key!');
        if (value === undefined) {
            value = this.attr('data-' + key);
            return sandbox.fn.isJSON(value) ? JSON.parse(value) : value;
        } else {
            return this.attr('data-' + key, JSON.stringify(value));
        }
    };

    /**
     * @param event
     * @returns {boolean}
     */
    sandbox.fn.notClicked = function (event) {
        if (!this.selector) console.error('No Selector:', this);
        return (!sandbox(event.target).closest(this.selector).length && !sandbox(event.target).parents(this.selector).length);
    };

    // Return jQuery Sandbox for assigning local dollar signs
    return sandbox;
}));
