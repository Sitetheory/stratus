//     Stratus.Views.DateTime.js 1.0

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
        define(['stratus', 'jquery', 'underscore', 'moment', 'promise', 'datetimepicker', 'stratus.views.widgets.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.moment);
    }
}(this, function (Stratus, $, _, moment) {

    // DateTime Widget
    // ---------------

    // This is the base view for all dateTime widgets, which extends the base view.
    Stratus.Views.Widgets.DateTime = Stratus.Views.Widgets.Base.extend({

        model: Stratus.Models.Generic,

        // The template MUST add the id = elementId (in this case to the surrounding div not the input, according to the dateTimePicker docs
        template: _.template('{% if (options.inline) { %}<div id="{{ elementId }}"></div>{% } else { %}<div id="{{ elementId }}" class="input-group date"><input type="text" class="form-control"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div>{% } %}'),

        options: {
            private: {
                autoSave: true,
                emptyValue: null,

                // If there is no model you want this to sync with, but you want to set a default starting value
                customValue: null,
                requiredCssFile: [Stratus.BaseUrl + 'sitetheorycore/dist/bootstrap/bootstrap-datetimepicker.min.css'],

                // Valid options that can be passed into dateTimePicker
                dateTimePicker: {
                    // Show the picker on the page instead of on a click event
                    inline: false,

                    // Show the date and the time side by side
                    sideBySide: false,

                    // Use the current date when opening up (useful to leave empty in some cases)
                    useCurrent: true,

                    // Show the trash icon to "clear" the selected date.
                    showClear: true,
                    toolbarPlacement: 'bottom',
                    widgetPositioning: { horizontal: 'auto', vertical: 'bottom' }
                }
            },
            public: {
                // Even though this is also from the dateTimePickerOptions, this is here also in custom options so that it
                // gets passed to the template (both variables will pull the value from the same data attribute on the DOM)
                inline: false,
                format: 'LLL',
                placeholder: 'Click to Add Date'
            }
        },

        // The Date Time Picker Object Created
        dateTimePicker: null,

        // additionalCustomOptions()
        // ------------------
        // Options to manipulate after the data attributes have been fetched
        postOptions: function (options) {
            // We pass in the options for dataTimePicker from the data attributes, but if we pass in unrecognized values
            // from the default optionsCustom it throws an error. So we need to get the data attributes specifically
            // for the dateTimePicker separately
            this.getDataOptions(this.options.dateTimePicker);

            // If it's set to be inline, then the style should not be form because form-control does weird stuff to overflow
            if (this.options.inline) this.options.style = 'widget';
        },

        // setEvents()
        // -----------
        // Set custom events because the backbone events won't work because they are on the outer element not the editable element
        /**
         * @returns {boolean}
         */
        registerElement: function () {
            if (!this.$element || !this.$element.length) return false;

            // Hydrate Element
            this.$element.datetimepicker(this.options.dateTimePicker);
            this.dateTimePicker = this.$element.data('DateTimePicker');

            // If customValue is set (e.g. publish sets one on the internal date time picker)
            if (this.options.customValue) {
                this.setValue(this.options.customValue);
            }

            // Also available but not needed "dp.change"
            this.$element.on('dp.show', function (event) {
                this.focusAction(event);
            }.bind(this));
            this.$element.on('dp.hide', function (event) {
                this.blurAction(event);
            }.bind(this));

            // If it's not display inline (and there is an input element) the input element should register blur
            if (!this.options.inline) {
                this.$elementInput = this.$element.find('input');

                // Native DatetimePicker events don't work as documented, so we just do native
                this.$elementInput.on('focus', function (event) {
                    this.focusAction(event);
                }.bind(this));
                this.$elementInput.on('blur', function (event) {
                    this.blurAction(event);
                }.bind(this));
                this.$elementInput.on('keydown', function (event) {
                    this.keyActions(event);
                }.bind(this));
            }

            return true;
        },

        // getValue()
        // ----------
        /**
         * @returns {*}
         */
        getValue: function () {
            return (typeof this.dateTimePicker === 'object' && this.dateTimePicker && this.dateTimePicker.date()) ? this.dateTimePicker.date().unix() : null;
        },

        // setValue()
        // --------------
        /**
         * @returns {*}
         */
        setValue: function (value) {
            if (!value || typeof this.dateTimePicker !== 'object' || !this.dateTimePicker) return false;

            // convert timestamp to
            var momentTime = moment.unix(value);

            // The Date Time Picker object is stored in a data attribute
            return (momentTime) ? this.dateTimePicker.date(momentTime) : momentTime;
        },

        // formatDisplayValue()
        // --------------------
        // If you need the value that gets displayed to the DOM to be formatted differently (e.g. convert timestamp to a date)
        // you can customize this value on any widget.
        /**
         * @param value
         * @returns {*|string}
         */
        formatDisplayValue: function (value) {
            return (value && this.options.format) ? moment.unix(value).format(this.options.format) : value || '';
        }

    });

}));
