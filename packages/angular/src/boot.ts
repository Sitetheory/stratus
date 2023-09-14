// PURPOSE
// - This is where we must register if a component will be used in html, e.g. sa-selector
// - we are using a component as an Angular app, this allows us to have as many angular components on a page defined
//  dynamically.

import {DOMComplete} from '@stratusjs/core/dom'

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
let boot = false
function angularBoot() {
    // Run Once
    if (boot) {
        console.log('stopped angular boot attempt after successful boot.')
        return
    }
    // Load Angular 8+
    // These are registered valid components to find and load on a page
    // TODO: eventually we need to dynamically load like config.js, e.g. see material.ts
    const sa = [
        // 'sa-base',
        'sa-boot', // Forcibly Boot Angular. Useful if element is not directly on a page onLoad
        'sa-editor',
        'sa-map',
        'sa-media-selector',
        'sa-selector',
        'sa-stripe-payment-method-item-display',
        'sa-stripe-payment-method-list',
        'sa-stripe-payment-method-selector',
        'sa-tree'
        // 'quill-editor'
    ]
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
    boot = true
    // Require Main
    require('@stratusjs/angular/main')
}

// Automatic Bootstrapping on DOM Complete
DOMComplete().then(() => angularBoot())
