// Normalizers
import '@stratus/angular/polyfills';

// Angular Core
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Stratus Specific
import {MaterialModules} from '@stratus/angular/material-modules';
import {AetherialComponent} from '@stratus/components/aetherial';
import {BaseComponent} from '@stratus/components/base';

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
        AetherialComponent,
        BaseComponent
    ],
    declarations: [
        AetherialComponent,
        BaseComponent
    ],
    bootstrap: [
        AetherialComponent,
        BaseComponent
    ],
    providers: []
})

export class AppModule {
    constructor() {
        console.log('Angular Boot:', this);
        Stratus.Instances[_.uniqueId('s2_app_')] = this;
    }
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .then(function () {
        console.log('@stratus/angular:', arguments)
    })
    .catch(function (error) {
        console.error('@stratus/angular:', error)
    })
;
