// Normalizers
import './polyfills'

// Angular Core
import {enableProdMode, NgModuleRef} from '@angular/core'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

// Bootstrap
import {AppModule} from './app.module'

// Stratus Core
import {cookie} from '@stratusjs/core/environment'

// Switch Environment Appropriately
if (null === cookie('env')) {
    enableProdMode()
}

// Start App Module
platformBrowserDynamic().bootstrapModule(AppModule)
    .then((module: NgModuleRef<any>) => {
        console.log('@stratusjs/angular initialized successfully!')

        // This hydrates broken top-level attributes (require OnChanges implementation)
        // const rootComponent = module.injector.get(ApplicationRef).components[0]
        // const rootElement: ElementRef = rootComponent.injector.get(ElementRef)
        //
        // if (!rootComponent || !rootElement) {
        //     return
        // }
        // for (const attr of rootElement.nativeElement.attributes) {
        //     if (attr.name === 'ng-version' || !attr.value) {
        //         continue
        //     }
        //     const changes: {[key: string]: any} = {}
        //     if (rootComponent.instance.ngOnChanges) {
        //         changes[attr.name] = new SimpleChange(rootComponent.instance[attr.name], attr.value, true)
        //     }
        //
        //     rootComponent.instance[attr.name] = attr.value
        //
        //     if (rootComponent.instance.ngOnChanges) {
        //         rootComponent.instance.ngOnChanges(changes)
        //     }
        // }
        // rootComponent.changeDetectorRef.detectChanges()
    })
    .catch(err => console.error('@stratusjs/angular failed to initialize!', err))
