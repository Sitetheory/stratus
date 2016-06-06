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

// Description
// -------------
// Render a widget that edits basic text content.

// Examples
// -------------

// Minimum Implementation
/*

 <div data-entity="view" data-id="99">
 <div data-type="text" data-property="viewVersion.title"></div>
 </div>

 <div data-entity="view" data-id="99" data-type="text" data-property="viewVersion.title"></div>

 */

// All Options
/*

 <div data-type="text" data-property="viewVersion.title" data-label="Title" data-help="Foo bar" data-style="form" data-render="click|auto" data-status="load" data-feedback="true" data-templates='{"render":"#myTemplate"}' data-options='{"autoSave": true, "autoSaveInterval": 5000}'></div>

 */

// The custom template must include the {{ elementId }} variable for the id of the editable element.
/*

 <div id="fooBar" data-type="text" data-property="viewVersion.title"></div>
 <script id="render_fooBar">
 <div id="{{ elementId }}">Template to Render</div>
 </script>


 */

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values in this.options
/*
 data-render: Determine whether to load automatically. If this value is "auto" or not set, the widget will render immediately. Otherwise, if it's set as "click" or "hover" it will render for the first time on that event.
 */

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

    // Text Widget
    // -------------

    // This is the base view for all text widgets, which extends the base view.
    Stratus.Views.Widgets.Text = Stratus.Views.Widgets.Base.extend({

        // Properties
        model: Stratus.Models.Generic,

        // The template MUST add the id = elementId
        template: _.template('{% if (options.before || options.after) { %}<div class="input-group">{% } %}{% if (options.before) { %}<span class="before{% if ( options.style === "form") { %} input-group-addon{% } %}">{{ options.before }}</span>{% } %}<span id="{{ elementId }}" class="widgetText" contenteditable="true"></span>{% if (options.after) { %}<span class="after{% if ( options.style === "form") { %} input-group-addon{% } %}">{{ options.after }}</span>{% } %}{% if (options.before || options.after) { %}</div>{% } %}'),

        // Standard Options for View
        options: {
            private: {
                // Editable Input
                editable: true,
                autoSave: true,
                forceType: 'model'
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
                // message, title, class
                Stratus.Events.trigger('toast', 'The data-property attribute is missing.', 'Missing Data Attribute', 'danger');
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
            return (!this.$element || !this.$element.length) ? false : this.$element.text();
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
            this.$element.text(value);
            return true;
        }

    });

}));
