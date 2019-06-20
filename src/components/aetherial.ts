import {Component} from "@angular/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

import * as Stratus from "stratus";
import * as _ from "lodash";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/components/';

/**
 * @title Drag&Drop sorting
 */
@Component({
    selector: 's2-aetherial',
    templateUrl: `${localDir}aetherial.html`,
    styleUrls: [ `${localDir}aetherial.css`]
})

export class AetherialComponent {
    constructor() {
        console.log('Aetherial:', this);
        Stratus.Instances[_.uniqueId('s2_aetherial_component_')] = this;
    }

    title = 'aetherial-app';

    examples = [
        'Foo',
        'Bar',
        'Baz',
        'Qux',
    ];

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.examples, event.previousIndex, event.currentIndex);
        // console.log('', this);
        // this.examples.forEach((m) => console.log(m));
    }
}
