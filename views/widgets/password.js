//     Stratus.Views.Text.js 1.0
//
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
        define(['stratus', 'jquery', 'underscore', 'stratus.views.widgets.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Password Widget
    // -------------

    // This is the base view for all text widgets, which extends the base view.
    Stratus.Views.Widgets.Password = Stratus.Views.Widgets.Base.extend({

        // Properties
        model: Stratus.Models.Generic,

        // The template MUST add the id = elementId
        template: _.template('{% if (options.before || options.after) { %}<div class="input-group">{% } %}{% if (options.before) { %}<span class="before{% if ( options.style === "form") { %} input-group-addon{% } %}">{{ options.before }}</span>{% } %}<input id="{{ elementId }}" class="widgetText" type="password">{% if (options.after) { %}<span class="after{% if ( options.style === "form") { %} input-group-addon{% } %}">{{ options.after }}</span>{% } %}{% if (options.before || options.after) { %}</div>{% } %}'),

        // Standard Options for View
        options: {
            private: {
                autoSave: true,
                forceType: 'model'
            },
            public: {
                editable: true,

                // TODO: build these options
                confirm: false,
                strength: false
            }
        },

        // validate()
        // -----------
        // Custom validate to check that the element contains the minimum required data attributes
        /**
         * @returns {boolean}
         */
        validate: function () {
            if (!this.$el.dataAttr('property')) {
                Stratus.Events.trigger('toast', new Stratus.Prototypes.Toast({
                    priority: 'danger',
                    title: 'Missing Data Attribute',
                    message: 'The data-property attribute is missing.'
                }));
                return false;
            }
            return true;
        },

        // getValue()
        // -----------
        // Get the value for this widget
        /**
         * @returns {*}
         */
        getValue: function () {
            return (!this.$element || !this.$element.length) ? false : this.$element.val();
        },

        // setValue()
        // -----------
        // Set the value on this widget
        /**
         * @param value
         * @returns {boolean}
         */
        setValue: function (value) {
            if (!this.$element || !this.$element.length) return false;
            this.$element.val(value);
            return true;
        }

    });

}));
