import {Component} from "@angular/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/components/';

/**
 * @title Drag&Drop sorting
 */
@Component({
    selector: 'stratus-aetherial',
    templateUrl: `${localDir}aetherial.html`,
    styleUrls: [ `${localDir}aetherial.css`]
})

export class AetherialComponent {
    // constructor() {
    //     console.log('aetherial:', this)
    // }

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
