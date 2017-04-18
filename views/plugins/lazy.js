//     Stratus.Views.Plugins.Lazy.js 1.0

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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'stratus.views.plugins.base'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {

    // Lazy Plugin
    // -----------

    // Find all images that have data-src and lazy load the "best" size version that will fit
    // inside the container.
    // If they have a src already, that's okay, it was just a placeholder image to allow us to have
    // the correct ratio of the image for reserving space in the design, and it will be replaced.
    // But if you set a src, you don't need to redundantly set the full path in the data-src, you can just enter data-src="lazy"
    // If you need the image to be a specific size (e.g. a small version) and you want to load the
    // right size image for the hard coded size (and not let it fetch the larger or smaller version that fits in the container), you can specify the width in CSS.
    // If you want to specify the size to load, you can add an attribute for data-size and specify
    // HQ, XL, L, M, S, XS
    // By default images will NOT be refetched at a larger size when the browser is made larger,
    // because that it's rare that people will resize their browser, and if the images get a little
    // blurry that's better than everything reloading on the page (next page load will fix this
    // automatically). But on mobile, we will listen for resize of window because
    Stratus.Views.Plugins.Lazy = Stratus.Views.Plugins.Base.extend({
        initialize: function (options) {
            this.prepare(options);
            if (this.$el.length === 0) return false;

            // allow watching a different element to trigger when this image is lazy loaded (needed for carousels)
            var $el = this.$el;
            Stratus.RegisterGroup.add('OnScroll', {
                method: Stratus.Internals.LoadImage,
                el: $el,
                spy: $el.data('spy') ? $($el.data('spy')) : $el
            });
        }
    });

}));
