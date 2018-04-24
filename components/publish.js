// Publish Component
// -----------------

/* global define */

// TODO: this component has not been finished. It needs to do everything that
// the previous widgets/publish.js did and some of that code has been ported
// over, some hasn't, and some needs to be slightly changed based on how
// Angular works. We just need the overall functionality to allow you to

// - publish now (main button
// - click an arrow to the right side of the button and pull down a menu that
// lets you select a publish date. - unpublish if it's already published - show
// link to version history page - change colors based on whether or not it's
// unpublished, published in the past, or published in the future (pending).

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'jquery',
      'angular',
      'moment',
      'stratus.services.model',
      'stratus.components.dateTime'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.jQuery, root.angular, root.moment)
  }
}(this, function (Stratus, _, jQuery, angular, moment) {
  // This component intends to allow publishing a versionable entity with
  // additional advanced options TODO: port over the extensive logic from the
  // old widgets/publish.js (read all comments)
  Stratus.Components.Publish = {
    bindings: {
      ngModel: '=',
      elementId: '@',
      full: '@',
      action: '@',
      showDateTime: '@',
      showUnpublish: '@',
      showVersionHistory: '@',
      redirect: '@'
    },
    controller: function ($scope, $element, $parse, $attrs, $log, Model) {
      var uid = _.uniqueId('publish_')
      Stratus.Instances[uid] = $scope
      Stratus.Internals.CssLoader(Stratus.BaseUrl +
        'sitetheorystratus/stratus/components/publish' +
        (Stratus.Environment.get('production') ? '.min' : '') + '.css')

      // Configuration
      $scope.elementId = $attrs.elementId || uid
      $scope.property = 'version'
      $scope.full = $attrs.full || true
      if (_.isString($scope.full)) {
        $scope.full = _.hydrate($scope.full)
      }
      $scope.action = $attrs.action === 'unpublish' ? 'unpublish' : 'publish'
      $scope.showDateTime = $attrs.showDateTime || false
      $scope.showUnpublish = $attrs.showUnpublish || false
      $scope.showVersionHistory = $attrs.showVersionHistory || false
      $scope.redirect = $attrs.redirect || false

      // Settings
      $scope.propertyTimePublish = $scope.property ? $scope.property +
        '.timePublish' : null
      $scope.showMore = !!($scope.showDateTime || $scope.showUnpublish ||
        $scope.showVersionHistory)
      $scope.timePublish = null

      // Model Handling
      $scope.model = null
      $scope.$watch('$ctrl.ngModel', function (data) {
        if (data instanceof Model && data !== $scope.model) {
          $scope.model = data
        }
      })

      // Methods
      $scope.setTimePublish = function (time) {
        // $log.log('timePublish:', time, $scope.model);
        if (!$scope.model ||
          !$scope.model.get($scope.propertyTimePublish)) {
          return false
        }
        /* *
        $scope.model.set($scope.propertyTimePublish, time || 'API::NOW');
        $scope.model.save();
        /* */
      }

      // Watchers
      $scope.$watch('timePublish', function (data) {
        /* $scope.setTimePublish(data); */
      })

      return true

      // var $dateTimeComponent = null
      // if ($scope.showDateTime) {
      //   $dateTimeComponent = jQuery('#' + $scope.elementId + ' stratus-date-time')
      // }

      // if ($scope.action === 'unpublish') {
      //   // TODO: Set the dateTime component date to current time (so when they
      //   // open it again it's at today) and then clear
      //   if (this.dateTimePickerView && typeof this.dateTimePickerView.dateTimePicker === 'object') {
      //     this.dateTimePickerView.dateTimePicker.date(moment())
      //     this.dateTimePickerView.dateTimePicker.clear()
      //   }
      // } else {
      //   // If expired (published in the past) treat as if it's unpublished (and
      //   // publish the current time if none specified). Problem is... there is
      //   // a date specified. So we need to clear the date somehow if it's
      //   // expired.

      //   // TODO: if timePublish is set, make sure the date picker uses the
      //   // correct time

      //   if ($dateTimeComponent && typeof $dateTimeComponent === 'object' &&
      //     $dateTimeComponent.length) {
      //     // If expired publish (published for past date and superceded by new
      //     // version) and publish is clicked without changing the date (the
      //     // dates are identical) then use the now date like they just want to
      //     // publish at this moment.
      //     if (this.isPublished === 3 && timePublish &&
      //       timePublish.unix() === this.timePublish) {

      //     } else {
      //       // convert moment object to unix milliseconds
      //       $scope.timePublish = $scope.version.get(propertyTimePublish)
      //     }
      //   }
      // }
    },
    templateUrl: Stratus.BaseUrl +
      'sitetheorystratus/stratus/components/publish' +
      (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
