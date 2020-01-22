/* global define */

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'

// Libraries
import _ from 'lodash'
import angular from 'angular'
import 'angular'
import 'jquery'
import 'moment'
import 'moment-range'

// FullCalendar
import '@fullcalendar/core'
import {EventApi, View, appendToElement, EventStore, sliceEventStore, createPlugin} from '@fullcalendar/core'

// Angular 1 Modules
import 'angular-material'

// Services
import '@stratusjs/angularjs/services/model'
import '@stratusjs/angularjs/services/collection'
import '@stratusjs/angularjs/services/registry'

// Services
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {Registry} from '@stratusjs/angularjs/services/registry'

// Stratus Utilities
import {cookie} from '@stratusjs/core/environment'
import {EventUi, EventUiHash} from '@fullcalendar/core/component/event-ui'

// Environment
const min: any = !cookie('env') ? '.min' : ''
const name: any = 'customView'
const localPath: any = '@stratusjs/calendar/src'
const defaultTemplate: any = 'default'

Stratus.Components.CalendarCustomView = {
    bindings: {
        template: '@',
        uid: '@'
    },
    controller(
        $scope: angular.IScope & any,
        $attrs: angular.IAttributes & any
    ) {
        // Initialize
        const $ctrl = this

        // WARNING DO NOT force a new uid if it was already provided by the parent or else it'll break the connection
        // uid should have be created by the View. Rely on that instead
        $ctrl.uid = $attrs.uid && !_.isEmpty($attrs.uid) ? $attrs.uid : _.uniqueId(_.snakeCase(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $ctrl.uid
        $scope.template = $attrs.template && !_.isEmpty($attrs.template) ? $attrs.template : defaultTemplate

        // Load this particular template's CSS
        // noinspection JSIgnoredPromiseFromCall
        Stratus.Internals.CssLoader(
            `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}.${$scope.template}${min}.css`
        )

        $scope.events = []
        // Make sure we reference our current scope, or events may not be updated
        $scope.$applyAsync(() => {
            $scope.$parent.customViews[$ctrl.uid] = $scope.template
            // console.log('$scope.$parent.customViews.' + $ctrl.uid, 'set to:', $scope.template)
        })

        // Will be given access to
        // $scope.view
        // $scope.options

        // $scope.model = $parse($attrs.ngModel)
        // $scope.render = () => {}
        // $scope.render()

        $ctrl.$onInit = () => {
            // console.log('CalendarCustomView inited')
            // console.log('$scope.$parent', $scope.$parent)
        }

        /**
         * @returns Promise<boolean> Return false to not issue other functions (such as URL clicking)
         * @fulfill boolean Return false to not issue other functions (such as URL clicking)
         */
        $scope.eventClick = async (eventData: any, ev: any) => {
            $scope.$parent.calendar.publiclyTrigger('eventClick', [
                {
                    el: ev.target || null,
                    event: eventData,
                    jsEvent: ev,
                    view: $scope.view
                }
            ])
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
        return `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}/${name}.${$attrs.template || defaultTemplate}${min}.html`
    }
}

export class CustomView extends View {

    uid: string
    $scope: angular.IScope
    $parentScope: angular.IScope
    componentEl: any
    eventsWaiting: any

    /**
     * Runs after constructor, no arguments
     * called once when the view is instantiated, when the user switches to the view.
     * Expects a scope inside th main calendar
     */
    initialize() {
        this.uid = _.uniqueId(_.snakeCase(name) + '_')
        // console.log('this.viewSpec.options', this.viewSpec.options)
        this.$parentScope = this.viewSpec.options.$scope

        // console.log('this.$parentScope scope is', this.$parentScope)

        // Create the CalendarCustomView Component
        const calendarCustomViewComponent: any = this.viewSpec.options.$compile(`<stratus-calendar-custom-view data-uid="${this.uid}" data-template="${this.viewSpec.options.template}"></stratus-calendar-custom-view>`)
        this.componentEl = calendarCustomViewComponent(this.$parentScope)

        // Watch for scope to get ready
        const that: any = this
        const stopWatchingScope = this.$parentScope.$watch(`customViews`, () => {
            if (
                Object.prototype.hasOwnProperty.call(that.$parentScope.customViews, that.uid) &&
                Object.prototype.hasOwnProperty.call(Stratus.Instances, that.uid)
            ) {
                // that.$scope = that.$parentScope.customViews[this.uid] // Angular is not allowing the scoped to be passed in this way
                that.$scope = Stratus.Instances[that.uid]
                // console.log('CustomView found scope for', this.uid, that.$scope)
                that.$scope.options = that.viewSpec.options
                that.$scope.view = that
                if (that.eventsWaiting) {
                    that.updateEventScope(that.eventsWaiting)
                }
                stopWatchingScope()
            }
        }, true)

        appendToElement(that.el, that.componentEl)
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
    destroy() {
        super.destroy()
        if (
            Object.prototype.hasOwnProperty.call(this, '$scope') &&
            Object.prototype.hasOwnProperty.call(this.$scope, '$destroy')
        ) {
            this.$scope.$destroy()
        }
        // TODO in the future, instead of creating new Views, could recreate the existing one
    }

    // noinspection JSUnusedGlobalSymbols
    // Runs when ever the View inits or the date range changes
    // Attempts tp update the display. Specifically, Update the list of events on the scope
    renderEvents(eventStore: EventStore, eventUiHash?: EventUiHash) {
        if (this.$scope) {
            const that: any = this
            this.updateEventScope(that.getEventsInRange(eventStore))
        } else {
            // If scope isn't ready yet, add the events to waiting
            this.eventsWaiting = this.getEventsInRange(eventStore)
        }
    }

    // Update the displayed events in the Stratus Component by sending it over
    updateEventScope(events: Array<EventApi>) {
        const that: any = this
        that.$scope.$applyAsync(() => {
            that.$scope.events.length = 0
            that.$scope.events.push(...events)
        })
    }

    // Get the current range of Events
    getEventsInRange(
        eventStore?: EventStore,
        eventUiBases?: EventUiHash
    ) {
        const that: any = this
        eventStore = eventStore || this.props.eventStore
        eventUiBases = eventUiBases || this.props.eventUiBases

        const events: any = []
        const sliceEventObjects = sliceEventStore(eventStore, eventUiBases, that.props.dateProfile.activeRange, that.nextDayThreshold)
        if (!Object.prototype.hasOwnProperty.call(sliceEventObjects, 'fg') || !_.isArray(sliceEventObjects.fg)) {
            return events
        }
        sliceEventObjects.fg.forEach((eventRaw: any) => {
            const event: EventApi & any = new EventApi(that.$parentScope.calendar, eventRaw.def, eventRaw.instance)
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

        // console.log('events', events)
        return events
    }
}

export default createPlugin({
    defaultView: 'custom',
    views: {
        custom: {
            class: CustomView,
            template: 'default',
            duration: {month: 1}
        },
        customArticle: {
            type: 'custom',
            template: 'article'
        },
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
