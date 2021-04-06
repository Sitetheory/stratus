// IdxMap Component
// @stratusjs/idx/map/map.component
// <stratus-idx-map>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
// import numeral from 'numeral'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {isJSON} from '@stratusjs/core/misc'
import {IdxComponentScope, IdxEmitter, IdxListScope, IdxService, Member, Property} from '@stratusjs/idx/idx'
import {MapComponent, MarkerSettings} from '@stratusjs/map/map.component'
import {numeralFormat} from '@stratusjs/angularjs-extras/filters/numeral'

// Component Preload
// tslint:disable-next-line:no-duplicate-imports
import '@stratusjs/map/map.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'map'
const componentName = 'map'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type IdxMapScope = IdxComponentScope & {
    listId: string
    initialized: boolean
    mapInitialized: boolean
    listInitialized: boolean
    mapMarkers: MarkerSettings[]
    map: MapComponent
    list: IdxListScope

    instancePath: string
    googleMapsKey: string
    mapType: string
    zoom: number
    zoomControl: boolean
    scrollwheel: boolean
    width?: string
    height?: string

    markerClickScroll: boolean
    markerClickHighlight: boolean
    markerPrice: boolean
    markerIcon: string
    markerIconHover: string
    markerIconLabelOriginX?: number
    markerIconLabelOriginY?: number

    getGoogleMapsKey(): string | null
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
        zoomControl: '@',
        scrollwheel: '@',
        height: '@',
        width: '@',
        markerClickScroll: '@',
        markerClickHighlight: '@',
        markerPrice: '@',
        markerIcon: '@',
        markerIconHover: '@',
        markerIconLabelOriginX: '@',
        markerIconLabelOriginY: '@',
        fullHeight: '@',
        fullHeightMinusElements: '@',
        referenceParent: '@',
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
            $scope.initialized = false
            $scope.mapInitialized = false
            $scope.listInitialized = false
            $scope.googleMapsKey = $attrs.googleMapsKey || null
            $scope.mapMarkers = []
            $scope.mapType = $attrs.mapType || 'roadmap'
            $scope.zoom = $attrs.zoom || 18
            $scope.zoomControl = $attrs.zoomControl || true
            $scope.scrollwheel = $attrs.scrollwheel || false
            $scope.height = $attrs.height || null // '500px'
            $scope.width = $attrs.width || null // '100%'
            $scope.markerClickScroll = $attrs.markerClickScroll && isJSON($attrs.markerClickScroll) ?
                JSON.parse($attrs.markerClickScroll) : false
            $scope.markerClickHighlight = $attrs.markerClickHighlight && isJSON($attrs.markerClickHighlight) ?
                JSON.parse($attrs.markerClickHighlight) : false
            $scope.markerPrice = $attrs.markerPrice && isJSON($attrs.markerPrice) ?
                JSON.parse($attrs.markerPrice) : false
            $scope.markerIcon = $attrs.markerIcon || ($scope.markerPrice ? `${localDir}images/map-marker-black.png` : null)
            $scope.markerIconLabelOriginX = $attrs.markerIconLabelOriginX || ($scope.markerPrice ? 33 : null)
            $scope.markerIconLabelOriginY = $attrs.markerIconLabelOriginX || ($scope.markerPrice ? 13 : null)
            $scope.markerIconHover = $attrs.markerIconHover || null
            $scope.fullHeight = $attrs.fullHeight || null
            $scope.fullHeightMinusElements = $attrs.fullHeightMinusElements || null
            $scope.referenceParent = $attrs.referenceParent || 'document'

            // Register this Map with the Property service
            Idx.registerMapInstance($scope.elementId, $scope)

            if ($scope.listId) {
                Idx.devLog($scope.elementId, 'is watching for map to update from', $scope.listId)
                Idx.on($scope.listId, 'init', (source: IdxListScope) => {
                    $scope.list = source
                    $scope.listInitialized = true
                    // $scope.initialized = true
                    $ctrl.prepareMapMarkers(source)
                    $scope.mapUpdate()
                })
                Idx.on($scope.listId, 'searched', (source: IdxListScope) => {
                    // page changing and searched triggers 'searched'
                    $ctrl.prepareMapMarkers(source)
                    $scope.mapUpdate()
                })
            }
            if ($scope.googleMapsKey) {
                $scope.initialized = true
            } else {
                Idx.on('Idx', 'sessionInit', () => {
                    console.log('session init')
                    $scope.initialized = true
                })
            }

            Idx.emit('init', $scope)
        }

        $ctrl.prepareMapMarkers = (source: IdxListScope<Member | Property>): void => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const markers: MarkerSettings[] = []
            let zIndexCounter = 100
            source.getPageModels().forEach((model) => {
                // console.log('looping listing', listing)
                if (
                    Object.prototype.hasOwnProperty.call(model, 'Latitude') &&
                    Object.prototype.hasOwnProperty.call(model, 'Longitude')
                ) {
                    const address = Idx.getStreetAddress(model as Property) // TODO handle Member?
                    const marker: MarkerSettings = {
                        position: {lat: model.Latitude, lng: model.Longitude},
                        title: address,
                        options: {
                            animation: 2 // DROP: 2 | BOUNCE: 1
                        },
                        // Example icon
                        // https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=A
                        // &psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1.1
                        // https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&color=ff333333&scale=1.1
                        // https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png&psize=16
                        // &font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1
                        // https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png?scale=1
                        // https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png
                        click: {
                            action: 'function',
                            // function: (marker: any, markerSetting: any) => {
                            function: () => {
                                if ($scope.list) {
                                    if ($scope.markerClickScroll) {
                                        // Scroll to Model
                                        $scope.list.scrollToModel(model)
                                    }
                                    if ($scope.markerClickHighlight) {
                                        // Highlight the model for 6 seconds
                                        $scope.list.highlightModel(model, 6000)
                                    }
                                }
                            }
                        }
                    }
                    // See https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
                    // for adding font details
                    if (
                        $scope.markerPrice &&
                        (
                            Object.prototype.hasOwnProperty.call(model, 'ListPrice') ||
                            Object.prototype.hasOwnProperty.call(model, 'ClosePrice')
                        ) &&
                        (model.ClosePrice || model.ListPrice)
                    ) {
                        // FIXME the format will need to change depending on the number range.
                        // We'll want to only use '0.0a' when there is 5 charcters
                        // marker.label = $scope.getShortCurrency(model.ClosePrice || model.ListPrice)
                        marker.label = {
                            color: 'white',
                            // text: $scope.getShortCurrency(model.ClosePrice || model.ListPrice)
                            // providing format to reduce processing
                            text: numeralFormat(model.ClosePrice || model.ListPrice, 1, '$0[.]0a').toUpperCase()
                        }
                        // console.log('has price label of', marker.label)
                        marker.collisionBehavior = 'REQUIRED_AND_HIDES_OPTIONAL'
                        marker.zIndex = zIndexCounter--
                    }
                    markers.push(marker)
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
            $scope.$applyAsync(() => {
                $scope.mapInitialized = true
            })
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

        $scope.getGoogleMapsKey = (): string | null => {
            return $scope.googleMapsKey || Idx.getGoogleMapsKey()
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
