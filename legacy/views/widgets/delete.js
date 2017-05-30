//     Stratus.Views.Delete.js 1.0

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

// Examples
// ========

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values. See the options in this.options below to know which attributes can be modified from the data attributes.

// Widget
// ======

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'zepto', 'underscore', 'stratus.views.widgets.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Delete Widget
    // -------------

    // Delete view which extends the view base
    Stratus.Views.Widgets.Delete = Stratus.Views.Widgets.Base.extend({

        // Properties
        template: _.template('{% if (options.icon !== false) { %}<span id="{{ elementId }}" class="{{ options.classBtn }}">{% if (options.icon === null) { %}<svg viewBox="0 0 50 50" version="1.1"xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-{{ elementId }}"><stop class="stop1" stop-color="#666666" offset="0%"></stop><stop class="stop2" stop-color="#666666" offset="100%"></stop></linearGradient></defs><g id="{{ elementId }}" class="actionButton" fill="url(#linearGradient-{{ elementId }})"><path d="M9.98721875,42 C9.98721875,44.209 11.736676,45.99 13.8951228,45.99 L36.092096,45.99 C38.2564134,45.99 40,44.204 40,42 L40,17 L10,17 L9.98721875,42 Z M16.9936094,23.904 L18.9872188,23.904 L18.9872188,40.0891113 L16.9936094,40.0891113 L16.9936094,23.904 Z M23.9286042,23.904 L25.9872188,23.904 L25.9872188,40.0891113 L23.9286042,40.0891113 L23.9286042,23.904 Z M30.9936094,23.904 L32.9872188,23.904 L32.9872188,40.0891113 L30.9936094,40.0891113 L30.9936094,23.904 Z" id="trashBase"></path><path d="M29.2875402,9.05695537 L29.2875402,5 L20.7124598,5 L20.7124598,9.05695537 L13.20584,9.05695537 C11.4407276,9.05695537 9.99360938,10.4185299 9.99360938,12.0985149 L9.98721875,15 L40,15 L40.0063906,12.0985149 C40.0063906,10.4222324 38.5680784,9.05695537 36.79416,9.05695537 L29.2875402,9.05695537 Z M22.8562299,7.02801488 L27.1437701,7.02801488 L27.1437701,9.05602976 L22.8562299,9.05602976 L22.8562299,7.02801488 Z" id="trashLid"></path></g></svg>{% } else { %}{{ options.icon }}{% } %}</span>{% } %}{% if (options.textOn !== false) { %}<span class="{{ options.classOn }}">{{ options.textOn }}</span><span class="{{ options.classOff }}">{{ options.textOff }}</span>{% } %}'),
        events: {
            click: 'saveAction'
        },
        options: {
            private: {
                forceType: 'model'
            },
            public: {
                editable: false,

                // set to NULL to use default icon, FALSE to hide button, or set to HTML (e.g. an SVG) if you want a custom icon.
                icon: null,

                // set to false if you do not want delete/undelete text
                textOn: 'Delete',
                textOff: 'Undelete',
                textDeleteConfirm: 'Are you sure you want to delete this?',
                classBtn: 'btnIcon',
                classOn: 'btnText smallLabel textOn',
                classOff: 'btnText smallLabel textOff',
                destroy: false,

                // specify if the widget should redirect the page after deletion
                redirect: null,

                // specify an integer representing the minimum number of collections that need to be present in order for
                // button to appear
                collectionMin: null
            }
        },

        /**
         * @returns {boolean}
         */
        onRegister: function () {
            if (this.options.collectionMin && _.has(this.model, 'collection') && typeof this.model.collection !== 'function') {
                // Don't allow destroying
                this.model.collection.on('add', this.checkMin, this);
                this.model.collection.on('remove', this.checkMin, this);
                this.checkMin();
            }
            this.model.on('change', this.scopeChanged, this);
            this.model.on('success', this.successAction, this);
            return true;
        },

        // checkMin()
        // ----------
        // Check whether there is a minimum number of collections in order to show or hide the delete button
        checkMin: function () {
            this.disabled = false;
            if (this.model.collection.length <= this.options.collectionMin) {
                this.disabled = true;
                this.$el.addClass('hidden');
            } else {
                this.$el.removeClass('hidden');
            }
        },

        // When the button is clicked toggle the delete status.
        saveAction: function (options) {

            if (this.disabled) return this;

            if (this.options.destroy) {
                this.model.destroy();
            } else {
                // TODO: use the small confirm/cancel popover
                if (this.toggleValue() < 0 && this.options.textDeleteConfirm) {
                    this.confirm  = this.confirm || new Stratus.Prototypes.Bootbox(
                        {
                            message: this.options.textDeleteConfirm,
                            handler: function (result) {
                                if (result) this.model.save({ status: this.toggleValue() });
                            }.bind(this)
                        }
                    );
                    Stratus.Events.trigger('confirm', this.confirm);
                } else {
                    this.model.save({ status: this.toggleValue() });
                }
            }

            return this;
        },

        // If this model is updated anywhere, check the status and update the DOM.
        /**
         * @param event
         */
        scopeChanged: function (event) {
            // Toggle Class
            var deleteStatus = (this.model.get('status') === -1);
            this.$el.toggleClass('deleted', deleteStatus);
            this.$el.toggleClass('on', !deleteStatus);
            this.$el.toggleClass('off', deleteStatus);
        },

        // After successfully deleting or undeleting, remove model from DOM or redirect
        successAction: function (model, response, options) {
            // If a redirect is set and it's just been deleted, redirect to that URL on Delete
            if (this.model.get('status') === -1) {
                if (this.options.redirect) {
                    window.location.href = this.options.redirect;
                } else if (this.options.destroy) {
                    // TODO: allow specifying an alternative element (e.g. not the delete button)
                    // this.$el.remove();
                }
            }
        },

        // If the entity is deleted return 0 (status off but not deleted). If status is not deleted, return -1 delete (deleted).
        toggleValue: function () {
            // If the Value is boolean, just get the opposite for now (see above)
            return (this.model.get('status') === -1) ? 0 : -1;
        }

    });

}));
