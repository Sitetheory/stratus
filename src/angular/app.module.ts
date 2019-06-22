// Angular Core
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Stratus Modules
import {MaterialModules} from '@stratus/angular/material';

// Stratus Core Components
import {AppComponent} from '@stratus/angular/app.component';
import {BaseComponent} from '@stratus/angular/base/base.component';

// Stratus Custom Components
import {SelectorComponent} from '@stratus/angular/selector/selector.component';

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
        SelectorComponent
    ],
    declarations: [
        AppComponent,
        BaseComponent,
        SelectorComponent
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
