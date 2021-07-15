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
    Input,
    OnChanges,
    OnInit
} from '@angular/core'
import {
    DomSanitizer
} from '@angular/platform-browser'

// Angular Material
// import {MatIconRegistry} from '@angular/material/icon'

// External Dependencies
import {Stratus} from '@stratusjs/runtime/stratus'
import _ from 'lodash'
import {cookie} from '@stratusjs/core/environment'

// Stratus Angular Core
import {RootComponent} from '@stratusjs/angular/core/root.component'

// Transformers
import {keys} from 'ts-transformer-keys'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'base'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Basic Load
 */
@Component({
    selector: 'sa-base',
    // template: '<ng-content></ng-content>',
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // styleUrls: [`${localDir}/base/base.component${min}.css`],
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
        protected ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        // Chain constructor
        super()

        Stratus.Instances[_.uniqueId('sa_base_component_')] = this

        // Hydrate Root App Inputs
        this.hydrate(this.elementRef, this.sanitizer, keys<BaseComponent>())
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
