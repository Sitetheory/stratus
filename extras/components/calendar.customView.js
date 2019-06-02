/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'stratus',
      'underscore',
      '@fullcalendar/core',
      '@fullcalendar/daygrid'
    ], factory)
  } else {
    factory(
      {},
      root.Stratus,
      root._,
      root.FullCalendar,
      root.FullCalendarDayGrid
    )
  }
}(this, function (exports, Stratus, _, fullcalendarCore, fullcalendarDayGridPlugin) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'calendar.customView'
  const localPath = 'extras/components'

  Stratus.Components.CalendarCustomView = {
    /* bindings: {
      ngModel: '='
    }, */
    controller: function ($scope) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $ctrl.uid
      // noinspection JSIgnoredPromiseFromCall
      /* Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}${min}.css`
      ) */

      $scope.events = []
      // Make sure we reference our current scope, or events may not be updated
      $scope.$parent.customViewScope = $scope

      // $scope.model = $parse($attrs.ngModel)
      // $scope.render = function () {}
      // $scope.render()

      $ctrl.$onInit = function () {
        console.log('init initied')
      }

      $scope.destroy = function () {
        if (typeof Stratus.Instances[$ctrl.uid].remove === 'function') {
          Stratus.Instances[$ctrl.uid].remove()
        }
        $scope.$destroy()
        delete Stratus.Instances[$ctrl.uid]
      }
    },
    templateUrl: `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}${min}.html`
  }

  class CustomView extends fullcalendarCore.View {
    /**
     * Runs after constructor, no arguments
     * called once when the view is instantiated, when the user switches to the view.
     * Expects a scope insid eth main calendar
     */
    initialize () {
      this.$parentScope = this.viewSpec.options.$scope

      console.log('parent scope is', this.$parentScope)

      // Create the CalendarCustomView Component
      let calendarCustomViewComponent = this.viewSpec.options.$compile('<stratus-calendar-custom-view></stratus-calendar-custom-view>')
      this.componentEl = calendarCustomViewComponent(this.$parentScope)

      // Watch for scope to get ready
      let that = this
      let stopWatchingScope = this.$parentScope.$watch('customViewScope', function () {
        if (that.$parentScope.customViewScope) {
          that.$scope = that.$parentScope.customViewScope
          stopWatchingScope()
          // console.log('our scope', that.$scope)
        }
      })

      fullcalendarCore.appendToElement(this.el, this.componentEl)
    }

    // render OOP:
    // renderDatesMem(props.dateProfile);
    // renderBusinessHoursMem(props.businessHours);
    // renderDateSelectionMem(props.dateSelection);
    // renderEventsMem(props.eventStore);
    // renderEventSelectionMem(props.eventSelection);
    // renderEventDragMem(props.eventDrag);
    // renderEventResizeMem(props.eventResize);

    renderDates (dateProfile) {
      // responsible for rendering the given dates
      // console.log('renderDates ran', dateProfile, this)

      // this.currentStart and this.currentEnd are now set
    }

    /**
     * Runs when View to being left to another View
     */
    destroy () {
      console.log('destroy')
      super.destroy()
      this.$scope.destroy()

      // TODO in the future, instead of creating new Vies, could recreate the existing one
    }

    /**
     * responsible for rendering events
     * Update the display. Specifically, Update the list of events on the scope
     * @param eventStore
     * @param eventUiHash
     */
    renderEvents (eventStore, eventUiHash) {
      if (this.$scope) {
        let that = this
        that.$scope.$applyAsync(function () {
          that.$scope.events.length = 0
          that.$scope.events.push(...that.getEventsInRange(eventStore))
        })
      }
    }

    /**
     * Get the current range of Events
     * @param {[]} eventStore
     * @param {[]} eventUiBases
     * @returns {[]}
     */
    getEventsInRange (eventStore, eventUiBases) {
      eventStore = eventStore || this.props.eventStore
      eventUiBases = eventUiBases || this.props.eventUiBases
      // let currentStart = this.currentStart || this.props.dateProfile.currentRange.start
      // let currentEnd = this.currentEnd || this.props.dateProfile.currentRange.end
      // this.currentStart
      // this.currentEnd
      // this.$scope.events = []

      let events = []
      let sliceEventObjects = fullcalendarCore.sliceEventStore(eventStore, eventUiBases, this.props.dateProfile.activeRange, this.nextDayThreshold)
      if (
        sliceEventObjects.hasOwnProperty('fg') &&
        _.isArray(sliceEventObjects.fg)
      ) {
        events.push(...sliceEventObjects.fg)
      }

      // TODO may need to process these better for stratus

      console.log('events', events)
      return events
    }
  }

  exports.CustomView = CustomView
  exports.default = fullcalendarCore.createPlugin({
    defaultView: 'customGrid',
    views: {
      custom: {
        class: CustomView,
        allDaySlot: true,
        duration: { month: 1 }
      },
      customGrid: {
        type: 'custom',
        duration: { days: 1 }
      }
    }
  })

  Object.defineProperty(exports, '__esModule', { value: true })
}))
