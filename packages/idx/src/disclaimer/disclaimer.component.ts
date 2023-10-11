/**
 * @file IdxDisclaimer Component @stratusjs/idx/disclaimer/disclaimer.component
 * @example <stratus-idx-disclaimer>
 */

// Compile Stylesheets
import './disclaimer.component.less'

// Runtime
import {isArray, isEmpty, isNumber, isString, isUndefined} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, ISCEService} from 'angular'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'
import {IdxComponentScope, IdxEmitter, IdxService, MLSService} from '@stratusjs/idx/idx'
import moment from 'moment'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'disclaimer'
const componentName = 'disclaimer'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
const localDistStyle = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/dist/${packageName}.bundle.min.css`

export interface CleanService extends MLSService {
    disclaimerString?: string
    disclaimerHTML?: any
}

export type IdxDisclaimerScope = IdxComponentScope & {
    initialized: boolean
    onWatchers: (() => void)[]

    service?: number | number[]
    type: 'Property' | 'Media' | 'Member' | 'Office' | 'OpenHouse'
    modificationTimestamp?: Date
    hideOnDuplicate?: boolean

    alwaysShow: boolean
    hideMe: boolean
    idxService: CleanService[]

    getMLSVariables(reset?: boolean): MLSService[]
    processMLSDisclaimer(reset?: boolean): void
}

Stratus.Components.IdxDisclaimer = {
    bindings: {
        elementId: '@',
        initNow: '=',
        service: '@',
        type: '@',
        hideOnDuplicate: '@',
        modificationTimestamp: '=',
    },
    controller(
        $attrs: IAttributes,
        $sce: ISCEService,
        $scope: IdxDisclaimerScope,
        Idx: IdxService,
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.initialized = false
        $scope.onWatchers = []
        $scope.service = $attrs.service && isJSON($attrs.service) ? JSON.parse($attrs.service) : []
        $scope.idxService = []
        $scope.type = $attrs.type ? JSON.parse($attrs.type) : 'Property'
        // FIXME if type !'Property' | 'Media' | 'Member' | 'Office' | 'OpenHouse', revert to Property
        // FIXME can later use this for last time checks
        $scope.alwaysShow = typeof $attrs.hideOnDuplicate === 'undefined'
        // Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`).then()
        Stratus.Internals.CssLoader(localDistStyle).then()

        let mlsVariables: {[serviceId: number]: MLSService}

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        const init = async () => {
            // console.log('disclaimer running init')
            // Register this Disclaimer with the IDX service
            Idx.registerDisclaimerInstance($scope.elementId, $scope)

            Idx.on('Idx', 'sessionInit', () => {
                // console.log('disclaimer sessionInit hit')
                if (!$scope.initialized) {
                    // console.log('disclaimer was not initialized yet, doing processMLSDisclaimer()')
                    $scope.processMLSDisclaimer()
                    $scope.initialized = true
                }
                // This only gets called once
                Idx.on('Idx', 'fetchTimeUpdate', (_scope: null, _serviceId, _modelName, _fetchTime) => {
                    // console.log('disclaimer fetchTimeUpdate hit, doing processMLSDisclaimer()')
                    $scope.processMLSDisclaimer(true)
                    // console.log('Fetch Times have updated!!!', serviceId, modelName, fetchTime)
                })
            })
            Idx.on('Idx', 'sessionRefresh', () => {
                // console.log('disclaimer session refreshed, doing processMLSDisclaimer()')
                $scope.processMLSDisclaimer(true)
                $scope.initialized = true
            })

            $scope.$watch('$ctrl.hideOnDuplicate', (hideOnDuplicate) => {
                // console.log('hideOnDuplicate raw is', hideOnDuplicate, '$attrs.hideOnDuplicate is', $attrs.hideOnDuplicate)
                if (typeof $attrs.hideOnDuplicate !== 'undefined') {
                    $scope.alwaysShow = false
                    if (hideOnDuplicate !== true) {
                        // Check if if a raw value
                        $scope.hideOnDuplicate =
                            $attrs.hideOnDuplicate ? (isString($attrs.hideOnDuplicate) && isJSON($attrs.hideOnDuplicate) ?
                                JSON.parse($attrs.hideOnDuplicate) : false) : false
                    } else {
                        $scope.hideOnDuplicate = hideOnDuplicate || false
                    }

                    $scope.$applyAsync(() => {
                        $scope.hideMe = false
                        if ($scope.hideOnDuplicate) {
                            // console.log('hideOnDuplicate detects true looking for main disclaimer')
                            // check if there is a duplicate disclaimer showing
                            const instances = Idx.getDisclaimerInstance()
                            Object.keys(instances).forEach((elementId: string) => {
                                if (
                                    elementId !== $scope.elementId && // don't let it be yourself
                                    instances[elementId].alwaysShow === true && // We need to ensure this always stays here
                                    (
                                        instances[elementId].modificationTimestamp === null || // This needs to be a Global, not single
                                        isUndefined(instances[elementId].modificationTimestamp)
                                    )
                                ) {
                                    // console.log($scope.elementId, 'found a master disclaimer at', elementId)
                                    $scope.hideMe = true
                                } /*else {
                                    console.log(elementId, 'is bad', instances[elementId])
                                    if (elementId === $scope.elementId) {
                                        console.log('elementId === $scope.elementId')
                                    }
                                    if (instances[elementId].alwaysShow !== true) {
                                        console.log('instances[elementId].alwaysShow !== true')
                                    }
                                    if (instances[elementId].modificationTimestamp !== null) {
                                        console.log('instances[elementId].modificationTimestamp !== null')
                                    }
                                }*/
                            })
                        }
                    })
                }
            })

            Idx.emit('init', $scope)
        }

        this.$onInit = () => {
            $scope.Idx = Idx
            // console.log('disclaimer running $onInit', this)

            let initNow = true
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                // TODO: This needs better logic to determine what is acceptably initialized
                initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
                // console.log('disclaimer initNow currently', clone(initNow))
            }

            const stopWatchingService = $scope.$watch('$ctrl.service', (service: unknown) => {
                $scope.service = isString(service) && isJSON(service) ? JSON.parse(service) : []
                // console.log('disclaimer saw service change is now', clone($scope.service))
                $scope.processMLSDisclaimer(true)
                $scope.$applyAsync()
                stopWatchingService()
            })

            if (initNow) {
                // console.log('disclaimer forcing init on boot')
                init().then()
                return
            }

            const stopWatchingInitNow = $scope.$watch('$ctrl.initNow', (initNowCtrl: boolean) => {
                if (initNowCtrl !== true) {
                    return
                }
                // console.log('disclaimer saw initNow become true', clone(initNowCtrl))
                if (!$scope.initialized) {
                    // console.log('disclaimer doing init after boot', this)
                    init().then()
                }
                stopWatchingInitNow()
            })
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            if (!mlsVariables || Object.keys(mlsVariables).length === 0 || reset) {
                mlsVariables = []
                let mlsServicesRequested: number[] = null
                // Ensure we are only requesting the services we are using
                if (
                    $scope.service &&
                    (
                        isNumber($scope.service) ||
                        !isEmpty($scope.service)
                    )
                ) {
                    if (!isArray($scope.service)) {
                        $scope.service = [$scope.service]
                    }
                    mlsServicesRequested = $scope.service
                }
                Idx.getMLSVariables(mlsServicesRequested).forEach((service: MLSService) => {
                    mlsVariables[service.id] = service
                })
            }
            return Object.values(mlsVariables)
        }

        /**
         * Process an MLS' required legal disclaimer to later display
         * @param reset - set true to force reset
         * TODO Idx needs to supply MLSVariables interface
         */
        $scope.processMLSDisclaimer = (reset?: boolean): void => {
            // console.log('disclaimer processMLSDisclaimer running')
            const services: MLSService[] = $scope.getMLSVariables(reset)
            // console.log('disclaimer got these services', clone(services))
            $scope.idxService = []
            let disclaimerComplete = ''
            services.forEach(service => {
                // console.log('disclaimer processing', clone(service))
                let singleDisclaimer = ''

                if (service.fetchTime[$scope.type]) {
                    singleDisclaimer += `Last checked ${moment(service.fetchTime[$scope.type]).format('M/D/YY h:mm a')}. `
                } else if (Idx.getLastSessionTime()) {
                    singleDisclaimer += `Last checked ${moment(Idx.getLastSessionTime()).format('M/D/YY')}. `
                }
                if ($scope.modificationTimestamp) {
                    singleDisclaimer += `Listing last updated ${moment($scope.modificationTimestamp).format('M/D/YY h:mm a')}. `
                } /*else {
                    console.log('no mod time!')
                }*/
                singleDisclaimer += service.disclaimer
                // disclaimerComplete += service.disclaimer
                if (disclaimerComplete) {
                    disclaimerComplete += '<br>'
                }
                disclaimerComplete += singleDisclaimer // TODO removing soon
                // TODO above was old process. New process below

                const cleanService: CleanService = service
                cleanService.disclaimerString = singleDisclaimer
                cleanService.disclaimerHTML = $sce.trustAsHtml(singleDisclaimer)
                $scope.idxService.push(cleanService)
                // console.log('disclaimer got this cleanService', clone(cleanService))
            })
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
            // TODO need to remove all on events/watchers. remove isn't being hit
            // console.log('This Disclaimer widget is getting killed')
            $scope.onWatchers.forEach(killOnWatcher => killOnWatcher())
        }
    },
    // data-ng-repeat="service in idxService"
    template: '<div id="{{::elementId}}" class="disclaimer-outer-container" data-ng-cloak data-ng-show="idxService.length > 0 && !hideMe" role="contentinfo" aria-label="IDX Disclaimers">' +
        '<div class="disclaimer-container" data-ng-repeat="service in idxService" data-ng-bind-html="service.disclaimerHTML"></div>' +
        '<div class="mls-logos-section" aria-label="MLS Logos">' +
        '<div class="mls-logos-container" data-ng-repeat="service in idxService">' +
        '<img class="mls-service-logo" alt="{{service.name}} MLS Brand Logo" data-ng-show="service.logo.default"  aria-label="{{service.name}}" data-ng-src="{{service.logo.medium || service.logo.default}}">' +
        '<img class="mls-service-logo" alt="{{service.name}} MLS supplementary Logo" data-ng-if="service.mandatoryLogo && service.mandatoryLogo.length > 0" data-ng-repeat="mandatoryLogo in service.mandatoryLogo"  aria-label="{{service.name}} supplementary" data-ng-src="{{mandatoryLogo}}">' +
        '</div>' +
        '</div>' +
        '</div>'
}
