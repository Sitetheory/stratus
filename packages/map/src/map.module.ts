import {StratusPackage} from '@stratusjs/angular/app.module'
import { NgModule } from '@angular/core'
import {GoogleMapsModule} from '@angular/google-maps'
import {MapComponent} from './map.component'


@NgModule({
    // These determine what exists as a component within Angular system.
    declarations: [
        MapComponent
    ],
    // This determines what is accessible via DOM as a component. These must be listed in `declarations`. (required in stratus)
    entryComponents: [
        MapComponent
    ],
    imports: [
        GoogleMapsModule
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
