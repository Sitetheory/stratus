//     Stratus.Views.Widgets.Generic.js 1.0

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
        define(['stratus', 'jquery', 'underscore', 'sortable', 'moment', 'stratus.views.widgets.base', 'stratus.views.widgets.dialogue'], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.Sortable, root.moment);
    }
}(this, function (Stratus, $, _, Sortable, moment) {

    // Generic Model View
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Generic = Stratus.Views.Widgets.Base.extend({

        timestamp: Date.now(),
        templateRender: 'entity',
        template: _.template('{{ model.id }}'),
        dialogueContainer: _.template('<div data-collection="{{ globals.uid }}" data-entity="{{ globals.entity }}" data-id="{{ model.id }}" data-dialogue="true"></div>'),
        el: function () {
            var selector = '[data-collection="' + this.collection.globals.get('uid') + '"]';
            if (this.model.collection.globals.get('entity')) {
                selector += '[data-entity="' + this.model.collection.globals.get('entity') + '"]';
            }
            return selector + '[data-id="' + this.model.get('id') + '"]:not([data-dialogue="true"])';
        },
        events: {
            'click [data-editable="true"]': 'edit',
            'dblclick [data-editable="true"]': 'edit',
            'keypress [contenteditable="true"]': 'updateOnEnter',
            'keydown [contenteditable="true"]': 'revertOnEscape',
            'focusout [contenteditable="true"]': 'close',
            'dragover [data-draggable="true"]': 'dragOver',
            'dragenter [data-draggable="true"]': 'dragEnter',
            'dragleave [data-draggable="true"]': 'dragLeave',
            drop: 'drop'
        },
        editable: 0,
        _isEditing: false,

        // promise()
        // -------------
        // Begin initializing the widget within an asynchronous promise realm
        /**
         * @param options
         * @param resolve
         * @param reject
         */
        promise: function (options, resolve, reject) {

            // Store Templates for Dialogue
            this.templates = (_.has(options, 'templates')) ? options.templates : null;

            // Transcend Parent Style
            if (_.has(options, 'style')) {
                this.options.style = options.style;
            }

            // Handle Re-rendering
            this.rerender = { change: null };
            if (_.has(options, 'rerender')) {
                this.rerender = options.rerender;
            }
            if (!this.rerender.change || this.rerender.change === 'one') {
                this.model.on('change', this.render, this);
            }

            // Create Template Information
            this.globals = (_.has(options, 'globals')) ? options.globals : {};
            this.icon = this.model.get('contentInfo.icon') || {
                resource: null,
                class: null,
                embed: '<svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-iconDefault"><stop class="stop1" stop-color="#666" offset="0%"></stop><stop class="stop2" stop-color="#666" offset="100%"></stop></linearGradient></defs><g id="iconDefault" class="contentTypeIcon defaultColor" fill="url(#linearGradient-defaultIcon)"><path d="M46.4277937,79.7846542 C47.3844573,80.7981293 48.2508314,81.7294307 49.0279304,82.5765295 C48.9285104,88.6299887 48.8392354,93.5309877 48.8189456,94.3172171 C48.776337,95.9444584 51.9354575,95.9586612 51.988211,94.2563477 C52.0054573,93.7085234 51.9232836,88.7365101 51.8167622,82.5400079 C52.5837163,81.703054 53.4399455,80.7839264 54.3824063,79.7836397 C58.6118133,78.9192946 71.9766987,75.5177111 81.9328992,65.5615106 C93.9099629,53.5844469 96.4045928,36.6617466 96.4045928,36.6617466 C96.4045928,36.6617466 79.4829069,39.1573909 67.5058432,51.1334401 C57.2645711,61.3757267 53.9583497,75.2235092 53.2147288,79.0248015 C52.7166145,79.4955247 52.2347319,79.9490015 51.7782116,80.3771161 C51.6909655,75.3422044 51.5915455,69.7878741 51.5174878,65.2257146 C54.1592186,61.104858 60.6052853,49.6725752 60.6052853,36.2021828 C60.6052853,19.2652797 50.4045928,5.535178 50.4045928,5.535178 C50.4045928,5.535178 40.2028858,19.2652797 40.2028858,36.2021828 C40.2028858,49.6553288 46.6337351,61.0754378 49.2815528,65.2094827 C49.2277849,69.7746858 49.1445967,75.3482914 49.0634376,80.4065363 C48.5967724,79.9703058 48.1037304,79.5056696 47.5944567,79.0227726 C46.8498213,75.2204657 43.5435999,61.3747122 33.3033423,51.1334401 C21.3262786,39.1573909 4.40459275,36.6617466 4.40459275,36.6617466 C4.40459275,36.6617466 6.89922257,53.5844469 18.8762863,65.5615106 C28.8335013,75.5187256 42.2004157,78.9203091 46.4277937,79.7846542"></path></g></svg>'
            };

            // Set Status
            if (typeof this.model.get('status') !== 'undefined') {
                this.$el.attr('data-modelstatus', (this.model.get('status')) ? 1 : 0);
            }

            // Create Dialogue if Template exists
            this.dialogue = _.has(this.templates, 'dialogue');
            if (this.dialogue) {
                $('#app').prepend(this.dialogueContainer({
                    globals: this.globals,
                    model: this.model.attributes
                }));
                var uid = _.uniqueId('dialogue_');
                Stratus.Instances[uid] = this.dialogue = new Stratus.Views.Widgets.Dialogue({
                    globals: this.globals,
                    model: this.model,
                    collection: this.collection,
                    templates: this.templates,
                    type: 'dialogue',
                    uid: uid,
                    view: this.view,
                    widget: this
                });
                this.dialogue.initializer.then(function (dialogue) {
                    this.dialogue = dialogue;
                    this.render();
                    resolve(this);
                }.bind(this), function (rejection) {
                    reject(new Stratus.Prototypes.Error(rejection, this));
                }.bind(this));
            } else {
                this.render();
                resolve(this);
            }
        },
        onRender: function (entries) {
            this.editable = _.size(this.$el.find('[data-editable="true"]'));
            return true;
        },
        refresh: function () {
            if (this.dialogue) {
                this.dialogue.refresh.call(this.dialogue);
            }
            this.render();
        },
        onDestroy: function () {
            if (this.dialogue) this.dialogue.onDestroy();
            Stratus.Views.Widgets.Base.prototype.onDestroy.call(this);
        },
        edit: function (event) {
            this._isEditing = true;
            if (!this.editable) return;
            $(event.target).addClass('editing');

            // TODO: ContentEditable should be enabled with a data-inline, not innately stuck
            $(event.target).attr('contenteditable', 'true');
            $(event.target).focus();
            if (this.dialogue && typeof this.dialogue === 'object') {
                this.dialogue.open();
            }
        },
        close: function (event) {
            this._isEditing = false;
            if (!this.editable) return;
            $(event.target).html(this.model.get($(event.target).data('property')));

            // TODO: ContentEditable should be enabled with a data-attribute, not innately stuck
            $(event.target).attr('contenteditable', 'false');
            $(event.target).removeClass('editing');
        },
        updateOnEnter: function (event) {
            if (!this.editable) return;
            if (event.keyCode === Stratus.Key.Enter) {
                event.preventDefault();
                this.model.set($(event.target).data('property'), event.target.innerHTML);
                this.model.save();
                $(event.target).blur();
            }
        },
        revertOnEscape: function (event) {
            if (!this.editable) return;
            if (event.keyCode === Stratus.Key.Escape) {
                event.preventDefault();
                $(event.target).blur();
            }
        },
        dragOver: function (event) {
            if (!Stratus.Environment.get('production')) console.log('Over:', event);
            return this;
        },
        dragEnter: function (event) {
            if (!Stratus.Environment.get('production')) console.log('Enter:', event);
            var $dropContainer = $(event.currentTarget);
            $dropContainer.animate({ opacity: 1 }, 'fast');
            return this;
        },
        dragLeave: function (event) {
            if (!Stratus.Environment.get('production')) console.log('Leave:', event);
            var $dropContainer = $(event.currentTarget);
            $dropContainer.animate({ opacity: 0.5 }, 'fast');
            return this;
        },
        drop: function (event) {
            //if (!Stratus.Environment.get('production')) console.log('Drop:', event);
            return this;
        }
    });

}));
