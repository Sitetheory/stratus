// PURPOSE
// - This is where we register every component that will be used or imported
// - add an import to define where it is located, e.g. import { BaseComponent } from './base/base.component'
// - add to declarations and entryComponents

import {forEach, extend, isNumber, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'

// Angular Core
import {HttpClientModule} from '@angular/common/http'
import {
    ApplicationRef,
    NgModule
} from '@angular/core'
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms'
import {MatNativeDateModule} from '@angular/material/core'
import {BrowserModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'

// Angular Locales
// import localeFr from '@angular/common/locales/fr'
// import localeEs from '@angular/common/locales/es'

// Register Locales
// registerLocaleData(localeFr, 'fr-FR')
// registerLocaleData(localeEs, 'es-ES')

// Material Modules
import {MaterialModules} from './material'

// Angular Packages
import {FlexLayoutModule} from '@angular/flex-layout'

// Base Components
import {BaseComponent} from './base/base.component'

// Stratus Custom Directives/Components
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component'
import {EditorComponent} from './editor/editor.component'
import {MediaSelectorComponent} from './media-selector/media-selector.component'
import {SelectorComponent} from './selector/selector.component'
import {StripePaymentMethodComponent} from '../../stripe/src/payment-method.component'
import {StripePaymentMethodItemComponent} from '../../stripe/src/payment-method-item.component'
import {StripePaymentMethodListComponent} from '../../stripe/src/payment-method-list.component'
import {StripePaymentMethodSelectorComponent} from '../../stripe/src/payment-method-selector.component'
import {StripeSetupIntentComponent} from '../../stripe/src/setup-intent.component'
import {TreeComponent} from './tree/tree.component'
import {TreeDialogComponent} from './tree/tree-dialog.component'
import {TreeNodeComponent} from './tree/tree-node.component'

// Custom Angular StratusPackages
// import {FormPackage} from '../../form/src/form.module'
import {MapPackage} from '../../map/src/map.module'

// Froala Modules (Required by Editor)
import {
    FroalaEditorModule,
    FroalaViewModule
} from 'angular-froala-wysiwyg'

// Editor Dialogs
import {CitationDialogComponent} from './editor/citation-dialog.component'
import {
    CodeViewDialogComponent
} from './editor/code-view-dialog.component'
import {
    MediaDialogComponent
} from './editor/media-dialog.component'
import {
    LinkDialogComponent
} from './editor/link-dialog.component'

export type StratusPackage = {
    stratusModule: any
    stratusComponents?: {[key:string]: any}
}

// Dynamic Loader Prototype
// import {
//     AngularModules
// } from './angular.modules'

// let roster: {};
// roster = {
//     // 'sa-base': BaseComponent,
//     'sa-selector': SelectorComponent,
//     'sa-tree': TreeComponent
// };
//
// const bootstrap = keys(roster)
//     .map(component => {
//         const elements = document.getElementsByTagName(component);
//         if (!elements || !elements.length) {
//             return null;
//         }
//         return component;
//     })
//     .filter((item) => !!item)
//     .map((element) => get(roster, element) || null)
//     .filter((item) => !!item);

// These are for external libraries (or Angular)
const ngModuleImports: any[] = [
    // AngularModules,
    BrowserModule,
    BrowserAnimationsModule,
    // CodeEditorModule.forRoot(),
    FlexLayoutModule,
    FormsModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    HttpClientModule,
    MaterialModules,
    MatNativeDateModule,
    ReactiveFormsModule,
    // SelectorComponent.forRoot()
]

// These determine what exists as a component within Angular system.
const ngDeclarations: any[] = [
    BaseComponent,
    CitationDialogComponent,
    CodeViewDialogComponent,
    ConfirmDialogComponent,
    EditorComponent,
    LinkDialogComponent,
    MediaDialogComponent,
    MediaSelectorComponent,
    SelectorComponent,
    StripePaymentMethodComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripePaymentMethodItemComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripePaymentMethodListComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripePaymentMethodSelectorComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripeSetupIntentComponent, // FIXME move to @stratusjs/stripe StratusPackage
    TreeComponent,
    TreeDialogComponent,
    TreeNodeComponent,
]

// This determines what is accessible via DOM as a component. These must be listed in `ngDeclarations`.
const ngEntryComponents: any[] = [
    BaseComponent, // FIXME shouldn't be needed as doesn't load on DOM
    CitationDialogComponent,
    CodeViewDialogComponent,
    ConfirmDialogComponent,
    EditorComponent,
    LinkDialogComponent,
    MediaDialogComponent,
    MediaSelectorComponent,
    SelectorComponent,
    StripePaymentMethodComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripePaymentMethodItemComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripePaymentMethodListComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripePaymentMethodSelectorComponent, // FIXME move to @stratusjs/stripe StratusPackage
    StripeSetupIntentComponent, // FIXME move to @stratusjs/stripe StratusPackage
    TreeComponent,
    TreeDialogComponent,
    TreeNodeComponent,
]

const appModuleComponents = {
    'sa-base': BaseComponent,
    'sa-editor': EditorComponent,
    'sa-media-selector': MediaSelectorComponent,
    'sa-selector': SelectorComponent,
    'sa-stripe-payment-method-list': StripePaymentMethodListComponent, // FIXME move to @stratusjs/stripe StratusPackage
    'sa-stripe-payment-method-selector': StripePaymentMethodSelectorComponent, // FIXME move to @stratusjs/stripe StratusPackage
    'sa-tree': TreeComponent
}

// This determines what custom Stratus Packages we want loaded in and will handle it's own declarations
const stratusPackages: StratusPackage[] = [
    MapPackage
]
stratusPackages.forEach((stratusPackage) => {
    ngModuleImports.push(stratusPackage.stratusModule)
    if (stratusPackage.hasOwnProperty('stratusComponents')) {
        extend(appModuleComponents, stratusPackage.stratusComponents)
    }
})

@NgModule({
    // These are for external libraries (or Angular)
    imports: ngModuleImports,
    // This determines what is accessible via DOM as a component. These must be listed in `declarations`.
    entryComponents: ngEntryComponents,
    // These determine what exists as a component within Angular system.
    declarations: ngDeclarations,
    // bootstrap,
    providers: [
        {provide: Window, useValue: window}
    ]
})
export class AppModule {
    // node: true || false
    initialTimeout = 1000
    instances = {}
    // These modules will be hydrated directly in the HTML, and *cannot* load in a component template/dialog
    modules = appModuleComponents

    constructor() {
        Stratus.Instances[uniqueId('sa_app_module_')] = this
    }

    ngDoBootstrap(appRef: ApplicationRef) {
        this.detectBoot(appRef)
    }

    // Fade out detection cycles
    exponentialTimeout(limit?: number) {
        if (isNumber(limit) && limit < this.initialTimeout) {
            return limit
        }
        // store current
        const currentTimeout = this.initialTimeout
        // increase amount
        this.initialTimeout = this.initialTimeout * 1.01
        // return
        return currentTimeout
    }

    detectBoot(appRef: ApplicationRef) {
        forEach(this.modules, (module, selector) => {
            // if (!(module instanceof ComponentFactory)) {
            //     return;
            // }
            const elements = document.getElementsByTagName(selector)
            if (!elements || !elements.length) {
                return
            }
            forEach(elements, (node) => {
                if (node.hasAttribute('ng-version')) {
                    return
                }
                // console.log('ngDoBootstrap detected:', node);
                // FIXME: The Modules aren't explicitly the correct type
                // @ts-ignore
                appRef.bootstrap(module, node)
            })
        })
        // FIXME this logic is broken
        /*
        forEach(this.directives, (directive, selector) => {
            // if (!(module instanceof ComponentFactory)) {
            //     return;
            // }
            // const elements = document.getElementsByTagName(selector)
            const elements = document.querySelectorAll(`[${selector}]`)
            if (!elements || !elements.length) {
                return
            }
            forEach(elements, (node) => {
                if (node.hasAttribute('ng-version')) {
                    return
                }
                console.warn('detected ', selector)
                // console.log('ngDoBootstrap detected:', node);
                // FIXME: Directives cannot be added to ngModule.entryComponents, so this will error
                // @ts-ignore
                appRef.bootstrap(directive, node)
            })
        })*/
        setTimeout(() => {
            this.detectBoot(appRef)
        }, this.exponentialTimeout(4000))
    }
}
