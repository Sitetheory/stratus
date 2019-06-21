import {Component} from "@angular/core";

import * as Stratus from "stratus";
import * as _ from "lodash";
import "stratus.services.registry";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';

/**
 * @title Shell Component
 */
@Component({
    selector: 's2-content-module-edit',
    templateUrl: `${localDir}/app.component.html`,
    providers: [],
})
export class AppComponent {
    constructor() {
        Stratus.Instances[_.uniqueId('s2_app_component_')] = this;
    }

    title = 's2-content-module-edit';
}
