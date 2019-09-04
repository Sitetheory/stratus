import {DOMComplete} from '@stratus/core/dom'

// Fade out detection cycles
let initialTimeout = 1000
function exponentialTimeout() {
    const currentTimeout = initialTimeout
    initialTimeout = initialTimeout * 1.2
    return currentTimeout
}

// Attempt to boot Angular
let boot = false
function angularBoot() {
    // Run Once
    if (boot) {
        console.log('stopped angular boot attempt after successful boot.')
        return
    }
    // Load Angular 8+
    const sa = [
        // 'sa-base',
        'sa-selector',
        'sa-tree',
        'quill-editor'
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
    require('@stratus/angular/main')
}

// Automatic Bootstrapping on DOM Complete
DOMComplete().then(() => angularBoot())
