import {NgModule, ModuleWithProviders} from '@angular/core'

import {FroalaViewDirective} from '@stratusjs/angular/froala/view/froala-view.directive'

@NgModule({
    declarations: [FroalaViewDirective],
    exports: [FroalaViewDirective]
})
export class FroalaViewModule {
    public static forRoot(): ModuleWithProviders<FroalaViewModule> {
        return {ngModule: FroalaViewModule, providers: []}
    }
}
