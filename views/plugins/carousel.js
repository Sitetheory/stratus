//     Stratus.Views.Plugins.Carousel.js 1.0

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

// Data Options
// --------
// - group: the number of items to group together and show in each slide (this will apply to both desktop and mobile, unless groupmobile is set).
// - groupmobile: the number of items to group together and show in each slide when loaded on a mobile device.
// - colminsize: the css to add to the nested items so that they properly align, e.g. if you specify data-group="3" data-colminsize="sm" then the class for the nestedItem will be 'col-sm-4'.
// - All Standard Bootstrap data options: interval, pause, wrap, keyboard

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'zepto', 'underscore', 'bootstrap', 'stratus.views.plugins.base', 'stratus.views.plugins.onscreen'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Carousel
    // -------------

    // This allows manipulation of the existing Bootstrap Carousel
    Stratus.Views.Plugins.Carousel = Stratus.Views.Plugins.Base.extend({

        // Custom Actions for View
        initialize: function (options) {

            this.prepare(options);

            var items = this.$el.find('.carousel-inner > .item');

            // If this is mobile, take all the .nestedItem elements and extract them into main layer so there is only one per frame
            if (Stratus.Client.mobile && this.$el.dataAttr('groupmobile')) {
                this.batchItems(this.$el.dataAttr('groupmobile'), items);
            } else if (this.$el.dataAttr('group')) {
                this.batchItems(this.$el.dataAttr('group'), items);
            }

            // Instantiate the Carousel Manually So we can wait until after we've re-arranged the DOM
            this.$el.carousel({
                interval: this.$el.dataAttr('interval') || 5000,
                pause: this.$el.dataAttr('pause') || 'hover',
                wrap: this.$el.dataAttr('wrap') || true,
                keyboard: this.$el.dataAttr('keyboard') || true
            });

            this.$el.on('slid.bs.carousel', function () {
                if (Stratus.Environment.get('viewPortChange') === false) {
                    Stratus.Environment.set('viewPortChange', true);
                }
            });

            // Register Listening for Pausing until OnScreen
            if (this.$el.dataAttr('startonscreen') !== false) {
                this.$el.carousel('pause');
                var that = this;
                this.onScreen = new Stratus.Views.Plugins.OnScreen({
                    el: this.el,
                    onScreen: function () {
                        that.$el.carousel('cycle');
                    },
                    offScreen: function () {
                        that.$el.carousel('pause');
                    }
                });
            }
        },
        batchItems: function (group, items) {
            group = group <= 0 ? 1 : group;
            var cols = Math.round(12 / group);
            var colMinSize = this.$el.dataAttr('colminsize') ? this.$el.dataAttr('colminsize') : 'xs';

            // Empty inner Coursel
            if (group > 1) {
                var $itemContainer = this.$el.find('.carousel-inner');
                $itemContainer.empty();
            }

            // check if there is an active class yet
            var activeSet = false;

            _.each(items, function (el, i) {
                // Only subnest if grouping is requested
                if (group > 1) {
                    // Check if a group item exists and how many children it has
                    var groupCount = 0;
                    var groupContainers = $itemContainer.children('.item');
                    var $groupContainer;
                    if (groupContainers.length > 0) {
                        $groupContainer = $(_.last(groupContainers));
                        groupCount = $groupContainer.children('.nestedItem').length;
                    }

                    // Create a new container if there is no groupCount or the container is full
                    if (!groupCount || groupCount >= group) {
                        $groupContainer = $('<div class="item"></div>');
                        $itemContainer.append($groupContainer);
                    }

                    // Prepare nested items to be inserted into item group
                    $(el).removeClass('item').addClass('nestedItem col-' + colMinSize + '-' + cols);
                    $groupContainer.append($(el));

                    // Add Active to the Group Container
                    if ($(el).hasClass('active')) {
                        activeSet = true;
                        $groupContainer.addClass('active');
                    }
                } else {
                    // Add Active to the Group Container
                    if ($(el).hasClass('active')) {
                        activeSet = true;
                    }
                }
            }.bind(this));

            if (!activeSet) {
                $(_.first(this.$el.find('.carousel-inner .item'))).addClass('active');
            }

            // If lazyloading images with data-lazysrc we wait to lazy-load until after the groupings are created
            // so that the proper size is loaded for column sizes
            /* TODO: Check if this is still needed *
            var $images = $('[data-lazysrc]');
            if ($images.length > 0) {
                _.each($images, function (el) {
                    $(el).attr('data-src', $(el).attr('data-lazysrc')).attr('data-lazysrc', null);
                });
            }
            /* */
        }

    });

}));
