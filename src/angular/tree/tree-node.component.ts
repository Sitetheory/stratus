// Angular Core
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'

// External
import * as _ from 'lodash'
import * as Stratus from 'stratus'

// Local Setup
const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular'
const systemDir = '@stratus/angular'
const moduleName = 'tree-node'

@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    constructor() {}

    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // Dependencies
        this._ = _

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${moduleName}/${moduleName}.component.css`)
    }
}
