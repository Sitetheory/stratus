//     Stratus.Views.Widgets.Map.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
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

    model: Stratus.Models.Generic,

    // Shouldn't use template, as that is assumed to be the whole widget. set to templates instead
    templates: {
      infoWindow: _.template('<div>{% if (location.title) { %}<h3>{{ location.title }}</h3>{% } %}{% if (location.details) { %}<p>{{ location.details }}</p>{% } %}</div>')
    }, // FIXME this.templates becomes unset if data-templates is not set!!!
    currentLocation: null,
    map: null,
    markers: [],
    infoWindows: [],

    options: {
      private: {
        locationSample: { // An example of what to place in the .this.options.locations[]
          position: { lat: 37.8288771, lng: -122.1591649 },
          center: false, // if set will make the map center on this marker. may not work with multiple centers or if 'fitBounds' is true. Overrides base center
          template: 'template name set in templates (optional)',
          title: 'Marker Name',
          details: 'The first template assumes a details variable can exist'
        }
      },
      public: {
        template: 'sitetheorymap/stratus/templates/map.infoWindow.html',
        apiKey: Stratus.Api.GoogleMaps, // using our API unless specified. This key not work on custom domains
        tile: 256,
        fitBounds: true, // attempt to automatically center and zoom
        centerOnUser: false, // attempt to fetch the user and center on user. requires SSL
        autoLabel: false, // {false, 'alpha', 'numeric'
        labelOptions: { // If autoLabeling, specifies what character to start at
          numericStart: 1,
          alphaStart: 'A'

          // TODO direction
        },
        zoom: 13,
        center: { // Overwritten by fitBounds and 'location center'
          lat: 37.8988771,
          lng: -122.0591649
        },
        locations: []
      }
    },

    // Order of priority for centering:
    // options.centerOnUser > options.fitBounds > options.locations.center > options.center

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
          if (location.position != undefined) {
            location.position = this.prepareLatLng(location.position);
          }

          if (location.center && location.position != undefined) {
            this.options.center = location.position;
          }

          if (typeof location.template == 'string' && this.templates[location.template]) { // Check if a path was specified
            location.template = this.templates[location.template];
          } else if (this.templates != undefined && this.templates[Object.keys(this.templates)[0]]) { // else fetch the first of the template batch
            location.template = this.templates[Object.keys(this.templates)[0]];
          } else if (typeof location.template !== 'function') {
            console.warn('no template for location', location);
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
        console.log('!!MAP OPTIONS', this.options);

        console.warn(this.collection.toJSON().payload);

        // TODO provide more layouts and a way to switch between them
        this.setupMarkersLayout();

      }.bind(this));
    },

    /**
     * Attempt to retrieve the user's current Geo Location and save
     */
    fetchCurrentLocation: function () {
      // Gather Current Geo-Location
      return new Promise(function (resolve, reject) {
        Stratus.Internals.Location().then(function (pos) {
          this.currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          if (resolve) resolve(this.currentLocation);
        }.bind(this), function (error) {
          if (reject) reject(error);
        }.bind(this));
      });
    },

    setupMarkersLayout: function () {
      this.renderMap();

      // create empty LatLngBounds object for centering map
      var bounds = new google.maps.LatLngBounds();
      var numericLabel = this.options.labelOptions.numericStart;
      var alphaLabel = this.options.labelOptions.alphaStart.charCodeAt(0);

      _.each(this.options.locations, function (location) {
        if (!location || !location.position || typeof location.template !== 'function') {
          return false;
        }

        // setup objects
        var infoWin = this.addInfoWindow({
          content: location.template({ location: location }) // inject itself
        });

        var markerOptions = { position: location.position };
        markerOptions.animation = google.maps.Animation.DROP; // TODO need to set animation options
        if (this.options.autoLabel == 'numeric') {
          markerOptions.label = '' + numericLabel++;
        } else if (this.options.autoLabel == 'alpha') {
          markerOptions.label = String.fromCharCode(alphaLabel++);
        }

        var marker = this.addMarker(markerOptions);

        // extend the bounds to include each marker's position
        bounds.extend(location.position);

        // setup marker events
        marker.addListener('click', function () {
          infoWin.open(this.map, marker);
        }.bind(this));

      }, this);

      // now fit the map to the newly inclusive bounds (Center and Zoom)
      if (this.options.fitBounds) {
        this.map.fitBounds(bounds);
      }

      if (this.options.centerOnUser) {
        this.fetchCurrentLocation().then(function (currentLocation) {
          this.options.center = currentLocation;
          this.map.setCenter(this.options.center);
        }.bind(this), function (error) {
          console.warn('Can\'t get currentLocation', error);
          if (this.currentLocation) { // At least grab the last known location
            this.options.center = this.currentLocation;
            this.map.setCenter(this.options.center);
          }
        }.bind(this));
      }

    },

    /**
     * @returns {boolean}
     */
    renderMap: function (options, callback) {
      if (this.map) return false; // TODO possibly allow re-rendering later if we redo objects?

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

    // The mapping between latitude, longitude and pixels is defined by the web
    // mercator projection.
    /**
     * @param latLng
     * @returns {streamGeometryType.Point}
     */
    projectCoord: function (latLng) {
      var siny = Math.sin(latLng.lat() * Math.PI / 180);

      // Truncating to 0.9999 effectively limits latitude to 89.189. This is
      // about a third of a tile past the edge of the world tile.
      siny = Math.min(Math.max(siny, -0.9999), 0.9999);

      return new google.maps.Point(
        this.options.tile * (0.5 + latLng.lng() / 360),
        this.options.tile * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
    },

    // This function builds a particular info window
    /**
     * @returns {string}
     */
    sampleContent: function () {
      var scale = 1 << (this.map ? this.map.getZoom() : this.options.zoom);
      var worldCoordinate = this.projectCoord(this.currentLocation || this.options.center);

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
