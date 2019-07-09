// Angular Core
import {HttpClientModule} from '@angular/common/http';
import {Component, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Stratus Modules
import {MaterialModules} from '@stratus/angular/material';

// Stratus Core Components
import {BaseComponent} from '@stratus/angular/base/base.component';

// Stratus Custom Components
import {SelectorBootComponent} from '@stratus/angular/selector/boot.component';
import {SelectorComponent} from '@stratus/angular/selector/selector.component';
import {TreeBootComponent} from '@stratus/angular/tree/boot.component';
import {TreeComponent} from '@stratus/angular/tree/tree.component';

// External Modules
import * as _ from "lodash";
import * as Stratus from "stratus";

// let roster: {};
// roster = {
//     's2-selector': SelectorBootComponent,
//     's2-tree': TreeBootComponent
// };
//
// const detected = _.keys(roster).map(function (component) {
//     const elements = document.getElementsByTagName(component);
//     if (!elements || !elements.length) {
//         return null;
//     }
//     return component;
// }).filter((item) => !!item);

// let bootstrap: Component[];
// bootstrap = detected.map((element) => element in roster ? roster[element] : null).filter((item) => !!item);
// bootstrap = [
//     SelectorBootComponent
// ];

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
        SelectorComponent,
        TreeComponent
    ],
    declarations: [
        BaseComponent,
        SelectorBootComponent,
        SelectorComponent,
        TreeBootComponent,
        TreeComponent
    ],
    bootstrap: [
        SelectorBootComponent
    ],
    providers: []
})
export class AppModule {
    constructor() {
        Stratus.Instances[_.uniqueId('s2_app_module_')] = this;
    }
}
