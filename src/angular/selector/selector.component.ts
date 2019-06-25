// Angular Core
import {Component} from "@angular/core";
import {FormControl} from '@angular/forms';

// CDK
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

// External
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

// SVG Icons
import {DomSanitizer, ɵDomSanitizerImpl} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

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

    // Basic Component Settings
    title = 'selector-dnd';
    uid: string;

    // Dependencies
    _: any;
    sanitizer: DomSanitizer;
    selectCtrl = new FormControl();

    // Stratus Data Connectivity
    registry = new Stratus.Data.Registry();
    data: any;
    collection: any;
    model: any;

    // API Endpoint for Selector
    // TODO: Avoid hard-coding this...
    url = '/Api/Content?q=value&options["showRouting"]';
    target = 'Content';

    // API Connectivity for Selector
    filteredModels: Observable<[]>;
    // filteredModels: any;

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {

        // Initialization
        this.uid = _.uniqueId('s2_selector_component_');
        Stratus.Instances[this.uid] = this;

        // Dependencies
        this._ = _;
        this.sanitizer = sanitizer;

        // SVG Icons
        iconRegistry.addSvgIcon(
            ':delete',
            sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        );

        // Data Connections
        this.registry.fetch(Stratus.Select('#widget-edit-entity'), this)
            .then(function (data: any) {
                console.log('S2 Selector Model:', data)
            });

        // Handling Pipes with Promises
        this.filteredModels = this.selectCtrl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterModels(value))
            );
    }

    /**
     * @param event
     */
    drop(event: CdkDragDrop<string[]>) {
        if (!this.model) {
            return
        }
        const models = _.get(this.model, "data.version.modules");
        if (!models || !_.isArray(models)) {
            return
        }
        moveItemInArray(models, event.previousIndex, event.currentIndex);
    }

    /**
     * @param model
     */
    remove (model: any) {
        // console.log('remove:', model, 'from:', this.collection ? this.collection.models : [])
    }

    /**
     * @param value
     * @private
     */
    private _filterModels(value: string): any {
        // TODO:
        // return await this.collection.filterAsync(value);
        // return await [];
        return [];
    }

    findImage (model: any) {
        const mime = _.get(model, 'version.images[0].mime');
        if (mime === undefined) {
            return ''
        }
        if (mime.indexOf('image') !== -1) {
            return _.get(model, 'version.images[0].src');
        } else if (mime.indexOf('video') !== -1) {
            return _.get(model, 'version.images[0].meta.thumbnail_small');
        }
        return ''
    }
}
