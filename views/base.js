//     Stratus.Views.Base.js 1.0

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

// Additional Standard Data Attribute Options
// -------------------------------------------
/*


data-property: The property on the model that is being edited or displayed.

data-label: Optional text to add a label near the widget.

data-help: Optional text to add a help button popover near the widget.

data-render: Set whether the widget should load automatically or on an event, e.g. false|auto|click|hover etc (default to auto). Note, if you do not want to render a template (because you are putting your own content inside, then set data-render="false"

data-status="load" : It is often a good idea to set the status as load, so that CSS can show styles indicating the model for the widget is loading still (the status will be changed to 'success' after it's loaded).

data-style: Set to "form" if you want to add the classes that make the widget look like a form. This is set to 'form' by default if the widget has a custom getValue() method that returns anything other than the default 'undefined', which basically means that the widget is intended to be an input that we fetch data from, i.e. a form.

data-feedback: Set to "true" to make the widget display standard Bootstrap style feedback elements on success, error, request, change, etc. This is set to true by default if data-style is set to "form".

data-templates: A JSON string to specify an alternative template to render, e.g. {"render":"#myTemplate"}

data-options: A JSON string of options to overwrite the javascript options, e.g. {"autoSave": true, "autoSaveInterval": 5000}'

 data-id: if you need to set a specific ID for the element that gets rendered inside your widget (for CSS purposes) you can set it here. Otherwise a default id will be assigned starting with "Widget-"

 */


// Widget
// ======

// Require.js
// -------------
// Define this module and its dependencies
define("stratus.views.base", ["stratus", "jquery", "underscore", "backbone"], function (Stratus, $, _, Backbone) {

    // Base Model View
    // -------------
    // This Backbone View intends to handle Generic rendering for a single Model.

    Stratus.Views.Base = Backbone.View.extend({

        /**
         * @param options
         */
        initialize: function(options) {
            if (!Stratus.Environment.get('production')) console.log(options);
        }

    });

    // Require.js
    // -------------

    // We are not returning this module because it should be
    // able to add its objects to the Stratus object reference,
    // passed by sharing.

});
