// Address Component
// -----------------

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
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Root Scope
  let root = this

  // Force Google Maps for the Moment
  require(['//maps.googleapis.com/maps/api/js?v=3&key=' + Stratus.Api.GoogleMaps + '&libraries=places&callback=initAutocomplete'], function () {
    console.log('map loaded!')
  })

  // This component is just a simple base.
  Stratus.Components.Address = {
    transclude: true,
    bindings: {
      elementId: '@',
      hello: '@'
    },
    controller: function ($scope, $attrs, $log) {
      this.uid = _.uniqueId('base_')
      Stratus.Instances[this.uid] = $scope
      $scope.elementId = $attrs.elementId || this.uid
      Stratus.Internals.CssLoader(Stratus.BaseUrl +
        Stratus.BundlePath + 'components/address' +
        (Stratus.Environment.get('production') ? '.min' : '') + '.css')

      $log.log('component:', this)

      let autocomplete

      root.initAutocomplete = function () {
        autocomplete = new google.maps.places.Autocomplete(
          /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
          { types: ['geocode'] })
        autocomplete.addListener('place_changed', function () {
          console.log('place:', autocomplete.getPlace())
        })
      }

      root.geolocate = function () {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            let geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            let circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy
            })
            autocomplete.setBounds(circle.getBounds())
          })
        }
      }
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/address' +
      (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
