// Normalizers
import '@stratusjs/angular/polyfills'

// Angular Core
import {enableProdMode} from '@angular/core'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

// Bootstrap
import {AppModule} from '@stratusjs/angular/app.module'

// Stratus Core
import {cookie} from '@stratusjs/core/environment'

// Switch Environment Appropriately
if (null === cookie('env')) {
    enableProdMode()
}

// Start App Module
platformBrowserDynamic().bootstrapModule(AppModule)
    .then(module => {
        console.log('@stratusjs/angular initialized successfully!')
    })
    // .then(module => console.log('@stratusjs/angular:', arguments))
    .catch(err => console.error('@stratusjs/angular failed to initialize!', err))

