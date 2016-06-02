//     Stratus.Views.Editor.js 1.0

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
        define([
            // Libraries
            "stratus",
            "jquery",
            "underscore",
            "codemirror",

            // Stratus
            "stratus.views.widgets.base",

            // jQuery Modules
            "jquery-cookie",

            // Redactor Modules
            "redactor",
            "redactor-clips",
            "redactor-definedlinks",
            "redactor-filemanager",
            "redactor-fullscreen",
            "redactor-imagemanager",
            "redactor-table",
            "redactor-textexpander",
            "redactor-video",

            // CodeMirror Modules
            "codemirror-htmlmixed",
            "codemirror-matchbrackets"
        ], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.CodeMirror);
    }
}(this, function (Stratus, $, _, CodeMirror) {

    // Editor View
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Editor = Stratus.Views.Widgets.Base.extend({

        // Properties
        model: Stratus.Models.Generic,
        template: _.template('<textarea id="{{ elementId }}"></textarea>'),

        options: {
            private: {
                // Editable Input
                editable: true,
                autoSave: true,
                unrenderEventDefault: 'blur',
                // TODO: Point to CDN appropriately (PATH!)
                requiredCssFile: [
                    '/sitetheory/v/1/0/bundles/sitetheorycore/js/redactor/redactor.css',
                    '/sitetheory/v/1/0/bundles/sitetheorycore/js/redactor/redactor-clips.css',
                    '/sitetheory/v/1/0/bundles/sitetheorycore/js/codemirror/lib/codemirror.css'
                ],
                redactor: {
                    // NOTE: callbacks don't work in this version so we do keybinding, and saving manually
                    focus: false,
                    codemirror: true,
                    definedLinks: '/Api/MenuLink',
                    paragraphize: false,
                    replaceDivs: false,
                    minHeight: 120,
                    fileUpload: 'https://app.sitetheory.io:3000/?session=' + $.cookie("SITETHEORY"),
                    fileManagerJson: '/Api/Media/?filter=file',
                    imageUpload: 'https://app.sitetheory.io:3000/?session=' + $.cookie("SITETHEORY"),
                    imageManagerJson: '/Api/Media/?filter=image',
                    formatting: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'svg'],
                    textexpander: [
                        ['lorem', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']
                    ],
                    plugins: ['clips', 'definedlinks', 'filemanager', 'fullscreen', 'imagemanager', 'table', 'textexpander', 'video']

                },
                api: {
                    limit: null
                },
                forceType: 'model'
            },
            public: {
                // Flag whether or not to include codeMirror for HTML view
                codemirror: true,
                codemirrorCssFile: '/sitetheory/v/1/0/bundles/sitetheorycore/css/codemirror/sitetheory.css'
            }
        },

        isFocused: false,
        redactorIsFocused: false,
        codeMirrorIsFocused: false,
        redactor: null,
        codeMirror: null,

        /**
         * @returns {boolean}
         */
        postOptions: function (options) {
            this.options.cssFile = this.options.cssFile || [];
            this.options.cssFile = _.union((!_.isArray(this.options.cssFile)) ? [this.options.cssFile] : this.options.cssFile, [this.options.codemirrorCssFile]);
        },

        // validate()
        // -----------
        // Custom validate to check that the element contains the minimum required data attributes
        /**
         * @returns {boolean}
         */
        validate: function () {
            // If this widget is used as an independent API with a model, it needs the data-property attribute
            // but if it's just used to render a redactor widget, e.g. in a form, then it doesn't need the property attribute
            if (typeof this.model === 'object' && !this.$el.data('property')) {
                // message, title, class
                Stratus.Events.trigger('toast', new Stratus.Prototypes.Toast({
                    title: 'Missing Data Attribute',
                    message: 'The data-property attribute is missing for redactor.',
                    class: 'danger'
                }));
                return false;
            }
            return true;
        },

        // registerElement()
        // -----------
        // After the basic render has been called and the element is built, we need to setup the Redactor and CodeMirror editors
        /**
         * @returns {boolean}
         */
        registerElement: function () {

            // Add the redactor to the editable element (not the widget container)
            // Set the value of codeMirror from user options
            this.options.redactor.codemirror = this.options.codemirror;

            this.$element.redactor(this.options.redactor);
            this.redactor = this.$element.data('redactor');

            // The built in callbacks: keydown, blur, etc doesn't trigger so we do it manually
            // Manually record whether the redactor or the codeMirror editors are focused so we can do specific actions
            this.redactor.$editor.on('blur', function (event) {
                this.redactorIsFocused = false;
                this.isFocusedCheck(event);
            }.bind(this));
            this.redactor.$editor.on('focus', function (event) {
                this.redactorIsFocused = true;
                this.isFocusedCheck(event);
            }.bind(this));
            this.redactor.$editor.on('keydown', function (event) {
                this.keyActions(event);
            }.bind(this));

            if (this.options.codemirror) {
                // Initialize CodeMirror
                this.codeMirror = CodeMirror.fromTextArea(this.$element[0], {
                    lineNumbers: true,
                    mode: "text/html",
                    matchBrackets: true,
                    lineWrapping: true,
                    theme: 'sitetheory'
                });
                // List for CodeMirror Events
                this.codeMirror.on('blur', function (event) {
                    this.codeMirrorIsFocused = false;
                    this.isFocusedCheck(event);
                }.bind(this));
                this.codeMirror.on('focus', function (event) {
                    this.codeMirrorIsFocused = true;
                    this.isFocusedCheck(event);
                }.bind(this));
                this.codeMirror.on('keydown', function (event) {
                    this.keyActions(event);
                }.bind(this));
            }
            return true;
        },

        // onUnrender()
        // ------------------
        // Custom functions that must be called when the widget is unrendered
        /**
         * @param entries
         */
        onUnrender: function (entries) {
            this.isFocused = false;
            this.redactorIsFocused = false;
            this.codeMirrorIsFocused = false;
            this.redactor = null;
            this.codeMirror = null;
        },

        focus: function () {
            this.redactor.focus.setStart();
        },
        blur: function () {
            this.redactor.focus.setEnd();
        },

        // isFocusedCheck()
        // ---------------
        // Since there can be two editors, and sometimes we need to know if the entire widget is focused or not (unrender)
        // we need to combine the values
        isFocusedCheck: function (event) {
            if ((this.redactorIsFocused || this.codeMirrorIsFocused)) {
                this.focusAction(event);
            } else {
                this.blurAction(event);
            }
        },

        // scopeChanged()
        // --------------

        // If the model changes, update the DOM as necessary
        /**
         * @returns {boolean}
         */
        scopeChanged: function () {
            if (!this.redactor) return false;
            return Stratus.Views.Widgets.Base.prototype.scopeChanged.call(this);
        },

        // getValue()
        // ----------

        // A standard method for getting the value from the widget (since every widget will vary)
        /**
         * @returns {*|null}
         */
        getValue: function () {
            // there are no values to get if the redactor isn't loaded (i.e. not rendered yet or unrendered)
            if (!this.redactor) return false;
            return (this.codeMirrorIsFocused) ? this.codeMirror.getValue() : this.redactor.code.get();
        },

        /**
         * @param value
         * @returns {boolean}
         */
        setValue: function (value) {
            if (!this.redactor || value === undefined) return false;
            value = value || '';
            (this.codeMirrorIsFocused) ? this.codeMirror.setValue(value) : this.redactor.code.set(value);
        }

    });

}));
