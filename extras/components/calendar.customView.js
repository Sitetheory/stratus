/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'underscore',
      '@fullcalendar/core',
      '@fullcalendar/daygrid'
    ], factory)
  } else {
    factory(
      {},
      root._,
      root.FullCalendar,
      root.FullCalendarDayGrid
    )
  }
}(this, function (exports, _, fullcalendarCore, fullcalendarDayGridPlugin) {
  // something

  /* class Renderer extends fullcalendarCore.FgEventRenderer {
    constructor (context) {
      super(context)
      console.log('Renderer made', this)
      // this.view = customView
      // this.emptyEvents()
    }

    emptyEvents () {
      console.log('running emptyEvents')
      this.context.view.renderEmptyMessage()
    }
  } */

  class CustomView extends fullcalendarCore.View {
    /**
     * Runs after constructor, no arguments
     */
    initialize () {
      // called once when the view is instantiated, when the user switches to the view.
      // initialize member variables or do other setup tasks.
      console.log('initialize ran', this)

      // let freeEl = fullcalendarCore.createElement('div', { className: `fc-elly fc-${this.viewSpec.type}-elly` }, 'This is a test')
      // this.view.el

      fullcalendarCore.appendToElement(this.el, 'Loading')

      // this.eventRenderer = new Renderer(this)
      // this.renderContent = fullcalendarCore.memoizeRendering(this.eventRenderer.renderSegs.bind(this.eventRenderer), this.eventRenderer.unrender.bind(this.eventRenderer))
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
      console.log('renderDates ran', dateProfile, this)

      // this.currentStart and this.currentEnd are now set
    }

    renderEvents (eventStore, eventUiHash) {
      // FIXME need to limit events by the date range
      // TODO need to parse events that are between this.currentStart and this.currentEnd
      // responsible for rendering events
      // console.log('renderEvents ran', eventStore, eventUiHash)
      let events = this.getEventsInRange(eventStore)

      if (events.length < 1) {
        // this.eventRenderer.emptyEvents() // could just put the items in here manually
        this.renderEmptyMessage()
      } else {
        this.el.innerHTML = `<h3>Wow, there are events here? ${events.length} infact... now gotta find out how to render them...</h3>`
        // TODO need some real rendering ability. first hard code.... then maybe can pull from a html file and display like stratus
      }
      // eventStore is all the new events loaded
      // return '<div>Some Event</div>'
    }

    getEventsInRange (eventStore, eventUiBases) {
      eventStore = eventStore || this.props.eventStore
      eventUiBases = eventUiBases || this.props.eventUiBases
      // let currentStart = this.currentStart || this.props.dateProfile.currentRange.start
      // let currentEnd = this.currentEnd || this.props.dateProfile.currentRange.end
      // this.currentStart
      // this.currentEnd
      let events = []

      let sliceEventObjects = fullcalendarCore.sliceEventStore(eventStore, eventUiBases, this.props.dateProfile.activeRange, this.nextDayThreshold)
      if (
        sliceEventObjects.hasOwnProperty('fg') &&
        _.isArray(sliceEventObjects.fg)
      ) {
        events.push(...sliceEventObjects.fg)
      }

      console.log({
        eventStore: eventStore,
        eventUiBases: eventUiBases,
        activeRange: this.props.dateProfile.activeRange,
        events: events
        // test: test
      })

      return events
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
