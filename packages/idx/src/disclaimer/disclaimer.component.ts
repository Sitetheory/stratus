// IdxDisclaimer Component
// @stratusjs/idx/disclaimer/disclaimer.component
// <stratus-idx-disclaimer>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
// import numeral from 'numeral'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
// import {cookie} from '@stratusjs/core/environment'
import {isJSON} from '@stratusjs/core/misc'
import {IdxComponentScope, IdxEmitter, IdxService, MLSService} from '@stratusjs/idx/idx'
import moment from 'moment'

// Component Preload

// Environment
// const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
// const moduleName = 'disclaimer'
const componentName = 'disclaimer'
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type IdxDisclaimerScope = IdxComponentScope & {
    initialized: boolean

    service?: number | number[]
    type: 'Property' | 'Media' | 'Member' | 'Office' | 'OpenHouse'
    modificationTimestamp?: Date

    disclaimerString: string
    disclaimerHTML: any

    getMLSDisclaimer(html?: boolean): string | any
    getMLSVariables(reset?: boolean): MLSService[]
    processMLSDisclaimer(reset?: boolean): void
}

Stratus.Components.IdxDisclaimer = {
    bindings: {
        elementId: '@',
        service: '@',
        type: '@',
        modificationTimestamp: '=',
    },
    controller(
        // $anchorScroll: angular.IAnchorScrollService,
        $attrs: angular.IAttributes,
        $sce: angular.ISCEService,
        $scope: IdxDisclaimerScope,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.service = $attrs.service && isJSON($attrs.service) ? JSON.parse($attrs.service) : []
        $scope.type = $attrs.type ? JSON.parse($attrs.type) : 'Property'
        // FIXME if type !'Property' | 'Media' | 'Member' | 'Office' | 'OpenHouse', revert to Property

        $ctrl.$onInit = () => {
            $scope.Idx = Idx
            $scope.initialized = false

            $scope.disclaimerString = 'Loading...'
            $scope.disclaimerHTML = $sce.trustAsHtml(`<span>${$scope.disclaimerString}</span>`)

            // Register this Map with the Property service
            Idx.registerDisclaimerInstance($scope.elementId, $scope)

            Idx.on('Idx', 'sessionInit', () => {
                if (!$scope.initialized) {
                    console.log('session init')
                    $scope.processMLSDisclaimer()
                    $scope.initialized = true
                }
            })
            Idx.on('Idx', 'sessionRefresh', () => {
                console.log('session refreshed')
                $scope.processMLSDisclaimer(true)
                $scope.initialized = true
            })

            Idx.emit('init', $scope)
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            if (!$ctrl.mlsVariables || reset) {
                $ctrl.mlsVariables = []
                let mlsServicesRequested: number[] = null
                // Ensure we are only requesting the services we are using
                if (
                    $scope.service &&
                    (
                        _.isNumber($scope.service) ||
                        !_.isEmpty($scope.service)
                    )
                ) {
                    if (!_.isArray($scope.service)) {
                        $scope.service = [$scope.service]
                    }
                    mlsServicesRequested = $scope.service
                }
                Idx.getMLSVariables(mlsServicesRequested).forEach((service: MLSService) => {
                    $ctrl.mlsVariables[service.id] = service
                })
            }
            return $ctrl.mlsVariables
        }

        /**
         * Process an MLS' required legal disclaimer to later display
         * @param reset - set true to force reset
         * TODO Idx needs to supply MLSVariables interface
         */
        $scope.processMLSDisclaimer = (reset?: boolean): void => {
            const services: MLSService[] = $scope.getMLSVariables(reset)
            let disclaimer = ''
            services.forEach(service => {
                if (disclaimer) {
                    disclaimer += '<br>'
                }
                if (service.fetchTime[$scope.type]) {
                    disclaimer += `Last checked ${moment(service.fetchTime[$scope.type]).format('M/D/YY h:mm a')}. `
                } else if (Idx.getLastSessionTime()) {
                    disclaimer += `Last checked ${moment(Idx.getLastSessionTime()).format('M/D/YY')}. `
                }
                if ($ctrl.modificationTimestamp) {
                    disclaimer += `Listing last updated ${moment($ctrl.modificationTimestamp).format('M/D/YY h:mm a')}. `
                } else {
                    console.log('no mod time!')
                }
                disclaimer += service.disclaimer
            })

            $scope.disclaimerString = disclaimer
            $scope.disclaimerHTML = $sce.trustAsHtml(disclaimer)
        }

        /**
         * Display an MLS' required legal disclaimer
         * @param html - if output should be HTML safe
         */
        $scope.getMLSDisclaimer = (html?: boolean): string|any => html ? $scope.disclaimerHTML : $scope.disclaimerString

        $scope.on = (emitterName: string, callback: IdxEmitter): void => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }
    },
    template: '<div id="{{::elementId}}" data-ng-cloak data-ng-show="disclaimerHTML" data-ng-bind-html="disclaimerHTML" aria-label="Disclaimers"></div>'
}
