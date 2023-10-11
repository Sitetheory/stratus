/**
 * @file IdxMap Component @stratusjs/idx/map/map.component
 * @example <stratus-idx-map>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Map-Widget
 */

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes} from 'angular'
import {cookie} from '@stratusjs/core/environment'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {IdxComponentScope, IdxEmitter, IdxListScope, IdxService, Member, Property} from '@stratusjs/idx/idx'
import {MapComponent, MarkerSettings} from '@stratusjs/map/map.component'
import {numeralFormat} from '@stratusjs/angularjs-extras/filters/numeral'

// Stratus Preload
import '@stratusjs/angular' // sa-map

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'map'
const componentName = 'map'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxMapScope = IdxComponentScope & {
    listId: string
    initialized: boolean
    mapInitialized: boolean
    listInitialized: boolean
    mapMarkers: MarkerSettings[]
    map: MapComponent
    list: IdxListScope

    instancePath: string
    instanceFullPath: string
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
    mapInitialize(map: MapComponent): Promise<void>
    mapUpdate(): Promise<void>
}

Stratus.Components.IdxMap = {
    /** @see https://github.com/Sitetheory/stratus/wiki/Idx-Package-Usage#Map */
    bindings: {
        /**
         * Type: string
         * Id of Idx List widget to attach to and render the available collection from. The counterpart List widget's
         * `element-id` must be defined and the same as this `list-id` (See Property List). Multiple Map widgets may
         * attach to the same List widget but, this Map widget may only display a single collection at this time.
         */
        listId: '@',
        /**
         * Type: string
         * Client will need to provide a Google Maps Api key with Javascript access. Without a provided key, the map
         * will default into 'Development Mode' and be known to the user that it's just for testing right now.
         */
        googleMapsKey: '@',
        /**
         * Type: string
         * Set type of tiles displayed on the Map.
         * Options: 'roadmap', 'hybrid', 'satellite', 'terrain'
         */
        mapType: '@',
        /**
         * Type: string
         * Set a height for the displayed map. Suggested to pixel sizes such as `500px`.
         * If not set, map relies on default css auto loaded.
         */
        height: '@',
        /**
         * Type: string
         * Set a width for the displayed map. Suggested to sizes such as `100%`.
         * If not set, map relies on default css auto loaded.
         */
        width: '@',
        /**
         * Type: boolean
         * Default: false
         * Set the map to retain 100% height of parent element (window/document by default)
         */
        fullHeight: '@',
        /**
         * Type: string[]
         * Set the map to retain 100% height of parent element (window/document by default). Also removes from itself
         * the height of specified surrounding elements to maintain a proper. E.g.: `["#header-container",]` to have a
         * 100% page height map minus the height of a header and toolbar.
         */
        fullHeightMinusElements: '@',
        /**
         * Type: string
         * Default: 'document'
         * For use with automatic sizing, what element should be referred to when process the full-height of a page.
         * Possible options being `document`, `window`, and any document query selector, e.g. `#body-container`
         */
        referenceParent: '@',
        /**
         * Type: number
         * Default: 18
         * Set the zoom level that the Map starts at.
         */
        zoom: '@',
        /**
         * Type: boolean
         * Default: true
         * Set to display the Zoom controls on the map.
         */
        zoomControl: '@',
        /**
         * Type: boolean
         * Default: false
         * Set if the user can adjust the Map zoom level via the mouse scrollwheel.
         */
        scrollwheel: '@',
        /**
         * Type: boolean
         * Default: false
         * Upon clicking a marker, attempt to scroll to the listing on the page.
         */
        markerClickScroll: '@',
        /**
         * Type: boolean
         * Default: false
         * Upon clicking a marker, attempt to highlight the lighting on the page momentarily.
         */
        markerClickHighlight: '@',
        /**
         * Type: boolean
         * Default: false
         * Enables Property Prices to be shown on the page atop markers.
         */
        markerPrice: '@',
        /**
         * Type: string
         * Set a default marker icon, providing a url path to the image.
         */
        markerIcon: '@',
        /**
         * Type: string
         * Set a default marker icon on mouse hover-over, providing a url path to the image. By default there is none.
         * FIXME This is currently buggy if the mouse is moving too fast.
         */
        markerIconHover: '@',
        /**
         * Type: number
         * When supplying a custom icon with a label, sets a position of position of the text, starting left on the x axis
         */
        markerIconLabelOriginX: '@',
        /**
         * Type: number
         * When supplying a custom icon with a label, sets a position of position of the text, starting top on the y axis
         */
        markerIconLabelOriginY: '@',
        /**
         * Type: string
         * Default: 'map'
         * The file name in which is loaded for the view of the widget. The name will automatically be appended with
         * '.component.min.html'. The default is 'map.component.html' / 'map'.
         * TODO: Will need to allow setting a custom path of views outside the library directory.
         */
        template: '@',
    },
    controller(
        // $anchorScroll: angular.IAnchorScrollService,
        $attrs: IAttributes,
        $scope: IdxMapScope,
        Idx: IdxService,
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.instancePath = $scope.elementId
        $scope.instanceFullPath = `Stratus.Instances.${$scope.instancePath}`

        this.$onInit = () => {
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
                Idx.on($scope.listId, 'init', (source: IdxListScope<Member | Property>) => {
                    $scope.list = source
                    $scope.listInitialized = true
                    // $scope.initialized = true
                    prepareMapMarkers(source)
                    $scope.mapUpdate().then()
                })
                Idx.on($scope.listId, 'searched', (source: IdxListScope<Member | Property>) => {
                    // page changing and searched triggers 'searched'
                    prepareMapMarkers(source)
                    $scope.mapUpdate().then()
                })
            }
            if ($scope.googleMapsKey) {
                $scope.initialized = true
            } else {
                Idx.on('Idx', 'sessionInit', () => {
                    Idx.devLog('map received session init')
                    $scope.initialized = true
                })
            }

            Idx.emit('init', $scope)
        }

        const prepareMapMarkers = (source: IdxListScope<Member | Property>): void => {
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

        /*$scope.stopWatchingModel = $scope.$watch('ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                $scope.stopWatchingModel()
            }
        })*/

        $scope.mapInitialize = async (map: MapComponent) => {
            // console.log('idx map is running the map!!!!', map)
            $scope.map = map
            $scope.$applyAsync(() => {
                Idx.devLog('Map initialized', $scope.map)
                $scope.mapInitialized = true
            })
            await $scope.mapUpdate()
        }

        /**
         * Refresh the Map with the latest markers
         */
        $scope.mapUpdate = async () => {
            if ($scope.map) {
                $scope.map.removeMarkers()
                await $scope.mapMarkers.reduce((_unused: any, marker) => {
                    $scope.map.addMarker(marker)
                }, undefined)
                // Also sleep for 0.5 seconds just to ensure everything is loaded in
                await new Promise(r => setTimeout(r, 500))

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
    templateUrl: ($attrs: IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
