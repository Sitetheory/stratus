// Map Component
// --------------

/* global define, google */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'angular-material'
    ], factory)
  } else {
    factory(
      root.Stratus,
      root._,
      root.angular
    )
  }
}(this, function (Stratus, _, angular) {
  // Force Google Maps for the Moment
  require(['//maps.googleapis.com/maps/api/js?v=3&key=' + Stratus.Api.GoogleMaps], function () {
    console.log('map loaded!')
  })

  // This component is a simple map at this time.
  Stratus.Components.Map = {
    transclude: true,
    bindings: {
      elementId: '@'
    },
    controller: function ($scope, $element, $attrs, $log) {
      this.uid = _.uniqueId('map_')
      Stratus.Instances[this.uid] = $scope
      $scope.elementId = $attrs.elementId || this.uid

      // Map Objects
      $scope.location = null
      $scope.map = null
      $scope.tile = 256

      // This function builds a particular info window
      $scope.createInfoWindowContent = function (latLng, zoom) {
        var scale = 1 << zoom
        var worldCoordinate = $scope.project(latLng)

        var pixelCoordinate = new google.maps.Point(
          Math.floor(worldCoordinate.x * scale),
          Math.floor(worldCoordinate.y * scale))

        var tileCoordinate = new google.maps.Point(
          Math.floor(worldCoordinate.x * scale / $scope.tile),
          Math.floor(worldCoordinate.y * scale / $scope.tile))

        return [
          'Lat/Lng: ' + latLng,
          'Zoom level: ' + zoom,
          'World Coordinate: ' + worldCoordinate,
          'Pixel Coordinate: ' + pixelCoordinate,
          'Tile Coordinate: ' + tileCoordinate
        ].join('<br>')
      }

      // The mapping between latitude, longitude and pixels is defined
      // by the web mercator projection.
      $scope.project = function (latLng) {
        var sinY = Math.sin(latLng.lat() * Math.PI / 180)

        // Truncating to 0.9999 effectively limits latitude to 89.189. This is
        // about a third of a tile past the edge of the world tile.
        sinY = Math.min(Math.max(sinY, -0.9999), 0.9999)

        return new google.maps.Point(
          $scope.tile * (0.5 + latLng.lng() / 360),
          $scope.tile * (0.5 - Math.log((1 + sinY) / (1 - sinY)) / (4 * Math.PI)))
      }

      // Example Code
      $scope.example = function () {
        // Gather Current Geo-Location (For the Initial Example)
        Stratus.Internals.Location().then(function (pos) {
          $scope.location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)

          $scope.map = new google.maps.Map(document.getElementById('#' + $scope.elementId), {
            center: $scope.location,
            zoom: 13
          })

          var coordInfoWindow = new google.maps.InfoWindow()

          coordInfoWindow.setContent($scope.createInfoWindowContent($scope.location, $scope.map.getZoom()))
          coordInfoWindow.setPosition($scope.location)
          coordInfoWindow.open($scope.map)

          $scope.map.addListener('zoom_changed', function () {
            coordInfoWindow.setContent($scope.createInfoWindowContent($scope.location, $scope.map.getZoom()))
            coordInfoWindow.open($scope.map)
          })
        }, function (error) {
          $log.error('location:', error.message)
        })
      }

      $scope.example()

      // Console
      $log.log('map:', $element)
    },
    template: '<div id="{{ elementId }}" class="loadAnimation">Map Here!</div>'
  }
}))
