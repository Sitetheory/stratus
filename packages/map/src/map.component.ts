// See https://github.com/angular/components/tree/master/src/google-maps#readme

// Angular Core
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core'

// External
import {DomSanitizer} from '@angular/platform-browser'
import {keys} from 'ts-transformer-keys'

// External Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps'
import _ from 'lodash'

// Components
import {
    RootComponent
} from '@stratusjs/angular/core/root.component'

// Local Setup
const packageName = 'map'
const localDir = `/assets/1/0/bundles/${boot.configuration.paths[`@stratusjs/${packageName}/*`].replace(/[^/]*$/, '')}`
const systemDir = `@stratusjs/${packageName}`
const moduleName = 'map'

// Static Variables
const devGoogleMapsKey = 'AIzaSyBAyMH-A99yD5fHQPz7uzqk8glNJYGEqus' // Public dev key as placeholder


export interface MarkerSettingsClick {
    action: 'open' | 'function' | ''
    content?: string
    function?: (marker: MapMarker, options: MarkerSettings) => any
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
    click?: MarkerSettingsClick | ((marker: MapMarker, options: MarkerSettings) => any)
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


export class MapComponent extends RootComponent implements OnInit { // implements OnInit, OnChanges

    @ViewChild(GoogleMap, {static: false}) map: GoogleMap
    @ViewChild(MapInfoWindow, {static: false}) markerWindow: MapInfoWindow

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // UI Flags
    initializing = false
    initialized = false
    styled = false

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
    @Input() center: google.maps.LatLngLiteral
    options: google.maps.MapOptions = {
        mapTypeId: this.mapType,
        zoomControl: this.zoomControl,
        scrollwheel: this.scrollwheel,
        disableDoubleClickZoom: this.disableDoubleClickZoom,
    }
    protected storedMarkers: MarkerSettings[] = []
    markerContent = ''

    constructor(
        private window: Window,
        private sanitizer: DomSanitizer,
        private ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        /*pastStratus.Internals.CssLoader(`${localDir}/${moduleName}.component.css`)
            .then(() => {
                this.styled = true
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = true
            })*/

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<MapComponent>())

        console.info('map constructed')

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
    }

    async ngOnInit() {
        this.initializing = true
        console.info('map Initing')

        await this.initGoogleMapsApi()


        this.initializing = false
        this.initialized = true
        console.info('map Inited')

        /*console.log('my instance is', this.uid)
        const myPath = `Stratus.Instances.${this.uid}`

        console.log('random.object.right', this.getFromPath(this, 'random.object.right'))
        console.log('random.object', this.getFromPath(this, 'random.object'))
        console.log('window', window)
        console.log(myPath, this.getFromPath(window, myPath))*/

        this.processProvidedMarkersPath()

        console.info('map is here', this.map) // can fitBounds with this???? this.map.fitBounds()

    }

    private processProvidedMarkersPath() {
        if (_.isString(this.markers)) {
            // TODO check and process google.maps.LatLngLiteral (just use addMarker())
            console.info('the test var markers is string', this.markers)
            const path = this.getFromPath(window, this.markers)
            console.info('something path led to', path)
            if (_.isArray(path)) {
                console.info('path is array, adding directly as markers reference')
                this.storedMarkers = path
            }

            // If this is the only marker, center it
            if (this.storedMarkers.length === 1) {
                this.centerAtPosition(this.storedMarkers[0].position)
            } else if (this.storedMarkers.length > 1) {
                const bounds = this.getMarkerBounds()
                this.centerAtPosition(bounds.getCenter())
                this.fitBounds(bounds)
            }
        } else if (_.isArray(this.markers)) {
            // TODO need to verify its MarkSettings and no LatLng
            this.storedMarkers = this.markers as MarkerSettings[]
            console.info('guessing that this is MarkerSettings[]', this.markers)
        } else {
            console.info('the test var something is.....something...', this.markers)
        }
    }

    getMarkerBounds(): google.maps.LatLngBounds {
        const latLngBounds = new google.maps.LatLngBounds()

        this.storedMarkers.forEach((marker) => {
            latLngBounds.extend(marker.position)
        })

        return latLngBounds
    }

    fitBounds(latLngBounds: google.maps.LatLngBounds) {
        // TODO padding?
        // FIXME breaking because this is being called before this.map is defined. How do we get notified when map is assigned??
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
            await Stratus.Internals.JsLoader(`https://maps.googleapis.com/maps/api/js?key=${this.googleMapsKey}`)
            // TODO check if google is already loaded
            if (
                !Object.prototype.hasOwnProperty.call(window, 'google') ||
                !Object.prototype.hasOwnProperty.call(window.google, 'maps')
            ) {
                console.error('Google Maps Api was not initialized, cannot continue')
                this.initializing = false
                return
            }
            console.log('Google Maps Api Loaded')
        } catch (e) {
            console.error('Google Maps Api could not be fetched, cannot continue')
            this.initializing = false
            return
        }
    }

    /**
     * Get the Browsers current position via GPS or Internet hostname. Mobile will prove to be more accurate
     * Page user may disable this at will
     */
    async getCurrentPosition(highAccuracy?: boolean): Promise<google.maps.LatLngLiteral> {
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
    centerAtPosition(position: google.maps.LatLngLiteral | google.maps.LatLng) {
        if (position instanceof google.maps.LatLng) { // toJSON
            position = position.toJSON()
        }
        this.center = position
    }

    addMarker(marker: MarkerSettings) {
        this.storedMarkers.push(marker)
    }

    mapClick(marker: MapMarker, markerSetting: MarkerSettings) {
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

    openMarkerInfo(marker: MapMarker, content: string) {
        // TODO need more options such as clicking off
        this.markerContent = content
        // console.info('marker', _.clone(marker))
        this.markerWindow.open(marker)
    }

    async testFunction() {
        const currentPosition = await this.getCurrentPosition()

        this.centerAtPosition(currentPosition)

        this.addMarker({
            position: currentPosition,
            title: 'Marker Title',
            options: {
                animation: google.maps.Animation.DROP // DROP | BOUNCE
            },
            click: {
                // action: 'open',
                // content: 'Marker content info',
                action: 'function',
                function: (marker, markerSetting) => {
                    console.log('I\'m just running a simple function!!', marker, markerSetting)
                }
            }
        })
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
