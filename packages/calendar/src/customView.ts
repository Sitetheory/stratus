/* global define */

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {isArray, isEmpty} from 'lodash'
import {IAttributes, ICompileService, ISCEService, IScope} from 'angular'
import 'moment'
import 'moment-range'
import {
    EventApi,
    SpecificViewContentArg,
    ViewProps,
    createPlugin,
    sliceEventStore
} from '@fullcalendar/core'
import 'angular-material'
import { CalendarScope } from '@stratusjs/calendar/calendar'
import {cookie} from '@stratusjs/core/environment'
import {safeUniqueId} from '@stratusjs/core/misc'

// Stratus Preload
import '@stratusjs/angularjs'

type  EventApiExtended = EventApi & {
    descriptionHTML?: any
}

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'calendar'
const componentName = 'customView'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${componentName}`
const defaultTemplate = 'default'

type CalendarCustomViewScope = IScope & {
    uid: string
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
        $scope: CalendarCustomViewScope, // IScope & any, // CalendarCustomViewScope
        $attrs: IAttributes
    ) {
        // Initialize
        $scope.template = $attrs.template && !isEmpty($attrs.template) ? $attrs.template : defaultTemplate
        // WARNING DO NOT force a new uid if it was already provided by the parent or else it'll break the connection
        // uid should have be created by the View. Rely on that instead
        $scope.uid = $attrs.uid && !isEmpty($attrs.uid) ? $attrs.uid : safeUniqueId(packageName, componentName, $scope.template)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $scope.uid
        $scope.events = []

        // Load this particular template's CSS
        // noinspection JSIgnoredPromiseFromCall
        Stratus.Internals.CssLoader(
            `${localDir}.${$scope.template}${min}.css`
        )

        // Make sure we reference our current scope, or events may not be updated
        $scope.$applyAsync(() => {
            $scope.$parent.customViews[$scope.uid] = $scope.template
            // console.log('$scope.$parent.customViews.' + $ctrl.uid, 'set to:', $scope.template)
        })

        this.$onInit = () => {
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
            delete $scope.$parent.customViews[$scope.uid]
            if (typeof Stratus.Instances[$scope.uid].remove === 'function') {
                Stratus.Instances[$scope.uid].remove()
            }
            $scope.$destroy()
            delete Stratus.Instances[$scope.uid]
        }
    },
    templateUrl(
        // $element: JQLite,
        $attrs: IAttributes & any
    ) {
        return `${localDir}.${$attrs.template || defaultTemplate}${min}.html`
    }
}

class CustomViewConfig {
    $calendarScope: CalendarScope
    $compile: ICompileService
    $sce: ISCEService
    template: string
    uid: string

    $scope: CalendarCustomViewScope
    eventsWaiting: EventApiExtended[]
    componentEl: JQLite

    constructor(
        $calendarScope: CalendarScope,
        $compile: ICompileService,
        $sce: ISCEService,
        template: string = 'default'
    ) {
        this.$calendarScope = $calendarScope
        this.$compile = $compile
        this.$sce = $sce
        this.template = template
        this.uid = safeUniqueId(packageName, componentName, this.template)

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
        if (!Object.prototype.hasOwnProperty.call(sliceEventObjects, 'fg') || !isArray(sliceEventObjects.fg)) {
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
    $compile: ICompileService,
    $sce: ISCEService,
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
            // console.log('content() ran', clone(props))
            // console.log('template is', template)
            customViewConfig.renderEvents(props)
            return { domNodes: customViewConfig.getDomNodes() }
        }
    }
}

export function customViewPluginConstructor(
    $calendarScope: CalendarScope,
    $compile: ICompileService,
    $sce: ISCEService
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
