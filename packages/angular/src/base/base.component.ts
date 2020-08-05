// NOTE: to register a component you need to add it to:
// 1. /packages/angular/src/boot.ts
//      - This is where we must register if a component will be used in html, e.g. sa-selector
//      - we are using a component as an Angular app, this allows us to have as many angular components on a page defined
//          dynamically.
// 2. /packages/angular/src/app.module.ts
//      - This is where we register every component that will be used or imported
//      - add an import to define where it is located, e.g. import { BaseComponent } from '@stratusjs/angular/base/base.component'
//      - add to declarations and entryComponents

// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injectable,
    Input,
    OnChanges,
    OnInit
} from '@angular/core'

// External Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import _ from 'lodash'
import {RootComponent} from '@stratusjs/angular/core/root.component'
import {keys} from 'ts-transformer-keys'
// import {MatIconRegistry} from '@angular/material/icon'
import {DomSanitizer} from '@angular/platform-browser'
import {cookie} from '@stratusjs/core/environment'

const localDir = `/assets/1/0/bundles/${boot.configuration.paths['@stratusjs/angular/*'].replace(/[^/]*$/, '')}`
const moduleName = 'base'

/**
 * @title Basic Load
 */
@Component({
    selector: 'sa-base',
    template: '<ng-content></ng-content>',
    // templateUrl: `${localDir}/base/base.component.html`,
    // styleUrls: [`${localDir}/base/base.component.css`],
    // viewProviders: [BaseComponent]
    changeDetection: ChangeDetectionStrategy.OnPush
})
// @Injectable()
export class BaseComponent extends RootComponent implements OnInit, OnChanges {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Registry Attributes
    @Input() target: string
    @Input() targetSuffix: string
    @Input() id: number
    @Input() manifest: boolean
    @Input() decouple: boolean
    @Input() direct: boolean
    @Input() api: object
    @Input() urlRoot: string

    // Component Attributes
    @Input() type: string
    @Input() property: string
    @Input() endpoint: string

    constructor(
        private sanitizer: DomSanitizer,
        private ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        // Chain constructor
        super()

        Stratus.Instances[_.uniqueId('sa_base_component_')] = this

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<BaseComponent>())
    }

    ngOnInit() {
        console.info('selector.ngOnInit')
    }

    ngOnChanges() {
        // Display Inputs
        if (!cookie('env')) {
            return
        }
        console.log('inputs:', {
            target: this.target,
            targetSuffix: this.targetSuffix,
            id: this.id,
            manifest: this.manifest,
            decouple: this.decouple,
            direct: this.direct,
            api: this.api,
            urlRoot: this.urlRoot,
        })
    }
}
