import {StratusPackage} from '@stratusjs/angular/app.module'
import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {CommonModule} from '@angular/common'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MaterialModules} from '../../angular/src/material.module'
import {StripePaymentMethodComponent} from './payment-method.component'
import {StripePaymentMethodItemComponent} from './payment-method-item.component'
import {StripePaymentMethodItemDisplayComponent} from './payment-method-item-display.component'
import {StripePaymentMethodListComponent} from './payment-method-list.component'
import {StripePaymentMethodSelectorComponent} from './payment-method-selector.component'
import {StripeSetupIntentComponent} from './setup-intent.component'

@NgModule({
    // These are for external libraries (or Angular)
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        MaterialModules,
        ReactiveFormsModule,
    ],
    // These determine what exists as a component within Angular system.
    declarations: [
        StripePaymentMethodComponent,
        StripePaymentMethodItemComponent,
        StripePaymentMethodItemDisplayComponent,
        StripePaymentMethodListComponent,
        StripePaymentMethodSelectorComponent,
        StripeSetupIntentComponent,
    ],
    // This determines what is accessible via DOM as a component. These must be listed in `declarations`. (required in stratus)
    entryComponents: [
        StripePaymentMethodComponent,
        StripePaymentMethodItemComponent,
        StripePaymentMethodItemDisplayComponent,
        StripePaymentMethodListComponent,
        StripePaymentMethodSelectorComponent,
        StripeSetupIntentComponent,
    ],
    exports: [
        StripePaymentMethodComponent,
        StripePaymentMethodItemComponent,
        StripePaymentMethodItemDisplayComponent,
        StripePaymentMethodListComponent,
        StripePaymentMethodSelectorComponent,
        StripeSetupIntentComponent,
    ],
    providers: [
        {provide: Window, useValue: window}
    ]
})
export class StripeModule {}
export const StripePackage: StratusPackage = {
    stratusModule: StripeModule,
    stratusComponents: {
        'sa-stripe-payment-method-item-display': StripePaymentMethodItemDisplayComponent,
        'sa-stripe-payment-method-list': StripePaymentMethodListComponent,
        'sa-stripe-payment-method-selector': StripePaymentMethodSelectorComponent
    }
}
