import {Component} from "@angular/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

/**
 * @title Drag&Drop sorting
 */
@Component({
    selector: 'stratus-aetherial',
    templateUrl: 'aetherial.html',
    styleUrls: ['aetherial.css'],
})

export class Aetherial {
    examples = [
        'Foo',
        'Bar',
        'Baz',
        'Qux',
    ];

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.examples, event.previousIndex, event.currentIndex);
        console.log('');
        this.examples.forEach((m) => console.log(m));
    }
}
