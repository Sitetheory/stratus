// TODO we will want to break this off into their own modules/packages
import {StratusPackage} from './app.module'
import {NgModule} from '@angular/core'

// Material Modules
import {MatNativeDateModule} from '@angular/material/core'
import {MaterialModules} from './material.module'

// Angular Libraries
import {HttpClientModule} from '@angular/common/http'
import {FlexLayoutModule} from '@angular/flex-layout'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {BrowserModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'

// Base Components
import {BaseComponent} from './base/base.component'

// Confirm Dialog
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component'

// Editor
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg'
import {CitationDialogComponent} from './editor/citation-dialog.component'
import {CodeViewDialogComponent} from './editor/code-view-dialog.component'
import {EditorComponent} from './editor/editor.component'
import {LinkDialogComponent} from './editor/link-dialog.component'
import {MediaDialogComponent} from './editor/media-dialog.component'

// Media Selector
import {MediaSelectorComponent} from './media-selector/media-selector.component'

// Selector
import {SelectorComponent} from './selector/selector.component'

// Timezone Selector
import {TimezoneSelectorComponent} from './timezone-selector/timezone-selector.component'

// Tree
import {TreeComponent} from './tree/tree.component'
import {TreeDialogComponent} from './tree/tree-dialog.component'
import {TreeNodeComponent} from './tree/tree-node.component'

@NgModule({
    // These are for external libraries (or Angular)
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        // CodeEditorModule.forRoot(),
        FlexLayoutModule,
        FormsModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        HttpClientModule,
        MaterialModules,
        MatNativeDateModule,
        ReactiveFormsModule,
        // SelectorComponent.forRoot()
    ],
    // These determine what exists as a component within Angular system.
    declarations: [
        BaseComponent,
        CitationDialogComponent,
        CodeViewDialogComponent,
        ConfirmDialogComponent,
        EditorComponent,
        LinkDialogComponent,
        MediaDialogComponent,
        MediaSelectorComponent,
        SelectorComponent,
        TimezoneSelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    // This determines what is accessible via DOM as a component. These must be listed in `declarations`. (required in stratus)
    entryComponents: [
        BaseComponent, // FIXME shouldn't be needed as doesn't load on DOM
        CitationDialogComponent,
        CodeViewDialogComponent,
        ConfirmDialogComponent,
        EditorComponent,
        LinkDialogComponent,
        MediaDialogComponent,
        MediaSelectorComponent,
        SelectorComponent,
        TimezoneSelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    exports: [
        ConfirmDialogComponent,
        EditorComponent,
        MediaSelectorComponent,
        SelectorComponent,
        TimezoneSelectorComponent,
        TreeComponent,
    ],
    providers: [
        {provide: Window, useValue: window}
    ]
})
export class AngularModule {}
export const AngularPackage: StratusPackage = {
    stratusModule: AngularModule,
    stratusComponents: {
        'sa-editor': EditorComponent,
        'sa-media-selector': MediaSelectorComponent,
        'sa-selector': SelectorComponent,
        'sa-timezone-selector': TimezoneSelectorComponent,
        'sa-tree': TreeComponent
    }
}
