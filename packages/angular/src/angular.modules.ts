// Note: This is an example, but not a functional dynamic importer, yet.

// Core
import {NgModule} from '@angular/core'

// Component List
import {
    EditorComponent
} from './editor/editor.component'

// Package List
// import {
//     FooModules
// } from '@stratusjs/foo/fooModules'

// Basic Injections
@NgModule({
    exports: [
        EditorComponent,
        // FooModules
    ]
})
export class AngularModules {
}
