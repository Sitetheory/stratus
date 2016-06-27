//     Stratus.Views.Publish.js 1.0

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
        define(['stratus', 'jquery', 'underscore', 'moment', 'bootstrap', 'stratus.views.widgets.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.moment);
    }
}(this, function (Stratus, $, _, moment) {

    // Publish Widget
    // -------------

    // Publish view which extends the view base.
    Stratus.Views.Widgets.Publish = Stratus.Views.Widgets.Base.extend({

        // Properties
        model: Stratus.Models.Generic,

        // Reference stratus.templates.publish.html for non-minified version
        template: _.template('<div class="customFontPrimary btn-group"> <div id="{{ elementId }}" class="btn btnPublish btnPublishNow"> <div class="btnGradientLight"></div> <span class="publishIcon"><svg viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-{{ elementId }}"><stop class="stop1" stop-color="#666" offset="0%"></stop><stop class="stop2" stop-color="#666" offset="100%"></stop></linearGradient></defs><g id="{{ elementId }}" class="actionButton" fill="url(#linearGradient-{{ elementId }})"><path d="M28,30.1375457 L32.6427791,30.1375457 L25.3213895,21.7702433 L18,30.1375457 L23,30.1375457 L23,35.1375457 L28,35.1375457 L28,30.1375457 Z M14.3930477,42.7642673 C14.0797205,42.7921292 13.7624003,42.8063635 13.4417034,42.8063635 C7.67490984,42.8063635 3,38.2036363 3,32.5258846 C3,26.9640464 7.48597806,22.4337866 13.0899051,22.2511307 C13.0898906,22.2434018 13.0898833,22.2356713 13.0898833,22.227939 C13.0898833,15.5505992 18.5029368,10.1375457 25.1802767,10.1375457 C31.8576166,10.1375457 37.2706701,15.5505992 37.2706701,22.227939 C37.2706701,22.2416148 37.2706473,22.2552852 37.270602,22.2689504 C42.7051812,22.629413 47,27.0838387 47,32.5258846 C47,38.0471916 42.5791658,42.5519003 37.0324293,42.7959538 L37.3056032,43.1375457 L14.2064766,43.1375457 L14.3930477,42.7642673 Z" id="publishVector"></path><path d="M72.701859,34.2998948 L64.8351456,26.4521221 L68.6232901,22.6260961 L72.4998246,26.5026307 L81.300947,17.7015082 L85.3037531,21.7043143 L72.701859,34.2998948 Z M75,7 C65.0561207,7 57,15.0624342 57,25 C57,34.9375658 65.0624342,43 75,43 C84.9375658,43 93,34.9375658 93,25 C93,15.0624342 84.9438793,7 75,7 L75,7 Z" id="publishedVector"></path><path d="M118.142857,12.7890403 L133.857143,12.7890403 L133.857143,17.5533347 C133.857143,21.0635219 131.076209,24.506013 127.632002,25.2192395 C127.632002,25.2192395 126.544646,25.5 126.027623,25.5 C125.492184,25.5 124.368303,25.2118984 124.368303,25.2118984 C120.930084,24.4923777 118.142857,21.0598417 118.142857,17.5533347 L118.142857,12.7890403 Z M133.857143,38.2109597 L118.142857,38.2109597 L118.142857,33.4466653 C118.142857,29.9364781 120.923791,26.493987 124.367998,25.7807605 C124.367998,25.7807605 125.455354,25.5 125.972377,25.5 C126.507816,25.5 127.631697,25.7881016 127.631697,25.7881016 C131.069916,26.5076223 133.857143,29.9401583 133.857143,33.4466653 L133.857143,38.2109597 Z M115,8 L137,8 L137,11.1818182 L115,11.1818182 L115,8 Z M115,39.8181818 L137,39.8181818 L137,43 L115,43 L115,39.8181818 Z" id="publishDelayVector"></path><path d="M165.059798,13.3852128 C167.694968,11.4345426 170.955888,10.2810397 174.486223,10.2810397 C183.245172,10.2810397 190.345703,17.3815708 190.345703,26.1405198 C190.345703,34.8994689 183.245172,42 174.486223,42 C166.458301,42 159.823524,36.035238 158.771959,28.2957813 L164.133072,28.2957813 C165.128356,33.1015263 169.385478,36.7135066 174.486223,36.7135066 C180.325522,36.7135066 185.05921,31.9798192 185.05921,26.1405198 C185.05921,20.3012205 180.325522,15.5675331 174.486223,15.5675331 C172.41893,15.5675331 170.490212,16.1608437 168.86106,17.1864745 L173.534927,21.8603419 L160.451524,22.4833611 L161.074543,9.39995745 L165.059798,13.3852128 Z" id="unpublishVector"></path></g></svg></span> <span class="publishText">Publish</span> </div>{% if (options.more) { %}<div id="dropdownBtn-{{ elementId }}" class="dropdown-toggle btn btnPublish btnPublishMore" data-toggle="dropdown"><div class="btnGradientLight"></div><span class="caret"></span></div><div class="dropdown-menu pull-right btnPublishDropdown" aria-labelledby="dropdownBtn-{{ elementId }}"><div>{% if (options.dateTimePicker) { %}<div data-type="dateTime" data-inline="true" data-collapse="true" data-usecurrent="false" data-customvalue="{{ model[options.versionEntity] ? model[options.versionEntity].timePublish : 0 }}" data-style="widget"></div>{% } %} {% if (options.unpublish) { %}<div><span class="action btnUnpublish" data-action="unpublish">Unpublish this Version</span></div>{% } %} {% if (options.revisionHistory && model[options.versionEntity]) { %}<a class="btnVersionHistory" href="/Content/Versions/Edit?id={{ model.id }}&versionId={{ model[options.versionEntity].id }}">Revision History</a>{% } %}</div></div>{% } %}</div>'),

        events: {
            'click .btnPublishNow': 'publishAction',
            'click [data-action="unpublish"]': 'unpublishAction'
        },

        options: {
            private: {
                autoSave: false,
                isPublishedValues: {
                    0: 'unpublished',
                    1: 'published',
                    2: 'delayed',

                    // expired: but treated like 'unpublished'
                    3: 'unpublished'
                },
                forceType: 'model'
            },
            public: {
                // Check that the element contains the minimum required data attributes. In this case, publishing interacts
                // with several properties, so we just want to know the versionable entity, that way we can access the
                // timePublish and the isPublished field from the same entity. But if that isn't set it's assumed the entity
                // itself is versionable
                versionEntity: null,

                // TODO: point to the cloud server (PATH!)
                // The CSS file to load for this widget
                cssFile: [Stratus.BaseUrl + 'sitetheorystratus/stratus/views/widgets/publish.css'],

                // Show or hide the custom dateTime picker in the "more" dropdown.
                dateTimePicker: false,

                // Show or hide the unpublish button in the "more" dropdown.
                unpublish: false,

                // Show or hide the version history link in the "more" dropdown.
                versionHistory: false,

                // Change the exact wording of the confirm message that appears when you "unpublish" something. Leave null if no confirmation is desired.
                textUnpublishConfirm: 'Please note that unpublishing this version will not necessarily hide the page. Any versions published in the past will take over as the latest published version. If you wish to hide the content entirely, use the status toggle instead.',

                // The text that shows up on the button if it is unpublished.
                textUnpublished: 'Publish',

                // The text that shows up on the button if it is published.
                textPublished: 'Published',

                // The text that shows up on the button if it is published in the future.
                textDelayed: 'Scheduled',

                // The text that shows up on the button if it was published in the past but superceded by another published version
                // 'Republish' but treated like "Publish"
                textExpired: 'Publish'
            }
        },

        dateTimePickerView: null,
        btnUnpublish: null,
        timePublish: null,
        isPublished: null,

        /**
         * @param options
         */
        postOptions: function (options) {
            if (this.options.dateTimePicker || this.options.unpublish || this.options.versionHistory) {
                this.options.more = true;
            }
            if (this.options.versionEntity) {
                this.options.propertyName = this.options.versionEntity + '.timePublish';
            }
        },

        // onRender()
        // ----------------
        // Setup the dateTimePicker and the unpublish button
        // record the dateTimePickerView after it's loaded
        /**
         * @returns {boolean}
         */
        onRender: function (entries) {
            // don't bother, if no dateTimePicker is required
            if (!this.options.dateTimePicker) return true;

            // There may be more than one element found (e.g. date time and unpublish button)
            if (entries.total > 0) {
                _.each(entries.views, function (el) {
                    if (el.type === 'datetime') {
                        // after the onRender() so it should be fine.
                        this.dateTimePickerView = el;
                    }
                }.bind(this));
            }
            return true;
        },

        // saveAction()
        // -------------
        // When the button is publish or unpublish. set the Publish time based on current time or the date selected
        // (if a dateTime field is available.
        /**
         * #param {object} options
         *      - {string} options.action : unpublish|publish|null
         * @param options
         * @returns {boolean}
         */
        saveAction: function (options) {

            if (typeof options === 'undefined') options = {};
            options.actions = options.actions ? options.actions : 'publish';

            // When publish is clicked, use 'now' or the time set in optional dateTimePicker object
            var timePublish = null;

            if (options.action === 'unpublish') {
                // Set the picker to the current date (so when they open it again it's at today) and then clear
                if (this.dateTimePickerView && typeof this.dateTimePickerView.dateTimePicker === 'object') {
                    this.dateTimePickerView.dateTimePicker.date(moment());
                    this.dateTimePickerView.dateTimePicker.clear();
                }
            } else {
                // If expired (published in the past) treat as if it's unpublished (and publish the current time if none specified). Problem is... there is a date specified. So we need to clear the date somehow if it's expired.
                if (this.dateTimePickerView && typeof this.dateTimePickerView.dateTimePicker === 'object') {
                    // return a moment object
                    timePublish = this.dateTimePickerView.dateTimePicker.date();

                    // If expired publish (published for past date and superceded by new version)
                    // and publish is clicked without changing the date (the dates are identical)
                    // then use the now date like they just want to publish at this moment.
                    if (this.isPublished === 3 && timePublish && timePublish.unix() === this.timePublish) {
                        timePublish = null;
                    } else {
                        // convert moment object to unix milliseconds
                        timePublish = timePublish ? timePublish.unix() : null;
                    }
                }

                // If dateTimePicker exists but is empty, OR no picker, then we will use "now".
                timePublish = timePublish ? timePublish : 'API::NOW';
            }

            if (this.options.versionEntity) {
                this.model.set(this.options.versionEntity + '.timePublish', timePublish);
            } else if (this.model.has('timePublish')) {
                this.model.set('timePublish', timePublish);
            } else {
                console.warn('This entity is either not versionable or a valid data-versionentity was not set');
            }

            if (options.action === 'unpublish' && this.options.textUnpublishConfirm) {
                this.confirm  = this.confirm || new Stratus.Prototypes.Bootbox(
                        {
                            message: this.options.textUnpublishConfirm,
                            handler: function (result) {
                                if (result) this.model.save();
                            }.bind(this)
                        }
                    );
                Stratus.Events.trigger('confirm', this.confirm);
            } else {
                this.model.save();
            }

            return true;
        },

        /**
         * @param event
         */
        publishAction: function (event) {
            this.saveAction();
        },

        /**
         * @param event
         */
        unpublishAction: function (event) {
            if (this.options.unpublish) {
                this.saveAction({ action: 'unpublish' });
            }
        },

        // scopeChanged()
        // -------------
        // If this entity model is changed anywhere, update the DOM.
        /**
         * @returns {boolean}
         */
        scopeChanged: function () {
            if (this.options.versionEntity) {
                this.timePublish = this.getPropertyValue();
                this.isPublished = this.model.get(this.options.versionEntity + '.isPublished');
            } else {
                this.timePublish = this.model.get('timePublish');
                this.isPublished = this.model.get('isPublished');
            }

            // If there is a dateTimePicker object, set the date in the picker to the model time
            if (this.timePublish && this.dateTimePickerView) {
                // convert timestamp to
                var momentTime = moment.unix(this.timePublish);
                if (momentTime) this.dateTimePickerView.dateTimePicker.date(momentTime);
            }

            // If this widget has a child element containing the publish text, reset the words whenever the model changes
            if (this.$el.find('.publishText')) {
                var isPublishedText = _.ucfirst(this.options.isPublishedValues[this.isPublished]);
                var publishText = this.options['text' + isPublishedText];
                this.$el.find('.publishText').text(publishText);
            }
            this.$el.toggleClass('unpublished', !this.isPublished);
            this.$el.toggleClass('published', (this.isPublished === 1));
            this.$el.toggleClass('delayed', (this.isPublished === 2));

            // expired: treated like unpublished
            this.$el.toggleClass('unpublished', (this.isPublished === 3));
        }

    });

}));
