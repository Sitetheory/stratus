import {Component} from "@angular/core";

import * as Stratus from "stratus";
import * as _ from "lodash";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/components/';

/**
 * @title Drag&Drop sorting
 */
@Component({
    selector: 's2-base',
    templateUrl: `${localDir}base.html`,
    styleUrls: [ `${localDir}base.css`]
})

export class BaseComponent {
    constructor() {
        console.log('Base:', this);
        Stratus.Instances[_.uniqueId('s2_base_')] = this;
    }
}
