// Angular Core
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Stratus Modules
import {MaterialModules} from '@stratus/modules/material';

// Stratus Core Components
import {AppComponent} from '@stratus/angular/app.component';
import {BaseComponent} from '@stratus/components/base';

// Stratus Custom Components
import {AetherialComponent} from '@stratus/components/aetherial';

// External Modules
import * as _ from "lodash";
import * as Stratus from "stratus";

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MaterialModules,
        MatNativeDateModule,
        ReactiveFormsModule,
    ],
    entryComponents: [
        BaseComponent,
        AetherialComponent
    ],
    declarations: [
        AppComponent,
        BaseComponent,
        AetherialComponent
    ],
    bootstrap: [
        AppComponent
    ],
    providers: []
})
export class AppModule {
    constructor() {
        Stratus.Instances[_.uniqueId('s2_app_module_')] = this;
    }
}
