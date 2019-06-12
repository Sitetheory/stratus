var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "@angular/core", "@angular/cdk/drag-drop"], function (require, exports, core_1, drag_drop_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/components/';
    let AetherialComponent = class AetherialComponent {
        constructor() {
            this.examples = [
                'Foo',
                'Bar',
                'Baz',
                'Qux',
            ];
        }
        drop(event) {
            drag_drop_1.moveItemInArray(this.examples, event.previousIndex, event.currentIndex);
        }
    };
    AetherialComponent = __decorate([
        core_1.Component({
            selector: 'stratus-aetherial',
            templateUrl: `${localDir}aetherial.html`,
            styleUrls: [`${localDir}aetherial.css`]
        })
    ], AetherialComponent);
    exports.AetherialComponent = AetherialComponent;
});
