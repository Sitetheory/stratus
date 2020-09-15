// IdxPropertyDetailsSubSection Component
// @stratusjs/idx/property/details-sub-section.component
// <stratus-idx-property-details-sub-section>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {IdxComponentScope, IdxEmitter, IdxListScope, IdxService, Member, Property} from '@stratusjs/idx/idx'
import {MapComponent, MarkerSettings} from '@stratusjs/map/map.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
// const moduleName = 'property'
const componentName = 'map'
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type IdxMapScope = IdxComponentScope & {
    listId: string
    listInitialized: boolean
    mapMarkers: MarkerSettings[]
    map: MapComponent
    list: IdxListScope

    instancePath: string
    googleMapsKey: string
    mapType: string
    zoom: number

    mapInitialize(map: MapComponent): void
    mapUpdate(): void
}

Stratus.Components.IdxMap = {
    bindings: {
        instancePath: '@',
        googleMapsKey: '@',
        listId: '@',
        mapType: '@',
        template: '@',
        zoom: '@',
    },
    controller(
        // $anchorScroll: angular.IAnchorScrollService,
        $attrs: angular.IAttributes,
        $scope: IdxMapScope,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.instancePath = `Stratus.Instances.${$scope.elementId}`

        $ctrl.$onInit = () => {
            $scope.Idx = Idx
            $scope.listId = $attrs.listId || null
            $scope.listInitialized = false
            $scope.googleMapsKey = $attrs.googleMapsKey || null
            $scope.mapType = $attrs.mapType || 'roadmap'
            $scope.zoom = $attrs.zoom || 18

            // Register this Map with the Property service
            Idx.registerMapInstance($scope.elementId, $scope)

            if ($scope.listId) {
                Idx.devLog($scope.elementId, 'is watching for map to update from', $scope.listId)
                Idx.on($scope.listId, 'init', (source: IdxListScope) => {
                    $scope.list = source
                    $ctrl.prepareMapMarkers(source)
                    $scope.mapUpdate()
                })
                Idx.on($scope.listId, 'pageChanged', (source: IdxListScope, pageNumber: number) => {
                    $ctrl.prepareMapMarkers(source)
                    $scope.mapUpdate()
                })
            }
            Idx.emit('init', $scope)
        }

        $ctrl.prepareMapMarkers = (source: IdxListScope<Member | Property>): void => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const markers: MarkerSettings[] = []
            source.getPageModels().forEach((model) => {
                // console.log('looping listing', listing)
                if (
                    Object.prototype.hasOwnProperty.call(model, 'Latitude') &&
                    Object.prototype.hasOwnProperty.call(model, 'Longitude')
                ) {
                    const address = Idx.getStreetAddress(model as Property) // TODO handle Member?
                    markers.push({
                        position: {lat: model.Latitude, lng: model.Longitude},
                        title: address,
                        options: {
                            animation: 2 // DROP: 2 | BOUNCE: 1
                        },
                        click: {
                            action: 'function',
                            function: (marker: any, markerSetting: any) => {
                                // TODO need option to enable scrolling
                                if ($scope.list) {
                                    // Scroll to Model
                                    $scope.list.scrollToModel(model)
                                }
                                // $scope.displayPropertyDetails(listing)
                            }
                        }
                    })
                }
            })

            // console.log('markers', markers)
            $scope.mapMarkers = markers
        }

        /*$scope.stopWatchingModel = $scope.$watch('$ctrl.ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                $scope.stopWatchingModel()
            }
        })*/

        $scope.mapInitialize = (map: MapComponent) => {
            // console.log('idx map is running the map!!!!', map)
            $scope.map = map
            $scope.mapUpdate()
        }

        /**
         * Refresh the Map with the latest markers
         */
        $scope.mapUpdate = () => {
            if ($scope.map) {
                $scope.map.removeMarkers()
                $scope.mapMarkers.forEach((marker) => {
                    $scope.map.addMarker(marker)
                })
                $scope.map.fitMarkerBounds()
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter): void => Idx.on($scope.elementId, emitterName, callback)

        $scope.getUid = (): string => $scope.elementId

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
