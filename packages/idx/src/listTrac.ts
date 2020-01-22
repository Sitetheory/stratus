// ListTrac Service
// @stratusjs/idx/listTrac

// Runtime
// import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
import {DOMComplete} from '@stratusjs/core/dom'

// Services
import '@stratusjs/angularjs/services/model' // Needed as $provider
import '@stratusjs/angularjs/services/collection'

Stratus.Services.ListTrac = [
    '$provide',
    ($provide: any) => {
        $provide.factory('ListTrac', (
            $injector: angular.auto.IInjectorService,
            $http: angular.IHttpService,
            $q: angular.IQService,
            $window: angular.IWindowService,
            ) => {
                const eventQueue: Array<() => void> = []
                let listTracLoaded = false
                let listTracPending = false
                let listTracAccountId = ''
                let LT: any
                let eventTypes: {
                    [key: string]: number
                } = {}

                async function loadListTrac() {
                    if (!listTracAccountId) {
                        console.warn('ListTrac Account Id not provided, will not load')
                        return
                    }
                    // Only attempt to load ListTrac if it's not already loaded or currently attempting to load
                    if (!listTracPending && !listTracLoaded) {
                        try {
                            listTracPending = true
                            await DOMComplete()
                            // console.log('importing ListTrac')
                            // Inject the javascript file into the HEAD to load
                            const jsFile: HTMLScriptElement = document.createElement('script')
                            jsFile.type = 'application/javascript'
                            jsFile.async = true
                            jsFile.src = `https://code.listtrac.com/monitor.ashx?nonjq=1&acct=${listTracAccountId}`
                            jsFile.onload = () => loadedListTrac()
                            Stratus.Select('head').append(jsFile)

                            // TODO make a timeout to check if it still doesn't load after some to time manually check..?
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }

                async function loadedListTrac() {
                    if (
                        Object.prototype.hasOwnProperty.call($window, '_LT') &&
                        typeof ($window._LT) !== 'undefined' &&
                        $window._LT !== null
                    ) {
                        eventTypes = $window._eventType
                        LT = $window._LT
                        listTracLoaded = true
                        listTracPending = false
                        processEventQueue()
                    } else {
                        listTracLoaded = false
                        console.warn('ListTrac failed to load')
                    }
                    listTracPending = false
                }

                function setAccountId(accountId: string): void {
                    listTracAccountId = accountId
                    // console.log('Set account id to', listTracAccountId)
                }

                async function track(eventName: string, mlsId: string, postalCode: number, agentId: string): Promise<void> {
                    // console.log('setting up Event', eventName)
                    await loadListTrac()
                    const promiseFunction = () => {
                        LT._trackEvent(
                            eventTypes[eventName],
                            mlsId,
                            postalCode,
                            agentId
                        )

                        return
                    }
                    addEventToQueue(promiseFunction)
                }

                function addEventToQueue(event: () => void) {
                    // console.log('addEventToQueue added')
                    eventQueue.push(event)
                    if (listTracLoaded) {
                        processEventQueue()
                    }
                }

                function processEventQueue() {
                    // console.log('processEventQueue running')
                    if (!listTracLoaded) {
                        console.warn('Cannot processEventQueue as ListTrac not loaded')
                        return
                    }
                    while (eventQueue.length > 0) {
                        // $q(eventQueue.shift()).then(() => console.log('Promise done'))
                        $q(eventQueue.shift())
                    }
                }

                return {
                    setAccountId,
                    track
                }
            }
        )
    }
]
