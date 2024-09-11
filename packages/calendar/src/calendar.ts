// Calendar Component
// --------------
// See https://fullcalendar.io/docs/v5/release-notes
// https://www.gracedover.com/Connect/General-Calendar
// https://gracedover.ccbchurch.com/w_calendar_sub.ics?campus_id=1
// TODO later when implementing new data source types, refer to https://fullcalendar.io/docs/google-calendar as a plugin example

// credit to https://github.com/leonaard/icalendar2fullcalendar for ics conversion
import {Stratus} from '@stratusjs/runtime/stratus'
import {extend, isArray} from 'lodash'
import {
    IAttributes,
    ICompileService,
    IHttpService,
    ISCEService,
    IScope,
    material,
    element
} from 'angular'
import moment from 'moment' // still needed by fullcalendar
import 'moment-range' // still needed by fullcalendar
// import 'moment-timezone'
import {cookie} from '@stratusjs/core/environment'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {FullCalEventExtendedProps, ICalExpander, registerTimezones} from '@stratusjs/calendar/iCal'
import { customViewPluginConstructor } from '@stratusjs/calendar/customView'
import { TimezoneList } from '@stratusjs/calendar/timezones'

// FullCalendar
import {Calendar, EventApi} from '@fullcalendar/core'
import '@fullcalendar/core/vdom'
import momentPlugin from '@fullcalendar/moment'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import fullCalendarDayGridPlugin from '@fullcalendar/daygrid'
import fullCalendarTimeGridPlugin from '@fullcalendar/timegrid'
import fullCalendarListPlugin from '@fullcalendar/list'

// Stratus Preload
import '@stratusjs/angularjs-extras'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'calendar'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src`

export type CalendarScope = IScope & {
    uid: string
    elementId: string
    calendarId: string
    initialized: boolean
    fetched: boolean
    calendar: Calendar
    calendarEl: HTMLElement

    startRange: unknown // moment
    endRange: unknown// moment
    options: {
        customButtons: any
        buttonIcons: {
            prev: string // 'left-single-arrow',
            next: string // 'right-single-arrow',
            prevYear: string // 'left-double-arrow',
            nextYear: string // 'right-double-arrow'
        }
        buttonText: {
            today: string // 'today',

            dayGridMonth: string // 'month',
            listMonth: string // 'month list',
            timeGridWeek: string // 'week agenda',
            dayGridWeek: string // 'week',
            listWeek: string // 'week list',
            timeGridDay: string // 'day agenda',
            dayGridDay: string // 'day',
            listDay: string // 'day list',
            listYear: string // 'year',

            customArticleDay: string // 'article',
            customArticleWeek: string // 'article',
            customArticleMonth: string // 'article',
            customArticleYear: string // 'article'
        }
        header: {
            left: string // 'prev,next today'
            center: string // 'title'
            right: string // 'month,weekGrid,dayGrid'
        }
        defaultView: string // 'dayGridMonth'
        possibleViews: string[] // ['dayGridMonth', 'timeGridWeek', 'timeGridDay']
        defaultDate: Date
        nowIndicator: boolean
        timeZone: string // 'local'
        eventForceTimezones: boolean // If the Event Popup should display time in their TZid instead of the Calendar's set zone
        eventForceAllDay: boolean
        eventLimit: number // 7
        eventLimitClick: 'popover' | 'week' | 'day' | string // 'popover'
        fixedWeekCount: boolean
        firstDay: number // 0
        weekends: boolean // true
        hiddenDays: number[] // []
        weekNumbers: boolean
        weekNumberCalculation: 'local' | 'ISO' | ((m: Date) => number) // string // 'local'
        businessHours: boolean
        RTL: boolean
        height: number | 'auto' | 'parent' // string | number
        contentHeight: number | 'auto' // string | number
        aspectRatio: number // 1.35
        handleWindowResize: boolean // true
        windowResizeDelay: number // 100
        eventSources: string[] // urls
        plugins: any[] // imports
    }
    customViews: {[viewUid: string]: string}

    addEventICSSource(url: string): Promise<unknown>
    handleEventClick(clickEvent: any): false
    displayEventDialog(calEvent: EventApi, clickEvent: MouseEvent): void
}

// This component is a simple calendar at this time.
Stratus.Components.Calendar = {
    transclude: true,
    bindings: {
        elementId: '@',
        options: '@'
    },
    controller(
        $scope: CalendarScope,
        $attrs: IAttributes,
        // $element: IAugmentedJQuery,
        $sce: ISCEService,
        // $mdPanel: material.IPanelService,
        $mdDialog: material.IDialogService,
        $http: IHttpService,
        $compile: ICompileService
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid

        // noinspection JSIgnoredPromiseFromCall
        Stratus.Internals.CssLoader(`${localDir}/${packageName}${min}.css`)
        $scope.initialized = false

        // FullCalendar
        $scope.calendarId = $scope.elementId + '_fullcalendar'
        $scope.calendar = null
        $scope.calendarEl = null

        $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

        // See http://fullcalendar.io/docs/display/customButtons/
        $scope.options.customButtons = $scope.options.customButtons || null

        // object. Determines which icons are displayed in buttons of the header. See http://fullcalendar.io/docs/display/buttonIcons/
        $scope.options.buttonIcons = $scope.options.buttonIcons || {
            prev: 'left-single-arrow',
            next: 'right-single-arrow',
            prevYear: 'left-double-arrow',
            nextYear: 'right-double-arrow'
        }
        const defaultButtonText: any = {
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

            customArticleDay: 'article',
            customArticleWeek: 'article',
            customArticleMonth: 'article',
            customArticleYear: 'article'
        }
        $scope.options.buttonText = extend({}, defaultButtonText, $scope.options.buttonText)
        $scope.options.defaultView = $scope.options.defaultView || 'dayGridMonth'

        $scope.options.eventForceTimezones = $scope.options.eventForceTimezones || false

        // Not used yet @see https://fullcalendar.io/docs/header
        $scope.options.possibleViews = $scope.options.possibleViews || ['dayGridMonth', 'timeGridWeek', 'timeGridDay']
        $scope.options.defaultDate = $scope.options.defaultDate || null
        $scope.options.nowIndicator = $scope.options.nowIndicator || false
        $scope.options.timeZone = $scope.options.timeZone || 'local' // TODO update reference on Sitetheory
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
        $scope.options.height = $scope.options.height || 'auto'
        $scope.options.contentHeight = $scope.options.contentHeight || 'auto'
        $scope.options.aspectRatio = $scope.options.aspectRatio || 1.35
        $scope.options.handleWindowResize = $scope.options.handleWindowResize || true
        $scope.options.windowResizeDelay = $scope.options.windowResizeDelay || 100
        $scope.options.eventSources = $scope.options.eventSources || []

        $scope.options.plugins = [
            momentPlugin, // Plugins are ES6 imports and return with 'default'
            momentTimezonePlugin, // Plugins are ES6 imports and return with 'default'
            fullCalendarDayGridPlugin, // Plugins are ES6 imports and return with 'default'
            fullCalendarTimeGridPlugin, // Plugins are ES6 imports and return with 'default'
            fullCalendarListPlugin, // Plugins are ES6 imports and return with 'default'
            customViewPluginConstructor($scope, $compile, $sce) // Plugins are ES6 imports and return with 'default'
        ]

        $scope.initialized = false
        $scope.fetched = false
        $scope.startRange = moment()
        $scope.endRange = moment()
        $scope.customViews = {} // Filled by the customPlugin to hold any custom Views currently displayed for storage and reuse

        /** This function builds the URL for a CSS Resource based on configuration path. */
        const resourceUrl = (resource: string) => `${Stratus.BaseUrl}${Stratus.DeploymentPath}${resource}/main.css`

        // CSS Loading depends on Views possible

        // Base CSS always required
        // noinspection JSIgnoredPromiseFromCall
        Stratus.Internals.CssLoader(resourceUrl('@fullcalendar/common'))
        // Check if dayGrid is used and load the CSS. load here as well rather than at init
        if ($scope.options.possibleViews.some((r: string) => ['dayGrid', 'dayGridDay', 'dayGridWeek', 'dayGridMonth'].includes(r))) {
            // noinspection JSIgnoredPromiseFromCall
            Stratus.Internals.CssLoader(resourceUrl('@fullcalendar/daygrid'))
        }
        // Check if timeGrid is used and load the CSS. load here as well rather than at init
        if ($scope.options.possibleViews.some((r: string) => ['timeGrid', 'timeGridDay', 'timeGridWeek'].includes(r))) {
            // noinspection JSIgnoredPromiseFromCall
            Stratus.Internals.CssLoader(
                resourceUrl('@fullcalendar/timegrid')
            )
        }
        // Check if dayGrid is used and load the CSS. load here as well rather than at init
        if ($scope.options.possibleViews.some((r: string) => ['list', 'listDay', 'listWeek', 'listMonth', 'listYear'].includes(r))) {
            // noinspection JSIgnoredPromiseFromCall
            Stratus.Internals.CssLoader(
                resourceUrl('@fullcalendar/list')
            )
        }

        /**
         * Compile $scope.options.header and $scope.options.possibleViews into something viewable on the page
         */
        const prepareHeader = () => {
            if ($scope.options.header) {
                return
            }
            const headerLeft = 'prev,next today'
            const headerCenter = 'title'
            let headerRight = 'month,weekGrid,dayGrid'
            // All this is assuming tha the default Header is not customized
            if (isArray($scope.options.possibleViews)) {
                // FIXME Other views don't have a proper 'name' yet. (such as lists), need a Naming scheme
                headerRight = $scope.options.possibleViews.join(',')
            }

            // object. Defines the buttons and title at the top of the calendar. See http://fullcalendar.io/docs/display/header/
            $scope.options.header = {
                left: headerLeft,
                center: headerCenter,
                right: headerRight
            }
        }

        this.$onInit = () => {
            registerTimezones(TimezoneList)
            // Compile the fullcalendar header to look usable
            prepareHeader()

            setTimeout(async () => {
                try {
                    // TODO add a loading indicator
                    if (cookie('env')) {
                        console.log('loading external urls:', $scope.options.eventSources)
                    }
                    // Render happens once prior to any url fetching
                    $scope.$applyAsync(async () => {
                        await this.render()
                    })
                    setTimeout(async () => {
                        // render a second and third time for safety... as it doesn't seem to always grab the window size
                        $scope.calendar.render()
                        setTimeout(async () => {
                            $scope.calendar.render()
                        }, 300)
                    }, 300)

                    // process a list of URLS, just using single example below
                    // Process each feed before continuing noting that Calendar is done loading
                    await Promise.all(
                        $scope.options.eventSources.map(
                            (url: string) => $scope.addEventICSSource(url)
                        )
                    )
                    if (cookie('env')) {
                        console.log('completed loading events:', arguments)
                    }
                    $scope.$applyAsync(() => {
                        $scope.initialized = true
                    })
                } catch (e) {
                    console.error('calendar render:', e)
                }
            }, 1)
        }

        // Fetch a ics source via URL and load into rendered fullcalendar
        $scope.addEventICSSource = async (url: string) => {
            // TODO handle bad fetch softly (throw)
            // FIXME cors-anywhere.herokuapp.com is no longer accepting all traffic anymore. disabling until there is another solution
            /*if (fullUrl.startsWith('http')) {
                fullUrl = `https://cors-anywhere.herokuapp.com/${url}`
            }*/
            if (
                url.startsWith('http') &&
                !url.startsWith('/') &&
                !url.startsWith('https://app004.sitetheory.io/')
            ) {
                url = `https://app004.sitetheory.io/${url}`
            }

            const response = await $http.get(url)
            if (cookie('env')) {
                console.log('fetched the events from:', url)
            }
            const iCalExpander = new ICalExpander(response.data, {maxIterations: 0})
            // TODO need options oh how to handle a date range.
            // Note that accepting ALL events could lead to running out of memory due to the vast size of some calendars
            // or the fact they could have infinite reoccurring events
            const twoYearsPast = new Date()
            twoYearsPast.setDate(twoYearsPast.getDate() - (365 * 2)) // minus 2 years
            const twoYearsFuture = new Date()
            twoYearsFuture.setDate(twoYearsFuture.getDate() + (365 * 2)) // add 2 years
            const events = iCalExpander.jsonEventsForFullCalendar(twoYearsPast, twoYearsFuture)
            $scope.calendar.addEventSource({
                events
                // TODO give Sitetheory options to color each event source
                // color: 'black',     // an option!
                // textColor: 'yellow' // an option!
            })

            return events
        }

        // Handles what actions to perform when an event is clicked
        $scope.handleEventClick = (clickEvent: any) => {
            // console.log('Event', clickEvent)
            // Simply open  popup for now
            $scope.displayEventDialog(clickEvent.event, clickEvent.jsEvent)
            return false // Return false to not issue other functions (such as URL clicking)
        }

        type CalendarEventDialog = {
            $scope: IScope
            eventData: EventApi & {
                extendedProps: FullCalEventExtendedProps
                descriptionHTML: any // html
                spanMultiDay: boolean
                eventTimeZone: string
            }
            calendarTimeZone: string

            $onInit(): void // angular.IController['$onInit']
            close(): void
        }

        // Create MDDialog popup for an event
        $scope.displayEventDialog = (calEvent: EventApi, clickEvent: MouseEvent) => {
            $mdDialog.show({
                templateUrl: `${localDir}/eventDialog${min}.html`,
                parent: element(document.body),
                targetEvent: clickEvent,
                clickOutsideToClose: true,
                escapeToClose: false,
                fullscreen: true, // Only for -xs, -sm breakpoints.
                locals: {
                    eventData: calEvent
                },
                bindToController: true,
                controllerAs: 'ctrl',
                // controller: this.EventDialogController
                controller() { // $scope, $mdDialog unused
                    const dialog: CalendarEventDialog  = this

                    dialog.$onInit = () => {
                        // Set a timezone that's easy to grab
                        dialog.calendarTimeZone = 'local'
                        if (
                            dialog.eventData &&
                            dialog.eventData._context &&
                            dialog.eventData._context.dateEnv // &&
                            // dialog.eventData._context.dateEnv.timeZone !== 'local'
                        ) {
                            dialog.calendarTimeZone = dialog.eventData._context.dateEnv.timeZone
                        }

                        dialog.eventData.eventTimeZone = dialog.calendarTimeZone
                        // Overwrite the displayed time with the Event's to display
                        if (
                            $scope.options.eventForceTimezones &&
                            dialog.eventData &&
                            !dialog.eventData.descriptionHTML &&
                            Object.prototype.hasOwnProperty.call(dialog.eventData.constructor.prototype, 'extendedProps') &&
                            Object.prototype.hasOwnProperty.call(dialog.eventData.extendedProps, 'timeZone')
                        ) {
                            dialog.eventData.eventTimeZone = dialog.eventData.extendedProps.timeZone
                        }

                        // The event saves misc data to the 'extendedProps' field. So we'll merge this in
                        if (
                            dialog.eventData &&
                            !dialog.eventData.descriptionHTML &&
                            Object.prototype.hasOwnProperty.call(dialog.eventData.constructor.prototype, 'extendedProps') &&
                            Object.prototype.hasOwnProperty.call(dialog.eventData.extendedProps, 'description')
                        ) {
                            dialog.eventData.descriptionHTML = $sce.trustAsHtml(dialog.eventData.extendedProps.description)
                        }

                        dialog.eventData.spanMultiDay = false
                        if (dialog.eventData.allDay) {
                            if(
                                Object.prototype.hasOwnProperty.call(dialog.eventData.constructor.prototype, 'extendedProps') &&
                                Object.prototype.hasOwnProperty.call(dialog.eventData.extendedProps, 'allDayMultiDay') &&
                                dialog.eventData.extendedProps.allDayMultiDay
                            ) {
                                dialog.eventData.spanMultiDay = true
                            }
                        } else {
                            const millisecondsInDay = 86400000
                            const millisecondsInInstance =
                                dialog.eventData._instance.range.end.getTime() - dialog.eventData._instance.range.start.getTime()
                            const NumDaysSpanned = millisecondsInInstance / millisecondsInDay
                            if (NumDaysSpanned > 0.9) {
                                dialog.eventData.spanMultiDay = true
                            }
                        }

                        // dialog.close = close
                        // console.log(clone(this))
                    }

                    dialog.close = () => {
                        if ($mdDialog) {
                            $mdDialog.hide()
                        }
                    }
                }
            })
        }

        /**
         * Initializes the fullcalendar display. Required before anything may be added to the calendar
         * @TODO Methods to look into:
         * 'viewRender' for callbacks on new date range (pagination maybe)  - http:// fullcalendar.io/docs/display/viewRender/
         * 'dayRender' for modifying day cells - http://fullcalendar.io/docs/display/dayRender/
         * 'windowResize' for callbacks on window resizing - https://fullcalendar.io/docs/handleWindowResize
         * 'render' force calendar to redraw - https://fullcalendar.io/docs/render
         */
        this.render = () => {
            // return new Promise((resolve) => {
            $scope.calendarEl = document.getElementById($scope.calendarId)

            $scope.calendar = new Calendar($scope.calendarEl, {
                plugins: $scope.options.plugins,
                headerToolbar: $scope.options.header,
                initialView: $scope.options.defaultView,
                initialDate: $scope.options.defaultDate,
                nowIndicator: $scope.options.nowIndicator,
                timeZone: $scope.options.timeZone,
                dayMaxEventRows: $scope.options.eventLimit,
                moreLinkClick: $scope.options.eventLimitClick,
                buttonText: $scope.options.buttonText,
                customButtons: $scope.options.customButtons,
                fixedWeekCount: $scope.options.fixedWeekCount,
                firstDay: $scope.options.firstDay,
                weekends: $scope.options.weekends,
                hiddenDays: $scope.options.hiddenDays,
                weekNumbers: $scope.options.weekNumbers,
                weekNumberCalculation: $scope.options.weekNumberCalculation,
                businessHours: $scope.options.businessHours,
                // isRTL: $scope.options.RTL, TODO this option was removed?
                height: $scope.options.height,
                contentHeight: $scope.options.contentHeight,
                aspectRatio: $scope.options.aspectRatio,
                handleWindowResize: $scope.options.handleWindowResize,
                windowResizeDelay: $scope.options.windowResizeDelay,
                eventInteractive: true,
                eventClick: $scope.handleEventClick // Handles what happens when an event is clicked
            })
            $scope.calendar.render()
            // console.log('$scope.calendar', $scope.calendar)
            return $scope.calendar
        }
    },
    template: '<div id="{{ ::elementId }}">' +
        '<md-progress-linear md-mode="indeterminate" data-ng-if="!initialized"></md-progress-linear>' +
        '<div id="{{ ::calendarId }}"></div>' +
        '</div>'
}
