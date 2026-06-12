// PURPOSE
// - This is where we must register if a component will be used in html, e.g. sa-selector
// - we are using a component as an Angular app, this allows us to have as many angular components on a page defined
//  dynamically.

import {DOMComplete} from '@stratusjs/core/dom'
import {cookie} from '@stratusjs/core/environment'
import {Stratus} from '@stratusjs/runtime/stratus'

// Fade out detection cycles
let initialTimeout = 1000
const limitTimeout = 5000
function exponentialTimeout() {
    if (initialTimeout > limitTimeout) {
        return limitTimeout
    }
    const currentTimeout = initialTimeout
    initialTimeout = initialTimeout * 1.2
    return currentTimeout
}

// TODO: Make this importable, so we can bootstrap other components dynamically in packages outside this one.
// Attempt to boot Angular
let booted = false
function loadAngularMaterialStyles() {
    const min = !cookie('env') ? '.min' : ''
    const localDir = `${Stratus.BaseUrl}${boot.configuration.paths['@stratusjs/angular/*'].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

    return Promise.all([
        Stratus.Internals.CssLoader('https://fonts.googleapis.com/icon?family=Material+Icons&display=swap'),
        Stratus.Internals.CssLoader(`${localDir}angular-material-indigo-pink${min}.css`)
    ]).catch((error: Error) => {
        console.warn('@stratusjs/angular failed to load Angular Material styles.', error)
    })
}

function angularBoot() {
    // Run Once
    if (booted) {
        console.log('stopped angular boot attempt after successful boot.')
        return
    }
    // Load Angular 8+
    // These are registered valid components to find and load on a page
    // TODO: eventually we need to dynamically load like config.js, e.g. see material.ts
    const angularComponentSelectors = [
        // 'sa-base',
        'sa-boot', // Forcibly Boot Angular. Useful if element is not directly on a page onLoad
        'sa-editor',
        'sa-map',
        'sa-media-selector',
        'sa-selector',
        'sa-stripe-payment-method-item-display',
        'sa-stripe-payment-method-list',
        'sa-stripe-payment-method-selector',
        'sa-timezone-selector',
        'sa-tree'
        // 'quill-editor'
    ]
    const sa = angularComponentSelectors.concat(
        angularComponentSelectors.map((selector: string) => `${selector}-boot`)
    )
    // sa.map((element) => element).reduce((element) => element);
    let detected = false
    sa.forEach(component => {
        if (detected) {
            return
        }
        const elements = document.getElementsByTagName(component)
        if (!elements || !elements.length) {
            return
        }
        detected = true
    })
    if (!detected) {
        setTimeout(() => {
            // console.log('reattempt angular boot cycle.');
            angularBoot()
        }, exponentialTimeout())
        return
    }
    // Lock Bootstrapper
    booted = true
    // Require Main after Angular Material styles are requested.
    loadAngularMaterialStyles().then(() => require('@stratusjs/angular/main'))
}

// Automatic Bootstrapping on DOM Complete
DOMComplete().then(() => angularBoot())
