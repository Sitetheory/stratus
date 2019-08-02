// Normalizers
import '@stratus/angular/polyfills';

// Environment
import {DOMComplete} from '@stratus/core/dom';

// Angular Core
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// Bootstrap
import {environment} from '@stratus/environments/environment';
import {AppModule} from '@stratus/angular/app.module';

if (environment.production) {
    enableProdMode();
}

let boot = false;

function angularBoot() {
    // Run Once
    if (boot) {
        console.log('stopped angular boot attempt after successful boot.');
        return;
    }
    // Load Angular 8+
    const s2 = [
        // 's2-base',
        's2-selector',
        's2-tree',
        'quill-editor'
    ];
    // s2.map((element) => element).reduce((element) => element);
    let detected = false;
    s2.forEach(component => {
        if (detected) {
            return;
        }
        const elements = document.getElementsByTagName(component);
        if (!elements || !elements.length) {
            return;
        }
        detected = true;
    });
    if (!detected) {
        setTimeout(() => {
            console.log('reattempt angular boot cycle.');
            angularBoot();
        }, 3000);
        return;
    }
    // Lock Bootstrapper
    boot = true;
    // Start App Module
    platformBrowserDynamic().bootstrapModule(AppModule)
        .then(module => {
            console.log('@stratus/angular initialized successfully!');
        })
        // .then(module => console.log('@stratus/angular:', arguments))
        .catch(err => console.error('@stratus/angular failed to initialize!', err))
    ;
}

// Automatic Bootstrapping on DOM Complete
DOMComplete().then(() => angularBoot());
