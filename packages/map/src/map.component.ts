// See https://github.com/angular/components/tree/master/src/google-maps#readme

// Angular Core
import {
    AfterViewInit,
    // ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    Input,
    KeyValueDiffers, KeyValueDiffer, KeyValueChanges,
    OnInit,
    ViewChild,
} from '@angular/core'

// External
import {DomSanitizer} from '@angular/platform-browser'
import {keys} from 'ts-transformer-keys'

// External Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
// import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps'
import _ from 'lodash'

// Components
import {
    RootComponent
} from '@stratusjs/angular/core/root.component'

// Local Setup
const packageName = 'map'
const systemDir = `@stratusjs/${packageName}`
const localDir = `/assets/1/0/bundles/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`
const moduleName = 'map'

// Static Variables
const devGoogleMapsKey = 'AIzaSyBAyMH-A99yD5fHQPz7uzqk8glNJYGEqus' // Public dev key as placeholder


export interface MarkerSettingsClick {
    action: 'open' | 'function' | ''
    content?: string
    function?: (marker: google.maps.Marker, options: MarkerSettings) => any
}

export interface MarkerSettings {
    position: google.maps.LatLngLiteral | google.maps.LatLng
    title?: string
    // Adding a Label when there is a shape does not look good
    label?: string | google.maps.MarkerLabel
    clickable?: boolean
    options?: google.maps.MarkerOptions

    // Custom option
    // content?: string
    click?: MarkerSettingsClick | ((marker: google.maps.Marker, options: MarkerSettings) => any)
}

/**
 * @title AutoComplete Selector with Drag&Drop Sorting
 */
@Component({
    // selector: 'sa-selector-component',
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}.component.html`
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}.component.css`
    // ],
    // changeDetection: ChangeDetectionStrategy.OnPush // Detect changes only once
})


export class MapComponent extends RootComponent implements OnInit, AfterViewInit, DoCheck { // implements OnInit, OnChanges

    @ViewChild('mapContainer', {static: false}) gMap: ElementRef
    map: google.maps.Map
    info: google.maps.InfoWindow
    // @ViewChild(GoogleMap, {static: false}) map: GoogleMap
    // @ViewChild(MapInfoWindow, {static: false}) markerWindow: MapInfoWindow
    // @ViewChild('gMap', { static: false }) gMap: GoogleMap

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // UI Flags
    initializing = false
    initialized = false
    styled = false

    // Watcher
    watcher: Watcher

    // Map Variables
    @Input() height = '500px'
    @Input() width = '100%'
    // TODO check if there is a global Key in stratus
    @Input() googleMapsKey = devGoogleMapsKey
    /**
     * If string, use as path from `window` to variable of MarkerSettings[]
     * Otherwise if object, use directly as MarkerSettings[]
     * TODO is string is json, process as google.maps.LatLngLiteral or google.maps.LatLngLiteral[]
     */
    @Input() markers: string | MarkerSettings[]
    // @Input() markers: string | google.maps.LatLngLiteral[] | MarkerSettings[] // Later allow just coords
    @Input() zoom = 18
    @Input() mapType = 'roadmap'  // 'roadmap' | 'hybrid' | 'satellite' | 'terrain'
    @Input() zoomControl = false
    @Input() scrollwheel = true
    @Input() disableDoubleClickZoom = false
    @Input() center: google.maps.LatLng | google.maps.LatLngLiteral = {lat: 37.4220656, lng: -122.0862784}
    options: google.maps.MapOptions = {
        mapTypeId: this.mapType,
        center: this.center,
        zoom: this.zoom,
        zoomControl: this.zoomControl,
        scrollwheel: this.scrollwheel,
        disableDoubleClickZoom: this.disableDoubleClickZoom,
    }
    protected storedMarkers: google.maps.Marker[] = []

    constructor(
        private Differ: KeyValueDiffers,
        private window: Window,
        private sanitizer: DomSanitizer,
        // private ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        /*Stratus.Internals.CssLoader(`${localDir}/${moduleName}.component.css`)
            .then(() => {
                this.styled = true
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = true
            })*/

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<MapComponent>())

        // Sanitize Numbers
        if (!_.isNumber(this.zoom)) {
            this.zoom = Number.parseInt(this.zoom, 10)
        }

        // Sanitize Booleans
        if (!_.isBoolean(this.scrollwheel)) {
            this.scrollwheel = (this.scrollwheel === 'true')
        }
        if (!_.isBoolean(this.disableDoubleClickZoom)) {
            this.disableDoubleClickZoom = (this.disableDoubleClickZoom === 'true')
        }

        // Ensure there is at least a Dev key
        if (_.isEmpty(this.googleMapsKey)) {
            this.googleMapsKey = devGoogleMapsKey
        }
        // Warn if website has not provided a Google Maps Api Key
        if (this.googleMapsKey === devGoogleMapsKey) {
            console.warn('Google Maps Api Key (data-google-maps-key) was not provided! Displaying in Development mode only.')
        }

        // Setup a watcher
        this.watcher = new Watcher(this.Differ)

        console.info(this.uid, 'constructed')
    }

    ngDoCheck() {
        this.watcher.checkWatchers()
    }

    /**
     * Loads when this component Inits
     * this.map is not available here yet
     */
    async ngOnInit() {
        this.initializing = true
        console.info(this.uid, 'Initing')
    }

    /** Loads when this.map renders */
    async ngAfterViewInit() {
        console.info('running ngAfterViewInit')

        try {
            await this.initGoogleMapsApi()
            this.map = new google.maps.Map(this.gMap.nativeElement, this.options)
            this.info = new google.maps.InfoWindow({
                maxWidth: 250
            })
            this.processProvidedMarkersPath()
            this.initialized = true
            console.info(this.uid, 'Inited')
        } catch (e) {
            console.error(this.uid, 'could not Init')
        }
        this.initializing = false
    }

    /**
     * Center and possibly zoom map on current Markers
     */
    public fitMarkerBounds() {
        if (this.storedMarkers.length === 1) {
            // If this is the only marker, center it
            // TODO Zoom....?
            this.centerAtPosition(this.storedMarkers[0].getPosition())
        } else if (this.storedMarkers.length > 1) {
            // This has multiple markers. Find the balance between all of them
            const bounds = this.getMarkerBounds()
            // this.centerAtPosition(bounds.getCenter())
            this.panToPosition(bounds.getCenter())
            this.fitBounds(bounds)
        }
    }

    /**
     * With currently input this.markers, create markers on the Map
     * @private
     */
    private processProvidedMarkersPath() {
        if (_.isString(this.markers)) {
            // console.info('the test var markers is string', this.markers)
            this.watcher.watch(this.window, this.markers, (newValue) => {
                // console.info(this.markers, 'variable changed', _.clone(newValue))
                if (_.isArray(newValue)) {
                    // We're just assuming that this is a MarkerSettings[] Need better way of checking?
                    this.removeMarkers()
                    newValue.forEach((mark: MarkerSettings) => {
                        this.addMarker(mark)
                    })
                    this.fitMarkerBounds()
                }
            })
        } else if (_.isArray(this.markers)) {
            // TODO need to verify its MarkSettings and not LatLng
            this.markers.forEach((mark: MarkerSettings) => {
                this.addMarker(mark)
            })
            this.fitMarkerBounds()
        } else {
            console.info('the test var something is.....something...', this.markers)
        }
    }

    private getMarkerBounds(): google.maps.LatLngBounds {
        const latLngBounds = new google.maps.LatLngBounds()

        this.storedMarkers.forEach((marker) => {
            // latLngBounds.extend(marker.position)
            latLngBounds.extend(marker.getPosition())
        })

        return latLngBounds
    }

    private fitBounds(latLngBounds: google.maps.LatLngBounds) {
        // TODO padding?
        // console.info('setting bounds to', latLngBounds)
        this.map.fitBounds(latLngBounds)
    }

    /**
     * Attempt Load in the Google Maps Api script
     * Required before any functions can be performed
     */
    private async initGoogleMapsApi() {
        console.log('Loading Google Maps Api')
        if (
            Object.prototype.hasOwnProperty.call(window, 'google') &&
            Object.prototype.hasOwnProperty.call(window.google, 'maps')
        ) {
            // Already loaded, don't try again
            return
        }

        try {
            // TODO check if google is already loaded first
            await Stratus.Internals.JsLoader(`https://maps.googleapis.com/maps/api/js?key=${this.googleMapsKey}`)
            console.log('Google Maps Api Loaded')
        } catch (e) {
            console.error('Google Maps Api could not be fetched, cannot continue')
            throw new Error('Google Maps Api could not be fetched, cannot continue')
        }

        if (
            !Object.prototype.hasOwnProperty.call(window, 'google') ||
            !Object.prototype.hasOwnProperty.call(window.google, 'maps')
        ) {
            console.error('Google Maps Api was not initialized, cannot continue')
            throw new Error('Google Maps Api was not initialized, cannot continue')
        }
    }

    /**
     * Get the Browsers current position via GPS or Internet hostname. Mobile will prove to be more accurate
     * Page user may disable this at will
     */
    public async getCurrentPosition(highAccuracy?: boolean): Promise<google.maps.LatLngLiteral> {
        return new Promise((resolve, reject) => {
            const options: {
                enableHighAccuracy?: boolean
            } = {}
            if (highAccuracy) {
                options.enableHighAccuracy = true
            }
            try {
                navigator.geolocation.getCurrentPosition(x => {
                        resolve({
                            lat: x.coords.latitude,
                            lng: x.coords.longitude
                        })
                    },
                    e => {
                        reject(e)
                    },
                    options
                )
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * Centers the Map at a specific coordinate
     */
    public centerAtPosition(position: google.maps.LatLngLiteral | google.maps.LatLng) {
        if (position instanceof google.maps.LatLng) { // toJSON
            position = position.toJSON()
        }
        this.map.setCenter(position)
    }

    public panToPosition(position: google.maps.LatLngLiteral | google.maps.LatLng) {
        if (position instanceof google.maps.LatLng) { // toJSON
            position = position.toJSON()
        }
        this.map.panTo(position)
    }

    public addMarker(marker: MarkerSettings | google.maps.Marker) {
        let realMarker: google.maps.Marker
        if (marker instanceof google.maps.Marker) {
            realMarker = marker as google.maps.Marker
        } else {
            realMarker = new google.maps.Marker(marker)
            // Only can add click event if MarkerSettings
            realMarker.addListener('click', () => {
                this.mapClick(realMarker, marker as MarkerSettings)
            })
        }
        realMarker.setMap(this.map)
        this.storedMarkers.push(realMarker)
    }

    public removeMarkers() {
        // TODO isn't there a better way to remove markers?
        this.storedMarkers.forEach((marker) => {
            marker.setMap(null)
        })
        this.storedMarkers = []
    }

    mapClick(marker: google.maps.Marker, markerSetting: MarkerSettings) {
        // TODO need other options other than this marker popup
        let clickOptions = markerSetting.click || {action: ''}
        if (_.isFunction(clickOptions)) {
            clickOptions = {
                action: 'function',
                function: clickOptions
            }
        }
        const action = clickOptions.action || ''
        switch (action) {
            case 'open': {
                this.openMarkerInfo(marker, clickOptions.content || '')
                break
            }
            case 'function': {
                // TODO verify that it is a function
                if (clickOptions.hasOwnProperty('function')) {
                    clickOptions.function(marker, markerSetting)
                }
                break
            }
        }
        // Otherwise do nothing
    }

    openMarkerInfo(marker: google.maps.Marker, content: string) {
        // TODO need more options such as clicking off
        this.info.setContent(content)
        this.info.open(this.map, marker) // TODO markerWindow not used right now
    }
}

class Watcher {
    // Watcher
    watching: {
        scope: object | any,
        path: string,
        action: ((newValue?: unknown, change?: KeyValueChanges<unknown, unknown>) => any)
        differ: KeyValueDiffer<unknown, unknown>
    }[] = []
    nextCheck = 0
    checkEveryMillisecond = 1000

    constructor(
        private Differ: KeyValueDiffers
    ) {
        this.Differ = Differ
    }

    watch(scope: object | any, path: string, action: ((newValue?: unknown, change?: KeyValueChanges<unknown, unknown>) => any)) {
        // Handled only arrays and objects currently
        const originalValue = this.getFromPath(scope, path)
        this.watching.push({
            scope,
            path,
            action,
            differ: this.Differ.find(originalValue).create(),
            /*action: (): any => {
                console.info('test running window watcher')
            }*/
        })
        // console.info('watching', path, originalValue)
    }

    checkWatchers() {
        const currentMilliseconds = new Date().getTime()
        // console.info('checkWatchers() cmparing', currentMilliseconds, this.nextCheck)
        if (this.nextCheck <= currentMilliseconds) {
            this.nextCheck = currentMilliseconds + this.checkEveryMillisecond
            // console.info('checkWatchers() ran')
            this.watching.forEach((watcher) => {
                const newValue = this.getFromPath(watcher.scope, watcher.path)
                const change = watcher.differ.diff(newValue)
                if (change) {
                    watcher.action(newValue, change)
                    // console.info(watcher.path, 'variable changed', _.clone(variable))
                }
            })
        }
    }

    private getFromPath(obj: any, path: string | string[], def?: any): any {

        /** If the path is a string, convert it to an array */
        const stringToPath = (stringPath: string | string[]) => {

            // If the path isn't a string, return it
            if (typeof stringPath !== 'string') {
                return stringPath
            }

            // Create new array
            const output: string[] = []

            // Split to an array with dot notation
            stringPath.split('.').forEach((item) => {

                // Split to an array with bracket notation
                item.split(/\[([^}]+)\]/g).forEach((key) => {

                    // Push to the new array
                    if (key.length > 0) {
                        output.push(key)
                    }

                })

            })

            return output

        }

        // Get the path as an array
        path = stringToPath(path)

        // Cache the current object
        let current = obj

        // For each item in the path, dig into the object
        // for (let i = 0; i < path.length; i++) {
        for (const pathPiece of path) {

            // If the item isn't found, return the default (or null)
            if (!current[pathPiece]) {
                return def || null
            }

            // Otherwise, update the current  value
            current = current[pathPiece]

        }

        return current

    }
}
