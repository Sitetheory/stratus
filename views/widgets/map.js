//     Stratus.Views.Widgets.Map.js 1.0

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
        define(['stratus', 'jquery', 'underscore', 'stratus.views.widgets.base', '//maps.googleapis.com/maps/api/js?key=' + Stratus.Api.GoogleMaps], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Map View
    // --------

    // This Backbone View intends to handle rendering for a Map on a page.
    Stratus.Views.Widgets.Map = Stratus.Views.Widgets.Base.extend({

        // Map Objects
        location: null,
        map: null,
        tile: 256,

        // The mapping between latitude, longitude and pixels is defined by the web
        // mercator projection.
        /**
         * @param latLng
         * @returns {streamGeometryType.Point}
         */
        project: function (latLng) {
            var siny = Math.sin(latLng.lat() * Math.PI / 180);

            // Truncating to 0.9999 effectively limits latitude to 89.189. This is
            // about a third of a tile past the edge of the world tile.
            siny = Math.min(Math.max(siny, -0.9999), 0.9999);

            return new google.maps.Point(
                this.tile * (0.5 + latLng.lng() / 360),
                this.tile * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
        },

        // This function builds a particular info window
        /**
         * @param latLng
         * @param zoom
         * @returns {string}
         */
        createInfoWindowContent: function (latLng, zoom) {
            var scale = 1 << zoom;
            var worldCoordinate = this.project(latLng);

            var pixelCoordinate = new google.maps.Point(
                Math.floor(worldCoordinate.x * scale),
                Math.floor(worldCoordinate.y * scale));

            var tileCoordinate = new google.maps.Point(
                Math.floor(worldCoordinate.x * scale / this.tile),
                Math.floor(worldCoordinate.y * scale / this.tile));

            var output = [];
            if (this.error) {
                output.push('Error: ' + this.error);
            } else {
                output = [
                    'Lat/Lng: ' + latLng,
                    'Zoom level: ' + zoom,
                    'World Coordinate: ' + worldCoordinate,
                    'Pixel Coordinate: ' + pixelCoordinate,
                    'Tile Coordinate: ' + tileCoordinate
                ];
            }
            return output.join('<br>');
        },

        /**
         * @param entries
         * @returns {boolean}
         */
        onRender: function (entries) {
            // Gather Current Geo-Location (For the Initial Example)
            Stratus.Internals.Location().done(function (pos) {
                this.location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                this.displayMap();
            }.bind(this), function (error) {
                this.error = error.message;
                this.location = new google.maps.LatLng(37.8988771, -122.0591649);
                this.displayMap();
            }.bind(this));
        },

        /**
         * @returns {boolean}
         */
        displayMap: function () {
            if (!this.location) return false;

            this.map = new google.maps.Map(this.$el[0], {
                center: this.location,
                zoom: 13
            });

            var coordInfoWindow = new google.maps.InfoWindow();

            coordInfoWindow.setContent(this.createInfoWindowContent(this.location, this.map.getZoom()));
            coordInfoWindow.setPosition(this.location);
            coordInfoWindow.open(this.map);

            this.map.addListener('zoom_changed', function () {
                coordInfoWindow.setContent(this.createInfoWindowContent(this.location, this.map.getZoom()));
                coordInfoWindow.open(this.map);
            }.bind(this));

            return true;
        }
    });

}));
