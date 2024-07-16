// PURPOSE
// - This is where we register every component that will be used or imported
// - add an import to define where it is located, e.g. import { BaseComponent } from './base/base.component'
// - add to declarations and entryComponents

import {forEach, extend, isNumber, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {ApplicationRef, NgModule} from '@angular/core'

// Angular Locales
// import localeFr from '@angular/common/locales/fr'
// import localeEs from '@angular/common/locales/es'

// Register Locales
// registerLocaleData(localeFr, 'fr-FR')
// registerLocaleData(localeEs, 'es-ES')

// Custom Angular StratusPackages
// import {FormPackage} from '../../form/src/form.module'
import {AngularPackage} from './angular.module'
import {MapPackage} from '../../map/src/map.module'
import {StripePackage} from '../../stripe/src/stripe.module'



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

// Compiled stratus modules
const ngModuleImports: any[] = []
// Compiled component declarations
const appModuleComponents = {}

// This determines what custom Stratus Packages we want loaded in and will handle it's own declarations
const stratusPackages: StratusPackage[] = [
    AngularPackage, // $stratusjs/angular
    MapPackage, // @stratusjs/map
    StripePackage // @stratusjs/stripe
]
stratusPackages.forEach((stratusPackage) => {
    ngModuleImports.push(stratusPackage.stratusModule)
    if (stratusPackage.hasOwnProperty('stratusComponents')) {
        extend(appModuleComponents, stratusPackage.stratusComponents)
    }
})

// FIXME add the definations to angular.module.ts as seen like Map and Stripe
@NgModule({
    // All Stratus Modules loaded
    imports: ngModuleImports,
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
