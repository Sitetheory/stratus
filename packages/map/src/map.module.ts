import {StratusPackage} from '@stratusjs/angular/app.module'
import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {CommonModule} from '@angular/common'
import {GoogleMapsModule} from '@angular/google-maps'
import {MaterialModules} from '../../angular/src/material'
import {MapComponent} from './map.component'

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        GoogleMapsModule,
        MaterialModules
    ],
    // These determine what exists as a component within Angular system.
    declarations: [
        MapComponent
    ],
    // This determines what is accessible via DOM as a component. These must be listed in `declarations`. (required in stratus)
    entryComponents: [
        MapComponent
    ],
    exports: [
        MapComponent
    ],
    providers: [
        {provide: Window, useValue: window}
    ]
})
export class MapModule {}
export const MapPackage: StratusPackage = {
    stratusModule: MapModule,
    stratusComponents: {
        'sa-map': MapComponent
    }
}
