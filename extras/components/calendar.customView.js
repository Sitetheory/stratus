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
  // const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'calendar.customView'
  // const localPath = 'extras/components'

  Stratus.Components.CalendarCustomView = {
    /* bindings: {
      ngModel: '='
    }, */
    controller: function ($scope) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      // $scope.elementId = $attrs.elementId || $ctrl.uid
      $scope.elementId = $ctrl.uid
      // noinspection JSIgnoredPromiseFromCall
      /* Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}${min}.css`
      ) */

      $scope.events = []

      // $scope.model = $parse($attrs.ngModel)
      // $scope.render = function () {}
      // $scope.render()

      $ctrl.$onInit = function () {
        console.log('init initied')
      }

      // Make sure we reference our current scope, or events may not be updated
      $scope.$parent.customViewScope = $scope
    },
    template: '<p>A CalendarCustomView</p>' +
      '<p>There are <span ng-bind="events.length"></span> events. Btw this is now ran through angular</p>' +
      '<p>This is a place holder template for <span ng-bind="::elementId"></span>. We will need to make an html file soon</p>'
  }

  class CustomView extends fullcalendarCore.View {
    /**
     * Runs after constructor, no arguments
     */
    initialize () {
      // called once when the view is instantiated, when the user switches to the view.
      // initialize member variables or do other setup tasks.
      console.log('initialize ran', this)

      this.$parentScope = this.viewSpec.options.$scope

      console.log('parent scope is', this.$parentScope)

      // Create the CalendarCustomView Component
      let calendarCustomViewComponent = this.viewSpec.options.$compile('<stratus-calendar-custom-view></stratus-calendar-custom-view>')
      this.componentEl = calendarCustomViewComponent(this.$parentScope)
      this.$scope = this.$parentScope.customViewScope

      console.log('our scope', this.$scope)
      console.log('componentEl', this.componentEl)

      fullcalendarCore.appendToElement(this.el, this.componentEl)

      // FIXME need to either destory this instance on movement to another View, or need to reload the existing
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

    renderEvents (eventStore, eventUiHash) {
      // responsible for rendering events
      // console.log('renderEvents ran', eventStore, eventUiHash)
      this.getEventsInRange(eventStore)

      /* if (events.length < 1) {
        // this.eventRenderer.emptyEvents() // could just put the items in here manually
        this.renderEmptyMessage()
      } else { */
      //  this.el.innerHTML = `<h3>Wow, there are events here? ${events.length} infact... now gotta find out how to render them...</h3>`
      // TODO need some real rendering ability. first hard code.... then maybe can pull from a html file and display like stratus
      // this.el.appendChild(this.componentEl)
      // fullcalendarCore.appendToElement(this.el, this.componentEl)
      // }
      // eventStore is all the new events loaded
      // return '<div>Some Event</div>'
    }

    getEventsInRange (eventStore, eventUiBases) {
      let that = this
      eventStore = eventStore || this.props.eventStore
      eventUiBases = eventUiBases || this.props.eventUiBases
      // let currentStart = this.currentStart || this.props.dateProfile.currentRange.start
      // let currentEnd = this.currentEnd || this.props.dateProfile.currentRange.end
      // this.currentStart
      // this.currentEnd
      this.$scope.events = []

      let sliceEventObjects = fullcalendarCore.sliceEventStore(eventStore, eventUiBases, this.props.dateProfile.activeRange, this.nextDayThreshold)
      if (
        sliceEventObjects.hasOwnProperty('fg') &&
        _.isArray(sliceEventObjects.fg)
      ) {
        this.$scope.$applyAsync(function () {
          that.$scope.events.push(...sliceEventObjects.fg)
        })
      }

      console.log({
        eventStore: eventStore,
        eventUiBases: eventUiBases,
        activeRange: this.props.dateProfile.activeRange,
        events: this.$scope.events
        // test: test
      })

      // return this.$scope.events
    }

    /**
     * @TODO testing
     */
    renderEmptyMessage () {
      console.log('running emptyEvents')
      // this.contentEl.innerHTML =
      this.el.innerHTML =
        '<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
        '<div class="fc-list-empty-wrap1">' +
        '<div class="fc-list-empty">' +
        fullcalendarCore.htmlEscape(this.opt('noEventsMessage')) +
        '</div>' +
        '</div>' +
        '</div>'
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
