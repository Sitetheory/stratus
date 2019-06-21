System.register(["@angular/core", "@angular/cdk/drag-drop", "stratus", "lodash"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, drag_drop_1, Stratus, _, localDir, AetherialComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (drag_drop_1_1) {
                drag_drop_1 = drag_drop_1_1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_1) {
                _ = _1;
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/components';
            AetherialComponent = class AetherialComponent {
                constructor() {
                    this.title = 'aetherial-dnd';
                    Stratus.Instances[_.uniqueId('s2_aetherial_component_')] = this;
                    this.registry = new Stratus.Data.Registry();
                    this.registry.fetch({
                        target: 'Content'
                    }, this);
                }
                drop(event) {
                    drag_drop_1.moveItemInArray(this.collection.models, event.previousIndex, event.currentIndex);
                }
            };
            AetherialComponent = __decorate([
                core_1.Component({
                    selector: 's2-aetherial',
                    templateUrl: `${localDir}/aetherial.html`,
                    styleUrls: [`${localDir}/aetherial.css`],
                }),
                __metadata("design:paramtypes", [])
            ], AetherialComponent);
            exports_1("AetherialComponent", AetherialComponent);
        }
    };
});
//# sourceMappingURL=aetherial.js.map