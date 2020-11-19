import {NgModule, ModuleWithProviders} from '@angular/core'

import {FroalaEditorDirective} from '@stratusjs/angular/froalaEditor/froalaEditor.directive'

@NgModule({
    declarations: [FroalaEditorDirective],
    exports: [FroalaEditorDirective]
})

export class FroalaEditorModule {
    public static forRoot(): ModuleWithProviders<FroalaEditorModule> {
        return {ngModule: FroalaEditorModule, providers: []}
    }
}
