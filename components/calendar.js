// Calendar Component
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'jquery',
      'moment',
      'angular',
      'angular-material',
      'moment-range',
      'fullcalendar'
    ], factory)
  } else {
    factory(
      root.Stratus,
      root._,
      root.$,
      root.moment,
      root.angular
    )
  }
}(this, function (Stratus, _, $, moment, angular) {
  // This component is a simple calendar at this time.
  Stratus.Components.Calendar = {
    transclude: true,
    bindings: {
      elementId: '@'
    },
    controller: function ($scope, $attrs, $log) {
      this.uid = _.uniqueId('calendar_')
      Stratus.Instances[this.uid] = $scope
      $scope.elementId = $attrs.elementId || this.uid
      $log.log('calendar:', this)
    },
    template: '<div id="{{ elementId }}">Calendar Stub</div>'
  }
}))
