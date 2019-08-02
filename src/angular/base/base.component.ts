import {ChangeDetectionStrategy, Component, Injectable} from '@angular/core';

import * as Stratus from 'stratus';
import * as _ from 'lodash';

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';

/**
 * @title Basic Load
 */
@Component({
    selector: 'sa-base',
    template: '',
    // templateUrl: `${localDir}/base/base.component.html`,
    // styleUrls: [`${localDir}/base/base.component.css`],
    // viewProviders: [BaseComponent]
    changeDetection: ChangeDetectionStrategy.OnPush
})
// @Injectable()
export class BaseComponent {
    constructor() {
        Stratus.Instances[_.uniqueId('sa_base_component_')] = this;
    }
}
