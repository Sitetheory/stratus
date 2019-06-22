import {Component} from "@angular/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

import * as Stratus from "stratus";
import * as _ from "lodash";

const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';

/**
 * @title AutoComplete Selector with Drag&Drop Sorting
 */
@Component({
    selector: 's2-selector',
    templateUrl: `${localDir}/selector/selector.component.html`,
    styleUrls: [
        `${localDir}/selector/selector.component.css`
    ],
})

export class SelectorComponent {
    constructor() {
        Stratus.Instances[_.uniqueId('s2_selector_component_')] = this;
        this.registry = new Stratus.Data.Registry();
        this.registry.fetch({
            target: 'Content'
        }, this)
    }

    title = 'selector-dnd';

    registry: any;
    data: any;
    collection: any;

    /**
     * @param event
     */
    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.collection.models, event.previousIndex, event.currentIndex);
        // console.log('', this);
        // this.examples.forEach((m) => console.log(m));
    }

    /**
     * @param model
     */
    remove (model: any) {
        console.log('remove:', model, 'from:', this.collection ? this.collection.models : [])
    }
}
