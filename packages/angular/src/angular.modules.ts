// Core
import {NgModule} from '@angular/core'

// Component List
import {
    EditorComponent
} from '@stratusjs/angular/editor/editor.component'

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
