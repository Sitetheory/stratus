// Normalizers
import '@stratus/angular/polyfills'

// Angular Core
import {enableProdMode} from '@angular/core'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

// Bootstrap
import {AppModule} from '@stratus/angular/app.module'

// Stratus Core
import {cookie} from '@stratus/core/environment'

// Switch Environment Appropriately
if (null === cookie('env')) {
    enableProdMode()
}

// Start App Module
platformBrowserDynamic().bootstrapModule(AppModule)
    .then(module => {
        console.log('@stratus/angular initialized successfully!')
    })
    // .then(module => console.log('@stratus/angular:', arguments))
    .catch(err => console.error('@stratus/angular failed to initialize!', err))

