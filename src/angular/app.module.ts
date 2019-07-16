// Angular Core
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Stratus Modules
import {MaterialModules} from '@stratus/angular/material';

// Stratus Core Components
import {BaseComponent} from '@stratus/angular/base/base.component';

// Stratus Custom Components
import {SelectorComponent} from '@stratus/angular/selector/selector.component';
import {TreeComponent, TreeComponentDialog} from '@stratus/angular/tree/tree.component';

// External Modules
import * as _ from "lodash";
import * as Stratus from "stratus";

let roster: {};
roster = {
    's2-selector': SelectorComponent,
    's2-tree': TreeComponent
};

const bootstrap = _.keys(roster)
    .map(function (component) {
        const elements = document.getElementsByTagName(component);
        if (!elements || !elements.length) {
            return null;
        }
        return component;
    })
    .filter((item) => !!item)
    .map((element) => element in roster ? _.get(roster, element) : null)
    .filter((item) => !!item);

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
        TreeComponent,
        TreeComponentDialog,
    ],
    declarations: [
        BaseComponent,
        SelectorComponent,
        TreeComponent,
        TreeComponentDialog,
    ],
    bootstrap: bootstrap,
    providers: []
})
export class AppModule {
    constructor() {
        Stratus.Instances[_.uniqueId('s2_app_module_')] = this;
    }
}
