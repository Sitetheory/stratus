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
        define(['stratus', 'jquery', 'underscore', 'stratus.views.widgets.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Map View
    // --------

    // This Backbone View intends to handle rendering for a Map on a page.
    Stratus.Views.Widgets.Map = Stratus.Views.Widgets.Base.extend({

        // Map Objects
        //location: null, //TODO there can't just be a generic single location
        currentLocation: null,
        map: null,
        markers: [],
        infoWindows: [],

        options: {
            private: {
                locationSample: {
                    position: { lat: 37.8288771, lng: -122.1591649 },
                    center: false, //if set will make the map center on this marker. may not work with multiple centers or if 'fitBounds' is true. Overrides base center
                    title: 'Second Place',
                    template: 'template name set in templates'
                }
            },
            public: {
                apiKey: Stratus.Api.GoogleMaps, //using our API unless specified
                tile: 256,
                fitBounds: true, //attempt to automatically center and zoom
                autoLabel: false, //{false, 'alpha', 'numeric'
                labelOptions: { //If autoLabeling, specifies what character to start at
                    numericStart: 1,
                    alphaStart: 'A'

                    //TODO direction
                },
                zoom: 13,
                center: {
                    lat: 37.8988771,
                    lng: -122.0591649
                },
                locations: []
            }
        },

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
                this.options.tile * (0.5 + latLng.lng() / 360),
                this.options.tile * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
        },

        /**
         * Converts the current objects into the correct Google instances if needed
         */
        prepareOptions: function () {
            if (!(this.options.center instanceof google.maps.LatLng) && this.options.center.lat !== undefined && this.options.center.lng !== undefined) {
                this.options.center = new google.maps.LatLng(this.options.center);
            }
            if ((this.options.locations !== undefined) && this.options.locations instanceof Object) {
                if (!(this.options.locations instanceof Array)) {
                    this.options.locations = [this.options.locations];
                }

                _.each(this.options.locations, function (location) {
                    if (location.position != undefined) {location.position = this.prepareLatLng(location.position);}

                    if (location.center && location.position != undefined) {this.options.center = location.position;}

                    if (typeof location.template == 'string' && this.templates[location.template]) { // Check if a path was specified
                        location.template = this.templates[location.template];
                    } else if (this.templates instanceof Array && this.templates[0]) { // else fetch the first of the template batch
                        location.template = this.templates[0];
                    } else if (this.template) { // else fetch the only template available
                        location.template = this.template;
                    } else if (typeof location.template !== 'function') {
                        delete location.template;
                    }
                }, this);
            }

        },

        /**
         * Converts the object into the correct Google instances if needed
         */
        prepareLatLng: function (latLng) {
            if (!(latLng instanceof google.maps.LatLng) && latLng !== undefined) {
                return new google.maps.LatLng(latLng);
            } else {
                return latLng;
            }

        },

        /**
         * @param entries
         * @returns {boolean}
         */
        onRender: function (entries) {
            require(['//maps.googleapis.com/maps/api/js?key=' + this.options.apiKey], function () {
                this.prepareOptions();
                console.log('!!OPTIONS', this.options);
                this.fetchCurrentLocation().done(function (currentLocation) {
                    this.options.center = currentLocation;

                    //this.setupSampleMap();
                    this.setupDynaMap();
                }.bind(this), function (error) {
                    console.warn(error);

                    //this.setupSampleMap();
                    this.setupDynaMap();
                }.bind(this));

            }.bind(this));
        },

        /**
         * Attempt to retrieve the user's current Geo Location and save
         */
        fetchCurrentLocation: function () {
            // Gather Current Geo-Location
            return new Promise(function (fulfill, reject) {
                Stratus.Internals.Location().done(function (pos) {
                    this.currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    if (fulfill) fulfill(this.currentLocation);
                }.bind(this), function (error) {
                    this.currentLocation = null;
                    if (reject) reject(error);
                }.bind(this));
            });
        },

        // This function builds a particular info window
        /**
         * @param latLng {LatLng} The origin location of window
         * @param content String or Function
         */
        createInfoWindow: function (latLng, content) {
            if (!this.map) return false;

            var coordInfoWindow = new google.maps.InfoWindow();

            if (content instanceof String) {
                coordInfoWindow.setContent(content);
            } else if (content instanceof Function) {
                coordInfoWindow.setContent(content.call(this));
            }
            coordInfoWindow.setPosition(latLng);
            coordInfoWindow.open(this.map);

            //TODO need to set custom specifiers for listeners and data
            this.map.addListener('zoom_changed', function () {
                if (content instanceof String) {
                    coordInfoWindow.setContent(content);
                } else if (content instanceof Function) {
                    coordInfoWindow.setContent(content.call(this));
                }
                coordInfoWindow.open(this.map);
            }.bind(this));
        },

        setupSampleMap: function () {
            this.renderMap();

            //this.createInfoWindow(this.location, 'This is a standard message');
            //this.createInfoWindow(this.options.center, this.sampleContent);

            var contentString = '<div id="content">' +
                '<div id="siteNotice">' +
                '</div>' +
                '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
                '<div id="bodyContent">' +
                '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                'sandstone rock formation in the southern part of the ' +
                'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) ' +
                'south west of the nearest large town, Alice Springs; 450&#160;km ' +
                '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major ' +
                'features of the Uluru - Kata Tjuta National Park. Uluru is ' +
                'sacred to the Pitjantjatjara and Yankunytjatjara, the ' +
                'Aboriginal people of the area. It has many springs, waterholes, ' +
                'rock caves and ancient paintings. Uluru is listed as a World ' +
                'Heritage Site.</p>' +
                '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
                'https://en.wikipedia.org/w/index.php?title=Uluru</a> ' +
                '(last visited June 22, 2009).</p>' +
                '</div>' +
                '</div>';

            var testTemplate = _.template('<div>Test Template Here! {{ name }}</div>')({ name: 'test' });

            var infoWin = this.addInfoWindow({ content: testTemplate });

            var marker = this.addMarker({
                position: new google.maps.LatLng(37.8948762, -122.0551638),
                title: 'Hello World!',
                label: 'B',
                draggable: true
            });

            marker.addListener('click', function () {
                infoWin.open(this.map, marker);
            });
        },

        setupDynaMap: function () {
            this.renderMap();

            //create empty LatLngBounds object for centering map
            var bounds = new google.maps.LatLngBounds();
            var numericLabel = this.options.labelOptions.numericStart;
            var alphaLabel = this.options.labelOptions.alphaStart.charCodeAt(0);

            _.each(this.options.locations, function (location) {
                if (!location || !location.position) {return false;}
                if (typeof location.template !== 'function') {return false;} //FIXME temporary

                //setup objects
                var infoWin = this.addInfoWindow({
                    content: location.template({ location: location }) //inject itself
                });

                var markerOptions = { position: location.position };
                markerOptions.animation = google.maps.Animation.DROP;
                if (this.options.autoLabel == 'numeric') {
                    markerOptions.label = '' + numericLabel++;
                } else if (this.options.autoLabel == 'alpha') {
                    markerOptions.label = String.fromCharCode(alphaLabel++);
                }

                var marker = this.addMarker(markerOptions);

                //extend the bounds to include each marker's position
                bounds.extend(location.position);

                //setup marker events
                marker.addListener('click', function () {
                    infoWin.open(this.map, marker);
                }.bind(this));

            }, this);

            //now fit the map to the newly inclusive bounds (Center and Zoom)
            if (this.options.fitBounds) {
                this.map.fitBounds(bounds);
            }

        },

        /**
         * @returns {boolean}
         */
        renderMap: function (options, callback) {
            if (this.map) return false; //TODO possibly allow rerendering later if we redo objects?

            this.map = new google.maps.Map(this.$el[0], {
                center: (options || {}).center || this.options.center,
                zoom: (options || {}).zoom || this.options.zoom
            });

            if (callback) callback(this.map);
            return true;
        },

        /**
         * See https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerOptions
         * Requires position property to be specified in the markerOptions
         * @param markerOptions
         * @returns {google.maps.Marker}
         */
        addMarker: function (markerOptions) {
            if (!markerOptions) return false;
            if (!markerOptions.position) return false;
            if (!this.map) return false;

            markerOptions.map = this.map;

            var marker = new google.maps.Marker(markerOptions);
            this.markers.push(marker);
            return marker;
        },

        /**
         * See https://developers.google.com/maps/documentation/javascript/3.exp/reference#InfoWindowOptions
         * Requires position property to be specified as a LatLng or Marker in the infoWindowOptions
         * @param infoWindowOptions
         * @returns {google.maps.InfoWindow}
         */
        addInfoWindow: function (infoWindowOptions) {
            if (!infoWindowOptions) return false;

            var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
            this.infoWindows.push(infoWindow);
            return infoWindow;
        },

        // This function builds a particular info window
        /**
         * @returns {string}
         */
        sampleContent: function () {
            var scale = 1 << (this.map ? this.map.getZoom() : this.options.zoom);
            var worldCoordinate = this.project(this.currentLocation || this.options.center);

            var pixelCoordinate = new google.maps.Point(
                Math.floor(worldCoordinate.x * scale),
                Math.floor(worldCoordinate.y * scale));

            var tileCoordinate = new google.maps.Point(
                Math.floor(worldCoordinate.x * scale / this.options.tile),
                Math.floor(worldCoordinate.y * scale / this.options.tile));

            var output = [];
            if (!this.currentLocation) {
                output.push(
                    'Can\'t Get Current Location ',
                    'Center: ' + this.options.center
                );
            } else {
                output.push('Lat/Lng: ' + this.currentLocation);
            }
            output.push(
                'Zoom level: ' + (this.map ? this.map.getZoom() : this.options.zoom),
                'World Coordinate: ' + worldCoordinate,
                'Pixel Coordinate: ' + pixelCoordinate,
                'Tile Coordinate: ' + tileCoordinate
            );
            return output.join('<br>');
        }
    });

}));
