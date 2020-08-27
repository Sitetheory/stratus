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

interface MarkerSettingsClick {
    action: 'open' | 'nothing'
    content?: string
}

interface MarkerSettings {
    title?: string
    position: google.maps.LatLngLiteral | google.maps.LatLng
    // Adding a Label when there is a shape does not look good
    label?: string | google.maps.MarkerLabel
    clickable?: boolean
    options?: google.maps.MarkerOptions

    // Custom option
    // content?: string
    click?: MarkerSettingsClick
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
    @Input() googleMapsKey = devGoogleMapsKey
    zoom = 18
    center: google.maps.LatLngLiteral
    options: google.maps.MapOptions = {
        zoomControl: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        mapTypeId: 'hybrid'
    }
    markers: MarkerSettings[] = []
    markerContent = ''

    constructor(
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
        Stratus.Internals.CssLoader(`${localDir}/${moduleName}.component.css`)
            .then(() => {
                this.styled = true
                // TODO this.refresh()
            })
            .catch(() => {
                console.error('CSS Failed to load for Component:', this)
                this.styled = true
                // TODO this.refresh()
            })

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<MapComponent>())

        console.info('map constructed')

        // Warn if website has not provided a Google Maps Api Key
        if (this.googleMapsKey === devGoogleMapsKey) {
            console.warn('Google Maps Api Key (data-google-maps-key) was not provided! Displaying in Development mode only.')
        }
    }

    async ngOnInit() {
        this.initializing = true
        console.info('map Initing', this.googleMapsKey)

        await this.initGoogleMapsApi()


        this.initializing = false
        this.initialized = true
        console.info('map Inited')

        this.testFunction()
    }

    /**
     * Attempt Load in the Google Maps Api script
     * Required before any functions can be performed
     */
    async initGoogleMapsApi() {
        console.log('Loading Google Maps Api')
        try {
            // TODO check if there is a global Key in stratus
            await Stratus.Internals.JsLoader(`https://maps.googleapis.com/maps/api/js?key=${this.googleMapsKey}`)
            // TODO check if google is already loaded
            /*if (!Object.prototype.hasOwnProperty.call($window, 'google')) {
                console.error('Google Maps Api was not initialized, cannot continue')
                this.initializing = false
                return
            }*/
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
    centerAtPosition(position: google.maps.LatLngLiteral) {
        this.center = position
    }

    addMarker(marker: MarkerSettings) {
        // TODO if no marker.click, add a blank one
        this.markers.push(marker)
    }

    mapClick(marker: MapMarker, clickOptions: MarkerSettingsClick) {
        // TODO need other options other than this marker popup
        const action = clickOptions.action || 'nothing'
        switch (action) {
            case 'open': {
                this.openMarkerInfo(marker, clickOptions.content || '')
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
                action: 'open',
                content: 'Marker content info'
            }
        })
    }
}
