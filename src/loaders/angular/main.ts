import '@stratus/loaders/angular/polyfills';

// import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
// import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// import {MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {MaterialModules} from '@stratus/loaders/angular/material-modules';

import {AetherialComponent} from '@stratus/components/aetherial';

@NgModule({
  imports: [
    BrowserModule,
    // BrowserAnimationsModule,
    // FormsModule,
    // HttpClientModule,
    // MaterialModules,
    // MatNativeDateModule,
    // ReactiveFormsModule,
  ],
  entryComponents: [AetherialComponent],
  declarations: [AetherialComponent],
  bootstrap: [AetherialComponent],
  providers: []
})
export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule)
    .then(function () {
      console.log('@stratus/loaders/angular/main', arguments)
    })
    .catch(function () {
      console.error('@stratus/loaders/angular/main', arguments)
    })
;
