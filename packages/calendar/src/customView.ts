/* global define */

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'

// Libraries
import _ from 'lodash'
import angular from 'angular'
// tslint:disable-next-line:no-duplicate-imports
import 'angular'
import 'moment'
import 'moment-range'

// FullCalendar
// import '@fullcalendar/core'
import {
    EventApi,
    SpecificViewContentArg,
    ViewProps,
    createPlugin,
    sliceEventStore
} from '@fullcalendar/core'

// Angular 1 Modules
import 'angular-material'

// Services
import '@stratusjs/angularjs/services/model'
import '@stratusjs/angularjs/services/collection'
import '@stratusjs/angularjs/services/registry'

// Components
import { CalendarScope } from '@stratusjs/calendar/calendar'


// Stratus Utilities
import {cookie} from '@stratusjs/core/environment'
// import {LooseObject} from '@stratusjs/core/misc'
// import {EventUiHash} from '@fullcalendar/core/component/event-ui'

type  EventApiExtended = EventApi & {
    descriptionHTML?: any
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'calendar'
const componentName = 'customView'
// const localPath = '@stratusjs/calendar/src'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${componentName}`
const defaultTemplate = 'default'

type CalendarCustomViewScope = angular.IScope & {
    elementId: string
    template: string
    $parent: CalendarScope

    events: EventApiExtended[]

    eventClick(eventData: EventApiExtended, ev: any): Promise<false>
    destroy(): void
}

Stratus.Components.CalendarCustomView = {
    bindings: {
        template: '@',
        uid: '@'
    },
    controller(
        $scope: CalendarCustomViewScope, // angular.IScope & any, // CalendarCustomViewScope
        $attrs: angular.IAttributes & any
    ) {
        // Initialize
        const $ctrl = this

        $scope.template = $attrs.template && !_.isEmpty($attrs.template) ? $attrs.template : defaultTemplate
        // WARNING DO NOT force a new uid if it was already provided by the parent or else it'll break the connection
        // uid should have be created by the View. Rely on that instead
        $ctrl.uid = $attrs.uid && !_.isEmpty($attrs.uid) ? $attrs.uid :
            _.uniqueId(`${_.camelCase(packageName)}_${_.camelCase(componentName)}_${_.camelCase($scope.template)}_`)
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $ctrl.uid
        $scope.events = []

        // Load this particular template's CSS
        // noinspection JSIgnoredPromiseFromCall
        Stratus.Internals.CssLoader(
            `${localDir}.${$scope.template}${min}.css`
        )

        // Make sure we reference our current scope, or events may not be updated
        $scope.$applyAsync(() => {
            $scope.$parent.customViews[$ctrl.uid] = $scope.template
            // console.log('$scope.$parent.customViews.' + $ctrl.uid, 'set to:', $scope.template)
        })

        $ctrl.$onInit = () => {
            // console.log('CalendarCustomView inited')
            // console.log('$scope.$parent', $scope.$parent)
        }

        /**
         * @returns Promise<boolean> Return false to not issue other functions (such as URL clicking)
         * @fulfill boolean Return false to not issue other functions (such as URL clicking)
         */
        $scope.eventClick = async (eventData: EventApiExtended, ev: any) => {
            $scope.$parent.calendar.getCurrentData().calendarApi.trigger('eventClick', {
                el: ev.target || null,
                event: eventData,
                jsEvent: ev,
                view: $scope.$parent.calendar.getCurrentData().viewApi
            })
            return false // Return false to not issue other functions (such as URL clicking)
        }

        $scope.destroy = () => {
            delete $scope.$parent.customViews[$ctrl.uid]
            if (typeof Stratus.Instances[$ctrl.uid].remove === 'function') {
                Stratus.Instances[$ctrl.uid].remove()
            }
            $scope.$destroy()
            delete Stratus.Instances[$ctrl.uid]
        }
    },
    templateUrl(
        $element: JQLite,
        $attrs: angular.IAttributes & any
    ) {
        return `${localDir}.${$attrs.template || defaultTemplate}${min}.html`
    }
}

class CustomViewConfig {
    $calendarScope: CalendarScope
    $compile: angular.ICompileService
    $sce: angular.ISCEService
    template: string
    uid: string

    $scope: CalendarCustomViewScope
    eventsWaiting: EventApiExtended[]
    componentEl: any

    constructor(
        $calendarScope: CalendarScope,
        $compile: angular.ICompileService,
        $sce: angular.ISCEService,
        template: string = 'default'
    ) {
        this.$calendarScope = $calendarScope
        this.$compile = $compile
        this.$sce = $sce
        this.template = template
        this.uid = _.uniqueId(`${_.camelCase(packageName)}_${_.camelCase(componentName)}_${_.camelCase(this.template)}_`)

        const calendarCustomViewComponent = $compile(`
            <stratus-calendar-custom-view data-uid="${this.uid}" data-template="${this.template}">
            </stratus-calendar-custom-view>
        `)
        this.componentEl = calendarCustomViewComponent($calendarScope)

        // Wait for the new component to be created and fetch it's $scope when ready
        const stopWatchingScope = this.$calendarScope.$watch(`customViews`, () => {
            if (
                Object.prototype.hasOwnProperty.call(this.$calendarScope.customViews, this.uid) &&
                Object.prototype.hasOwnProperty.call(Stratus.Instances, this.uid)
            ) {
                this.$scope = Stratus.Instances[this.uid]
                // console.log('CustomView found scope for', this.uid, this.$scope)
                // $scope.options = that.viewSpec.options
                // that.$scope.view = that
                if (this.eventsWaiting) {
                    this.updateEventScope(this.eventsWaiting)
                }
                stopWatchingScope()
            }
        }, true)
    }

    updateEventScope(events: EventApiExtended[]) {
        this.$scope.$applyAsync(() => {
            this.$scope.events.length = 0
            this.$scope.events.push(...events)
        })
    }

    getEventsInRange(props: SpecificViewContentArg & ViewProps) {
        const events: EventApiExtended[] = []
        const sliceEventObjects = sliceEventStore(
            props.eventStore, props.eventUiBases, props.dateProfile.activeRange, props.nextDayThreshold
        )
        if (!Object.prototype.hasOwnProperty.call(sliceEventObjects, 'fg') || !_.isArray(sliceEventObjects.fg)) {
            return events
        }
        sliceEventObjects.fg.forEach((eventRaw) => {
            const event: EventApiExtended = new EventApi(this.$calendarScope.calendar.getCurrentData(), eventRaw.def, eventRaw.instance)
            if (
                event &&
                !Object.prototype.hasOwnProperty.call(event, 'descriptionHTML') &&
                Object.prototype.hasOwnProperty.call(event.constructor.prototype, 'extendedProps') &&
                Object.prototype.hasOwnProperty.call(event.extendedProps, 'description')
            ) {
                event.descriptionHTML = this.$sce.trustAsHtml(event.extendedProps.description)
            }
            events.push(event)
        })

        // console.log('events', events)
        return events
    }

    renderEvents(props: SpecificViewContentArg & ViewProps) {
        if (this.$scope) {
            this.updateEventScope(this.getEventsInRange(props))
        } else {
            // If scope isn't ready yet, add the events to waiting
            this.eventsWaiting = this.getEventsInRange(props)
        }
    }

    getDomNodes() {
        return this.componentEl
    }

    destroy() {
        if (this.$scope) {
            this.$scope.$destroy()
        }
    }
}

const CustomViewConfigConstructor = (
    $calendarScope: CalendarScope,
    $compile: angular.ICompileService,
    $sce: angular.ISCEService,
    template: string = 'default'
) => {
    const customViewConfig = new CustomViewConfig(
        $calendarScope,
        $compile,
        $sce,
        template
    )

    return { // RenderHookProps<ViewProps>
        classNames: [ 'custom-view' ],
        content: (props: SpecificViewContentArg & ViewProps) => { // : SpecificViewContentArg & ViewProps
            // console.log('content() ran', _.clone(props))
            // console.log('template is', template)
            customViewConfig.renderEvents(props)
            return { domNodes: customViewConfig.getDomNodes() }
        }
    }
}

export function customViewPluginConstructor(
    $calendarScope: CalendarScope,
    $compile: angular.ICompileService,
    $sce: angular.ISCEService
) {
    return createPlugin({
        initialView: 'custom', // defaultView: 'custom',
        views: {
            custom: CustomViewConfigConstructor($calendarScope, $compile, $sce),
            customArticle: CustomViewConfigConstructor($calendarScope, $compile, $sce, 'article'),
            customArticleDay: {
                type: 'customArticle',
                duration: {day: 1}
            },
            customArticleWeek: {
                type: 'customArticle',
                duration: {week: 1}
            },
            customArticleMonth: {
                type: 'customArticle',
                duration: {month: 1}
            },
            customArticleYear: {
                type: 'customArticle',
                duration: {year: 1}
            }
        }
    })
}
