// Calendar Component
// --------------
// See https://fullcalendar.io/docs/v4/release-notes
// https://www.gracedover.com/Connect/General-Calendar
// https://gracedover.ccbchurch.com/w_calendar_sub.ics?campus_id=1

// credit to https://github.com/leonaard/icalendar2fullcalendar for ics conversion
/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'moment',
      'angular',
      'stratus.components.calendar.timezones',
      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/list',
      'fullcalendar/customView',
      'angular-material',
      'moment-range',
      'stratus.services.iCal'
    ], factory)
  } else {
    factory(
      root.Stratus,
      root._,
      root.moment,
      root.angular
    )
  }
}(this, function (Stratus, _, moment, angular, timezones, fullcalendarCore, fullcalendarDayGridPlugin, fullcalendarTimeGridPlugin, fullcalendarListPlugin, fullcalendarCustomViewPlugin) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'calendar'
  const localPath = 'extras/components'

  console.log('new fullcalendar', fullcalendarCore)
  console.log('new plugin', fullcalendarCustomViewPlugin)

  // This component is a simple calendar at this time.
  Stratus.Components.Calendar = {
    transclude: true,
    bindings: {
      // TODO: remove if we don't need models and collections
      // ngModel: '=',
      elementId: '@',
      options: '@'
    },
    // TODO: remove Collection if we don't need models and collections
    controller: function ($scope, $attrs, $element, $sce, $mdPanel, $mdDialog, $http, $compile, iCal) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      // noinspection JSIgnoredPromiseFromCall
      Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}${min}.css`
      )
      $scope.initialized = false

      // FullCalendar
      $scope.calendarId = $scope.elementId + '_fullcalendar'
      $scope.calendar = null
      $scope.calendarEl = null

      // noinspection JSIgnoredPromiseFromCall
      Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}node_modules/@fullcalendar/core/main${min}.css`
      )
      // noinspection JSIgnoredPromiseFromCall
      Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}node_modules/@fullcalendar/daygrid/main${min}.css`
      )
      // noinspection JSIgnoredPromiseFromCall
      Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}node_modules/@fullcalendar/timegrid/main${min}.css`
      )
      // noinspection JSIgnoredPromiseFromCall
      Stratus.Internals.CssLoader(
        `${Stratus.BaseUrl}${Stratus.BundlePath}node_modules/@fullcalendar/list/main${min}.css`
      )

      $scope.options = $attrs.options && _.isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
      $scope.options.customButtons = $scope.options.customButtons || null // See http://fullcalendar.io/docs/display/customButtons/
      $scope.options.buttonIcons = $scope.options.buttonIcons || { // object. Determines which icons are displayed in buttons of the header. See http://fullcalendar.io/docs/display/buttonIcons/
        prev: 'left-single-arrow',
        next: 'right-single-arrow',
        prevYear: 'left-double-arrow',
        nextYear: 'right-double-arrow'
      }
      const defaultButtonText = {
        today: 'today',

        dayGridMonth: 'month',
        listMonth: 'month list',
        timeGridWeek: 'week agenda',
        dayGridWeek: 'week',
        listWeek: 'week list',
        timeGridDay: 'day agenda',
        dayGridDay: 'day',
        listDay: 'day list',
        listYear: 'year',

        custom: 'custom'
      }
      $scope.options.buttonText = _.extend({}, defaultButtonText, $scope.options.buttonText)
      $scope.options.defaultView = $scope.options.defaultView || 'dayGridMonth'
      $scope.options.possibleViews = $scope.options.possibleViews || ['dayGridMonth', 'timeGridWeek', 'timeGridDay'] // Not used yet @see https://fullcalendar.io/docs/header
      $scope.options.defaultDate = $scope.options.defaultDate || null
      $scope.options.nowIndicator = $scope.options.nowIndicator || false
      $scope.options.timezone = $scope.options.timezone || false
      $scope.options.eventForceAllDay = $scope.options.eventForceAllDay || false
      $scope.options.eventLimit = $scope.options.eventLimit || 7
      $scope.options.eventLimitClick = $scope.options.eventLimitClick || 'popover'
      $scope.options.fixedWeekCount = $scope.options.fixedWeekCount || false
      $scope.options.firstDay = $scope.options.firstDay || 0
      $scope.options.weekends = $scope.options.weekends || true
      $scope.options.hiddenDays = $scope.options.hiddenDays || []
      $scope.options.weekNumbers = $scope.options.weekNumbers || false
      $scope.options.weekNumberCalculation = $scope.options.weekNumberCalculation || 'local'
      $scope.options.businessHours = $scope.options.businessHours || false
      $scope.options.RTL = $scope.options.RTL || false
      $scope.options.height = $scope.options.height || null
      $scope.options.contentHeight = $scope.options.contentHeight || null
      $scope.options.aspectRatio = $scope.options.aspectRatio || 1.35
      $scope.options.handleWindowResize = $scope.options.handleWindowResize || true
      $scope.options.windowResizeDelay = $scope.options.windowResizeDelay || 100
      $scope.options.eventSources = $scope.options.eventSources || []

      $scope.options.plugins = [
        fullcalendarDayGridPlugin.default, // Plugins are ES6 imports and return with 'default'
        fullcalendarTimeGridPlugin.default, // Plugins are ES6 imports and return with 'default'
        fullcalendarListPlugin.default, // Plugins are ES6 imports and return with 'default'
        fullcalendarCustomViewPlugin.default // Plugins are ES6 imports and return with 'default'
      ]

      $scope.initialized = false
      $scope.fetched = false
      $scope.startRange = moment()
      $scope.endRange = moment()

      $scope.options.defaultView = 'listMonth' // dev testing
      $scope.options.possibleViews = ['dayGridMonth', 'timeGridWeek', 'listMonth', 'custom'] // dev testing

      // Event Collection
      // TODO: remove if we don't need models and collections
      // $scope.collection = null

      $ctrl.$onInit = function () {
        // Load all timezones for use
        iCal.registerTimezones(timezones)
        // Compile the fullcalendar header to look useable
        $ctrl.prepareHeader()

        // TODO: remove if we don't need models and collections
        /* *
        $scope.$watch('$ctrl.ngModel', function (data) {
          if (data instanceof Collection) {
            $scope.collection = data
          }
        })
        /* */

        // Ensure the Collection is ready first
        /* *
        let collectionWatcher = $scope.$watch('collection.completed', async function (completed) {
          if (completed) {
            collectionWatcher() // Destroy this watcher
            console.log('collection:', $scope.collection)
            // initialize everything here
            $ctrl.render()
            // process a list of URLS, just using single example below
            // Process each feed before continuing
            console.log('loading external urls', $scope.options.eventSources)
            await Promise.all($scope.options.eventSources.map(url => $scope.addEventICSSource(url)))
            // console.log('completed loading events', events);
            console.log('events all loaded!')
            $scope.initialized = true
          }
        }, true)
        /* */

        setTimeout(async function () {
          try {
            // TODO add a loading indicator
            if (!Stratus.Environment.get('production')) {
              console.log('loading external urls:', $scope.options.eventSources)
            }
            // Render happens once prior to any url fetching
            await $ctrl.render()
            // process a list of URLS, just using single example below
            // Process each feed before continuing
            // If we want to
            await Promise.all($scope.options.eventSources.map(url => $scope.addEventICSSource(url)))
            // $log.log('completed loading events', events);\
            if (!Stratus.Environment.get('production')) {
              console.log('completed loading events:', arguments)
            }
            $scope.initialized = true
          } catch (e) {
            console.error('calendar render:', e)
          }
        }, 1)
      }

      /**
       * Fetch a ics source via URL and load into rendered fullcalendar
       * @param {string} url
       * @returns {Promise<EventObject[]>}
       * @fulfill {EventObject[]}
       */
      $scope.addEventICSSource = async function (url) {
        let fullUrl = url
        // TODO handle bad fetch softly (throw)
        // If pulling externally, we'll use cors-anywhere.herokuapp.com for now
        if (fullUrl.startsWith('http')) {
          fullUrl = `https://cors-anywhere.herokuapp.com/${url}`
        }

        let response = await $http.get(fullUrl)
        if (!Stratus.Environment.get('production')) {
          console.log('fetched the events from:', url)
        }
        const iCalExpander = new iCal.ICalExpander(response.data, { maxIterations: 0 })
        const events = iCalExpander.jsonEventsForFullCalendar(new Date('2018-01-24T00:00:00.000Z'), new Date('2020-01-26T00:00:00.000Z'))
        $scope.calendar.addEventSource({
          events: events
          // color: 'black',     // an option!
          // textColor: 'yellow' // an option!
        })

        return events
      }

      // noinspection JSUnusedLocalSymbols
      /**
       * Handles what actions to perform when an event is clicked
       * @param {Object} clickEvent
       * @param {Element} clickEvent.el HTML Element
       * @param {fullcalendarCore.EventApi} clickEvent.event Event data (Calendar Data)
       * @param {MouseEvent} clickEvent.jsEvent Click data
       * @param {fullcalendarCore.View} clickEvent.view Plugin View data
       * @returns {Promise<boolean>} Return false to not issue other functions (such as URL clicking)
       * @fulfill {boolean} Return false to not issue other functions (such as URL clicking)
       */
      $scope.handleEventClick = async function (clickEvent) {
        console.log('Event', clickEvent)
        // Simply open  popup for now
        // noinspection JSIgnoredPromiseFromCall
        $scope.displayEventDialog(clickEvent.event, clickEvent.jsEvent)
        return false // Return false to not issue other functions (such as URL clicking)
      }

      /**
       * Create MDDialog popup for an event
       * @param {Object} calEvent
       * @param {Object} clickEvent
       * @returns {Promise}
       * @fulfill {*} Unknown fulfillment
       */
      $scope.displayEventDialog = async function (calEvent, clickEvent) {
        return $mdDialog.show({
          templateUrl: `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/calendar.eventDialog${min}.html`,
          parent: angular.element(document.body),
          targetEvent: clickEvent,
          clickOutsideToClose: true,
          escapeToClose: false,
          fullscreen: true, // Only for -xs, -sm breakpoints.
          locals: {
            eventData: calEvent
          },
          bindToController: true,
          controllerAs: 'ctrl',
          controller: function ($scope, $mdDialog) {
            let dc = this

            dc.$onInit = function () {
              // The event saves misc data to the 'extendedProps' field. So we'll merge this in
              if (
                dc.eventData &&
                !dc.eventData.descriptionHTML &&
                dc.eventData.constructor.prototype.hasOwnProperty('extendedProps') &&
                dc.eventData.extendedProps.hasOwnProperty('description')
              ) {
                dc.eventData.descriptionHTML = $sce.trustAsHtml(dc.eventData.extendedProps.description)
                console.log('processed desc')
              }

              console.log('evet', dc.eventData)

              dc.close = close
            }

            function close () {
              if ($mdDialog) {
                $mdDialog.hide()
              }
            }
          }
        })
      }

      /**
       * Compile $scope.options.header and $scope.options.possibleViews into something viewable on the page
       */
      $ctrl.prepareHeader = function () {
        if ($scope.options.header) {
          return
        }
        let headerLeft = 'prev,next today'
        let headerCenter = 'title'
        let headerRight = 'month,weekGrid,dayGrid'
        // All this is assuming tha the default Header is not customized
        if (_.isArray($scope.options.possibleViews)) {
          // FIXME Other views don't have a proper 'name' yet. (such as lists), need a Naming scheme
          headerRight = $scope.options.possibleViews.join(',')
        }

        $scope.options.header = { // object. Defines the buttons and title at the top of the calendar. See http://fullcalendar.io/docs/display/header/
          left: headerLeft,
          center: headerCenter,
          right: headerRight
        }
      }

      /**
       * Initializes the fullcalendar display. Required before anything may be added to the calendar
       * @TODO Methods to look into:
       * 'viewRender' for callbacks on new date range (pagination maybe)  - http:// fullcalendar.io/docs/display/viewRender/
       * 'dayRender' for modifying day cells - http://fullcalendar.io/docs/display/dayRender/
       * 'windowResize' for callbacks on window resizing - http://fullcalendar.io/docs/display/windowResize/
       * 'render' force calendar to redraw - http://fullcalendar.io/docs/display/render/
       * @returns {Promise<Calendar>}
       * @fulfill {Calendar}
       */
      $ctrl.render = function () {
        // return new Promise(function (resolve) {
        $scope.calendarEl = document.getElementById($scope.calendarId)

        $scope.calendar = new fullcalendarCore.Calendar($scope.calendarEl, {
          $scope: $scope,
          $compile: $compile,
          $sce: $sce,
          // customViewScope: customViewScope,
          // customViewComponent: compiledComponent,

          plugins: $scope.options.plugins,
          header: $scope.options.header,
          defaultView: $scope.options.defaultView,
          defaultDate: $scope.options.defaultDate,
          nowIndicator: $scope.options.nowIndicator,
          timezone: $scope.options.timezone,
          eventLimit: $scope.options.eventLimit,
          eventLimitClick: $scope.options.eventLimitClick,
          buttonText: $scope.options.buttonText,
          customButtons: $scope.options.customButtons,
          fixedWeekCount: $scope.options.fixedWeekCount,
          firstDay: $scope.options.firstDay,
          weekends: $scope.options.weekends,
          hiddenDays: $scope.options.hiddenDays,
          weekNumbers: $scope.options.weekNumbers,
          weekNumberCalculation: $scope.options.weekNumberCalculation,
          businessHours: $scope.options.businessHours,
          isRTL: $scope.options.RTL,
          height: $scope.options.height,
          contentHeight: $scope.options.contentHeight,
          aspectRatio: $scope.options.aspectRatio,
          handleWindowResize: $scope.options.handleWindowResize,
          windowResizeDelay: $scope.options.windowResizeDelay,
          eventClick: $scope.handleEventClick // Handles what happens when an event is clicked
          /* eventRender: function (info) {
            console.log(info.event.extendedProps)
          } */
        })
        $scope.calendar.render()
        return $scope.calendar
      }
    },
    template: '<div id="{{ elementId }}">' +
      '<div id="{{ calendarId }}"></div>' +
      '</div>'
  }
}))
