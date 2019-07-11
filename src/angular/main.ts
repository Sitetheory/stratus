// Normalizers
import '@stratus/angular/polyfills';

// Environment
import * as Stratus from "stratus";

// Angular Core
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// Bootstrap
import {environment} from '@stratus/environments/environment';
import {AppModule} from "@stratus/angular/app.module";

if (environment.production) {
    enableProdMode();
}

Stratus.DOM.complete(function () {
    // Load Angular 8+
    const s2 = [
        's2-selector',
        's2-tree'
    ];
    // s2.map((element) => element).reduce((element) => element);
    let detected = false;
    s2.forEach(function (component) {
        if (detected) {
            return
        }
        const elements = document.getElementsByTagName(component);
        if (!elements || !elements.length) {
            return
        }
        detected = true
    });
    if (!detected) {
        return
    }
    platformBrowserDynamic().bootstrapModule(AppModule)
        .then(function (module) {
            console.log('@stratus/angular initialized successfully!')
        })
        // .then(foo => console.error('@stratus/angular:', arguments))
        .catch(err => console.error('@stratus/angular failed to initialize!', err))
    ;
});
