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
    platformBrowserDynamic().bootstrapModule(AppModule)
        .then(function (module) {
            console.log('@stratus/angular initialized!')
        })
        // .then(foo => console.error('@stratus/angular:', arguments))
        .catch(err => console.error('@stratus/angular did not initialize properly!'))
    ;
});
