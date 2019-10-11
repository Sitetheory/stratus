/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'stratus',
      'lodash',
      '@fullcalendar/core',
      'angular-material',
      'moment-range'
    ], factory)
  } else {
    factory(
      {},
      root.Stratus,
      root._,
      root.FullCalendar
    )
  }
}(this, function (exports, Stratus, _, fullcalendarCore) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'customView'
  const localPath = '@stratusjs/angularjs-extras/src/components/calendar'
  const defaultTemplate = 'default'
  let uid = null

  Stratus.Components.CalendarCustomView = {
    bindings: {
      template: '@'
    },
    controller: function ($scope, $attrs) {
      // Initialize
      const $ctrl = this
      // uid should have be created b the View. Rely on that instead
      if (!uid) {
        uid = _.uniqueId(_.camelToSnake(name) + '_')
      }
      $ctrl.uid = uid
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $ctrl.uid
      $scope.template = $attrs.template && !_.isEmpty($attrs.template) ? $attrs.template : defaultTemplate

      // Load this particular template's CSS
      // noinspection JSIgnoredPromiseFromCall
      Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}.${$scope.template}${min}.css`
      )

      /** @type {fullcalendarCore.EventApi[]} */
      $scope.events = []
      // Make sure we reference our current scope, or events may not be updated
      $scope.$applyAsync(function () {
        $scope.$parent.customViews[uid] = $scope.template
      })

      // Will be given access to
      // $scope.view
      // $scope.options

      // $scope.model = $parse($attrs.ngModel)
      // $scope.render = function () {}
      // $scope.render()

      $ctrl.$onInit = function () {
        // console.log('init inited')
      }

      /**
       *
       * @param {fullcalendarCore.EventApi} eventData
       * @param {MouseEvent} ev
       * @returns {Promise<boolean>} Return false to not issue other functions (such as URL clicking)
       * @fulfill {boolean} Return false to not issue other functions (such as URL clicking)
       */
      $scope.eventClick = async function (eventData, ev) {
        $scope.$parent.calendar.publiclyTrigger('eventClick', [{
          el: ev.target || null,
          event: eventData,
          jsEvent: ev,
          view: $scope.view
        }])
        return false // Return false to not issue other functions (such as URL clicking)
      }

      $scope.destroy = function () {
        delete $scope.$parent.customViews[uid]
        if (typeof Stratus.Instances[uid].remove === 'function') {
          Stratus.Instances[uid].remove()
        }
        $scope.$destroy()
        delete Stratus.Instances[uid]
      }
    },
    templateUrl: function ($element, $attrs) {
      return `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}.${$attrs.template || defaultTemplate}${min}.html`
    }
  }

  class CustomView extends fullcalendarCore.View {
    /**
     * Runs after constructor, no arguments
     * called once when the view is instantiated, when the user switches to the view.
     * Expects a scope inside th main calendar
     */
    initialize () {
      uid = _.uniqueId(_.camelToSnake(name) + '_')
      // console.log('this.viewSpec.options', this.viewSpec.options)
      this.$parentScope = this.viewSpec.options.$scope

      // console.log('parent scope is', this.$parentScope)

      // Create the CalendarCustomView Component
      const calendarCustomViewComponent = this.viewSpec.options.$compile(`<stratus-calendar-custom-view data-template="${this.viewSpec.options.template}"></stratus-calendar-custom-view>`)
      this.componentEl = calendarCustomViewComponent(this.$parentScope)

      // Watch for scope to get ready
      const that = this
      const stopWatchingScope = this.$parentScope.$watch(`customViews`, function () {
        if (
          Object.prototype.hasOwnProperty.call(that.$parentScope.customViews, uid) &&
            Object.prototype.hasOwnProperty.call(Stratus.Instances, uid)
        ) {
          // that.$scope = that.$parentScope.customViews[uid] // Angular is not allowing the scoped to be passed in this way
          that.$scope = Stratus.Instances[uid]
          that.$scope.options = that.viewSpec.options
          that.$scope.view = that
          if (that.eventsWaiting) {
            that.updateEventScope(that.eventsWaiting)
          }
          stopWatchingScope()
        }
      }, true)

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

    /**
     * Runs when View to being left to another View
     */
    destroy () {
      super.destroy()
      this.$scope.destroy()
      // TODO in the future, instead of creating new Vies, could recreate the existing one
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Runns when ever the View inits or the date range changes
     * Attempts tp update the display. Specifically, Update the list of events on the scope
     * @param {[]} eventStore
     * @param {[]} eventUiHash
     */
    renderEvents (eventStore, eventUiHash) {
      if (this.$scope) {
        const that = this
        this.updateEventScope(that.getEventsInRange(eventStore))
      } else {
        // If scope isn't ready yet, add the events to waiting
        this.eventsWaiting = this.getEventsInRange(eventStore)
      }
    }

    /**
     * Update the displayed events in the Stratus Component by sending it over
     * @param {fullcalendarCore.EventApi[]} events
     */
    updateEventScope (events) {
      const that = this
      that.$scope.$applyAsync(function () {
        that.$scope.events.length = 0
        that.$scope.events.push(...events)
      })
    }

    /**
     * Get the current range of Events
     * @param {[]} eventStore
     * @param {[]=} eventUiBases
     * @returns {fullcalendarCore.EventApi[]}
     */
    getEventsInRange (eventStore, eventUiBases) {
      const that = this
      eventStore = eventStore || this.props.eventStore
      eventUiBases = eventUiBases || this.props.eventUiBases

      const events = []
      const sliceEventObjects = fullcalendarCore.sliceEventStore(eventStore, eventUiBases, that.props.dateProfile.activeRange, that.nextDayThreshold)
      if (
        Object.prototype.hasOwnProperty.call(sliceEventObjects, 'fg') &&
        _.isArray(sliceEventObjects.fg)
      ) {
        sliceEventObjects.fg.forEach(function (eventRaw) {
          const event = new fullcalendarCore.EventApi(that.$parentScope.calendar, eventRaw.def, eventRaw.instance)
          if (
            event &&
            !event.descriptionHTML &&
            Object.prototype.hasOwnProperty.call(event.constructor.prototype, 'extendedProps') &&
              Object.prototype.hasOwnProperty.call(event.extendedProps, 'description')
          ) {
            event.descriptionHTML = that.viewSpec.options.$sce.trustAsHtml(event.extendedProps.description)
          }
          events.push(event)
        })
      }

      // console.log('events', events)
      return events
    }
  }

  exports.CustomView = CustomView
  exports.default = fullcalendarCore.createPlugin({
    defaultView: 'custom',
    views: {
      custom: {
        class: CustomView,
        template: 'default',
        duration: { month: 1 }
      },
      customArticle: {
        type: 'custom',
        template: 'article'
      },
      customArticleDay: {
        type: 'customArticle',
        duration: { day: 1 }
      },
      customArticleWeek: {
        type: 'customArticle',
        duration: { week: 1 }
      },
      customArticleMonth: {
        type: 'customArticle',
        duration: { month: 1 }
      },
      customArticleYear: {
        type: 'customArticle',
        duration: { year: 1 }
      }
    }
  })

  Object.defineProperty(exports, '__esModule', { value: true })
}))
