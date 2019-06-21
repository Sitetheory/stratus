import {Component} from "@angular/core";

import * as Stratus from "stratus";
import * as _ from "lodash";
import * as Registry from "stratus.services.registry";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular/';

/**
 * @title Drag&Drop sorting
 */
@Component({
    selector: 's2-app',
    templateUrl: `${localDir}app.component.html`,
    providers: [],
})

export class AppComponent {
    constructor() {
        console.log('AppComponent:', this, document.getElementsByTagName('s2-app'));
        console.log('AppComponent Elements:', document.getElementsByTagName('s2-app'));
        Stratus.Instances[_.uniqueId('s2_app_component_')] = this;
        this.registry = new Registry();
        this.registry.fetch({
            target: 'Media'
        }, this)
    }

    title = 's2-app';
    registry: any;
}
